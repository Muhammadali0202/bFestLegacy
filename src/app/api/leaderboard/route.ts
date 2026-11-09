import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';
import { syncGoogleSheetToDatabase } from '@/lib/sheetSync';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    try {
      await syncGoogleSheetToDatabase();
    } catch (_) {
      // Continue even if background sheet sync is unreachable
    }

    const { searchParams } = new URL(request.url);
    const sector = searchParams.get('sector') || undefined;

    const leaderboard = await StartupRepository.getLeaderboard(sector);
    return NextResponse.json({ success: true, ...leaderboard });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
