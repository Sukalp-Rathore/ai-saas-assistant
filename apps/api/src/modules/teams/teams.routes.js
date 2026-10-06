import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import * as teamController from "./teams.controller.js";

const router = Router();

router.get("/", authenticate, teamController.list);
router.get("/invites", authenticate, teamController.listInvites);
router.post("/invites", authenticate, teamController.invite);
router.post("/accept-invite", authenticate, teamController.acceptInvite);
router.put("/invites/:id/revoke", authenticate, teamController.revokeInvite);
router.put("/:id", authenticate, teamController.updateRole);
router.delete("/:id", authenticate, teamController.removeMember);

export default router;
