import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    const status = err.message === "Email already registered" ? 409 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    const status = err.message === "Invalid credentials" ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: "Logged out" });
  } catch {
    res.json({ message: "Logged out" });
  }
}

export async function googleAuth(req: Request, res: Response) {
  try {
    const result = await authService.googleLogin(req.body.accessToken);
    res.json(result);
  } catch (err: any) {
    const status = err.message === "Invalid Google token" ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await authService.getMe(req.user!.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function changeName(req: Request, res: Response) {
  try {
    const user = await authService.changeName(req.user!.userId, req.body.name);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function setPassword(req: Request, res: Response) {
  try {
    await authService.setPassword(req.user!.userId, req.body.password);
    res.json({ message: "Password set successfully" });
  } catch (err: any) {
    const status = err.message === "Password already set" ? 409 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    res.json({ message: "Password changed successfully" });
  } catch (err: any) {
    const status = err.message === "Current password is incorrect" ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: "If an account exists, a reset email has been sent" });
  } catch {
    // Always return success to prevent email enumeration
    res.json({ message: "If an account exists, a reset email has been sent" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    await authService.resetPassword(req.body.token, req.body.email, req.body.password);
    res.json({ message: "Password reset successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
