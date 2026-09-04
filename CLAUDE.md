# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Monflo API is a personal finance/expense tracking REST API built with Express 5, TypeScript, Prisma ORM, and PostgreSQL.

## Common Commands

```bash
npm run dev              # Start dev server (nodemon + tsx, port 4000)
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled server from dist/
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Create/run database migrations
npm run prisma:studio    # Open Prisma Studio UI
```

No test framework is configured yet.

## Architecture

**Request flow:** Routes → Controllers → Services → Prisma ORM → PostgreSQL

- **Routes** (`src/routes/`) — Define endpoints, apply auth and validation middleware
- **Controllers** (`src/controllers/`) — Thin layer; parse request, call service, send response
- **Services** (`src/services/`) — All business logic and database queries
- **Schemas** (`src/schemas/`) — Zod schemas for request validation and type inference
- **Middleware** (`src/middleware/`) — JWT auth verification and Zod validation

## Key Patterns

- **Auth:** JWT access tokens (15m) + refresh token rotation with bcryptjs-hashed tokens stored in DB. Google OAuth supported. Auth middleware injects `req.user.userId`.
- **Validation:** Zod schemas validated via `validate()` middleware before controllers run. Schemas also export inferred TypeScript types.
- **Error handling:** Try-catch in controllers; services throw descriptive errors; controllers map to HTTP status codes.
- **Prisma config** (`src/config/prisma.ts`): Uses `@prisma/adapter-pg` PostgreSQL adapter.
- **Config** (`src/config/index.ts`): All env vars centralized in a single `config` export.

## Database

Schema in `prisma/schema.prisma`. Key models: User, Activity (financial transactions with expense boolean and amount in integer units), RefreshToken, UserSettings, PasswordResetToken. Activity has a composite index on `[userId, date]`.

## API Routes

- `/api/auth/*` — Registration, login, token refresh, logout, Google OAuth, password management
- `/api/activities/*` — CRUD for financial transactions, summary stats, bulk restore/reset (all protected)
- `/api/settings/*` — User preferences like appearance and amount visibility (all protected)
- `/health` — Health check

## Deployment

Docker multi-stage build (Node 22-alpine) deployed to VPS via GitHub Actions on push to `main`. `entrypoint.sh` runs Prisma migrations on container startup. Branch `develop` is used for development.

## Related Projects

Monflo is a multi-platform system with two frontend clients that consume this API. All repos have their own CLAUDE.md — review them when making cross-repo changes.

- **`monflo`** — React Native mobile app (iOS & Android). Uses the same auth flow, activity endpoints, and settings endpoints.
- **`monflo-react`** — React web app (Vite + Tailwind CSS). Uses the same API endpoints as the mobile app.

API changes must stay compatible with both clients.
