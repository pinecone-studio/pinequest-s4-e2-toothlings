# Screener

Phone-camera dental caries **screening-and-triage** tool for non-dentists in Mongolia.
**Not a diagnosis** — it routes children to care faster; a dentist confirms.

## Monorepo layout

```
apps/
  web/        Next.js admin/review board (React 19)
  mobile/     Expo React Native screener app (React 18)
  api/        Fastify sync API over the DB (auth, screenings, roster, follow-up)
  inference/  Python FastAPI + YOLOv8 (stateless, behind INFERENCE_URL)
packages/
  types/      shared domain types
  core/       pure logic: childKey hash, triage scoring, role guards, zod schemas
  db/         Prisma schema + client (SQLite dev / Postgres prod)
  config/     shared tsconfig / prettier
```

## Status

Implemented and verified end-to-end:

- **Contract** — `@pinequest/types` (domain) + `@pinequest/core` (childKey hash, triage
  scoring, role guards, zod schemas; unit-tested).
- **Persistence** — `@pinequest/db`: Prisma schema (immutable screening event log + single
  mutable follow-up), initial migration, dev seed.
- **API** (`apps/api`) — JWT auth + role guards; immutable screening persist with server-side
  triage; roster CRUD, bulk import (duplicate warnings), carry-class-forward; follow-up with
  optimistic lock + audit log.
- **Admin board** (`apps/web`) — login + role-gated admin shell (dashboard screens in progress).
- **Mobile** (`apps/mobile`) — Expo skeleton (capture flow upcoming).

Not yet built: full admin screens, dentist/follow-up views, mobile capture, on-device/offline
inference, sync engine.

## Prerequisites

- Node.js 20+
- **pnpm** via Corepack: `corepack enable pnpm` (or prefix commands with `corepack pnpm …`)
- Python 3.10+ (only for `apps/inference`)

## Install

```bash
corepack enable pnpm      # once, makes `pnpm` available
pnpm install
```

## Check (the commit gate)

```bash
pnpm typecheck   # tsc --noEmit across all workspaces
pnpm lint        # eslint .
pnpm test        # vitest (packages/core)
```

Per-package, e.g. mobile only: `pnpm --filter @pinequest/mobile typecheck`

## Database (once)

```bash
cd packages/db
cp .env.example .env
pnpm migrate     # prisma migrate dev (creates dev.db)
pnpm seed        # admin@screener.mn / admin123 + demo school/class
```

## Run each surface

```bash
# API  → http://localhost:4000  (health: /health)
cp apps/api/.env.example apps/api/.env
pnpm --filter @pinequest/api dev

# Web board → http://localhost:3000
cp apps/web/.env.example apps/web/.env.local      # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm --filter @pinequest/web dev

# Mobile (Expo) → opens Expo dev tools; press i (iOS sim) / a (Android) / w (web)
pnpm --filter @pinequest/mobile dev
#   needs the Expo Go app on a device, or an iOS/Android simulator installed.

# Inference (Python, separate venv)
cd apps/inference
pip3 install -r requirements.txt
python3 download_model.py        # downloads YOLO weights → best.pt (once)
python3 server.py                # http://127.0.0.1:8765/health
```

Run web + api together from the root: `pnpm dev` (Turborepo).

## Seeded login

`admin@screener.mn` / `admin123`

## Quick smoke test (API)

```bash
curl localhost:4000/health
TOKEN=$(curl -s -X POST localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@screener.mn","password":"admin123"}' | jq -r .data.token)
curl localhost:4000/api/schools -H "authorization: Bearer $TOKEN"
```

> If `pnpm` isn't on your PATH, prefix any command with `corepack pnpm …`.
