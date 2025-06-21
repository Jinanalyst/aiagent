import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { action, referrerId, newUserId, upgradeType } = await req.json();

    if (action === 'track_signup') {
      // Handle new user signup with referral
      if (referrerId && newUserId) {
        // In a real app, you'd save this to a database
        // For now, we'll use localStorage simulation
        
        // Award tokens to both referrer and new user
        const tokensToAward = 10;
        
        return NextResponse.json({
          success: true,
          message: 'Referral tracked successfully',
          tokensAwarded: tokensToAward,
          referrerId,
          newUserId
        });
      }
    }

    if (action === 'track_upgrade') {
      // Handle pro upgrade bonus
      if (referrerId && upgradeType === 'pro') {
        const bonusTokens = 50;
        
        return NextResponse.json({
          success: true,
          message: 'Pro upgrade bonus tracked',
          bonusTokens,
          referrerId
        });
      }
    }

    if (action === 'get_stats') {
      // Get referral stats for a user
      const requestData = await req.json();
      
      // In a real app, you'd fetch from database
      // For demo, return mock data
      return NextResponse.json({
        success: true,
        stats: {
          tokensEarned: 0,
          freeReferrals: 0,
          proReferrals: 0
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });
    }

    // In a real app, fetch from database
    // For demo, return mock stats
    const stats = {
      tokensEarned: 0,
      freeReferrals: 0,
      proReferrals: 0
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Referral GET API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 