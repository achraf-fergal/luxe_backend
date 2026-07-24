import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema/index.js";

const required = ["DB_HOST", "DB_USER", "DB_NAME"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `${key} must be set. Add it to your .env file (see .env.example).`,
    );
  }
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME,
});

export const db = drizzle(pool, { schema, mode: "default" });

// MySQL has no `RETURNING` clause, so these helpers insert/update and then
// re-select the affected row by its primary key.
export async function insertAndFetch(table, values) {
  const { eq } = await import("drizzle-orm");
  const [result] = await db.insert(table).values(values);
  const [row] = await db.select().from(table).where(eq(table.id, result.insertId));
  return row;
}

export async function updateAndFetch(table, id, values) {
  const { eq } = await import("drizzle-orm");
  await db.update(table).set(values).where(eq(table.id, id));
  const [row] = await db.select().from(table).where(eq(table.id, id));
  return row;
}

export * from "./schema/index.js";
