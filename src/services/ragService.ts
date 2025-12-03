// RAG (Retrieval Augmented Generation) Service
// Handles document upload, processing, embedding, and retrieval
// Uses Ollama's nomic-embed-text for fully local/offline embeddings

import localforage from 'localforage';

const OLLAMA_BASE_URL = 'http://localhost:11434';
const EMBEDDING_MODEL = 'nomic-embed-text';

let embeddingModelAvailable: boolean | null = null;

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  content: string;
  chunks: DocumentChunk[];
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    page?: number;
    section?: string;
  };
}

// Initialize localforage for storing documents and embeddings
const documentsStore = localforage.createInstance({
  name: 'localchat',
  storeName: 'documents',
});

// Check if Ollama embedding model is available
const checkEmbeddingModel = async (): Promise<boolean> => {
  if (embeddingModelAvailable !== null) return embeddingModelAvailable;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) {
      embeddingModelAvailable = false;
      return false;
    }

    const data = await response.json();
    const models = data.models || [];
    embeddingModelAvailable = models.some(
      (m: any) => m.name === EMBEDDING_MODEL || m.name.startsWith(`${EMBEDDING_MODEL}:`)
    );

    if (embeddingModelAvailable) {
      console.log(`✓ Embedding model available: ${EMBEDDING_MODEL}`);
    } else {
      console.warn(`⚠ Embedding model not found: ${EMBEDDING_MODEL}`);
      console.log('Run: ollama pull nomic-embed-text');
    }

    return embeddingModelAvailable ?? false;
  } catch (error) {
    console.warn('⚠ Ollama not running or not accessible');
    embeddingModelAvailable = false;
    return false;
  }
};

// Parse different file types
// Parse Excel files
const parseExcel = async (file: File): Promise<string> => {
  try {
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let fullText = '';
    
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      fullText += `\n--- Sheet: ${sheetName} ---\n${csv}\n`;
    });
    
    if (fullText.trim().length < 10) {
      throw new Error('No data found in Excel file');
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Excel error:', error);
    throw new Error('Failed to parse Excel file');
  }
};

export const parseFile = async (file: File, onProgress?: (progress: number, status: string) => void): Promise<string> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  console.log('Parsing file:', fileName, 'Type:', fileType);

  try {
    // Text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      return await file.text();
    }

    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // Pass progress callback to PDF parser for OCR updates
      return await parsePDF(file, onProgress);
    }

    // Word documents
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await parseDOCX(file);
    }

    // Excel files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls')
    ) {
      return await parseExcel(file);
    }

    throw new Error(`Unsupported file type: ${fileType || fileName}`);
  } catch (error) {
    console.error('Error parsing file:', error);
    throw error;
  }
};

