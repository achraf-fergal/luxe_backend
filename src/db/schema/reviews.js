import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { productsTable } from "./products.js";
import { usersTable } from "./users.js";

const reviewsTable = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("product_id").references(() => productsTable.id).notNull(),
  userId: int("user_id").references(() => usersTable.id).notNull(),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });

export { insertReviewSchema, reviewsTable };
