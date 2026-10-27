import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector') || undefined;

    const leaderboard = await StartupRepository.getLeaderboard(sector);
    return NextResponse.json({ success: true, ...leaderboard });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
