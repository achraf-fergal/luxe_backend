import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error("DB_HOST, DB_USER and DB_NAME must be set. Copy .env.example to .env first.");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/index.js",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME,
  },
});
