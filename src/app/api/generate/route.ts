import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { CREDIT_USAGE } from '@/lib/solana/wallet';
import { GenerationRequest, GenerationResponse } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { prompt, walletAddress, model = 'gpt-4o' } = await req.json();

  if (!prompt || !walletAddress) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // 1. Check user's credit balance
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('walletAddress', walletAddress)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found or error fetching user' }, { status: 404 });
  }

  const creditsRequired = 1; // Always deduct 1 credit per request
  if (user.credits < creditsRequired) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  // 2. Generate content with the selected AI model
  let completion;
  try {
    const modelKey = model as 'gpt-4o' | 'claude-3-sonnet-20240229' | 'claude-3-opus-20240229';

    if (modelKey.startsWith('gpt')) {
      const response = await openai.chat.completions.create({
        model: modelKey,
        messages: [{ role: 'user', content: prompt }],
      });
      completion = response.choices[0].message.content;
    } else if (modelKey.startsWith('claude')) {
      const response = await anthropic.messages.create({
        model: modelKey,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find(block => block.type === 'text');
      completion = textBlock ? textBlock.text : '';
    } else {
        return NextResponse.json({ error: 'Invalid model specified' }, { status: 400 });
    }

    if (!completion) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    // 3. Deduct credits
    const newCredits = user.credits - creditsRequired;
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('walletAddress', walletAddress);

    if (updateError) {
      // Log the error but still return the completion
      console.error('Failed to deduct credits:', updateError);
    }

    // 4. Return the generated content
    return NextResponse.json({ completion });

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: 'An error occurred during generation.' }, { status: 500 });
  }
} 