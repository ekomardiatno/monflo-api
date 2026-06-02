import { Router } from "express";
import * as activityController from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createActivitySchema, updateActivitySchema, queryActivitiesSchema, restoreActivitiesSchema } from "../schemas/activity.schema";

const router = Router();

router.use(authenticate);

router.get("/", validate(queryActivitiesSchema, "query"), activityController.getAll);
router.get("/:id", activityController.getOne);
router.post("/", validate(createActivitySchema), activityController.create);
router.post("/restore", validate(restoreActivitiesSchema), activityController.restore);
router.delete("/reset", activityController.resetAll);
router.put("/:id", validate(updateActivitySchema), activityController.update);
router.delete("/:id", activityController.remove);

export default router;
