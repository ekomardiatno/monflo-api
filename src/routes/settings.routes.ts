import { Router } from "express";
import * as settingsController from "../controllers/settings.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateSettingsSchema } from "../schemas/settings.schema";

const router = Router();

router.use(authenticate);

router.get("/", settingsController.get);
router.put("/", validate(updateSettingsSchema), settingsController.update);

export default router;
