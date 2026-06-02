import { z } from "zod/v4";

export const updateSettingsSchema = z.object({
  appearanceType: z.enum(["LIGHT", "DARK"]).optional(),
  amountVisibility: z.boolean().optional(),
  autoSelectAppearance: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
