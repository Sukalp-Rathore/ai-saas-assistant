import { Router } from "express";
import { authenticateApiKey } from "../../middlewares/api-key.middleware.js";
import { checkQuota } from "../../middlewares/quota.middleware.js";
import * as publicController from "./public.controller.js";

const router = Router();

router.post("/chat", authenticateApiKey, checkQuota, publicController.chat);
router.get("/workspace", authenticateApiKey, publicController.workspaceInfo);
router.get("/usage", authenticateApiKey, publicController.usage);

export default router;
