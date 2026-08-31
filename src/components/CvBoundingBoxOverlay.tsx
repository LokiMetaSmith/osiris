'use client';

import React, { useEffect, useRef } from 'react';
import { BoundingBoxDetection } from '@/lib/cv/target-tracker';

interface CvOverlayProps {
  detections: BoundingBoxDetection[];
  width?: number;
  height?: number;
}

const CLASS_COLORS: Record<string, string> = {
  vehicle: '#38bdf8', // Sky blue
  truck: '#f59e0b',   // Amber
  vessel: '#06b6d4',  // Cyan
  aircraft: '#a855f7',// Purple
  person: '#10b981'   // Emerald
};

export function CvBoundingBoxOverlay({ detections, width = 640, height = 360 }: CvOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    detections.forEach((det) => {
      const x = det.x1 * width;
      const y = det.y1 * height;
      const w = (det.x2 - det.x1) * width;
      const h = (det.y2 - det.y1) * height;

      const color = CLASS_COLORS[det.class_name] || '#ef4444';

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Draw corner accents
      const cornerLen = Math.min(w, h) * 0.2;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y);
      ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen);
      ctx.stroke();

      // Draw label background
      const label = `#${det.track_id} ${det.class_name.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 10px monospace';
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(x, y > 16 ? y - 16 : y, textWidth + 8, 14);

      // Draw label text
      ctx.fillStyle = color;
      ctx.fillText(label, x + 4, y > 16 ? y - 5 : y + 10);
    });
  }, [detections, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full"
    />
  );
}
