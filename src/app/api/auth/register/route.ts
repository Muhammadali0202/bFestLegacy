import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Public registration is disabled. Please log in with an account provisioned by the Business Fest Administrator.',
    },
    { status: 403 }
  );
}
