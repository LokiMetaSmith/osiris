import { NextResponse } from 'next/server';
import { getDrones, createDrone } from '@/lib/db/flight-ops-store';

export async function GET() {
  try {
    const drones = await getDrones();
    return NextResponse.json(drones);
  } catch (error) {
    console.error('Error fetching drones:', error);
    return NextResponse.json({ error: 'Failed to fetch drones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const drone = await createDrone(data);
    return NextResponse.json(drone);
  } catch (error) {
    console.error('Error creating drone:', error);
    return NextResponse.json({ error: 'Failed to create drone' }, { status: 500 });
  }
}
