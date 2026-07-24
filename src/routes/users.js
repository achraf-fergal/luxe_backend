import { Router } from "express";
import { db, insertAndFetch, updateAndFetch } from "../db/index.js";
import { usersTable } from "../db/index.js";
import { eq, like, sql } from "drizzle-orm";
import { logger } from "../lib/logger.js";
const router = Router();
function formatUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    phone: u.phone,
    createdAt: u.createdAt.toISOString(),
    addresses: []
  };
}
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ user: formatUser(user), token: `mock-token-${user.id}` });
  } catch (err) {
    logger.error({ err }, "Error logging in");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) return res.status(400).json({ error: "Email already in use" });
    const user = await insertAndFetch(usersTable, { name, email, passwordHash: password, role: "customer" });
    res.status(201).json({ user: formatUser(user), token: `mock-token-${user.id}` });
  } catch (err) {
    logger.error({ err }, "Error registering");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/logout", async (req, res) => {
  res.json({ success: true });
});
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Not authenticated" });
    const tokenId = authHeader.replace("Bearer mock-token-", "");
    const userId = parseInt(tokenId);
    if (isNaN(userId)) return res.status(401).json({ error: "Invalid token" });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(formatUser(user));
  } catch (err) {
    logger.error({ err }, "Error getting me");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.patch("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Not authenticated" });
    const tokenId = authHeader.replace("Bearer mock-token-", "");
    const userId = parseInt(tokenId);
    const user = await updateAndFetch(usersTable, userId, req.body);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(formatUser(user));
  } catch (err) {
    logger.error({ err }, "Error updating me");
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { search } = req.query;
    const where = search ? like(usersTable.name, `%${search}%`) : void 0;
    const [items, countResult] = await Promise.all([
      db.select().from(usersTable).where(where).limit(limit).offset(offset),
      db.select({ count: sql`count(*)` }).from(usersTable).where(where)
    ]);
    res.json({ items: items.map(formatUser), total: Number(countResult[0].count), page, limit });
  } catch (err) {
    logger.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});
var stdin_default = router;
export {
  stdin_default as default
};
