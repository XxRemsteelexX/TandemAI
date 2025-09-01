
import { Provider } from '../types';

export const PROVIDER_PRESETS: Record<string, Omit<Provider, 'id' | 'enabled'>> = {
  // Local Providers
  'ollama-default': {
    name: 'Ollama - Default Model',
    type: 'openai_compat',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3.1:8b',
    maxTokens: 2048,
    timeout: 60000,
    description: 'Default Ollama setup - lightweight and fast',
    recommended: true
  },
  
  'lmstudio-default': {
    name: 'LM Studio - Default Model', 
    type: 'openai_compat',
    baseUrl: 'http://localhost:1234/v1',
    model: 'llama-3.1-8b-instruct',
    maxTokens: 2048,
    timeout: 60000,
    description: 'Default LM Studio setup',
    recommended: true
  },

  // API Providers - Ready to use templates
  'openai-gpt4-turbo': {
    name: 'OpenAI - GPT-4 Turbo',
    type: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4-turbo-preview',
    apiKey: '',
    maxTokens: 4096,
    timeout: 60000,
    description: 'Latest GPT-4 with 128k context - premium quality'
  },

  'groq-llama-fast': {
    name: 'Groq - Llama 3.1 70B (Ultra Fast)',
    type: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1', 
    model: 'llama-3.1-70b-versatile',
    apiKey: '',
    maxTokens: 8192,
    timeout: 30000,
    description: 'Lightning-fast inference on Groq hardware',
    recommended: true
  },

  'claude-sonnet': {
    name: 'Anthropic - Claude 3.5 Sonnet',
    type: 'anthropic',
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-3-5-sonnet-20241022',
    apiKey: '',
    maxTokens: 4096,
    timeout: 60000,
    description: 'Excellent reasoning and analysis capabilities'
  },

  'together-llama': {
    name: 'Together AI - Llama 3.1 70B Turbo',
    type: 'together',
    baseUrl: 'https://api.together.xyz/v1',
    model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    apiKey: '',
    maxTokens: 4096,
    timeout: 60000,
    description: 'Fast and cost-effective, great for most tasks'
  },

  'deepseek-coder': {
    name: 'DeepSeek - Coder V2.5',
    type: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-coder',
    apiKey: '',
    maxTokens: 4096,
    timeout: 60000,
    description: 'Specialized for coding and technical tasks'
  },

  'openrouter-claude': {
    name: 'OpenRouter - Claude 3.5 Sonnet',
    type: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet',
    apiKey: '',
    maxTokens: 4096,
    timeout: 60000,
    description: 'Access Claude through OpenRouter unified API'
  }
};

export const QUICK_SETUP_GUIDES = {
  local: {
    title: 'Local Setup Guide',
    steps: [
      'Install Ollama: `curl -fsSL https://ollama.ai/install.sh | sh`',
      'Pull a model: `ollama pull llama3.1:8b`',
      'Or install LM Studio from https://lmstudio.ai',
      'Load any model and start the local server',
      'Test connection in TandemAI Providers tab'
    ]
  },
  
  api: {
    title: 'API Setup Guide', 
    steps: [
      'Get API keys from your preferred providers',
      'Go to Providers tab and add new provider',
      'Choose provider type and enter API key',
      'Test connection to verify it works',
      'Add to your orchestration sequence'
    ]
  }
};
