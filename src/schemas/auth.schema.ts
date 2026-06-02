import { z } from "zod/v4";

export const registerSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
});

export const changeNameSchema = z.object({
  name: z.string().min(1).max(100),
});

export const setPasswordSchema = z.object({
  password: z.string().min(6).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  email: z.email(),
  password: z.string().min(6).max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type ChangeNameInput = z.infer<typeof changeNameSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
