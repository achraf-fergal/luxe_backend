import { Router } from "express";
import { db, insertAndFetch, updateAndFetch } from "../db/index.js";
import { cartsTable, productsTable, couponsTable } from "../db/index.js";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
async function getOrCreateCart(sessionId) {
  let [cart] = await db.select().from(cartsTable).where(eq(cartsTable.sessionId, sessionId));
  if (!cart) {
    cart = await insertAndFetch(cartsTable, { sessionId, items: [] });
  }
  return cart;
}
async function buildCartResponse(cart) {
  const items = cart.items || [];
  const enrichedItems = await Promise.all(items.map(async (item, idx) => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    if (!product) return null;
    return {
      id: item.id,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        images: product.images || [],
        rating: parseFloat(product.rating),
        reviewCount: product.reviewCount,
        tags: product.tags || [],
        variants: product.variants || [],
        specifications: product.specifications || [],
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isBestSeller: product.isBestSeller,
        createdAt: product.createdAt.toISOString()
      },
      quantity: item.quantity,
      price: item.price,
      variant: item.variant
    };
  }));
  const validItems = enrichedItems.filter(Boolean);
  const subtotal = validItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  let discount = 0;
  if (cart.couponCode) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, cart.couponCode));
    if (coupon && coupon.isActive) {
      if (coupon.type === "percent") {
        discount = subtotal * (parseFloat(coupon.value) / 100);
      } else {
        discount = parseFloat(coupon.value);
      }
    }
  }
  const total = Math.max(0, subtotal - discount + shipping + tax);
  return {
    id: cart.id,
    items: validItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: validItems.reduce((sum, item) => sum + item.quantity, 0),
    couponCode: cart.couponCode
  };
}
router.get("/", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const cart = await getOrCreateCart(sessionId);
    res.json(await buildCartResponse(cart));
  } catch (err) {
    logger.error({ err }, "Error getting cart");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/items", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const { productId, quantity, variant } = req.body;
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
    if (!product) return res.status(404).json({ error: "Product not found" });
    const cart = await getOrCreateCart(sessionId);
    const items = cart.items || [];
    const existingIdx = items.findIndex((i) => i.productId === productId && i.variant === (variant || null));
    if (existingIdx >= 0) {
      items[existingIdx].quantity += quantity;
    } else {
      items.push({ id: Date.now(), productId, quantity, price: parseFloat(product.price), variant: variant || null });
    }
    const updated = await updateAndFetch(cartsTable, cart.id, { items });
    res.json(await buildCartResponse(updated));
  } catch (err) {
    logger.error({ err }, "Error adding to cart");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.patch("/items/:itemId", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const itemId = parseInt(req.params.itemId);
    const { quantity } = req.body;
    const cart = await getOrCreateCart(sessionId);
    let items = cart.items || [];
    if (quantity <= 0) {
      items = items.filter((i) => i.id !== itemId);
    } else {
      items = items.map((i) => i.id === itemId ? { ...i, quantity } : i);
    }
    const updated = await updateAndFetch(cartsTable, cart.id, { items });
    res.json(await buildCartResponse(updated));
  } catch (err) {
    logger.error({ err }, "Error updating cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/items/:itemId", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const itemId = parseInt(req.params.itemId);
    const cart = await getOrCreateCart(sessionId);
    const items = (cart.items || []).filter((i) => i.id !== itemId);
    const updated = await updateAndFetch(cartsTable, cart.id, { items });
    res.json(await buildCartResponse(updated));
  } catch (err) {
    logger.error({ err }, "Error removing cart item");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/coupon", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] || "default-session";
    const { code } = req.body;
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, code));
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: "Invalid or expired coupon" });
    }
    const cart = await getOrCreateCart(sessionId);
    const updated = await updateAndFetch(cartsTable, cart.id, { couponCode: code });
    res.json(await buildCartResponse(updated));
  } catch (err) {
    logger.error({ err }, "Error applying coupon");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
