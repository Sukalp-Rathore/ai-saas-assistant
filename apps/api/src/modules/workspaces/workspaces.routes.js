import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as workspaceController from "./workspaces.controller.js";

const router = Router();

router.get("/", authenticate, workspaceController.list);
router.post("/", authenticate, workspaceController.create);
router.get("/:id", authenticate, workspaceController.get);
router.put("/:id", authenticate, workspaceController.update);
router.delete("/:id", authenticate, workspaceController.remove);
router.post("/test-connection", authenticate, workspaceController.testConnection);

export default router;
