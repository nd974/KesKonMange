import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

let pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}.oregon-postgres.render.com/${process.env.DB_NAME}`,
    ssl: { rejectUnauthorized: false },
    max: 10,                 // ️⭐ garder les connexions ouvertes
    idleTimeoutMillis: 300000, // ️⭐ 5 minutes
    connectionTimeoutMillis: 5000,
  });
}

pool = global.pgPool;

export { pool };
