import { Router } from "express";
import { z } from "zod";
const HealthCheckResponse = z.object({
  status: z.string()
});
const router = Router();
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});
var stdin_default = router;
export {
  stdin_default as default
};
