import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { index, upgrade } from "./subscription.controller.js";

const router = Router();

router.get("/", authenticate, index);
router.post("/upgrade", authenticate, upgrade);

export default router;
