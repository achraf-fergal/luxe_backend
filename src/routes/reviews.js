import { Router } from "express";
import { db, insertAndFetch } from "../db/index.js";
import { reviewsTable, usersTable } from "../db/index.js";
import { eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
router.get("/", async (req, res) => {
  try {
    const productId = parseInt(req.query.productId);
    if (isNaN(productId)) return res.status(400).json({ error: "productId is required" });
    const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, productId)).orderBy(desc(reviewsTable.createdAt)).limit(20);
    const enriched = await Promise.all(reviews.map(async (r) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, r.userId));
      return {
        id: r.id,
        productId: r.productId,
        userId: r.userId,
        userName: user?.name || "Anonymous",
        userAvatar: user?.avatar || null,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        createdAt: r.createdAt.toISOString()
      };
    }));
    res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Error listing reviews");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    const userId = 1;
    const review = await insertAndFetch(reviewsTable, { productId, userId, rating, title, comment });
    res.status(201).json({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: "You",
      userAvatar: null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      createdAt: review.createdAt.toISOString()
    });
  } catch (err) {
    logger.error({ err }, "Error creating review");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
