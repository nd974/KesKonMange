import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // charge les variables depuis .env

const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT } = process.env;

export const pool = new pg.Pool({
  connectionString: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}.oregon-postgres.render.com/${DB_NAME}`,
  port: DB_PORT ? Number(DB_PORT) : 5432, // port par défaut PostgreSQL
});
