import { NextResponse } from 'next/server';
import { getStorageDiagnostics } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const diagnostics = await getStorageDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: error.message || 'Failed to check database health',
      },
      { status: 500 }
    );
  }
}

