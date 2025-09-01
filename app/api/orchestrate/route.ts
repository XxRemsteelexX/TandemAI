
import { NextRequest, NextResponse } from 'next/server';
import { OrchestrationEngine } from '@/lib/orchestration';
import { ProviderManager } from '@/lib/providers';
import { ChatMessage, OrchestrationConfig, Provider, StreamEvent } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, config, providers }: {
      messages: ChatMessage[];
      config: OrchestrationConfig;
      providers: Provider[];
    } = body;

    if (!messages || !config || !providers) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Create provider map
    const providerMap = new Map<string, Provider>();
    providers.forEach(provider => providerMap.set(provider.id, provider));

    // Validate that all providers in sequence exist and are enabled
    for (const providerId of config.sequence) {
      const provider = providerMap.get(providerId);
      if (!provider) {
        return NextResponse.json({ error: `Provider ${providerId} not found` }, { status: 400 });
      }
      if (!provider.enabled) {
        return NextResponse.json({ error: `Provider ${providerId} is disabled` }, { status: 400 });
      }
    }

    const orchestrationEngine = new OrchestrationEngine(providerMap);

    // Create a readable stream for real-time updates
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const onStream = (event: StreamEvent) => {
          try {
            const data = JSON.stringify(event);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          } catch (error) {
            console.error('Stream encoding error:', error);
          }
        };

        try {
          // Execute orchestration with streaming
          const result = await orchestrationEngine.execute(messages, config, onStream);
          
          // Send final completion event
          const finalEvent: StreamEvent = {
            type: 'final',
            final_result: result
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          
        } catch (error: any) {
          console.error('Orchestration error:', error);
          
          const errorEvent: StreamEvent = {
            type: 'error',
            error: error.message || 'Unknown orchestration error'
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
