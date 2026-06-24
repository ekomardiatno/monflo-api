import { prisma } from "../config/prisma";
import { CreateActivityInput, UpdateActivityInput, RestoreActivitiesInput } from "../schemas/activity.schema";

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

export async function restoreActivities(userId: string, input: RestoreActivitiesInput) {
  return prisma.$transaction(async (tx) => {
    await tx.activity.deleteMany({ where: { userId } });
    if (input.activities.length > 0) {
      await tx.activity.createMany({
        data: input.activities.map((a) => ({
          userId,
          expense: a.expense,
          amount: a.amount,
          date: new Date(a.date),
          description: a.description,
          category: a.category,
        })),
      });
    }
    return tx.activity.findMany({
      where: { userId },
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
  });
}

export async function resetAllActivities(userId: string) {
  await prisma.activity.deleteMany({ where: { userId } });
}

export async function getSummary(userId: string) {
  const activities = await prisma.activity.findMany({
    where: { userId },
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

  let balance = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  const monthly: Record<
    string,
    {
      income: number;
      expense: number;
      expenseCategories: Record<string, number>;
      incomeCategories: Record<string, number>;
    }
  > = {};

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const recentActivities: typeof activities = [];

  for (const a of activities) {
    const d = new Date(a.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!monthly[monthKey]) {
      monthly[monthKey] = {
        income: 0,
        expense: 0,
        expenseCategories: {},
        incomeCategories: {},
      };
    }

    const m = monthly[monthKey];
    if (a.expense) {
      totalExpense += a.amount;
      balance -= a.amount;
      m.expense += a.amount;
      m.expenseCategories[a.category] = (m.expenseCategories[a.category] || 0) + a.amount;
    } else {
      totalIncome += a.amount;
      balance += a.amount;
      m.income += a.amount;
      m.incomeCategories[a.category] = (m.incomeCategories[a.category] || 0) + a.amount;
    }

    if (
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear &&
      recentActivities.length < 5
    ) {
      recentActivities.push(a);
    }
  }

  return { balance, totalIncome, totalExpense, monthly, recentActivities };
}
