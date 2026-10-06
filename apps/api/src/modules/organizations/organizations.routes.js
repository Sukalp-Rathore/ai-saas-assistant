import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { deleteMyOrganizationLogo, getMyOrganization, updateMyOrganization, updateMyOrganizationLogo } from "./organizations.controller.js";

const router = Router();

router.get("/", authenticate, getMyOrganization);
router.put("/", authenticate, updateMyOrganization);
router.post("/logo", authenticate, updateMyOrganizationLogo);
router.delete("/logo", authenticate, deleteMyOrganizationLogo);

export default router;
