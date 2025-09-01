
import { Provider, ChatMessage, ChatResponse } from './types';

export class ProviderManager {
  private providers: Map<string, Provider> = new Map();

  addProvider(provider: Provider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): Provider[] {
    return Array.from(this.providers.values());
  }

  getEnabledProviders(): Provider[] {
    return this.getAllProviders().filter(p => p.enabled);
  }

  updateProvider(id: string, updates: Partial<Provider>) {
    const provider = this.providers.get(id);
    if (provider) {
      this.providers.set(id, { ...provider, ...updates });
    }
  }

  removeProvider(id: string) {
    this.providers.delete(id);
  }

  // Create default providers (local + API)
  static createDefaultProviders(): Provider[] {
    return [
      // Local Providers (Recommended for privacy)
      {
        id: 'ollama-qwen',
        name: 'Ollama - Qwen2.5:32b',
        type: 'openai_compat',
        baseUrl: 'http://localhost:11434/v1',
        model: 'qwen2.5:32b',
        enabled: true,
        maxTokens: 2048,
        timeout: 120000,
        description: 'Local Ollama instance - Great for privacy',
        recommended: true
      },
      {
        id: 'ollama-llama-small',
        name: 'Ollama - Llama 3.1 8B (Lightweight)',
        type: 'openai_compat',
        baseUrl: 'http://localhost:11434/v1',
        model: 'llama3.1:8b',
        enabled: false,
        maxTokens: 2048,
        timeout: 60000,
        description: 'Fast lightweight model for quick responses',
        recommended: true
      },
      {
        id: 'lmstudio-llama',
        name: 'LM Studio - Llama 3.1 70B',
        type: 'openai_compat',
        baseUrl: 'http://localhost:1234/v1',
        model: 'llama-3.1-70b-instruct',
        enabled: true,
        maxTokens: 2048,
        timeout: 120000,
        description: 'LM Studio local server - High quality responses',
        recommended: true
      },
      {
        id: 'vllm-local',
        name: 'vLLM - Local Model',
        type: 'openai_compat',
        baseUrl: 'http://localhost:8000/v1',
        model: 'meta-llama/Llama-3.1-70B-Instruct',
        enabled: false,
        maxTokens: 2048,
        timeout: 120000,
        description: 'vLLM local deployment for fast inference'
      },
      {
        id: 'llamacpp-local',
        name: 'llama.cpp - Local Model',
        type: 'openai_compat',
        baseUrl: 'http://localhost:8080/v1',
        model: 'llama-3.1-70b-instruct',
        enabled: false,
        maxTokens: 2048,
        timeout: 120000,
        description: 'llama.cpp server for optimized local inference'
      },
      
      // API Providers
      {
        id: 'openai-gpt4',
        name: 'OpenAI - GPT-4',
        type: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4-turbo-preview',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'OpenAI GPT-4 - Premium quality responses'
      },
      {
        id: 'openai-gpt35',
        name: 'OpenAI - GPT-3.5 Turbo (Budget)',
        type: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'Budget-friendly OpenAI model',
        recommended: true
      },
      {
        id: 'anthropic-claude',
        name: 'Anthropic - Claude 3.5 Sonnet',
        type: 'anthropic',
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-3-5-sonnet-20241022',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'Anthropic Claude - Excellent reasoning capabilities'
      },
      {
        id: 'groq-llama',
        name: 'Groq - Llama 3.1 70B',
        type: 'groq',
        baseUrl: 'https://api.groq.com/openai/v1',
        model: 'llama-3.1-70b-versatile',
        enabled: false,
        maxTokens: 8192,
        timeout: 30000,
        description: 'Ultra-fast inference with Groq hardware',
        recommended: true
      },
      {
        id: 'together-llama',
        name: 'Together AI - Llama 3.1 70B',
        type: 'together',
        baseUrl: 'https://api.together.xyz/v1',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'Together AI - Fast and affordable'
      },
      {
        id: 'fireworks-llama',
        name: 'Fireworks AI - Llama 3.1 70B',
        type: 'fireworks',
        baseUrl: 'https://api.fireworks.ai/inference/v1',
        model: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'Fireworks AI - Optimized inference'
      },
      {
        id: 'openrouter-claude',
        name: 'OpenRouter - Claude 3.5 Sonnet',
        type: 'openrouter',
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'anthropic/claude-3.5-sonnet',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'OpenRouter unified API access'
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek - Coder V2',
        type: 'deepseek',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-coder',
        enabled: false,
        maxTokens: 4096,
        timeout: 60000,
        description: 'DeepSeek specialized coding model'
      },
      {
        id: 'kimi-moonshot',
        name: 'Kimi - Moonshot V1',
        type: 'kimi',
        baseUrl: 'https://api.moonshot.cn/v1',
        model: 'moonshot-v1-8k',
        enabled: false,
        maxTokens: 8192,
        timeout: 60000,
        description: 'Kimi by Moonshot - Long context support'
      }
    ];
  }
}

