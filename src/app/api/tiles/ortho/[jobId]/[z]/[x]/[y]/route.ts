import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ jobId: string; z: string; x: string; y: string }> }
) {
  const { jobId, z, x, y } = await context.params;

  try {
    // Generate a tactical 256x256 raster orthomosaic tile overlay using sharp
    const svgOverlay = `
      <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" fill="#003311" fill-opacity="0.55" stroke="#00ff66" stroke-width="2"/>
        <line x1="0" y1="0" x2="256" y2="256" stroke="#00ff66" stroke-width="0.5" stroke-dasharray="4"/>
        <line x1="256" y1="0" x2="0" y2="256" stroke="#00ff66" stroke-width="0.5" stroke-dasharray="4"/>
        <text x="128" y="120" font-family="monospace" font-size="12" fill="#00ff66" text-anchor="middle" font-weight="bold">ORTHO ORTHOMOSAIC</text>
        <text x="128" y="140" font-family="monospace" font-size="10" fill="#aaffcc" text-anchor="middle">${jobId}</text>
        <text x="128" y="160" font-family="monospace" font-size="9" fill="#00ff66" text-anchor="middle">Z:${z} X:${x} Y:${y}</text>
      </svg>
    `;

    const imageBuffer = await sharp(Buffer.from(svgOverlay))
      .png()
      .toBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating tile', { status: 500 });
  }
}
