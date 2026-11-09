import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startupId, voterToken, rating, feedback, userRole } = body;

    // Verify Student Affairs or Admin access
    const tokenCookie = request.cookies.get('bf_session')?.value;
    const sessionUser = tokenCookie ? verifySessionToken(tokenCookie) : null;
    const effectiveRole = sessionUser?.role || userRole;

    if (effectiveRole !== 'student_affairs' && effectiveRole !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Rating access is restricted to IMSciences Student Affairs only.',
      }, { status: 403 });
    }

    if (!startupId || !voterToken || !rating) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: startupId, voterToken, and rating are required.' 
      }, { status: 400 });
    }

    const result = await StartupRepository.submitPublicVote({
      startupId,
      voterToken: sessionUser?.id ? `sa_${sessionUser.id}` : voterToken,
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
