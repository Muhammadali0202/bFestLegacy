import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleSheetToDatabase } from '@/lib/sheetSync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheetUrl, googleFormUrl, csvData, autoApprove = true } = body;

    const result = await syncGoogleSheetToDatabase({
      sheetUrl,
      googleFormUrl,
      csvData,
      autoApprove,
      force: true,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error syncing Google Sheet:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync Google Sheet.' },
      { status: 500 }
    );
  }
}
