# Screener

Phone-camera dental caries **screening-and-triage** tool for non-dentists in Mongolia.
**Not a diagnosis** — it routes children to care faster; a dentist confirms.

## Monorepo layout

```
apps/
  admin/      Next.js admin/review board (React 19)
  screener/   Expo React Native screener app (React 18)
  server/     Hono sync API over the DB (auth, screenings, roster, follow-up)
  model/      Python FastAPI + YOLOv8 (stateless, behind INFERENCE_URL)
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
- **API** (`apps/server`) — JWT auth + role guards; immutable screening persist with server-side
  triage; roster CRUD, bulk import (duplicate warnings), carry-class-forward; follow-up with
  optimistic lock + audit log.
- **Admin board** (`apps/admin`) — login + role-gated admin shell (dashboard, dentist review,
  follow-up worklist, user management, audit log).
- **Mobile** (`apps/screener`) — Expo skeleton (capture flow upcoming).

Not yet built: mobile capture, on-device/offline inference, sync engine.

## Prerequisites

- Node.js 20+
- **pnpm** via Corepack: `corepack enable pnpm` (or prefix commands with `corepack pnpm …`)
- Python 3.10+ (only for `apps/model`)

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

Per-package, e.g. screener only: `pnpm --filter @pinequest/screener typecheck`

## Database (once)

```bash
cd packages/db
cp .env.example .env
pnpm migrate     # prisma migrate dev (creates dev.db)
pnpm seed        # admin@screener.mn / admin123 + demo school/class
```

## Run each surface

```bash
# Server  → http://localhost:4000  (health: /health)
cp apps/server/.env.example apps/server/.env
pnpm --filter @pinequest/server dev

# Admin board → http://localhost:3000
cp apps/admin/.env.example apps/admin/.env.local      # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm --filter @pinequest/admin dev

# Screener (Expo) → opens Expo dev tools; press i (iOS sim) / a (Android) / w (web)
pnpm --filter @pinequest/screener dev
#   needs the Expo Go app on a device, or an iOS/Android simulator installed.

# Model inference (Python, separate venv)
cd apps/model
pip3 install -r requirements.txt
python3 download_model.py        # downloads YOLO weights → best.pt (once)
python3 server.py                # http://127.0.0.1:8765/health
```

Run admin + server together from the root: `pnpm dev` (Turborepo).

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
