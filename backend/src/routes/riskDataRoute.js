import express from "express";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";
const usePgSSL =
  process.env.PGSSL === "true" ||
  process.env.PGSSLMODE === "require" ||
  isProduction;
const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED === "true";
const pgSslConfig = usePgSSL ? { ssl: { rejectUnauthorized } } : {};

// Local Postgres pool (PostGIS)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ...pgSslConfig,
      }
    : {
        user: process.env.PGUSER || "postgres",
        host: process.env.PGHOST || "localhost",
        database: process.env.PGDATABASE || "postgres",
        password: process.env.PGPASSWORD || "",
        port: Number(process.env.PGPORT || 5432),
        ...pgSslConfig,
      }
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to categorize risk
function categorize(score) {
  if (score < 35) return "Low";
  if (score < 70) return "Medium";
  return "High";
}

// Mock dataset derived from the Python sample
function buildMockData() {
  const data = [
    ["Vijay Nagar", 22.75, 75.91, 68.13],
    ["Rajwada", 22.719, 75.857, 100.0],
    ["Bhawarkuan", 22.686, 75.865, 49.78],
    ["Palasia", 22.73, 75.89, 40.26],
    ["Tilak Nagar", 22.745, 75.925, 81.38],
    ["Rau", 22.633, 75.805, 55.2],
    ["MG Road", 22.72, 75.87, 72.5],
    ["Kanadia Road", 22.72, 75.95, 60.0],
    ["Bhanwarkuan Extension", 22.69, 75.875, 48.9],
    ["Super Corridor", 22.78, 75.95, 90.2],
    ["Banganga", 22.78, 75.87, 45.0],
    ["Nanda Nagar", 22.765, 75.895, 50.3],
    ["Mhow Naka", 22.69, 75.86, 35.5],
    ["Sukhliya", 22.765, 75.915, 60.8],
    ["Scheme 54", 22.74, 75.905, 53.2],
    ["Chhatribagh", 22.725, 75.85, 42.7],
    ["Malwa Mill", 22.715, 75.875, 38.6],
    ["Khajrana", 22.74, 75.92, 77.5],
    ["Indrapuri", 22.755, 75.905, 65.3],
    ["Sudama Nagar", 22.7, 75.87, 36.9],
  ];
  return data.map(([name, lat, lng, score], idx) => ({
    id: idx + 1,
    area_name: name,
    latitude: lat,
    longitude: lng,
    past_challans: 0,
    illegal_construction_cases: 0,
    encroachment_cases: 0,
    population_density: null,
    avg_land_value: null,
    risk_score: score,
    risk_category: categorize(score),
  }));
}

router.get("/risk-data", async (_req, res) => {
  try {
    const query = `
      SELECT id,
             area_name,
             ST_Y(geom) AS latitude,
             ST_X(geom) AS longitude,
             past_challans,
             illegal_construction_cases,
             encroachment_cases,
             population_density,
             avg_land_value,
             risk_score,
             risk_category
      FROM risk_assessment;
    `;
    const result = await pool.query(query);
    const rows = result.rows || [];
    if (!rows.length) {
      // Fallback to mock if table is empty
      return res.json({ success: true, data: buildMockData() });
    }
    res.json({ success: true, data: rows });
  } catch (err) {
    console.warn(
      "Risk data query failed, returning mock dataset:",
      err?.message || err
    );
    // Fallback to mock on any error to avoid 500 in development/demo
    res.json({ success: true, data: buildMockData() });
  }
});

// Convert GeoJSON FeatureCollection (Point features) to rows used by frontend
function convertGeoJsonToRows(fc) {
  try {
    if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
      return [];
    }
    return fc.features
      .filter(
        (f) =>
          f &&
          f.geometry &&
          f.geometry.type === "Point" &&
          Array.isArray(f.geometry.coordinates)
      )
      .map((f, idx) => {
        const [lng, lat] = f.geometry.coordinates;
        const p = f.properties || {};
        const score = Number(p.risk_score);
        return {
          id: p.id || idx + 1,
          area_name: p.area_name || p.name || `Area ${idx + 1}`,
          latitude: Number(lat),
          longitude: Number(lng),
          past_challans: Number(p.past_challans ?? 0),
          illegal_construction_cases: Number(p.illegal_construction_cases ?? 0),
          encroachment_cases: Number(p.encroachment_cases ?? 0),
          population_density: p.population_density ?? null,
          avg_land_value: p.avg_land_value ?? null,
          risk_score: Number.isFinite(score) ? score : 0,
          risk_category:
            p.risk_category || categorize(Number.isFinite(score) ? score : 0),
        };
      });
  } catch {
    return [];
  }
}

// Mock data route from local GeoJSON file
router.get("/risk-data/mock", async (req, res) => {
  try {
    const provided = (
      req.query.path ||
      process.env.MOCK_RISK_GEOJSON_PATH ||
      ""
    ).toString();
    let filePath = provided;
    if (!filePath) {
      // Default to client public if present
      filePath = path.resolve(
        __dirname,
        "../../../client1/public/indore_risk_mock.geojson"
      );
    }
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, data: [] });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const geojson = JSON.parse(raw);
    const rows = convertGeoJsonToRows(geojson);
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.warn("Failed to load mock risk geojson:", err?.message || err);
    return res.json({ success: true, data: [] });
  }
});

export default router;
