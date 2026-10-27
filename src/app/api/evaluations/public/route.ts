import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startupId, voterToken, rating, feedback } = body;

    if (!startupId || !voterToken || !rating) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: startupId, voterToken, and rating are required.' 
      }, { status: 400 });
    }

    const result = await StartupRepository.submitPublicVote({
      startupId,
      voterToken,
      rating: Number(rating),
      feedback,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record vote' }, { status: 500 });
  }
}
