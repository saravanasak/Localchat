// Simple attachment service - no embeddings, just direct file content
import localforage from 'localforage';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  uploadedAt: string;
}

const attachmentsStore = localforage.createInstance({
  name: 'localchat',
  storeName: 'attachments',
});

// Parse file to text
export const parseFileToText = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();
  
  // Text files - simple and reliable
  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    return await file.text();
  }
  
  // For other files, just read as text
  return await file.text();
};

// Upload attachment
export const uploadAttachment = async (file: File): Promise<Attachment> => {
  try {
    const content = await parseFileToText(file);
    
    const attachment: Attachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      uploadedAt: new Date().toISOString(),
    };
    
    await attachmentsStore.setItem(attachment.id, attachment);
    return attachment;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw new Error('Failed to upload file. Please try a text file (.txt or .md)');
  }
};

// Get attachment
export const getAttachment = async (id: string): Promise<Attachment | null> => {
  return await attachmentsStore.getItem(id);
};

// Delete attachment
export const deleteAttachment = async (id: string): Promise<void> => {
  await attachmentsStore.removeItem(id);
};

// Get all attachments
export const getAllAttachments = async (): Promise<Attachment[]> => {
  const attachments: Attachment[] = [];
  await attachmentsStore.iterate((value: any) => {
    attachments.push(value);
  });
  return attachments.sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};

// Build context from attachments
export const buildContextFromAttachments = (
  attachments: Attachment[],
  query: string
): string => {
  if (attachments.length === 0) return query;
  
  let context = 'Here are the attached files for context:\n\n';
  
  attachments.forEach((att, index) => {
    context += `--- File ${index + 1}: ${att.name} ---\n`;
    context += att.content + '\n\n';
  });
  
  context += '---\n\n';
  context += `Based on the above files, please answer: ${query}`;
  
  return context;
};

// Clear all attachments
export const clearAllAttachments = async (): Promise<void> => {
  await attachmentsStore.clear();
};
