
import { Provider, ChatMessage, ChatResponse, OrchestrationConfig, OrchestrationStep, OrchestrationResult, StreamEvent } from './types';
import { callProvider } from './providers';
import { calculateDiff } from './utils';

// Optional hooks for future features
async function runVerifier(_answer: string, _ctx?: any): Promise<{ entailed: number[]; neutral: number[]; contradicted: number[] }> {
  return { entailed: [], neutral: [], contradicted: [] };
}

async function runJudge(_question: string, _answer: string, _ctx?: any): Promise<number> {
  return 8.5; // Default good score until judge model is implemented
}

// Utility functions for cleaner message building
function sys(content: string): ChatMessage {
  return { role: 'system', content };
}

function user(content: string): ChatMessage {
  return { role: 'user', content };
}

function assistant(content: string): ChatMessage {
  return { role: 'assistant', content };
}

export class OrchestrationEngine {
  constructor(private providers: Map<string, Provider>) {}

  async execute(
    messages: ChatMessage[],
    config: OrchestrationConfig,
    onStream?: (event: StreamEvent) => void
  ): Promise<OrchestrationResult> {
    try {
      // Extract question from messages
      const userMessages = messages.filter(m => m.role === 'user');
      const question = userMessages[userMessages.length - 1]?.content || '';
      const history = messages.slice(0, -1); // All messages except the last user message
      
      // Get providers from sequence
      const sequenceProviders = config.sequence
        .map(id => this.providers.get(id))
        .filter(Boolean) as Provider[];

      if (sequenceProviders.length === 0) {
        throw new Error('No valid providers in sequence');
      }

      const emit = onStream || (() => {});

      switch (config.mode) {
        case 'conversation':
          return await this.runConversationMode(question, history, sequenceProviders, config, emit);
        case 'answer':
          return await this.runAnswerMode(question, history, sequenceProviders, config, emit);
        case 'argumentative':
          return await this.runArgumentativeMode(question, history, sequenceProviders, config, emit);
        case 'research':
          return await this.runResearchMode(question, history, sequenceProviders, config, emit);
        default:
          throw new Error(`Unknown orchestration mode: ${config.mode}`);
      }
    } catch (error: any) {
      onStream?.({ type: 'error', error: error.message });
      throw error;
    }
  }

  // Helper: run a single provider turn and emit events
  private async runTurn(
    round: number,
    provider: Provider,
    messages: ChatMessage[],
    temperature: number,
    emit: (event: StreamEvent) => void
  ): Promise<OrchestrationStep> {
    emit({ type: 'round_start', round, provider_id: provider.id });

    const result = await callProvider(provider, messages, temperature);

    const step: OrchestrationStep = {
      round,
      provider_id: provider.id,
      prompt: messages[messages.length - 1]?.content || '',
      response: result
    };

    emit({ type: 'round_result', round, provider_id: provider.id, result });
    return step;
  }

  // Helper: compute diff and decide early stop
  private maybeDiffAndStop(
    prevText: string,
    newText: string,
    config: OrchestrationConfig,
    round: number,
    emit: (event: StreamEvent) => void
  ): { ratio: number; earlyStop: boolean } {
    const diff = calculateDiff(prevText, newText);
    emit({ type: 'diff', round, diff });
    const earlyStop = !!config.early_stop && diff.ratio < (config.min_change_ratio ?? 0.02);
    return { ratio: diff.ratio, earlyStop };
  }