export async function testProvider(provider: Provider): Promise<{ success: boolean; error?: string; latency?: number }> {
  const startTime = Date.now();
  
  try {
    let response: Response;
    let requestBody: any;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    const testMessages = [
      { role: 'user', content: 'Hello! Please respond with just "OK" to test the connection.' }
    ];

    // Build request based on provider type
    switch (provider.type) {
      case 'anthropic':
        headers['x-api-key'] = provider.apiKey || '';
        headers['anthropic-version'] = '2023-06-01';
        requestBody = {
          model: provider.model,
          messages: testMessages.map(m => ({
            role: m.role,
            content: [{ type: 'text', text: m.content }]
          })),
          max_tokens: 10,
          temperature: 0.1
        };
        response = await fetch(`${provider.baseUrl}/v1/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(provider.timeout)
        });
        break;

      case 'openrouter':
        headers['Authorization'] = `Bearer ${provider.apiKey || ''}`;
        headers['HTTP-Referer'] = 'https://tandemai.local';
        headers['X-Title'] = 'TandemAI';
        requestBody = {
          model: provider.model,
          messages: testMessages,
          max_tokens: 10,
          temperature: 0.1
        };
        response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(provider.timeout)
        });
        break;

      default:
        // OpenAI-compatible (includes local providers and most APIs)
        if (provider.apiKey) {
          headers['Authorization'] = `Bearer ${provider.apiKey}`;
        }
        requestBody = {
          model: provider.model,
          messages: testMessages,
          max_tokens: 10,
          temperature: 0.1
        };
        response = await fetch(`${provider.baseUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(provider.timeout)
        });
        break;
    }

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    // Check response format based on provider type
    let hasValidResponse = false;
    if (provider.type === 'anthropic') {
      hasValidResponse = data?.content?.[0]?.text;
    } else {
      hasValidResponse = data?.choices?.[0]?.message?.content;
    }

    if (!hasValidResponse) {
      return { success: false, error: 'Invalid response format from provider' };
    }

    return { success: true, latency };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.name === 'TimeoutError' ? 'Connection timeout' : error.message 
    };
  }
}

export async function callProvider(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  switch (provider.type) {
    case 'openai_compat':
    case 'openai':
      return callOpenAICompatible(provider, messages, temperature, maxTokens);
    case 'anthropic':
      return callAnthropic(provider, messages, temperature, maxTokens);
    case 'groq':
      return callGroq(provider, messages, temperature, maxTokens);
    case 'together':
      return callTogether(provider, messages, temperature, maxTokens);
    case 'fireworks':
      return callFireworks(provider, messages, temperature, maxTokens);
    case 'openrouter':
      return callOpenRouter(provider, messages, temperature, maxTokens);
    case 'deepseek':
      return callDeepSeek(provider, messages, temperature, maxTokens);
    case 'kimi':
      return callKimi(provider, messages, temperature, maxTokens);
    default:
      throw new Error(`Unsupported provider type: ${provider.type}`);
  }
}

async function callOpenAICompatible(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // Add provider-specific headers
    if (provider.apiKey) {
      if (provider.type === 'openrouter') {
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        headers['HTTP-Referer'] = 'https://tandemai.local';
        headers['X-Title'] = 'TandemAI';
      } else {
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
      }
    }

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`Provider ${provider.name} returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error(`Invalid response format from provider ${provider.name}`);
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`Provider ${provider.name} failed: ${error.message}`);
  }
}

async function callAnthropic(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    // Convert OpenAI-style messages to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch(`${provider.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: provider.model,
        system: systemMessage?.content || undefined,
        messages: conversationMessages.map(m => ({
          role: m.role,
          content: [{ type: 'text', text: m.content }]
        })),
        max_tokens: maxTokens || provider.maxTokens,
        temperature
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    const text = data?.content?.[0]?.text || '';
    if (!text) {
      throw new Error('Invalid response format from Anthropic');
    }

    return {
      text,
      usage: {
        prompt_tokens: data?.usage?.input_tokens || 0,
        completion_tokens: data?.usage?.output_tokens || 0,
        total_tokens: (data?.usage?.input_tokens || 0) + (data?.usage?.output_tokens || 0)
      },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`Anthropic provider ${provider.name} failed: ${error.message}`);
  }
}

async function callDeepSeek(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey || ''}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`DeepSeek provider ${provider.name} failed: ${error.message}`);
  }
}

async function callGroq(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey || ''}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`Groq API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`Groq provider ${provider.name} failed: ${error.message}`);
  }
}

async function callTogether(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey || ''}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`Together AI returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Together AI');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`Together AI provider ${provider.name} failed: ${error.message}`);
  }
}

async function callFireworks(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey || ''}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`Fireworks AI returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Fireworks AI');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`Fireworks AI provider ${provider.name} failed: ${error.message}`);
  }
}

async function callOpenRouter(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey || ''}`,
      'HTTP-Referer': 'https://tandemai.local',
      'X-Title': 'TandemAI'
    };

    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenRouter');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`OpenRouter provider ${provider.name} failed: ${error.message}`);
  }
}

async function callKimi(
  provider: Provider, 
  messages: ChatMessage[], 
  temperature: number = 0.2,
  maxTokens?: number
): Promise<ChatResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey || ''}`
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature,
        max_tokens: maxTokens || provider.maxTokens,
        stream: false
      }),
      signal: AbortSignal.timeout(provider.timeout)
    });

    if (!response.ok) {
      throw new Error(`Kimi API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Kimi');
    }

    return {
      text: data.choices[0].message.content,
      usage: data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      latency_ms: latency,
      provider_id: provider.id,
      model: provider.model
    };
  } catch (error: any) {
    throw new Error(`Kimi provider ${provider.name} failed: ${error.message}`);
  }
}
