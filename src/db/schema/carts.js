import { mysqlTable, varchar, int, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

const cartsTable = mysqlTable("carts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userId: int("user_id"),
  items: json("items").$type().notNull().default([]),
  couponCode: varchar("coupon_code", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

const insertCartSchema = createInsertSchema(cartsTable).omit({ id: true, createdAt: true, updatedAt: true });

export { cartsTable, insertCartSchema };
