import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import reportsRoutes from "./routes/reports.js";
import usersRoutes from "./routes/users.js";
import drawingsRoutes from "./routes/drawings.js";
import { Pool } from "pg";
import { sequelize } from "./config/database.js";
import Drawing from "./models/Drawing.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// console.log(process.env.MONGODB_URl);

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bhunirakshak";
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-this-in-production";

// Set JWT_SECRET globally for the auth routes
process.env.JWT_SECRET = JWT_SECRET;

console.log("Using MongoDB URI:", MONGODB_URI);
console.log("JWT Secret:", JWT_SECRET ? "Set" : "Not set");
console.log("Frontend URL:", FRONTEND_URL);

// Enhanced CORS configuration
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    name: "Bhu-Nirakshak API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Postgres pool (for PostGIS)
const pgConfig = {
  user: process.env.PGUSER || "postgres",
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  password: process.env.PGPASSWORD || "",
  port: Number(process.env.PGPORT || 5432),
};

const pool = new Pool(pgConfig);

// Boundaries endpoint (GeoJSON FeatureCollection)
async function handleBoundaries(_req, res) {
  const table = process.env.BOUNDARY_TABLE || "indore_boundary.indore_boundary";
  const geomColumn = process.env.BOUNDARY_GEOM_COLUMN || "geom";
  try {
    const query = `
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(${geomColumn})::jsonb,
            'properties', to_jsonb(t) - '${geomColumn}'
          )
        )
      ) AS geojson
      FROM (SELECT * FROM ${table}) t;
    `;
    const result = await pool.query(query);
    const geojson = result.rows?.[0]?.geojson || {
      type: "FeatureCollection",
      features: [],
    };
    res.json(geojson);
  } catch (err) {
    console.error("Error fetching boundaries:", err);
    res.status(500).json({ message: "Failed to fetch boundaries" });
  }
}

app.get("/boundaries", handleBoundaries);
app.get("/api/boundaries", handleBoundaries);

// API routes
console.log("Mounting auth routes at /api/auth");
app.use("/api/auth", authRoutes);
console.log("Mounting reports routes at /api/reports");
app.use("/api/reports", reportsRoutes);
console.log("Mounting users routes at /api/users");
app.use("/api/users", usersRoutes);
console.log("Mounting drawings routes at /api/drawings");
app.use("/api/drawings", drawingsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    // Sync PostGIS database
    await sequelize.sync({ alter: true });
    console.log("✅ PostGIS database synced successfully");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 API server running on http://localhost:${PORT}`);
      console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
