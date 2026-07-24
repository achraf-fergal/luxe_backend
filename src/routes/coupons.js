import { Router } from "express";
import { db, insertAndFetch } from "../db/index.js";
import { couponsTable } from "../db/index.js";
import { logger } from "../lib/logger.js";
const router = Router();
function formatCoupon(c) {
  return {
    id: c.id,
    code: c.code,
    type: c.type,
    value: parseFloat(c.value),
    minOrderAmount: c.minOrderAmount ? parseFloat(c.minOrderAmount) : null,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    isActive: c.isActive,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null
  };
}
router.get("/", async (req, res) => {
  try {
    const coupons = await db.select().from(couponsTable);
    res.json(coupons.map(formatCoupon));
  } catch (err) {
    logger.error({ err }, "Error listing coupons");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { code, type, value, minOrderAmount, maxUses, isActive, expiresAt } = req.body;
    const coupon = await insertAndFetch(couponsTable, {
      code,
      type,
      value: value.toString(),
      minOrderAmount: minOrderAmount?.toString(),
      maxUses,
      isActive: isActive ?? true,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });
    res.status(201).json(formatCoupon(coupon));
  } catch (err) {
    logger.error({ err }, "Error creating coupon");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
