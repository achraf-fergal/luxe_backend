import { Router } from "express";
import healthRouter from "./health.js";
import productsRouter from "./products.js";
import categoriesRouter from "./categories.js";
import cartRouter from "./cart.js";
import ordersRouter from "./orders.js";
import usersRouter from "./users.js";
import reviewsRouter from "./reviews.js";
import wishlistRouter from "./wishlist.js";
import couponsRouter from "./coupons.js";
import analyticsRouter from "./analytics.js";
const router = Router();
router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);
router.use("/users", usersRouter);
router.use("/reviews", reviewsRouter);
router.use("/wishlist", wishlistRouter);
router.use("/coupons", couponsRouter);
router.use("/analytics", analyticsRouter);
var stdin_default = router;
export {
  stdin_default as default
};
