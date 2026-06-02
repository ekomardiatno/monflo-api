import { Router } from "express";
import authRoutes from "./auth.routes";
import activityRoutes from "./activity.routes";
import settingsRoutes from "./settings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/activities", activityRoutes);
router.use("/settings", settingsRoutes);

export default router;