  private async runConversationMode(
    question: string,
    history: ChatMessage[],
    providers: Provider[],
    config: OrchestrationConfig,
    emit: (event: StreamEvent) => void
  ): Promise<OrchestrationResult> {
    const steps: OrchestrationStep[] = [];
    const responses: string[] = [];
    let totalTokens = 0;
    let totalLatency = 0;

    // Sequential conversation: A → B → C (single pass)
    for (let i = 0; i < Math.min(providers.length, 3); i++) {
      const provider = providers[i];
      
      // Build conversation-specific prompts
      const systemPrompts = [
        'You are a thoughtful moderator. Provide a concise answer and invite others to add their perspectives. Keep it conversational and under 6 sentences.',
        'You are a specialist who adds technical depth when helpful. Build on the previous response with additional insights, but keep it concise (≤6 sentences).',
        'You are a clarifier who fixes small errors and improves readability. Polish the previous responses into a clear, final answer.'
      ];

      const conversationMessages: ChatMessage[] = [
        sys(systemPrompts[i] || systemPrompts[0]),
        ...history,
        user(question)
      ];

      // Add context from previous speakers
      if (responses.length > 0) {
        const context = responses.map((resp, idx) => `Speaker ${idx + 1}: ${resp}`).join('\n\n');
        conversationMessages.push(user(`Previous responses:\n${context}\n\nPlease add your perspective.`));
      }

      const step = await this.runTurn(i + 1, provider, conversationMessages, config.seed_temperature || 0.3, emit);
      steps.push(step);
      responses.push(step.response.text);
      
      totalTokens += step.response.usage?.total_tokens || 0;
      totalLatency += step.response.latency_ms;
    }

    // Combine responses for final answer
    const final_answer = responses.length === 1 ? responses[0] : responses.join('\n\n---\n\n');

    const result: OrchestrationResult = {
      final_answer,
      steps,
      total_tokens: totalTokens,
      total_latency_ms: totalLatency,
      early_stopped: false,
      mode: 'conversation'
    };

    emit({ type: 'final', final_result: result });
    return result;
  }

  private async runAnswerMode(
    question: string,
    history: ChatMessage[],
    providers: Provider[],
    config: OrchestrationConfig,
    emit: (event: StreamEvent) => void
  ): Promise<OrchestrationResult> {
    const steps: OrchestrationStep[] = [];
    let totalTokens = 0;
    let totalLatency = 0;
    let earlyStoppedFlag = false;

    if (providers.length < 2) {
      throw new Error('Answer mode needs at least 2 providers (seed + refine)');
    }

    // Round 1: seed
    const pA = providers[0];
    const seedMessages: ChatMessage[] = [
      sys('Answer concisely and directly. If uncertain, say what\'s missing.'),
      ...history,
      user(question)
    ];
    
    const s1 = await this.runTurn(1, pA, seedMessages, config.seed_temperature || 0.35, emit);
    steps.push(s1);
    totalTokens += s1.response.usage?.total_tokens || 0;
    totalLatency += s1.response.latency_ms;

    // Round 2: refine
    const pB = providers[1];
    const refineMessages: ChatMessage[] = [
      sys('You are a careful editor. Improve the previous answer by correcting mistakes and adding missing key points. Keep it concise.'),
      ...history,
      user(question),
      user(`Previous answer:\n${s1.response.text}\n\nPlease improve this answer.`)
    ];
    
    const s2 = await this.runTurn(2, pB, refineMessages, config.refine_temperature || 0.15, emit);
    steps.push(s2);
    totalTokens += s2.response.usage?.total_tokens || 0;
    totalLatency += s2.response.latency_ms;

    let current = s2.response.text;
    
    // Check early stopping
    const { earlyStop } = this.maybeDiffAndStop(s1.response.text, current, config, 2, emit);
    if (earlyStop || providers.length === 2) {
      earlyStoppedFlag = earlyStop;
    } else if (providers.length > 2) {
      // Round 3: polish or judge
      const pC = providers[2];
      let judgeScore: number | undefined;

      if (config.use_judge) {
        judgeScore = await runJudge(question, current);
        emit({ type: 'final', final_result: { final_answer: current, steps, total_tokens: totalTokens, total_latency_ms: totalLatency, early_stopped: earlyStoppedFlag, mode: 'answer' } });
        if (judgeScore < 7.5) {
          // One more refine using strongest provider
          const extraRefineMessages: ChatMessage[] = [
            sys('You are a careful editor. Improve the previous answer by correcting mistakes and adding missing key points. Keep it concise.'),
            ...history,
            user(question),
            user(`Previous answer:\n${current}\n\nPlease improve this answer further.`)
          ];
          const s3 = await this.runTurn(3, pA, extraRefineMessages, config.refine_temperature || 0.15, emit);
          steps.push(s3);
          current = s3.response.text;
          totalTokens += s3.response.usage?.total_tokens || 0;
          totalLatency += s3.response.latency_ms;
        }
      } else {
        // Polish with C
        const polishMessages: ChatMessage[] = [
          sys('You are a polishing assistant. Tighten clarity and remove redundancy from the previous answer. Return only the improved version.'),
          ...history,
          user(question),
          user(`Previous answer:\n${current}\n\nPlease polish this answer.`)
        ];
        const s3 = await this.runTurn(3, pC, polishMessages, config.refine_temperature || 0.15, emit);
        steps.push(s3);
        current = s3.response.text;
        totalTokens += s3.response.usage?.total_tokens || 0;
        totalLatency += s3.response.latency_ms;
        this.maybeDiffAndStop(s2.response.text, current, config, 3, emit);
      }
    }

    // Optional verifier
    if (config.use_verifier) {
      await runVerifier(current);
    }

    const result: OrchestrationResult = {
      final_answer: current,
      steps,
      total_tokens: totalTokens,
      total_latency_ms: totalLatency,
      early_stopped: earlyStoppedFlag,
      mode: 'answer'
    };

    emit({ type: 'final', final_result: result });
    return result;
  }

