import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  registerSchema, loginSchema, refreshSchema, googleAuthSchema,
  changeNameSchema, setPasswordSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema,
} from "../schemas/auth.schema";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/google", validate(googleAuthSchema), authController.googleAuth);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.me);
router.post("/change-name", authenticate, validate(changeNameSchema), authController.changeName);
router.post("/set-password", authenticate, validate(setPasswordSchema), authController.setPassword);
router.post("/change-password", authenticate, validate(changePasswordSchema), authController.changePassword);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
