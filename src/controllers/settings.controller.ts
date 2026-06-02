import { Request, Response } from "express";
import * as settingsService from "../services/settings.service";

export async function get(req: Request, res: Response) {
  try {
    const settings = await settingsService.getSettings(req.user!.userId);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const settings = await settingsService.updateSettings(req.user!.userId, req.body);
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
