import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { index } from "./analytics.controller.js";

const router = Router();

router.get("/", authenticate, index);

export default router;
