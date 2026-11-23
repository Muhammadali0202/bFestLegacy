import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';
import { verifySessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startupId, voterToken, rating, rubricStars, rubricScores, progressPercentage, feedback, userRole } = body;

    // Verify Bfest's Officials (student_affairs) or Admin access
    const tokenCookie = request.cookies.get('bf_session')?.value;
    const sessionUser = tokenCookie ? verifySessionToken(tokenCookie) : null;
    const effectiveRole = sessionUser?.role || userRole;

    if (effectiveRole !== 'student_affairs' && effectiveRole !== 'admin') {
      return NextResponse.json({
        success: false,
        error: "Rating access is restricted to Bfest's Officials only.",
      }, { status: 403 });
    }

    if (!startupId || !voterToken || (rating === undefined && !rubricScores && !Array.isArray(rubricStars))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: startupId, voterToken, and rubric scores are required.' 
      }, { status: 400 });
    }

    let computedOutOf100 = Number(rating) || 0;
    if (rubricScores && typeof rubricScores === 'object') {
      computedOutOf100 = Object.values(rubricScores).reduce<number>(
        (sum, val) => sum + Math.min(10, Math.max(0, Number(val) || 0)),
        0
      );
    } else if (Array.isArray(rubricStars)) {
      computedOutOf100 = rubricStars.length * 10;
    }

    const result = await StartupRepository.submitPublicVote({
      startupId,
      voterToken: sessionUser?.id ? `sa_${sessionUser.id}` : voterToken,
      rating: computedOutOf100,
      rubricStars: Array.isArray(rubricStars) ? rubricStars : undefined,
      rubricScores: rubricScores && typeof rubricScores === 'object' ? rubricScores : undefined,
      progressPercentage: progressPercentage !== undefined ? Number(progressPercentage) : undefined,
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
