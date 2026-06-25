# Screener

Phone-camera dental **screening-and-triage** tool for non-dentists in Mongolia.
**Not a diagnosis** — it routes children to care faster; a dentist confirms.

## Monorepo layout

> Folder name ≠ package name on this branch — `pnpm --filter` uses the **package name**.

```
apps/
  web/      Next.js admin/review board   → pkg @pinequest/admin   :3000
  mobile/   Expo React Native screener   → pkg @pinequest/screener (Metro :8081)
  server/   Hono sync API over the DB    → pkg @pinequest/server   :4000
  model/    Python FastAPI + YOLOv8      → (no pkg; stateless)     :8765
packages/
  types/    shared domain types
  core/     pure logic: childKey hash, triage scoring, role guards, zod schemas
  db/       Prisma schema + client (SQLite dev / Postgres prod)  → pkg @pinequest/db
  sync/     offline outbox + ILocalStore adapters
  config/   shared tsconfig / eslint / prettier
```

## Ports & env (reference)

| Surface | Folder | Package | URL / Port | Env file | Key vars |
|---|---|---|---|---|---|
| API server | `apps/server` | `@pinequest/server` | http://localhost:4000 | `apps/server/.env` | `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, `INFERENCE_URL` |
| Admin board | `apps/web` | `@pinequest/admin` | http://localhost:3000 | `apps/web/.env.local` | `NEXT_PUBLIC_API_URL` |
| Mobile (Expo) | `apps/mobile` | `@pinequest/screener` | Metro :8081 | `apps/mobile/.env` (optional) | `EXPO_PUBLIC_API_URL` |
| Model inference | `apps/model` | — (Python) | http://127.0.0.1:8765 | shell env | `INFERENCE_PORT` |
| Database | `packages/db` | `@pinequest/db` | SQLite file | `packages/db/.env` | `DATABASE_URL` |

## Prerequisites

- **Node.js 20+**
- **pnpm** via Corepack: `corepack enable pnpm` (or prefix any command with `corepack pnpm …`)
- **Python 3.10+** — only needed to run `apps/model`
- For the mobile app: **Xcode** (iOS simulator) and/or **Android Studio**, or the **Expo Go** app on a physical device

## Install (once)

```bash
corepack enable pnpm      # makes `pnpm` available
pnpm install              # installs all workspaces
```

## 1 · Database — set up once

The SQLite dev DB is owned by `packages/db`. Create it, migrate, and seed:

```bash
cd packages/db
cp .env.example .env       # DATABASE_URL="file:./dev.db"
pnpm generate              # prisma client
pnpm migrate               # creates dev.db + applies migrations
pnpm seed                  # seeds admin@screener.mn / admin123 + demo school/class
cd ../..
```

Inspect data anytime with `pnpm --filter @pinequest/db studio` (Prisma Studio).

## 2 · API server → http://localhost:4000

```bash
cp apps/server/.env.example apps/server/.env
# Optional: to use the real model, add to apps/server/.env →
#   INFERENCE_URL=http://127.0.0.1:8765/analyze
pnpm --filter @pinequest/server dev      # tsx watch (hot reload)
```

Health check: `curl localhost:4000/health` → `{"ok":true}`.

## 3 · Admin board → http://localhost:3000

```bash
cp apps/web/.env.example apps/web/.env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm --filter @pinequest/admin dev             # next dev -p 3000
```

Open http://localhost:3000 → landing page → **Эхлэх (Begin)** → `/dashboard/admin`.
Log in with the seeded admin (below). Requires the API server (step 2) running.

## 4 · Mobile screener (Expo)

```bash
# Point the app at your API. localhost works on the iOS simulator;
# on a physical device use your machine's LAN IP instead.
echo 'EXPO_PUBLIC_API_URL=http://localhost:4000' > apps/mobile/.env

pnpm --filter @pinequest/screener dev    # expo start (then press i / a / w)
#   i = iOS simulator, a = Android emulator, w = web
#   or: cd apps/mobile && npx expo run:ios   (builds a dev client)
```

Physical device: replace `localhost` with your computer's IP, e.g.
`EXPO_PUBLIC_API_URL=http://192.168.1.50:4000`, and make sure the phone is on the
same Wi‑Fi. If Metro shows a stale-bundle error, restart with `npx expo start -c`.

## 5 · Model inference service (Python, optional)

Only needed for the real photo-inference path (`/api/screenings/analyze`). Run it in
its own virtualenv:

```bash
cd apps/model
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 download_model.py     # downloads YOLO weights → best.pt (once)
python3 server.py             # http://127.0.0.1:8765/health
```

Then set `INFERENCE_URL=http://127.0.0.1:8765/analyze` in `apps/server/.env` (step 2)
and restart the server.

## Run several at once (Turborepo)

```bash
pnpm dev                                   # all JS apps: server + web + mobile (Expo is interactive)
pnpm --filter @pinequest/server --filter @pinequest/admin dev   # just API + board
```

The Python model is not part of Turborepo — run it separately, or `pnpm dev:model` from root.

## Recommended startup order

1. **DB** (once): `packages/db` migrate + seed
2. **Model** (optional): `apps/model` `python3 server.py`
3. **API server**: `apps/server` (port 4000)
4. **Admin board** (port 3000) and/or **Mobile** (Expo)

## Seeded login

`admin@screener.mn` / `admin123`

## Check (the commit gate)

```bash
pnpm typecheck   # tsc --noEmit across all workspaces
pnpm lint        # eslint .
pnpm test        # vitest (packages/core)
```

Per-package, e.g. server only: `pnpm --filter @pinequest/server typecheck`

## Quick smoke test (API)

```bash
curl localhost:4000/health
TOKEN=$(curl -s -X POST localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@screener.mn","password":"admin123"}' | jq -r .data.token)
curl localhost:4000/api/schools -H "authorization: Bearer $TOKEN"
```

## Troubleshooting

- **`No projects matched the filters`** — use the **package** name, not the folder:
  `@pinequest/admin` (folder `apps/web`), `@pinequest/screener` (folder `apps/mobile`).
- **`EADDRINUSE :::3000` / `:4000`** — a previous dev server is still running.
  Find it with `lsof -ti :3000` and `kill <pid>`.
- **Board can't reach API** — confirm the server is on :4000 and
  `apps/web/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000`.
- **Expo: `Unable to resolve module …`** — stale Metro cache; restart with
  `npx expo start -c`.
- **`pnpm` not found** — run `corepack enable pnpm`, or prefix commands with `corepack pnpm …`.
