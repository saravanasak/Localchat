// Service for managing Ollama installation and models

export interface ModelInfo {
  name: string;
  description: string;
  size: string;
  parameters: string;
  tags: string[];
  isInstalled?: boolean;
  isDownloading?: boolean;
  downloadProgress?: number;
}

export interface OllamaStatus {
  isInstalled: boolean;
  isRunning: boolean;
  version?: string;
}

// Model categories for better organization
export const MODEL_CATEGORIES = {
  RECOMMENDED: 'recommended',
  CHAT: 'chat',
  CODE: 'code',
  VISION: 'vision',
  EMBEDDING: 'embedding',
  SMALL: 'small',
  LARGE: 'large',
};

// Comprehensive list of Ollama models from https://ollama.com/library
export const CURATED_MODELS: ModelInfo[] = [
  // Featured & Recommended
  {
    name: 'llama3.2',
    description: 'Meta\'s latest Llama 3.2 model with improved performance',
    size: '2.0 GB',
    parameters: '3B',
    tags: ['recommended', 'chat', 'general', 'featured'],
  },
  {
    name: 'llama3.2:1b',
    description: 'Smallest Llama 3.2 model, extremely fast',
    size: '1.3 GB',
    parameters: '1B',
    tags: ['recommended', 'chat', 'small', 'fast', 'featured'],
  },
  {
    name: 'llama3.1',
    description: 'Meta Llama 3.1 with 128K context window',
    size: '4.7 GB',
    parameters: '8B',
    tags: ['recommended', 'chat', 'general'],
  },
  {
    name: 'llama3.1:70b',
    description: 'Large Llama 3.1 model for best quality',
    size: '40 GB',
    parameters: '70B',
    tags: ['chat', 'large', 'quality'],
  },
  {
    name: 'llama3.1:405b',
    description: 'Largest Llama model, state-of-the-art performance',
    size: '231 GB',
    parameters: '405B',
    tags: ['chat', 'large', 'quality'],
  },
  
  // Mistral Family
  {
    name: 'mistral',
    description: 'Mistral 7B - powerful and efficient',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['recommended', 'chat', 'general', 'featured'],
  },
  {
    name: 'mistral-nemo',
    description: 'Mistral Nemo 12B with 128K context',
    size: '7.1 GB',
    parameters: '12B',
    tags: ['chat', 'general'],
  },
  {
    name: 'mistral-large',
    description: 'Mistral\'s largest model with 128K context',
    size: '69 GB',
    parameters: '123B',
    tags: ['chat', 'large', 'quality'],
  },
  
  // Gemma Family
  {
    name: 'gemma2:2b',
    description: 'Google\'s Gemma 2 - compact and efficient',
    size: '1.6 GB',
    parameters: '2B',
    tags: ['recommended', 'chat', 'small', 'fast'],
  },
  {
    name: 'gemma2',
    description: 'Google\'s Gemma 2 9B model',
    size: '5.4 GB',
    parameters: '9B',
    tags: ['chat', 'general'],
  },
  {
    name: 'gemma2:27b',
    description: 'Largest Gemma 2 model',
    size: '16 GB',
    parameters: '27B',
    tags: ['chat', 'large'],
  },
  
  // Phi Family
  {
    name: 'phi3',
    description: 'Microsoft Phi-3 - small but capable',
    size: '2.3 GB',
    parameters: '3.8B',
    tags: ['recommended', 'chat', 'small', 'fast'],
  },
  {
    name: 'phi3:medium',
    description: 'Microsoft Phi-3 Medium 14B',
    size: '7.9 GB',
    parameters: '14B',
    tags: ['chat', 'general'],
  },
  
  // Qwen Family
  {
    name: 'qwen2.5',
    description: 'Alibaba\'s Qwen 2.5 - multilingual',
    size: '4.7 GB',
    parameters: '7B',
    tags: ['chat', 'general', 'multilingual'],
  },
  {
    name: 'qwen2.5:14b',
    description: 'Qwen 2.5 14B model',
    size: '9.0 GB',
    parameters: '14B',
    tags: ['chat', 'general', 'multilingual'],
  },
  {
    name: 'qwen2.5:32b',
    description: 'Qwen 2.5 32B model',
    size: '19 GB',
    parameters: '32B',
    tags: ['chat', 'large', 'multilingual'],
  },
  {
    name: 'qwen2.5:72b',
    description: 'Largest Qwen 2.5 model',
    size: '41 GB',
    parameters: '72B',
    tags: ['chat', 'large', 'quality', 'multilingual'],
  },
  
  // Code Models
  {
    name: 'codellama',
    description: 'Meta\'s Code Llama for programming',
    size: '3.8 GB',
    parameters: '7B',
    tags: ['recommended', 'code', 'specialized'],
  },
  {
    name: 'codellama:13b',
    description: 'Code Llama 13B',
    size: '7.4 GB',
    parameters: '13B',
    tags: ['code', 'specialized'],
  },
  {
    name: 'codellama:34b',
    description: 'Code Llama 34B',
    size: '19 GB',
    parameters: '34B',
    tags: ['code', 'large', 'specialized'],
  },
  {
    name: 'qwen2.5-coder',
    description: 'Qwen 2.5 Coder - advanced coding assistant',
    size: '4.7 GB',
    parameters: '7B',
    tags: ['recommended', 'code', 'specialized'],
  },
  {
    name: 'qwen2.5-coder:32b',
    description: 'Qwen 2.5 Coder 32B',
    size: '19 GB',
    parameters: '32B',
    tags: ['code', 'large', 'specialized'],
  },
  {
    name: 'deepseek-coder-v2',
    description: 'DeepSeek Coder V2 - strong code performance',
    size: '8.9 GB',
    parameters: '16B',
    tags: ['code', 'specialized'],
  },
  {
    name: 'deepseek-coder-v2:236b',
    description: 'DeepSeek Coder V2 236B',
    size: '133 GB',
    parameters: '236B',
    tags: ['code', 'large', 'quality', 'specialized'],
  },
  {
    name: 'starcoder2',
    description: 'StarCoder 2 for code generation',
    size: '1.7 GB',
    parameters: '3B',
    tags: ['code', 'small', 'specialized'],
  },
  {
    name: 'codegemma',
    description: 'Google\'s CodeGemma for coding',
    size: '5.0 GB',
    parameters: '7B',
    tags: ['code', 'specialized'],
  },
  
  // Vision Models
  {
    name: 'llama3.2-vision',
    description: 'Llama 3.2 with vision capabilities',
    size: '7.9 GB',
    parameters: '11B',
    tags: ['vision', 'multimodal', 'specialized'],
  },
  {
    name: 'llava',
    description: 'LLaVA - Large Language and Vision Assistant',
    size: '4.7 GB',
    parameters: '7B',
    tags: ['vision', 'multimodal', 'specialized'],
  },
  {
    name: 'llava:13b',
    description: 'LLaVA 13B',
    size: '8.0 GB',
    parameters: '13B',
    tags: ['vision', 'multimodal', 'specialized'],
  },
  {
    name: 'llava:34b',
    description: 'LLaVA 34B',
    size: '20 GB',
    parameters: '34B',
    tags: ['vision', 'multimodal', 'large', 'specialized'],
  },
  {
    name: 'bakllava',
    description: 'BakLLaVA - vision model',
    size: '4.7 GB',
    parameters: '7B',
    tags: ['vision', 'multimodal', 'specialized'],
  },
  
  // Specialized Models
  {
    name: 'nous-hermes2',
    description: 'Nous Hermes 2 - fine-tuned for instructions',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['chat', 'specialized'],
  },
  {
    name: 'neural-chat',
    description: 'Intel\'s Neural Chat model',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['chat', 'specialized'],
  },
  {
    name: 'starling-lm',
    description: 'Starling LM - RLHF trained',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['chat', 'specialized'],
  },
  {
    name: 'orca-mini',
    description: 'Orca Mini - compact and efficient',
    size: '1.9 GB',
    parameters: '3B',
    tags: ['chat', 'small', 'fast'],
  },
  {
    name: 'vicuna',
    description: 'Vicuna - fine-tuned LLaMA',
    size: '3.8 GB',
    parameters: '7B',
    tags: ['chat', 'specialized'],
  },
  {
    name: 'wizardcoder',
    description: 'WizardCoder for programming',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['code', 'specialized'],
  },
  {
    name: 'solar',
    description: 'Solar 10.7B - efficient and powerful',
    size: '6.1 GB',
    parameters: '10.7B',
    tags: ['chat', 'general'],
  },
  {
    name: 'openchat',
    description: 'OpenChat - optimized for conversation',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['chat', 'specialized'],
  },
  {
    name: 'dolphin-mixtral',
    description: 'Dolphin Mixtral - uncensored',
    size: '26 GB',
    parameters: '8x7B',
    tags: ['chat', 'large', 'specialized'],
  },
  {
    name: 'mixtral',
    description: 'Mixtral 8x7B - mixture of experts',
    size: '26 GB',
    parameters: '8x7B',
    tags: ['chat', 'large', 'quality'],
  },
  {
    name: 'command-r',
    description: 'Cohere Command R for RAG',
    size: '20 GB',
    parameters: '35B',
    tags: ['chat', 'large', 'specialized'],
  },
  {
    name: 'command-r-plus',
    description: 'Cohere Command R+ - enhanced',
    size: '70 GB',
    parameters: '104B',
    tags: ['chat', 'large', 'quality', 'specialized'],
  },
  
  // Embedding Models
  {
    name: 'nomic-embed-text',
    description: 'Nomic Embed - text embeddings',
    size: '274 MB',
    parameters: '137M',
    tags: ['embedding', 'specialized', 'small'],
  },
  {
    name: 'mxbai-embed-large',
    description: 'MixedBread.ai embeddings',
    size: '669 MB',
    parameters: '335M',
    tags: ['embedding', 'specialized', 'small'],
  },
  {
    name: 'all-minilm',
    description: 'All-MiniLM embeddings',
    size: '45 MB',
    parameters: '23M',
    tags: ['embedding', 'specialized', 'small', 'fast'],
  },
  
  // Other Notable Models
  {
    name: 'yi',
    description: '01.AI Yi model - multilingual',
    size: '4.0 GB',
    parameters: '6B',
    tags: ['chat', 'general', 'multilingual'],
  },
  {
    name: 'yi:34b',
    description: '01.AI Yi 34B',
    size: '19 GB',
    parameters: '34B',
    tags: ['chat', 'large', 'multilingual'],
  },
  {
    name: 'falcon',
    description: 'TII Falcon model',
    size: '4.0 GB',
    parameters: '7B',
    tags: ['chat', 'general'],
  },
  {
    name: 'aya',
    description: 'Aya - massively multilingual (101 languages)',
    size: '4.8 GB',
    parameters: '8B',
    tags: ['chat', 'multilingual', 'specialized'],
  },
  {
    name: 'tinyllama',
    description: 'TinyLlama - extremely small and fast',
    size: '637 MB',
    parameters: '1.1B',
    tags: ['chat', 'small', 'fast'],
  },
  {
    name: 'tinydolphin',
    description: 'Tiny Dolphin - compact model',
    size: '636 MB',
    parameters: '1.1B',
    tags: ['chat', 'small', 'fast'],
  },
  {
    name: 'stablelm2',
    description: 'Stable LM 2 by Stability AI',
    size: '1.7 GB',
    parameters: '1.6B',
    tags: ['chat', 'small'],
  },
  {
    name: 'zephyr',
    description: 'Zephyr - fine-tuned Mistral',
    size: '4.1 GB',
    parameters: '7B',
    tags: ['chat', 'specialized'],
  },
];

