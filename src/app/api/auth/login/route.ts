import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/store';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await UserRepository.findByEmail(email);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Role check if specified by user login tab
    if (role && user.role !== role) {
      return NextResponse.json(
        { 
          success: false, 
          error: `This account is registered as a ${user.role.toUpperCase()}, not a ${role.toUpperCase()}. Please select the correct tab.` 
        },
        { status: 400 }
      );
    }

    // Strip passwordHash from response
    const { passwordHash: _, ...userSafe } = user;
    const token = createSessionToken(userSafe);

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${userSafe.fullName}!`,
      user: userSafe,
      token,
    });

    response.cookies.set('bf_session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
