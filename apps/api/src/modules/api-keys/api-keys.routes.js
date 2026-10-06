import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as apiKeyController from "./api-keys.controller.js";

const router = Router();

router.get("/", authenticate, apiKeyController.list);
router.post("/", authenticate, apiKeyController.create);
router.put("/:id", authenticate, apiKeyController.update);
router.delete("/:id", authenticate, apiKeyController.remove);
router.post("/:id/regenerate", authenticate, apiKeyController.regenerate);

export default router;
