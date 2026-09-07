import { NextResponse } from 'next/server';
import { getFlightPlans, createFlightPlan } from '@/lib/db/flight-ops-store';

export async function GET() {
  try {
    const plans = await getFlightPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching flight plans:', error);
    return NextResponse.json({ error: 'Failed to fetch flight plans' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const plan = await createFlightPlan(data);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating flight plan:', error);
    return NextResponse.json({ error: 'Failed to create flight plan' }, { status: 500 });
  }
}
