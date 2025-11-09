import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new pg.Pool({
    connectionString: `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}.oregon-postgres.render.com/${DB_NAME}`,
});