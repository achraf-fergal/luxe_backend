import { Router } from "express";
import { db, insertAndFetch, updateAndFetch } from "../db/index.js";
import { productsTable } from "../db/index.js";
import { eq, like, gte, lte, and, desc, asc, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    compareAtPrice: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
    category: p.category,
    brand: p.brand,
    stock: p.stock,
    images: p.images || [],
    rating: parseFloat(p.rating),
    reviewCount: p.reviewCount,
    tags: p.tags || [],
    variants: p.variants || [],
    specifications: p.specifications || [],
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    createdAt: p.createdAt.toISOString()
  };
}
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { category, search, minPrice, maxPrice, brand, sortBy, inStock } = req.query;
    const conditions = [];
    if (category) conditions.push(eq(productsTable.category, category));
    if (search) conditions.push(like(productsTable.name, `%${search}%`));
    if (minPrice) conditions.push(gte(productsTable.price, minPrice));
    if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));
    if (brand) conditions.push(eq(productsTable.brand, brand));
    if (inStock === "true") conditions.push(gte(productsTable.stock, sql`1`));
    let orderBy;
    switch (sortBy) {
      case "price_asc":
        orderBy = asc(productsTable.price);
        break;
      case "price_desc":
        orderBy = desc(productsTable.price);
        break;
      case "popular":
        orderBy = desc(productsTable.reviewCount);
        break;
      case "rating":
        orderBy = desc(productsTable.rating);
        break;
      default:
        orderBy = desc(productsTable.createdAt);
    }
    const where = conditions.length > 0 ? and(...conditions) : void 0;
    const [items, countResult] = await Promise.all([
      db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
      db.select({ count: sql`count(*)` }).from(productsTable).where(where)
    ]);
    res.json({ items: items.map(formatProduct), total: Number(countResult[0].count), page, limit });
  } catch (err) {
    logger.error({ err }, "Error listing products");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/featured", async (req, res) => {
  try {
    const items = await db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).limit(8);
    res.json(items.map(formatProduct));
  } catch (err) {
    logger.error({ err }, "Error listing featured products");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/best-sellers", async (req, res) => {
  try {
    const items = await db.select().from(productsTable).where(eq(productsTable.isBestSeller, true)).limit(8);
    res.json(items.map(formatProduct));
  } catch (err) {
    logger.error({ err }, "Error listing best sellers");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/new-arrivals", async (req, res) => {
  try {
    const items = await db.select().from(productsTable).where(eq(productsTable.isNew, true)).orderBy(desc(productsTable.createdAt)).limit(8);
    res.json(items.map(formatProduct));
  } catch (err) {
    logger.error({ err }, "Error listing new arrivals");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(formatProduct(product));
  } catch (err) {
    logger.error({ err }, "Error getting product");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id/related", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Product not found" });
    const related = await db.select().from(productsTable).where(and(eq(productsTable.category, product.category), sql`${productsTable.id} != ${id}`)).limit(4);
    res.json(related.map(formatProduct));
  } catch (err) {
    logger.error({ err }, "Error listing related products");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const product = await insertAndFetch(productsTable, req.body);
    res.status(201).json(formatProduct(product));
  } catch (err) {
    logger.error({ err }, "Error creating product");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await updateAndFetch(productsTable, id, req.body);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(formatProduct(product));
  } catch (err) {
    logger.error({ err }, "Error updating product");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Error deleting product");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
