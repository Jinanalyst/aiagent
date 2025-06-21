import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not found',
        details: 'Please set OPENAI_API_KEY in your .env.local file'
      }, { status: 500 });
    }

    if (apiKey === 'your_openai_api_key_here') {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        details: 'Please replace the placeholder with your actual OpenAI API key'
      }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Test the API key with a simple request
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Say "Hello, API is working!"' }],
      max_tokens: 10,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'OpenAI API is working correctly',
      response: response.choices[0].message.content
    });

  } catch (error) {
    console.error('OpenAI API test error:', error);
    return NextResponse.json({ 
      error: 'OpenAI API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 