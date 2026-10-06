import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { deleteProfile, login, logout, refresh, register, updateProfile, googleAuth, googleCallback } from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.put("/profile", authenticate, updateProfile);
router.delete("/profile", authenticate, deleteProfile);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

export default router;
