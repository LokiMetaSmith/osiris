import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getDb() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  if (!pool) {
    console.warn('[PostGIS] DATABASE_URL not set, falling back to mock data for flight ops');
    return {
        query: async (text: string, params: any[] = []) => ({ rows: [] })
    } as any;
  }
  return pool;
}

export interface Pilot {
  id: string;
  full_name: string;
  email: string;
  faa_cert_number: string | null;
  cert_expiration_date: string | null;
  noaa_uxsoc_certified: boolean;
  flight_hours_logged: number;
  status: 'active' | 'suspended' | 'expired';
}

export interface Drone {
  id: string;
  registration_number: string;
  serial_number: string;
  make_model: string;
  airframe_type: string;
  empty_weight_kg: number | null;
  max_takeoff_weight_kg: number | null;
  airworthiness_status: 'airworthy' | 'maintenance' | 'grounded';
  last_inspection_date: string | null;
  baseline_qualification: any;
}

export interface FlightPlan {
  id: string;
  mission_name: string;
  pilot_id: string | null;
  drone_id: string | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  airspace_class: string | null;
  max_altitude_ft_agl: number | null;
  max_altitude_ft_msl: number | null;
  laanc_auth_id: string | null;
  coa_number: string | null;
  geometry_geojson: any | null;
  status: 'draft' | 'filed' | 'active' | 'completed' | 'cancelled';
  pre_flight_compliance: any;
  created_at: string;
}

export async function getPilots(): Promise<Pilot[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.query('SELECT * FROM pilots ORDER BY full_name ASC');
  return result.rows;
}

export async function getDrones(): Promise<Drone[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.query('SELECT * FROM drones ORDER BY registration_number ASC');
  return result.rows;
}

export async function getFlightPlans(): Promise<FlightPlan[]> {
  const db = await getDb();
  if (!db) return [];
  const result = await db.query(`
    SELECT
      fp.*,
      p.full_name as pilot_name,
      p.faa_cert_number,
      d.registration_number,
      d.make_model
    FROM flight_plans fp
    LEFT JOIN pilots p ON fp.pilot_id = p.id
    LEFT JOIN drones d ON fp.drone_id = d.id
    ORDER BY fp.created_at DESC
  `);
  return result.rows;
}

export async function getFlightPlan(id: string): Promise<FlightPlan | null> {
    const db = await getDb();
    if (!db) return null;
    const result = await db.query(`
      SELECT
        fp.*,
        p.full_name as pilot_name,
        p.faa_cert_number,
        d.registration_number,
        d.make_model
      FROM flight_plans fp
      LEFT JOIN pilots p ON fp.pilot_id = p.id
      LEFT JOIN drones d ON fp.drone_id = d.id
      WHERE fp.id = $1
    `, [id]);
    return result.rows[0] || null;
}

export async function createPilot(pilot: Partial<Pilot>): Promise<Pilot | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.query(
    `INSERT INTO pilots (full_name, email, faa_cert_number, cert_expiration_date, noaa_uxsoc_certified, flight_hours_logged, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [pilot.full_name, pilot.email, pilot.faa_cert_number, pilot.cert_expiration_date, pilot.noaa_uxsoc_certified || false, pilot.flight_hours_logged || 0, pilot.status || 'active']
  );
  return result.rows[0];
}

export async function createDrone(drone: Partial<Drone>): Promise<Drone | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.query(
    `INSERT INTO drones (registration_number, serial_number, make_model, airframe_type, empty_weight_kg, max_takeoff_weight_kg, airworthiness_status, last_inspection_date, baseline_qualification)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [drone.registration_number, drone.serial_number, drone.make_model, drone.airframe_type, drone.empty_weight_kg, drone.max_takeoff_weight_kg, drone.airworthiness_status || 'airworthy', drone.last_inspection_date, drone.baseline_qualification || '{}']
  );
  return result.rows[0];
}

export async function createFlightPlan(plan: Partial<FlightPlan>): Promise<FlightPlan | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.query(
    `INSERT INTO flight_plans (mission_name, pilot_id, drone_id, planned_start, planned_end, airspace_class, max_altitude_ft_agl, max_altitude_ft_msl, laanc_auth_id, coa_number, geometry_geojson, status, pre_flight_compliance)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
    [plan.mission_name, plan.pilot_id, plan.drone_id, plan.planned_start, plan.planned_end, plan.airspace_class, plan.max_altitude_ft_agl, plan.max_altitude_ft_msl, plan.laanc_auth_id, plan.coa_number, plan.geometry_geojson, plan.status || 'draft', plan.pre_flight_compliance || '{}']
  );
  return result.rows[0];
}

export async function updateFlightPlanCompliance(id: string, compliance: any): Promise<FlightPlan | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db.query(
        `UPDATE flight_plans SET pre_flight_compliance = $1 WHERE id = $2 RETURNING *`,
        [compliance, id]
    );
    return result.rows[0];
}
