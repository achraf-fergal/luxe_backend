import { mysqlTable, varchar, text, int, decimal, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { categoriesTable } from "./categories.js";

const productsTable = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  categoryId: int("category_id").references(() => categoriesTable.id),
  category: varchar("category", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  stock: int("stock").notNull().default(0),
  images: json("images").$type().default([]),
  tags: json("tags").$type().default([]),
  variants: json("variants").$type().default([]),
  specifications: json("specifications").$type().default([]),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: int("review_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });

export { insertProductSchema, productsTable };