// Fetch all available models from Ollama library
export const fetchAllOllamaModels = async (): Promise<ModelInfo[]> => {
  try {
    // Try to fetch from Ollama's library API
    const response = await fetch('https://ollama.com/api/tags');
    
    if (response.ok) {
      const data = await response.json();
      return parseOllamaModels(data);
    }
  } catch (error) {
    console.log('Could not fetch from Ollama API, using curated list');
  }

  // Fallback to curated list
  return CURATED_MODELS;
};

// Parse Ollama API response
const parseOllamaModels = (data: any): ModelInfo[] => {
  if (!data || !Array.isArray(data.models)) {
    return CURATED_MODELS;
  }

  return data.models.map((model: any) => ({
    name: model.name,
    description: model.description || 'No description available',
    size: formatBytes(model.size || 0),
    parameters: extractParameters(model.name),
    tags: categorizModel(model.name, model.description),
  }));
};

// Extract parameter count from model name
const extractParameters = (name: string): string => {
  const match = name.match(/(\d+)b/i);
  if (match) {
    return `${match[1]}B`;
  }
  
  // Common patterns
  if (name.includes('1b')) return '1B';
  if (name.includes('3b')) return '3B';
  if (name.includes('7b')) return '7B';
  if (name.includes('13b')) return '13B';
  if (name.includes('70b')) return '70B';
  
  return 'Unknown';
};

