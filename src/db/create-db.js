import "dotenv/config";
import mysql from "mysql2/promise";

const required = ["DB_HOST", "DB_USER", "DB_NAME"];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `${key} must be set. Add it to your .env file (see .env.example).`,
    );
  }
}

const host = process.env.DB_HOST;
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD ?? "";
const database = process.env.DB_NAME;

if (password === "your_password") {
  throw new Error(
    "DB_PASSWORD in .env is still the placeholder 'your_password'. Replace it with your MySQL password, or leave it blank if your user has no password.",
  );
}

async function main() {
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  console.log(`Database ${database} created or already exists.`);
  console.log("Run `npm run db:push` to create the tables, then `npm run db:seed` to add sample data.");
  await connection.end();
}

main().catch((error) => {
  console.error("Failed to create database:", error.message || error);
  process.exit(1);
});
