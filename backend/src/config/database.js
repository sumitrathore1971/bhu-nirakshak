import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const useSSL =
  process.env.PGSSL === "true" ||
  process.env.PGSSLMODE === "require" ||
  isProduction;
const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED === "true";

const sequelizeOptions = {
  dialect: "postgres",
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
  ...(useSSL
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized,
          },
        },
      }
    : {}),
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, sequelizeOptions)
  : new Sequelize({
      ...sequelizeOptions,
      host: process.env.PGHOST || "localhost",
      port: process.env.PGPORT || 5432,
      username: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE || "postgres",
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
