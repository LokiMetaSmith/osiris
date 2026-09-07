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

-- 5. Pilots & Operators
CREATE TABLE IF NOT EXISTS pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    faa_cert_number VARCHAR(128),
    cert_expiration_date DATE,
    noaa_uxsoc_certified BOOLEAN DEFAULT FALSE,
    flight_hours_logged NUMERIC(8,2) DEFAULT 0.0,
    status VARCHAR(32) DEFAULT 'active' -- active, suspended, expired
);

-- 6. Airframes (Drones)
CREATE TABLE IF NOT EXISTS drones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(128) UNIQUE NOT NULL,
    serial_number VARCHAR(128) UNIQUE NOT NULL,
    make_model VARCHAR(128) NOT NULL,
    airframe_type VARCHAR(64) NOT NULL, -- multirotor, fixed-wing, glider, hybrid
    empty_weight_kg NUMERIC(6,2),
    max_takeoff_weight_kg NUMERIC(6,2),
    airworthiness_status VARCHAR(32) DEFAULT 'airworthy', -- airworthy, maintenance, grounded
    last_inspection_date DATE,
    -- Baseline Airworthiness Qualification (Part 1 & TP-01 to TP-04)
    baseline_qualification JSONB DEFAULT '{}'::jsonb
);

-- 7. Flight Plans & Operations
CREATE TABLE IF NOT EXISTS flight_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_name VARCHAR(255) NOT NULL,
    pilot_id UUID REFERENCES pilots(id) ON DELETE SET NULL,
    drone_id UUID REFERENCES drones(id) ON DELETE RESTRICT,
    planned_start TIMESTAMPTZ,
    planned_end TIMESTAMPTZ,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    airspace_class VARCHAR(16),
    max_altitude_ft_agl NUMERIC(8,2),
    max_altitude_ft_msl NUMERIC(8,2),
    laanc_auth_id VARCHAR(128),
    coa_number VARCHAR(128),
    geometry_geojson JSONB,
    status VARCHAR(32) DEFAULT 'draft', -- draft, filed, active, completed, cancelled
    -- Operational Qualifications & Part 2 (Pre-flight, TP-05 to TP-08)
    pre_flight_compliance JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flight_plans_status ON flight_plans(status);
CREATE INDEX IF NOT EXISTS idx_flight_plans_drone_id ON flight_plans(drone_id);
CREATE INDEX IF NOT EXISTS idx_flight_plans_pilot_id ON flight_plans(pilot_id);
