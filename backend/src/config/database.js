import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT || 5432,
  username: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "postgres",
  logging: false, // Set to console.log for debugging
  define: {
    timestamps: true,
    underscored: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostGIS database connection established successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to PostGIS database:", err);
  });

export { sequelize };
