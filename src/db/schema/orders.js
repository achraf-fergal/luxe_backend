import { mysqlTable, int, decimal, varchar, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users.js";

const ordersTable = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => usersTable.id),
  items: json("items").$type().notNull().default([]),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).notNull().default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  shippingAddress: json("shipping_address").$type(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("card"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });

export { insertOrderSchema, ordersTable };
