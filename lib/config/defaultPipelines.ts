
import { OrchestrationConfig } from '../types';

export const DEFAULT_PIPELINES: Record<string, OrchestrationConfig> = {
  local_privacy: {
    mode: 'answer',
    sequence: ['ollama-qwen', 'lmstudio-llama'],
    rounds: 2,
    early_stop: true,
    min_change_ratio: 0.02,
    seed_temperature: 0.35,
    refine_temperature: 0.15,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  },
  
  hybrid_quality: {
    mode: 'answer',
    sequence: ['openai-gpt35', 'anthropic-claude', 'ollama-qwen'],
    rounds: 2,
    early_stop: true,
    min_change_ratio: 0.02,
    seed_temperature: 0.35,
    refine_temperature: 0.15,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  },
  
  debate_mode: {
    mode: 'argumentative',
    sequence: ['openai-gpt4', 'anthropic-claude', 'ollama-qwen'],
    rounds: 1,
    early_stop: false,
    min_change_ratio: 0.02,
    seed_temperature: 0.3,
    refine_temperature: 0.2,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  },
  
  research_comprehensive: {
    mode: 'research',
    sequence: ['anthropic-claude', 'openai-gpt4', 'deepseek-coder'],
    rounds: 2,
    early_stop: true,
    min_change_ratio: 0.05,
    seed_temperature: 0.3,
    refine_temperature: 0.2,
    thinking_mode: true,
    use_verifier: false,
    use_judge: false
  }
};

export function getDefaultPipelineForMode(mode: string): OrchestrationConfig {
  switch (mode) {
    case 'conversation':
      return {
        mode: 'conversation',
        sequence: ['ollama-qwen', 'lmstudio-llama', 'ollama-llama-small'],
        rounds: 1,
        early_stop: false,
        min_change_ratio: 0.02,
        seed_temperature: 0.3,
        refine_temperature: 0.2,
        thinking_mode: true,
        use_verifier: false,
        use_judge: false
      };
    case 'answer':
      return DEFAULT_PIPELINES.local_privacy;
    case 'argumentative':
      return DEFAULT_PIPELINES.debate_mode;
    case 'research':
      return DEFAULT_PIPELINES.research_comprehensive;
    default:
      return DEFAULT_PIPELINES.local_privacy;
  }
}
