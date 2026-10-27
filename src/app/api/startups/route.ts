import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const sector = searchParams.get('sector') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const onlyPublished = searchParams.get('onlyPublished') === 'true';
    const submittedBy = searchParams.get('submittedBy') || undefined;

    const startups = await StartupRepository.getAll({
      search,
      sector,
      status,
      onlyPublished,
      submittedBy,
    });

    return NextResponse.json({ success: true, count: startups.length, startups });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch startups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.tagline || !body.sector || !body.contactEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: name, tagline, sector, and contactEmail are required.' 
      }, { status: 400 });
    }

    const newStartup = await StartupRepository.register({
      name: body.name,
      tagline: body.tagline,
      description: body.description || '',
      problem: body.problem || '',
      solution: body.solution || '',
      sector: body.sector,
      logo: body.logo || '🚀',
      website: body.website || '',
      contactEmail: body.contactEmail,
      founders: body.founders || [{ name: 'Founder', role: 'Lead' }],
      boothNumber: body.boothNumber || 'Pending Allocation',
      submittedBy: body.submittedBy,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Startup registered successfully. It is now pending organizer review.',
      startup: newStartup 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to register startup' }, { status: 500 });
  }
}