  private async runArgumentativeMode(
    question: string,
    history: ChatMessage[],
    providers: Provider[],
    config: OrchestrationConfig,
    emit: (event: StreamEvent) => void
  ): Promise<OrchestrationResult> {
    const steps: OrchestrationStep[] = [];
    let totalTokens = 0;
    let totalLatency = 0;

    if (providers.length < 3) {
      throw new Error('Argumentative mode needs 3 providers (A, B, C arbiter)');
    }

    // A & B in parallel
    const pA = providers[0], pB = providers[1], pC = providers[2];
    const baseMsgs: ChatMessage[] = [
      sys('Propose an answer and state key assumptions briefly.'),
      ...history,
      user(question)
    ];

    emit({ type: 'round_start', round: 1, provider_id: pA.id });
    emit({ type: 'round_start', round: 1, provider_id: pB.id });

    const [aRes, bRes] = await Promise.all([
      callProvider(pA, baseMsgs, config.seed_temperature || 0.3),
      callProvider(pB, baseMsgs, config.seed_temperature || 0.3)
    ]);

    const sA: OrchestrationStep = {
      round: 1,
      provider_id: pA.id,
      prompt: question,
      response: aRes
    };
    const sB: OrchestrationStep = {
      round: 1,
      provider_id: pB.id,
      prompt: question,
      response: bRes
    };

    steps.push(sA, sB);
    totalTokens += (aRes.usage?.total_tokens || 0) + (bRes.usage?.total_tokens || 0);
    totalLatency += Math.max(aRes.latency_ms, bRes.latency_ms);

    emit({ type: 'round_result', round: 1, provider_id: pA.id, result: aRes });
    emit({ type: 'round_result', round: 1, provider_id: pB.id, result: bRes });

    // C: arbiter
    const arbiterMessages: ChatMessage[] = [
      sys('You are an arbiter who resolves disagreements. Compare both responses, choose stronger reasoning with brief justification, then produce a single final answer. Note remaining uncertainty if any.'),
      ...history,
      user(question),
      user(`Two responses to consider:\n\nResponse A:\n${aRes.text}\n\nResponse B:\n${bRes.text}\n\nPlease provide your final arbitrated answer.`)
    ];

    const sC = await this.runTurn(2, pC, arbiterMessages, config.refine_temperature || 0.2, emit);
    steps.push(sC);
    totalTokens += sC.response.usage?.total_tokens || 0;
    totalLatency += sC.response.latency_ms;

    const final_answer = sC.response.text;
    this.maybeDiffAndStop(aRes.text, final_answer, config, 2, emit);

    const result: OrchestrationResult = {
      final_answer,
      steps,
      total_tokens: totalTokens,
      total_latency_ms: totalLatency,
      early_stopped: false,
      mode: 'argumentative'
    };

    emit({ type: 'final', final_result: result });
    return result;
  }

