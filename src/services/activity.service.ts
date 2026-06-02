import { prisma } from "../config/prisma";
import { CreateActivityInput, UpdateActivityInput } from "../schemas/activity.schema";

export async function getActivities(userId: string, month?: number, year?: number) {
  const where: any = { userId };

  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    where.date = { gte: start, lt: end };
  }

  return prisma.activity.findMany({
    where,
    orderBy: { date: "desc" },
    select: {
      id: true,
      expense: true,
      amount: true,
      date: true,
      description: true,
      category: true,
    },
  });
}

export async function getActivity(id: number, userId: string) {
  return prisma.activity.findFirst({ where: { id, userId } });
}

export async function createActivity(userId: string, input: CreateActivityInput) {
  return prisma.activity.create({
    data: {
      userId,
      expense: input.expense,
      amount: input.amount,
      date: new Date(input.date),
      description: input.description,
      category: input.category,
    },
  });
}

export async function updateActivity(id: number, userId: string, input: UpdateActivityInput) {
  const existing = await prisma.activity.findFirst({ where: { id, userId } });
  if (!existing) return null;

  const data: any = { ...input };
  if (input.date) data.date = new Date(input.date);

  return prisma.activity.update({ where: { id }, data });
}

export async function deleteActivity(id: number, userId: string) {
  const existing = await prisma.activity.findFirst({ where: { id, userId } });
  if (!existing) return false;

  await prisma.activity.delete({ where: { id } });
  return true;
}
