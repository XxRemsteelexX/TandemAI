
import { NextRequest, NextResponse } from 'next/server';
import { callProvider } from '@/lib/providers';
import { Provider, ChatMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, messages, temperature = 0.2, maxTokens }: {
      provider: Provider;
      messages: ChatMessage[];
      temperature?: number;
      maxTokens?: number;
    } = body;

    if (!provider || !messages) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const result = await callProvider(provider, messages, temperature, maxTokens);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Chat request failed' 
    }, { status: 500 });
  }
}
