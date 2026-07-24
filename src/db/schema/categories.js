import { mysqlTable, int, varchar, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";

const categoriesTable = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  image: varchar("image", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });

export { categoriesTable, insertCategorySchema };
