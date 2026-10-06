import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import organizationRoutes from "../modules/organizations/organizations.routes.js";
import workspaceRoutes from "../modules/workspaces/workspaces.routes.js";
import teamRoutes from "../modules/teams/teams.routes.js";
import apiKeyRoutes from "../modules/api-keys/api-keys.routes.js";
import publicRoutes from "../modules/public/public.routes.js";
import reportRoutes from "../modules/reports/reports.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";
import subscriptionRoutes from "../modules/subscriptions/subscription.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: "sukalp-api",
    timestamp: new Date().toISOString()
  });
});

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/teams", teamRoutes);
router.use("/api-keys", apiKeyRoutes);
router.use("/public", publicRoutes);
router.use("/reports", reportRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/subscriptions", subscriptionRoutes);

export default router;
