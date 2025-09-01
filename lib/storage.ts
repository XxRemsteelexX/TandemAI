
import { TandemAIConfig, Provider, OrchestrationConfig } from './types';
import { ProviderManager } from './providers';
import { MODES } from './config/defaultModes';

const STORAGE_KEY = 'tandem-ai-config';

export function getDefaultConfig(): TandemAIConfig {
  const defaultProviders = ProviderManager.createDefaultProviders();
  const enabledProviders = defaultProviders.filter(p => p.enabled);
  
  return {
    providers: defaultProviders,
    orchestration: {
      ...MODES.answer,
      sequence: enabledProviders.slice(0, 2).map(p => p.id)
    } as OrchestrationConfig,
    ui: {
      theme: 'system',
      show_thinking: true,
      auto_scroll: true
    }
  };
}

export function saveConfig(config: TandemAIConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save configuration:', error);
  }
}

export function loadConfig(): TandemAIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      const defaultConfig = getDefaultConfig();
      return {
        providers: parsed.providers || defaultConfig.providers,
        orchestration: { ...defaultConfig.orchestration, ...parsed.orchestration },
        ui: { ...defaultConfig.ui, ...parsed.ui }
      };
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }
  
  return getDefaultConfig();
}

export function resetConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Chat history storage
const CHAT_HISTORY_KEY = 'tandem-ai-chat-history';

export interface ChatSession {
  id: string;
  timestamp: number;
  userMessage: string;
  response: string;
  mode: string;
  steps: any[];
  metadata: {
    totalTokens: number;
    totalLatency: number;
    providers: string[];
  };
}

export function saveChatSession(session: ChatSession): void {
  try {
    const history = getChatHistory();
    history.unshift(session); // Add to beginning
    
    // Keep only last 50 sessions
    const trimmed = history.slice(0, 50);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save chat session:', error);
  }
}

export function getChatHistory(): ChatSession[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

export function deleteChatSession(sessionId: string): void {
  try {
    const history = getChatHistory();
    const filtered = history.filter(session => session.id !== sessionId);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete chat session:', error);
  }
}
