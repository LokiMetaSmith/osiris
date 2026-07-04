export type SensorType = 'drone' | 'ground' | 'maritime' | 'mobile';
export type SensorStatus = 'active' | 'standby' | 'offline' | 'warning';

export interface SensorTelemetry {
  lat: number;
  lng: number;
  alt?: number;
  heading?: number;
  speed?: number;
  battery?: number;
  signal_strength?: number; // 0-100
}

export interface LiveSensor {
  id: string;
  name: string;
  type: SensorType;
  status: SensorStatus;
  telemetry: SensorTelemetry;
  stream_url?: string;
  stream_type?: 'hls' | 'webrtc' | 'mjpeg';
  source: string;
  last_seen: string; // ISO timestamp
  metadata?: Record<string, any>;
}

export interface SensorRegistrationRequest {
  id: string;
  name: string;
  type: SensorType;
  stream_url?: string;
  stream_type?: 'hls' | 'webrtc' | 'mjpeg';
  source: string;
  token: string;
}

export interface SensorTelemetryUpdate {
  id: string;
  telemetry: SensorTelemetry;
  status?: SensorStatus;
  token: string;
}