// Categorize model based on name and description
const categorizModel = (name: string, description: string = ''): string[] => {
  const tags: string[] = [];
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();

  // Size categories
  if (lowerName.includes('1b') || lowerName.includes('2b')) {
    tags.push('small', 'fast');
  } else if (lowerName.includes('70b') || lowerName.includes('405b')) {
    tags.push('large', 'quality');
  }

  // Type categories
  if (lowerName.includes('code') || lowerDesc.includes('code')) {
    tags.push('code', 'specialized');
  } else if (lowerName.includes('vision') || lowerDesc.includes('vision')) {
    tags.push('vision', 'multimodal');
  } else if (lowerName.includes('embed')) {
    tags.push('embedding', 'specialized');
  } else {
    tags.push('chat', 'general');
  }

  // Recommended models
  if (
    lowerName.includes('llama3.2') ||
    lowerName.includes('mistral') ||
    lowerName.includes('phi3')
  ) {
    tags.push('recommended');
  }

  return tags;
};

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 GB';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
};

export const checkOllamaStatus = async (): Promise<OllamaStatus> => {
  try {
    const response = await fetch('/api/version', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        isInstalled: true,
        isRunning: true,
        version: data.version,
      };
    }
    
    return { isInstalled: false, isRunning: false };
  } catch (error) {
    return { isInstalled: false, isRunning: false };
  }
};

