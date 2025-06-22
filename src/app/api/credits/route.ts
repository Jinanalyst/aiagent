import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('wallet_address', walletAddress)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      credits: user.credits,
      plan: user.plan,
    });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, credits, plan } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          credits: credits || 0,
          plan: plan || 'free',
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }
    } else {
      // Create new user
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          credits: credits || 10, // Free users get 10 credits
          plan: plan || 'free',
        });

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }

    // Record credit transaction if credits were purchased
    if (credits && credits > 0) {
      await supabase.from('credit_transactions').insert({
        user_id: walletAddress,
        type: 'purchase',
        amount: credits,
        description: `Purchased ${credits} credits`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Credits updated successfully',
    });
  } catch (error) {
    console.error('Credits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 