import { Router } from "express";
import { db, insertAndFetch } from "../db/index.js";
import { categoriesTable, productsTable } from "../db/index.js";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
router.get("/", async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable);
    const result = await Promise.all(cats.map(async (c) => {
      const [countRes] = await db.select({ count: sql`count(*)` }).from(productsTable).where(eq(productsTable.category, c.name));
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        productCount: Number(countRes.count)
      };
    }));
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Error listing categories");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) return res.status(404).json({ error: "Category not found" });
    const [countRes] = await db.select({ count: sql`count(*)` }).from(productsTable).where(eq(productsTable.category, cat.name));
    res.json({ ...cat, productCount: Number(countRes.count) });
  } catch (err) {
    logger.error({ err }, "Error getting category");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const cat = await insertAndFetch(categoriesTable, req.body);
    res.status(201).json({ ...cat, productCount: 0 });
  } catch (err) {
    logger.error({ err }, "Error creating category");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