export const pullModel = async (
  modelName: string,
  onProgress?: (progress: number, status: string) => void
): Promise<void> => {
  try {
    const response = await fetch('/api/pull', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        
        try {
          const data = JSON.parse(line);
          
          if (data.total && data.completed) {
            const progress = (data.completed / data.total) * 100;
            onProgress?.(progress, data.status || 'downloading');
          } else if (data.status) {
            onProgress?.(0, data.status);
          }
        } catch (e) {
          console.error('Error parsing progress:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error pulling model:', error);
    throw error;
  }
};

export const deleteModel = async (modelName: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete model: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
};

export const getInstallInstructions = () => {
  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return {
      platform: 'macOS',
      downloadUrl: 'https://ollama.com/download/Ollama-darwin.zip',
      instructions: [
        'Download Ollama for macOS',
        'Open the downloaded file',
        'Drag Ollama to Applications',
        'Launch Ollama from Applications',
        'Refresh this page',
      ],
    };
  } else if (platform.includes('win') || userAgent.includes('windows')) {
    return {
      platform: 'Windows',
      downloadUrl: 'https://ollama.com/download/OllamaSetup.exe',
      instructions: [
        'Download Ollama for Windows',
        'Run the installer',
        'Follow the installation wizard',
        'Ollama will start automatically',
        'Refresh this page',
      ],
    };
  } else {
    return {
      platform: 'Linux',
      downloadUrl: 'https://ollama.com/download',
      instructions: [
        'Open terminal',
        'Run: curl -fsSL https://ollama.com/install.sh | sh',
        'Wait for installation to complete',
        'Ollama will start automatically',
        'Refresh this page',
      ],
    };
  }
};
