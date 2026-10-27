import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';

export async function GET() {
  try {
    const config = await StartupRepository.getEventConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch event configuration' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await StartupRepository.updateEventConfig(body);
    return NextResponse.json({ success: true, message: 'Event configuration updated', config: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update event configuration' }, { status: 500 });
  }
}