// Parse PDF with OCR fallback for scanned documents
const parsePDF = async (file: File, onProgress?: (progress: number, status: string) => void): Promise<string> => {
  try {
    console.log('Starting PDF parse for:', file.name, 'Size:', file.size);
    onProgress?.(20, 'Loading PDF...');
    
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    onProgress?.(30, 'Extracting text...');
    let fullText = '';
    let totalItems = 0;
    
    // Try text extraction first
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      totalItems += textContent.items.length;
      
      const pageText = textContent.items
        .map((item: any) => {
          if (typeof item === 'string') return item;
          if (item.str) return item.str;
          if (item.text) return item.text;
          return '';
        })
        .filter(text => text.trim().length > 0)
        .join(' ');
      
      if (pageText.trim()) {
        fullText += pageText + '\n\n';
      }
    }
    
    console.log('Total text items:', totalItems);
    console.log('Extracted text length:', fullText.trim().length);
    
    // If no text found, use OCR
    if (fullText.trim().length < 10) {
      console.log('No text found, using OCR...');
      onProgress?.(40, 'Scanned PDF detected, using OCR...');
      
      const Tesseract = await import('tesseract.js');
      let ocrText = '';
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) { // Limit to 10 pages for performance
        onProgress?.(40 + (50 * pageNum / Math.min(pdf.numPages, 10)), `OCR processing page ${pageNum}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng', {
          logger: (m: any) => console.log(m)
        });
        
        ocrText += text + '\n\n';
      }
      
      if (ocrText.trim().length < 10) {
        throw new Error('Could not extract text from PDF using OCR');
      }
      
      return ocrText.trim();
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Parse DOCX using mammoth
const parseDOCX = async (file: File): Promise<string> => {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 10) {
      throw new Error('Could not extract text from DOCX file');
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file. Please ensure it\'s a valid Word document.');
  }
};

// Chunk text into smaller pieces
export const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    
    if ((currentChunk + trimmedSentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      
      // Add overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + trimmedSentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

// Generate embeddings using Ollama (local/offline)
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding;
};



// Upload and process document - embeddings are optional
export const uploadDocument = async (
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<Document> => {
  try {
    onProgress?.(10, 'Parsing document...');
    const content = await parseFile(file, onProgress);

    onProgress?.(50, 'Chunking text...');
    const textChunks = chunkText(content, 800, 100);

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Check if embedding model is available
    onProgress?.(60, 'Checking embedding model...');
    const useEmbeddings = await checkEmbeddingModel();

    if (!useEmbeddings) {
      console.warn('Embedding model not available, using keyword search');
    }

    const chunks: DocumentChunk[] = [];
    const totalChunks = textChunks.length;

    for (let i = 0; i < totalChunks; i++) {
      const chunkContent = textChunks[i];

      if (useEmbeddings) {
        const progress = 60 + Math.floor((i / totalChunks) * 30);
        onProgress?.(progress, `Embedding ${i + 1}/${totalChunks}...`);

        try {
          const embedding = await generateEmbedding(chunkContent);
          chunks.push({
            id: `${documentId}_chunk_${i}`,
            documentId,
            content: chunkContent,
            embedding,
            metadata: { chunkIndex: i } as any,
          });
          continue;
        } catch {
          // Fall through to non-embedded chunk
        }
      }

      chunks.push({
        id: `${documentId}_chunk_${i}`,
        documentId,
        content: chunkContent,
        metadata: { chunkIndex: i } as any,
      });
    }

    onProgress?.(95, 'Saving...');
    const document: Document = {
      id: documentId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      content,
      chunks,
    };

    await documentsStore.setItem(documentId, document);

    const embeddedCount = chunks.filter((c) => c.embedding).length;
    console.log(`Document saved: ${chunks.length} chunks, ${embeddedCount} with embeddings`);

    onProgress?.(100, 'Complete!');
    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Get all documents
export const getAllDocuments = async (): Promise<Document[]> => {
  const documents: Document[] = [];
  await documentsStore.iterate((value: any) => {
    documents.push(value);
  });
  return documents.sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
};

// Get document by ID
export const getDocument = async (id: string): Promise<Document | null> => {
  return await documentsStore.getItem(id);
};

// Delete document
export const deleteDocument = async (id: string): Promise<void> => {
  await documentsStore.removeItem(id);
};

// Cosine similarity between two vectors
const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Vector similarity search - the core of RAG
export const searchDocuments = async (query: string, topK: number = 5): Promise<DocumentChunk[]> => {
  try {
    const documents = await getAllDocuments();
    console.log(`Searching ${documents.length} documents for: "${query}"`);

    // Check if we have embeddings
    const hasEmbeddings = documents.some((doc) => doc.chunks.some((c) => c.embedding));

    if (hasEmbeddings) {
      // Use vector similarity search
      console.log('Using vector similarity search');
      const queryEmbedding = await generateEmbedding(query);

      const scoredChunks: Array<{ chunk: DocumentChunk; score: number; docName: string }> = [];

      for (const doc of documents) {
        for (const chunk of doc.chunks) {
          if (chunk.embedding) {
            const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
            scoredChunks.push({
              chunk,
              score: similarity,
              docName: doc.name,
            });
          }
        }
      }

      // Sort by similarity (highest first)
      scoredChunks.sort((a, b) => b.score - a.score);

      console.log(`Top scores: ${scoredChunks.slice(0, 3).map((s) => s.score.toFixed(3))}`);

      return scoredChunks.slice(0, topK).map((item) => ({
        ...item.chunk,
        metadata: {
          ...item.chunk.metadata,
          similarity: item.score,
          documentName: item.docName,
        } as any,
      }));
    } else {
      // Fallback to keyword search
      console.log('Using keyword search (no embeddings)');
      const expandedTerms = expandQueryTerms(query);

      const scoredChunks: Array<{ chunk: DocumentChunk; score: number; docName: string }> = [];

      for (const doc of documents) {
        for (const chunk of doc.chunks) {
          const chunkText = chunk.content.toLowerCase();
          let score = 0;

          expandedTerms.forEach((term) => {
            const matches = (chunkText.match(new RegExp(escapeRegex(term), 'gi')) || []).length;
            score += matches;
          });

          if (score > 0) {
            scoredChunks.push({ chunk, score, docName: doc.name });
          }
        }
      }

      scoredChunks.sort((a, b) => b.score - a.score);

      return scoredChunks.slice(0, topK).map((item) => ({
        ...item.chunk,
        metadata: {
          ...item.chunk.metadata,
          similarity: item.score / 10,
          documentName: item.docName,
        } as any,
      }));
    }
  } catch (error) {
    console.error('Error searching documents:', error);
    return [];
  }
};

// Escape special regex characters
const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Expand query with synonyms and related terms
const expandQueryTerms = (query: string): string[] => {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const expanded = new Set<string>(words);
  
  // Common synonyms and related terms
  const synonyms: Record<string, string[]> = {
    'mac': ['apple', 'macbook', 'imac', 'macintosh', 'macos'],
    'apple': ['mac', 'macbook', 'imac', 'iphone', 'ipad'],
    'macbook': ['mac', 'apple', 'laptop'],
    'dell': ['latitude', 'optiplex', 'precision', 'xps'],
    'laptop': ['notebook', 'portable', 'macbook', 'latitude'],
    'computer': ['pc', 'machine', 'workstation', 'desktop', 'laptop'],
    'specs': ['specifications', 'spec', 'configuration', 'config', 'requirements'],
    'specifications': ['specs', 'spec', 'configuration', 'config'],
    'price': ['cost', 'pricing', 'amount', 'fee'],
    'cost': ['price', 'pricing', 'amount', 'expense'],
  };
  
  words.forEach(word => {
    if (synonyms[word]) {
      synonyms[word].forEach(syn => expanded.add(syn));
    }
  });
  
  return Array.from(expanded);
};

// Build optimized context - Put RELEVANT sections first, then full document
export const buildRAGContext = async (query: string, topK: number = 10): Promise<string> => {
  const allDocs = await getAllDocuments();

  if (allDocs.length === 0) {
    return query;
  }

  console.log(`Building RAG context for query: "${query}", Docs: ${allDocs.length}`);

  // First, find the most relevant chunks for the query
  const relevantChunks = await searchDocuments(query, topK);
  console.log(`Found ${relevantChunks.length} relevant chunks`);

  // Build system prompt - STRICT mode to prevent hallucination
  const systemPrompt = `You are a document assistant. You MUST follow these rules EXACTLY:

STRICT RULES:
1. ONLY use information that appears EXACTLY in the document below
2. When answering, COPY the exact text from the document - do not paraphrase
3. If you cannot find the EXACT answer in the document, say "I could not find this specific information in the document"
4. NEVER make up or infer information that is not explicitly written
5. NEVER mix information from different sections
6. Format your answer by quoting the relevant text directly

The most relevant sections are shown first below.`;

  let context = '';

  // PART 1: Show the most relevant chunks FIRST (this is what the model will focus on)
  if (relevantChunks.length > 0) {
    context += `\n${'═'.repeat(60)}\n`;
    context += `🎯 MOST RELEVANT SECTIONS FOR YOUR QUESTION:\n`;
    context += `${'═'.repeat(60)}\n\n`;

    relevantChunks.forEach((chunk, index) => {
      const docName = (chunk.metadata as any).documentName || 'Document';
      context += `[Section ${index + 1}] From "${docName}":\n`;
      context += `${'-'.repeat(40)}\n`;
      context += `${chunk.content}\n\n`;
    });
  }

  // PART 2: Add full document content (for additional context)
  context += `\n${'═'.repeat(60)}\n`;
  context += `📄 FULL DOCUMENT CONTENT (for additional context):\n`;
  context += `${'═'.repeat(60)}\n\n`;

  let totalLength = context.length;
  const maxTotalLength = 300000; // 300KB limit to leave room for relevant chunks

  for (const doc of allDocs) {
    const remainingSpace = maxTotalLength - totalLength;

    if (remainingSpace < 1000) {
      context += '\n[Additional document content truncated due to size]\n';
      break;
    }

    context += `\nFILE: ${doc.name}\n`;
    context += `${'─'.repeat(40)}\n`;

    if (doc.content.length <= remainingSpace) {
      context += doc.content + '\n';
      totalLength += doc.content.length;
    } else {
      context += doc.content.substring(0, remainingSpace - 100);
      context += '\n[... truncated ...]\n';
      totalLength = maxTotalLength;
    }

    console.log(`Added doc "${doc.name}": ${Math.min(doc.content.length, remainingSpace)} chars`);
  }

  // Build final context
  const finalContext = `${systemPrompt}

${context}

${'═'.repeat(60)}
USER QUESTION: ${query}
${'═'.repeat(60)}

IMPORTANT: Copy the EXACT text from the document that answers this question. Do not paraphrase or interpret:`;
  
  console.log(`Built RAG context: ${finalContext.length} chars total`);
  
  return finalContext;
};

// Clear all documents
export const clearAllDocuments = async (): Promise<void> => {
  await documentsStore.clear();
};

// Get storage stats
export const getStorageStats = async () => {
  const documents = await getAllDocuments();
  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);
  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunks.length, 0);
  
  return {
    documentCount: documents.length,
    totalSize,
    totalChunks,
    formattedSize: formatBytes(totalSize),
  };
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
