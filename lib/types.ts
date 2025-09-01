
// Core Types for TandemAI
export interface Provider {
  id: string;
  name: string;
  type: 'openai_compat' | 'openai' | 'anthropic' | 'kimi' | 'deepseek' | 'grok' | 'together' | 'fireworks' | 'openrouter' | 'groq';
  baseUrl: string;
  model: string;
  apiKey?: string;
  enabled: boolean;
  maxTokens: number;
  timeout: number;
  description?: string;
  recommended?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  text: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
  provider_id: string;
  model: string;
}

export interface OrchestrationConfig {
  mode: 'conversation' | 'answer' | 'argumentative' | 'research';
  sequence: string[]; // provider IDs
  rounds: number;
  early_stop: boolean;
  min_change_ratio: number;
  seed_temperature: number;
  refine_temperature: number;
  thinking_mode: boolean;
  use_verifier: boolean;
  use_judge: boolean;
}

export interface OrchestrationStep {
  round: number;
  provider_id: string;
  prompt: string;
  response: ChatResponse;
  diff?: {
    ratio: number;
    added: string[];
    removed: string[];
  };
}

export interface OrchestrationResult {
  final_answer: string;
  steps: OrchestrationStep[];
  total_tokens: number;
  total_latency_ms: number;
  early_stopped: boolean;
  mode: string;
}

export type OrchestrationMode = 'conversation' | 'answer' | 'argumentative' | 'research';

// Local Storage Types
export interface TandemAIConfig {
  providers: Provider[];
  orchestration: OrchestrationConfig;
  ui: {
    theme: 'light' | 'dark' | 'system';
    show_thinking: boolean;
    auto_scroll: boolean;
  };
}

// Streaming Event Types
export interface StreamEvent {
  type: 'round_start' | 'tokens' | 'round_result' | 'diff' | 'final' | 'error';
  round?: number;
  provider_id?: string;
  chunk?: string;
  result?: ChatResponse;
  diff?: { ratio: number; added: string[]; removed: string[] };
  final_result?: OrchestrationResult;
  error?: string;
}
