import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const startup = await StartupRepository.getById(id);

    if (!startup) {
      return NextResponse.json({ success: false, error: 'Startup not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, startup });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch startup' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const hasDetailUpdates =
      body.name !== undefined ||
      body.tagline !== undefined ||
      body.description !== undefined ||
      body.problem !== undefined ||
      body.solution !== undefined ||
      body.sector !== undefined ||
      body.logo !== undefined ||
      body.website !== undefined ||
      body.contactEmail !== undefined ||
      body.founders !== undefined;

    let updated = null;
    if (hasDetailUpdates) {
      updated = await StartupRepository.updateDetails(id, body);
    }
    if (body.status !== undefined || body.isPublished !== undefined || (body.isFirstSemester !== undefined && !hasDetailUpdates)) {
      updated = await StartupRepository.updateStatus(id, body.status, body.isPublished, body.isFirstSemester);
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Startup not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Startup status updated successfully',
      startup: updated 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update startup' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await StartupRepository.delete(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Startup not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Startup removed successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to remove startup' }, { status: 500 });
  }
}
