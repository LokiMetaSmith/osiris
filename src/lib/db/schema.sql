-- PostGIS Spatial Schema for Aerial Telemetry & Geofencing Intelligence

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Active Sensors Table
CREATE TABLE IF NOT EXISTS sensors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'drone',
    heading NUMERIC(5,2) DEFAULT 0,
    speed NUMERIC(6,2) DEFAULT 0,
    battery NUMERIC(4,1) DEFAULT 100.0,
    alt NUMERIC(8,2) DEFAULT 0,
    stream_url TEXT,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors USING GIST (location);

-- 2. Historical Telemetry Audit Log
CREATE TABLE IF NOT EXISTS telemetry_history (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(64) NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    heading NUMERIC(5,2),
    speed NUMERIC(6,2),
    battery NUMERIC(4,1),
    alt NUMERIC(8,2),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_sensor_time ON telemetry_history (sensor_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_location ON telemetry_history USING GIST (location);

-- 3. Dynamic Geofences (No-Fly Zones & Airspace Restrictions)
CREATE TABLE IF NOT EXISTS geofences (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'no_fly_zone', -- no_fly_zone, restricted, warning
    min_alt NUMERIC(8,2) DEFAULT 0,
    max_alt NUMERIC(8,2) DEFAULT 10000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    polygon GEOMETRY(Polygon, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_geofences_polygon ON geofences USING GIST (polygon);

-- 4. Airspace Violation Alerts
CREATE TABLE IF NOT EXISTS airspace_alerts (
    id VARCHAR(64) PRIMARY KEY,
    sensor_id VARCHAR(64) NOT NULL,
    geofence_id VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'HIGH', -- LOW, MEDIUM, HIGH, CRITICAL
    message TEXT NOT NULL,
    triggered_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    location GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_alerts_triggered ON airspace_alerts (triggered_at DESC);
