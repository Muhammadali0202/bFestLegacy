import { NextRequest, NextResponse } from 'next/server';
import { InvestmentRepository, UserRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const investorId = searchParams.get('investorId');

    let investments = [];
    if (startupId) {
      investments = await InvestmentRepository.getByStartup(startupId);
    } else if (investorId) {
      investments = await InvestmentRepository.getByInvestor(investorId);
    } else {
      investments = await InvestmentRepository.getAll();
    }

    return NextResponse.json({
      success: true,
      count: investments.length,
      investments,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startupId, 
      investorId, 
      investorName, 
      firmName, 
      amount, 
      dealType, 
      rating, 
      review 
    } = body;

    if (!startupId || !investorId || amount === undefined || rating === undefined) {
      return NextResponse.json(
        { success: false, error: 'startupId, investorId, amount, and rating (1-5) are required.' },
        { status: 400 }
      );
    }

    // Verify Investor authorization & approval status
    const investor = await UserRepository.findById(investorId);
    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor account not found.' },
        { status: 404 }
      );
    }

    if (investor.role !== 'investor' && investor.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only registered investors or administrators can submit investment ratings.' },
        { status: 403 }
      );
    }

    if (!investor.isApproved) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Your investor account is currently pending approval by the Business Fest Organizer. You cannot invest until approved.' 
        },
        { status: 403 }
      );
    }

    const numAmount = Number(amount);
    const numRating = Number(rating);

    if (isNaN(numAmount) || numAmount < 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid investment amount.' },
        { status: 400 }
      );
    }

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5 stars.' },
        { status: 400 }
      );
    }

    const result = await InvestmentRepository.create({
      startupId,
      investorId,
      investorName: investorName || investor.fullName,
      firmName: firmName || investor.companyOrFirm,
      amount: numAmount,
      dealType,
      rating: numRating,
      review,
    });

    if (!result.success || !result.investment) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to record investment.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Investment of PKR ${numAmount.toLocaleString()} & rating of ${numRating}/5 recorded! This startup has received a ranking boost on the live leaderboard.`,
      investment: result.investment,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error recording investment.' },
      { status: 500 }
    );
  }
}
