
import { OrchestrationConfig } from '../types';

export const MODES: Record<string, Partial<OrchestrationConfig>> = {
  conversation: {
    mode: 'conversation',
    rounds: 1,
    early_stop: false,
    min_change_ratio: 0.02,
    seed_temperature: 0.3,
    refine_temperature: 0.2,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  },
  answer: {
    mode: 'answer',
    rounds: 2,
    early_stop: true,
    min_change_ratio: 0.02,
    seed_temperature: 0.35,
    refine_temperature: 0.15,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  },
  argumentative: {
    mode: 'argumentative',
    rounds: 1,
    early_stop: false,
    seed_temperature: 0.3,
    refine_temperature: 0.2,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  },
  research: {
    mode: 'research',
    rounds: 1,
    early_stop: true,
    min_change_ratio: 0.05,
    seed_temperature: 0.3,
    refine_temperature: 0.2,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  }
};

export const PRESETS = {
  'Local Privacy': {
    description: 'Uses only local models for complete privacy',
    providers: ['ollama-qwen', 'lmstudio-llama', 'ollama-llama-small'],
    mode: 'answer' as const
  },
  'Speed First': {
    description: 'Fast responses with lightweight models',
    providers: ['groq-llama', 'ollama-llama-small', 'together-llama'],
    mode: 'conversation' as const
  },
  'Max Quality': {
    description: 'Best possible responses using top models',
    providers: ['anthropic-claude', 'openai-gpt4', 'lmstudio-llama'],
    mode: 'answer' as const
  },
  'Research Deep': {
    description: 'Comprehensive research with multiple rounds',
    providers: ['openai-gpt4', 'anthropic-claude', 'deepseek-coder'],
    mode: 'research' as const
  }
};
