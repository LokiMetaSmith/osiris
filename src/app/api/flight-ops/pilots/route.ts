import { NextResponse } from 'next/server';
import { getPilots, createPilot } from '@/lib/db/flight-ops-store';

export async function GET() {
  try {
    const pilots = await getPilots();
    return NextResponse.json(pilots);
  } catch (error) {
    console.error('Error fetching pilots:', error);
    return NextResponse.json({ error: 'Failed to fetch pilots' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const pilot = await createPilot(data);
    return NextResponse.json(pilot);
  } catch (error) {
    console.error('Error creating pilot:', error);
    return NextResponse.json({ error: 'Failed to create pilot' }, { status: 500 });
  }
}
