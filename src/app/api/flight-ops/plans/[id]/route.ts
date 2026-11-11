import { NextResponse } from 'next/server';
import { getFlightPlan, updateFlightPlanCompliance } from '@/lib/db/flight-ops-store';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const plan = await getFlightPlan(id);
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching flight plan:', error);
    return NextResponse.json({ error: 'Failed to fetch flight plan' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (body.pre_flight_compliance) {
        const plan = await updateFlightPlanCompliance(id, body.pre_flight_compliance);
        return NextResponse.json(plan);
    }
    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  } catch (error) {
    console.error('Error updating flight plan:', error);
    return NextResponse.json({ error: 'Failed to update flight plan' }, { status: 500 });
  }
}
