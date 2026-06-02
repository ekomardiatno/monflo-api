import { z } from "zod/v4";

export const createActivitySchema = z.object({
  expense: z.boolean(),
  amount: z.number().int().positive(),
  date: z.string(),
  description: z.string().max(500),
  category: z.string().min(1).max(50),
});

export const updateActivitySchema = createActivitySchema.partial();

export const queryActivitiesSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const restoreActivitiesSchema = z.object({
  activities: z.array(createActivitySchema),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type RestoreActivitiesInput = z.infer<typeof restoreActivitiesSchema>;
