import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { UserRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('bf_session')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    // Refresh from repository to get latest isApproved state or changes
    const freshUser = await UserRepository.findById(payload.id);
    if (!freshUser) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: freshUser,
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
