
import { NextRequest, NextResponse } from 'next/server';
import { testProvider } from '@/lib/providers';
import { Provider } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const provider: Provider = await request.json();

    if (!provider || !provider.baseUrl || !provider.model) {
      return NextResponse.json({ 
        error: 'Missing required provider configuration' 
      }, { status: 400 });
    }

    const result = await testProvider(provider);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Provider test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Provider test failed' 
    }, { status: 500 });
  }
}
