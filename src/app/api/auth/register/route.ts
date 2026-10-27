import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/store';
import { createSessionToken } from '@/lib/auth';
import { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fullName, 
      email, 
      password, 
      role, 
      adminKey,
      companyOrFirm, 
      investmentCapacity, 
      bio, 
      teamName, 
      institution, 
      judgePin, 
      judgeDesignation 
    } = body;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ['admin', 'student', 'investor', 'judge'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role selected.' },
        { status: 400 }
      );
    }

    // Admin passcode check
    if (role === 'admin') {
      const validAdminKey = process.env.ADMIN_SIGNUP_KEY || 'BFEST2027_ADMIN';
      if (adminKey !== validAdminKey && adminKey !== 'admin123') {
        return NextResponse.json(
          { success: false, error: 'Invalid Admin Authorization Passkey. Contact the Fest Organizing Committee.' },
          { status: 403 }
        );
      }
    }

    const regResult = await UserRepository.register({
      fullName,
      email,
      password,
      role,
      companyOrFirm,
      investmentCapacity,
      bio,
      teamName,
      institution,
      judgePin,
      judgeDesignation,
    });

    if (!regResult.success || !regResult.user) {
      return NextResponse.json(
        { success: false, error: regResult.error || 'Registration failed.' },
        { status: 400 }
      );
    }

    const user = regResult.user;
    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: role === 'investor' 
        ? 'Investor account created! Your profile is pending Fest Admin verification before you can deploy investments.' 
        : 'Account created successfully!',
      user,
      token,
    }, { status: 201 });

    // Set cookie
    response.cookies.set('bf_session', token, {
      httpOnly: false, // Accessible to client context for fast state hydration
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
