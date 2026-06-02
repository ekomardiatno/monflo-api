import { Request, Response } from "express";
import * as activityService from "../services/activity.service";

export async function getAll(req: Request, res: Response) {
  try {
    const { month, year } = (req as any).validatedQuery || {};
    const activities = await activityService.getActivities(req.user!.userId, month, year);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const activity = await activityService.getActivity(
      parseInt(req.params.id as string),
      req.user!.userId,
    );
    if (!activity) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }
    res.json(activity);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const activity = await activityService.createActivity(req.user!.userId, req.body);
    res.status(201).json(activity);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const activity = await activityService.updateActivity(
      parseInt(req.params.id as string),
      req.user!.userId,
      req.body,
    );
    if (!activity) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }
    res.json(activity);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const deleted = await activityService.deleteActivity(
      parseInt(req.params.id as string),
      req.user!.userId,
    );
    if (!deleted) {
      res.status(404).json({ error: "Activity not found" });
      return;
    }
    res.json({ message: "Deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function restore(req: Request, res: Response) {
  try {
    const activities = await activityService.restoreActivities(req.user!.userId, req.body);
    res.json(activities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function resetAll(req: Request, res: Response) {
  try {
    await activityService.resetAllActivities(req.user!.userId);
    res.json({ message: "All activities deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
