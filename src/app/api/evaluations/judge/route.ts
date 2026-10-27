import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { startupId, judgeName, judgePin, innovationScore, marketScore, executionScore, pitchScore, notes } = body;

    if (!startupId || innovationScore === undefined || marketScore === undefined || executionScore === undefined || pitchScore === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required rubric scores (innovation, market, execution, pitch) or startup ID.' 
      }, { status: 400 });
    }

    const result = await StartupRepository.submitJudgeScore({
      startupId,
      judgeName: judgeName || 'Honorable Judge',
      judgePin,
      innovationScore: Number(innovationScore),
      marketScore: Number(marketScore),
      executionScore: Number(executionScore),
      pitchScore: Number(pitchScore),
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: result.message, 
      evaluation: result.evaluation 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to submit evaluation' }, { status: 500 });
  }
}
