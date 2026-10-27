import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as any) || 'all';

    const investors = await UserRepository.getAllInvestors(status);
    return NextResponse.json({
      success: true,
      count: investors.length,
      investors,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investors list' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { investorId, isApproved } = body;

    if (!investorId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'investorId and isApproved (boolean) are required.' },
        { status: 400 }
      );
    }

    const result = await UserRepository.updateInvestorApproval(investorId, isApproved);
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update investor approval.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Investor ${result.user.fullName} has been ${isApproved ? 'approved' : 'suspended'}.`,
      investor: result.user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update investor status' },
      { status: 500 }
    );
  }
}
