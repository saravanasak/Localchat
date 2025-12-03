const API_URL = ''; // Empty string will use the current host, which will go through the Vite proxy

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  done: boolean;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export const generateChatResponse = async (
  model: string,
  messages: Message[],
  onChunk: (content: string) => void,
): Promise<void> => {
  try {
    console.log('Generating chat response');
    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: messages[messages.length - 1].content,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Generate response not ok:', response.status, errorText);
      throw new Error(`Failed to generate chat response: ${response.status} ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            onChunk(parsed.response);
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};

export const listModels = async (): Promise<string[]> => {
  try {
    console.log('Fetching models');
    const response = await fetch(`${API_URL}/api/tags`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('List models response not ok:', response.status, errorText);
      throw new Error(`Failed to fetch models: ${response.status} ${errorText}`);
    }

    const text = await response.text();
    console.log('Raw response:', text);
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed response:', data);

      if (!data.models || !Array.isArray(data.models)) {
        console.error('Invalid models response:', data);
        throw new Error('Invalid models response format');
      }

      return data.models.map((model: { name: string }) => model.name);
    } catch (e) {
      console.error('Error parsing JSON:', e);
      throw new Error('Failed to parse models response');
    }
  } catch (error) {
    console.error('Error listing models:', error);
    throw error;
  }
};