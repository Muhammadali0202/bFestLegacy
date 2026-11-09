import { NextRequest, NextResponse } from 'next/server';
import { StartupRepository } from '@/lib/store';
import { BusinessSector } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_SECTORS: BusinessSector[] = [
  'FinTech & Banking',
  'AgriTech & Food',
  'HealthTech & Med',
  'EdTech & Learning',
  'AI & Smart Systems',
  'Green & CleanTech',
  'E-Commerce & Logistics',
];

function normalizeSector(rawSector?: string): BusinessSector {
  if (!rawSector) return 'AI & Smart Systems';
  const cleaned = rawSector.trim().toLowerCase();
  const match = VALID_SECTORS.find(
    (s) =>
      s.toLowerCase() === cleaned ||
      s.toLowerCase().includes(cleaned) ||
      cleaned.includes(s.split(' ')[0].toLowerCase())
  );
  return match || 'AI & Smart Systems';
}

function extractField(body: Record<string, any>, keys: string[]): string {
  // Support both flat JSON and Google Apps Script `namedValues` object (where values are arrays)
  const source = body.namedValues && typeof body.namedValues === 'object' ? body.namedValues : body;

  for (const key of Object.keys(source)) {
    const lowerKey = key.trim().toLowerCase();
    if (keys.some((k) => lowerKey === k.toLowerCase() || lowerKey.includes(k.toLowerCase()))) {
      const val = source[key];
      if (Array.isArray(val)) return String(val[0] || '').trim();
      if (val !== undefined && val !== null) return String(val).trim();
    }
  }
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.GOOGLE_FORM_WEBHOOK_SECRET || 'bfest_google_form_2027';
    const headerSecret =
      request.headers.get('x-webhook-secret') ||
      new URL(request.url).searchParams.get('secret');

    if (configuredSecret && headerSecret && headerSecret !== configuredSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook secret.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      body.name ||
      extractField(body, ['startup name', 'venture name', 'project name', 'team name', 'title', 'name']);
    const tagline =
      body.tagline ||
      extractField(body, ['tagline', 'short pitch', 'one-liner', 'summary']) ||
      'Student Venture at Business Fest 2027';
    const description =
      body.description ||
      extractField(body, ['description', 'about', 'overview', 'details']) ||
      tagline;
    const problem =
      body.problem ||
      extractField(body, ['problem', 'challenge']);
    const solution =
      body.solution ||
      extractField(body, ['solution', 'product', 'innovation']);
    const rawSector =
      body.sector ||
      extractField(body, ['sector', 'category', 'industry', 'track']);
    const contactEmail =
      body.contactEmail ||
      extractField(body, ['email', 'contact email', 'email address']);
    const website =
      body.website ||
      extractField(body, ['website', 'url', 'demo link', 'link']);
    const founderName =
      extractField(body, ['founder', 'team lead', 'leader name', 'student name', 'full name']) ||
      'Student Founder';
    const founderRole =
      extractField(body, ['role', 'designation', 'department']) ||
      'Team Lead';
    const boothNumber =
      body.boothNumber ||
      extractField(body, ['booth', 'stall']) ||
      'Pending Allocation';

    if (!name || !contactEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Form payload must include at least Startup Name and Contact Email.',
        },
        { status: 400 }
      );
    }

    const founders =
      Array.isArray(body.founders) && body.founders.length > 0
        ? body.founders
        : [{ name: founderName, role: founderRole }];

    const startup = await StartupRepository.register({
      name,
      tagline,
      description,
      problem,
      solution,
      sector: normalizeSector(rawSector),
      logo: body.logo || '🚀',
      website,
      contactEmail,
      founders,
      boothNumber,
      submittedBy: 'google-form-webhook',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Startup registered from Google Form and added to the Admin Moderation Queue.',
        startup,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error processing Google Form webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process Google Form submission.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    endpoint: '/api/webhooks/google-form',
    status: 'active',
    instructions: 'Send a POST request from Google Forms Apps Script with startup details.',
  });
}

