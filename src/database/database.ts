import { Pool } from "pg";

export const pool = new Pool({
    user: process.env.PSQL_USER,
    host: process.env.PSQL_HOST,
    password: process.env.PSQL_PASSWORD,
    database: process.env.PSQL_DATABASE,
    port: Number(process.env.PSQL_PORT)
});