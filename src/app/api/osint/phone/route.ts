import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: "Not Implemented", message: "This endpoint has been stubbed and is pending local replacement." },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Not Implemented", message: "This endpoint has been stubbed and is pending local replacement." },
    { status: 501 }
  );
}
