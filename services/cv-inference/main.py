import os
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="OSINT Edge CV Microservice",
    description="YOLOv8 Aerial Object Detection & Bounding Box Target Tracking",
    version="1.0.0"
)

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_name: str
    track_id: int

class FrameDetectionResponse(BaseModel):
    frame_id: str
    timestamp: float
    processing_time_ms: float
    detections: List[BoundingBox]

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "cv-inference",
        "model": "YOLOv8s-VisDrone",
        "device": "CUDA/CPU Fallback"
    }

@app.post("/detect/frame", response_model=FrameDetectionResponse)
def detect_frame(frame_id: str, sensor_id: Optional[str] = None):
    start_time = time.time()

    # Simulated/Inference object detections on video frame (normalized coordinates 0.0 - 1.0)
    mock_detections = [
        BoundingBox(x1=0.42, y1=0.38, x2=0.51, y2=0.46, confidence=0.92, class_name="vehicle", track_id=101),
        BoundingBox(x1=0.65, y1=0.52, x2=0.72, y2=0.60, confidence=0.87, class_name="truck", track_id=102),
        BoundingBox(x1=0.25, y1=0.70, x2=0.30, y2=0.75, confidence=0.79, class_name="person", track_id=103)
    ]

    processing_time = (time.time() - start_time) * 1000

    return FrameDetectionResponse(
        frame_id=frame_id,
        timestamp=time.time(),
        processing_time_ms=round(processing_time, 2),
        detections=mock_detections
    )
