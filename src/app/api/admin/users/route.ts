import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/store';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await UserRepository.getAllManagedAccounts();
    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch managed accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      password,
      role,
      institution,
      teamName,
      judgePin,
      judgeDesignation,
      companyOrFirm,
      investmentCapacity,
    } = body;

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Full name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ['student', 'judge', 'student_affairs', 'registration_team', 'tv_admin', 'investor', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role specified.' },
        { status: 400 }
      );
    }

    const result = await UserRepository.register({
      fullName,
      email,
      password,
      role,
      institution: institution || 'IMSciences Peshawar',
      teamName: role === 'student' ? (teamName || `${fullName}'s Team`) : undefined,
      judgePin: role === 'judge' ? (judgePin || '2027') : undefined,
      judgeDesignation,
      companyOrFirm,
      investmentCapacity,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create account.' },
        { status: 400 }
      );
    }

    // Ensure admin-created accounts are immediately approved
    if (role === 'investor' && !result.user.isApproved) {
      await UserRepository.updateInvestorApproval(result.user.id, true);
      result.user.isApproved = true;
    }

    return NextResponse.json({
      success: true,
      message: `Created ${role.replace('_', ' ').toUpperCase()} account for ${result.user.fullName}.`,
      user: result.user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create account.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const res = await UserRepository.deleteUser(id);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Account removed.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to remove account.' }, { status: 500 });
  }
}

