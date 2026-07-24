import { Router } from "express";
import { db, insertAndFetch, updateAndFetch } from "../db/index.js";
import { ordersTable } from "../db/index.js";
import { eq, and, sql, desc } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
function formatOrder(o) {
  return {
    id: o.id,
    userId: o.userId,
    items: o.items || [],
    subtotal: parseFloat(o.subtotal),
    discount: parseFloat(o.discount || "0"),
    shipping: parseFloat(o.shipping || "0"),
    tax: parseFloat(o.tax || "0"),
    total: parseFloat(o.total),
    status: o.status,
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    trackingNumber: o.trackingNumber,
    createdAt: o.createdAt.toISOString()
  };
}
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status, userId } = req.query;
    const conditions = [];
    if (status) conditions.push(eq(ordersTable.status, status));
    if (userId) conditions.push(eq(ordersTable.userId, parseInt(userId)));
    const where = conditions.length > 0 ? and(...conditions) : void 0;
    const [items, countResult] = await Promise.all([
      db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql`count(*)` }).from(ordersTable).where(where)
    ]);
    res.json({ items: items.map(formatOrder), total: Number(countResult[0].count), page, limit });
  } catch (err) {
    logger.error({ err }, "Error listing orders");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(formatOrder(order));
  } catch (err) {
    logger.error({ err }, "Error getting order");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, shippingOption, notes } = req.body;
    const subtotal = 99.99;
    const shipping = shippingOption === "express" ? 19.99 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    const order = await insertAndFetch(ordersTable, {
      userId: null,
      items: [],
      subtotal: subtotal.toString(),
      discount: "0",
      shipping: shipping.toString(),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
      shippingAddress,
      paymentMethod
    });
    res.status(201).json(formatOrder(order));
  } catch (err) {
    logger.error({ err }, "Error creating order");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.patch("/:id/status", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, trackingNumber } = req.body;
    const updateData = { status };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    const order = await updateAndFetch(ordersTable, id, updateData);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(formatOrder(order));
  } catch (err) {
    logger.error({ err }, "Error updating order status");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