  private async runResearchMode(
    question: string,
    history: ChatMessage[],
    providers: Provider[],
    config: OrchestrationConfig,
    emit: (event: StreamEvent) => void
  ): Promise<OrchestrationResult> {
    const steps: OrchestrationStep[] = [];
    let totalTokens = 0;
    let totalLatency = 0;

    if (providers.length < 3) {
      throw new Error('Research mode needs 3 providers (lead, suggest, rewrite)');
    }

    // A: lead outline
    const pA = providers[0];
    const leadMessages: ChatMessage[] = [
      sys('You are the lead researcher. Produce a thorough, structured outline answer in bullet points. If sources are provided in context, cite them.'),
      ...history,
      user(question)
    ];
    const s1 = await this.runTurn(1, pA, leadMessages, config.seed_temperature || 0.3, emit);
    steps.push(s1);
    totalTokens += s1.response.usage?.total_tokens || 0;
    totalLatency += s1.response.latency_ms;

    // B: suggestions
    const pB = providers[1];
    const suggestMessages: ChatMessage[] = [
      sys('Suggest improvements ONLY (no rewrite). Return bullet points: missing angles, data to fetch, structure changes, key caveats.'),
      ...history,
      user(question),
      user(`LEAD_OUTLINE:\n${s1.response.text}`)
    ];
    const s2 = await this.runTurn(2, pB, suggestMessages, config.refine_temperature || 0.2, emit);
    steps.push(s2);
    totalTokens += s2.response.usage?.total_tokens || 0;
    totalLatency += s2.response.latency_ms;

    // C: rewrite
    const pC = providers[2];
    const rewriteMessages: ChatMessage[] = [
      sys('Rewrite the answer, incorporating the suggestions. Keep correct parts; add missing key points. If sources were provided, cite like [S1]. Return ONLY the rewritten answer.'),
      ...history,
      user(question),
      user(`LEAD:\n${s1.response.text}\n\nSUGGESTIONS:\n${s2.response.text}`)
    ];
    const s3 = await this.runTurn(3, pC, rewriteMessages, config.refine_temperature || 0.2, emit);
    steps.push(s3);
    totalTokens += s3.response.usage?.total_tokens || 0;
    totalLatency += s3.response.latency_ms;

    // Optional extra rounds (B -> C)
    let final_answer = s3.response.text;
    for (let r = 2; r <= (config.rounds || 1); r++) {
      const { earlyStop } = this.maybeDiffAndStop(steps[steps.length - 1].response.text, final_answer, config, steps.length, emit);
      if (earlyStop) break;

      // Suggestions again based on latest draft
      const suggestMessages2: ChatMessage[] = [
        sys('Suggest improvements ONLY (no rewrite). Return bullet points: missing angles, data to fetch, structure changes, key caveats.'),
        ...history,
        user(question),
        user(`Current draft:\n${final_answer}`)
      ];
      const sB2 = await this.runTurn(steps.length + 1, pB, suggestMessages2, config.refine_temperature || 0.2, emit);
      steps.push(sB2);
      totalTokens += sB2.response.usage?.total_tokens || 0;
      totalLatency += sB2.response.latency_ms;

      const rewriteMessages2: ChatMessage[] = [
        sys('Rewrite the answer, incorporating the suggestions. Keep correct parts; add missing key points. Return ONLY the rewritten answer.'),
        ...history,
        user(question),
        user(`Current draft:\n${final_answer}\n\nSUGGESTIONS:\n${sB2.response.text}`)
      ];
      const sC2 = await this.runTurn(steps.length + 1, pC, rewriteMessages2, config.refine_temperature || 0.2, emit);
      steps.push(sC2);
      final_answer = sC2.response.text;
      totalTokens += sC2.response.usage?.total_tokens || 0;
      totalLatency += sC2.response.latency_ms;
    }

    const result: OrchestrationResult = {
      final_answer,
      steps,
      total_tokens: totalTokens,
      total_latency_ms: totalLatency,
      early_stopped: false,
      mode: 'research'
    };

    emit({ type: 'final', final_result: result });
    return result;
  }


}
