import { prisma } from "../config/prisma";
import { UpdateSettingsInput } from "../schemas/settings.schema";

export async function getSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await prisma.userSettings.create({ data: { userId } });
  }
  return {
    appearanceType: settings.appearanceType,
    amountVisibility: settings.amountVisibility,
    autoSelectAppearance: settings.autoSelectAppearance,
  };
}

export async function updateSettings(userId: string, input: UpdateSettingsInput) {
  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
  return {
    appearanceType: settings.appearanceType,
    amountVisibility: settings.amountVisibility,
    autoSelectAppearance: settings.autoSelectAppearance,
  };
}
