import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { RegisterInput, LoginInput } from "../schemas/auth.schema";
import { sendResetEmail } from "./email.service";

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

function parseExpiry(duration: string): Date {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const value = parseInt(match[1]);
  const unit = match[2];
  const ms = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
  return new Date(Date.now() + value * ms);
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      settings: {
        create: {},
      },
    },
    select: { id: true, email: true, name: true, password: true, createdAt: true },
  });

  const accessToken = generateAccessToken(user.id);
  const rawRefresh = generateRefreshToken();
  const hashedRefresh = await bcrypt.hash(rawRefresh, 10);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashedRefresh,
      expiresAt: parseExpiry(config.jwt.refreshExpiresIn),
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, hasPassword: !!user.password, createdAt: user.createdAt },
    accessToken,
    refreshToken: rawRefresh,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.password) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken(user.id);
  const rawRefresh = generateRefreshToken();
  const hashedRefresh = await bcrypt.hash(rawRefresh, 10);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashedRefresh,
      expiresAt: parseExpiry(config.jwt.refreshExpiresIn),
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, hasPassword: !!user.password, createdAt: user.createdAt },
    accessToken,
    refreshToken: rawRefresh,
  };
}

export async function refresh(rawRefreshToken: string) {
  const tokens = await prisma.refreshToken.findMany({
    where: { expiresAt: { gt: new Date() } },
  });

  let matched: (typeof tokens)[0] | null = null;
  for (const t of tokens) {
    if (await bcrypt.compare(rawRefreshToken, t.token)) {
      matched = t;
      break;
    }
  }
  if (!matched) throw new Error("Invalid refresh token");

  // Rotate: delete old, create new
  await prisma.refreshToken.delete({ where: { id: matched.id } });

  const accessToken = generateAccessToken(matched.userId);
  const newRawRefresh = generateRefreshToken();
  const hashedRefresh = await bcrypt.hash(newRawRefresh, 10);

  await prisma.refreshToken.create({
    data: {
      userId: matched.userId,
      token: hashedRefresh,
      expiresAt: parseExpiry(config.jwt.refreshExpiresIn),
    },
  });

  return { accessToken, refreshToken: newRawRefresh };
}

export async function logout(rawRefreshToken: string) {
  const tokens = await prisma.refreshToken.findMany();
  for (const t of tokens) {
    if (await bcrypt.compare(rawRefreshToken, t.token)) {
      await prisma.refreshToken.delete({ where: { id: t.id } });
      return;
    }
  }
}

export async function googleLogin(googleAccessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${googleAccessToken}` },
  });
  if (!res.ok) throw new Error("Invalid Google token");
  const payload = (await res.json()) as { sub?: string; email?: string; name?: string };
  if (!payload.email) throw new Error("Invalid Google token");

  const { sub: googleId, email, name } = payload;

  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        googleId,
        settings: { create: {} },
      },
    });
  }

  const accessToken = generateAccessToken(user.id);
  const rawRefresh = generateRefreshToken();
  const hashedRefresh = await bcrypt.hash(rawRefresh, 10);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashedRefresh,
      expiresAt: parseExpiry(config.jwt.refreshExpiresIn),
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, hasPassword: !!user.password, createdAt: user.createdAt },
    accessToken,
    refreshToken: rawRefresh,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, password: true, createdAt: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    hasPassword: !!user.password,
    createdAt: user.createdAt,
  };
}

export async function changeName(userId: string, name: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, email: true, name: true, password: true, createdAt: true },
  });
  return { id: user.id, email: user.email, name: user.name, hasPassword: !!user.password, createdAt: user.createdAt };
}

export async function setPassword(userId: string, password: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.password) throw new Error("Password already set");

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.password) throw new Error("User not found");

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) return;

  // Delete existing tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 10);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  await sendResetEmail(email, resetUrl);
}

export async function resetPassword(token: string, email: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid reset token");

  const resetTokens = await prisma.passwordResetToken.findMany({
    where: { userId: user.id, expiresAt: { gt: new Date() } },
  });

  let matched: (typeof resetTokens)[0] | null = null;
  for (const t of resetTokens) {
    if (await bcrypt.compare(token, t.token)) {
      matched = t;
      break;
    }
  }
  if (!matched) throw new Error("Invalid reset token");

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
}
