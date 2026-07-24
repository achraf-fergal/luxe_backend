import { Router } from "express";
import { db } from "../db/index.js";
import { productsTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
const wishlists = {};
function getWishlist(sessionId) {
  if (!wishlists[sessionId]) wishlists[sessionId] = /* @__PURE__ */ new Set();
  return wishlists[sessionId];
}
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
    const sessionId = req.headers["x-session-id"] || "default-session";
    const wl = getWishlist(sessionId);
    const products = await Promise.all([...wl].map(async (id) => {
      const [p] = await db.select().from(productsTable).where(eq(productsTable.id, id));
      return p ? formatProduct(p) : null;
    }));
    res.json(products.filter(Boolean));
  } catch (err) {
    logger.error({ err }, "Error getting wishlist");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/:productId", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const productId = parseInt(req.params.productId);
    getWishlist(sessionId).add(productId);
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error adding to wishlist");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/:productId", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const productId = parseInt(req.params.productId);
    getWishlist(sessionId).delete(productId);
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Error removing from wishlist");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
