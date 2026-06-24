# Screener — phone-camera dental caries screening & triage

Working name **Screener**. A phone-camera caries-and-danger screening tool for non-dentists
(parents, teachers, soum health workers) in Mongolia, including no-signal areas. It is
**SCREENING-AND-TRIAGE, NOT diagnosis** — it routes children to care faster; a human dentist
confirms. Keep that framing in all UI copy and naming. The app will keep gaining features —
protect the spine below so it doesn't rot.

## Core principle (read first)
Everything is a **view/aggregation over an IMMUTABLE event log**.
- A **screening is an event**: once saved, never edited; corrections are new events.
- The **phone is the source of truth at capture**; the server is a replica that aggregates.
- Screenings sync **UP, one-directional**. Only **follow-up status** is mutable (two-way,
  last-write-wins by timestamp + actor).

## Three surfaces
- **apps/mobile** (Expo RN) — offline-first capture + on-device inference + result. The capture surface.
- **apps/web** (Next.js) — admin/review **board**: cohort dashboard, prioritized worklist, dentist
  chart, follow-up lifecycle, metrics, content mgmt. Role-scoped. (Board/admin only unless decided otherwise.)
- **apps/api** (Fastify) — thin **sync service** over packages/db: ingest screening events, serve
  aggregations, relay mutable follow-up status. NOT where screening decisions happen.
- **apps/inference** (Python FastAPI + YOLOv8) — stateless, behind `INFERENCE_URL`. The online
  inference path and the source for the on-device model.

## Package map (share logic, not UI; pure packages have NO platform imports)
- **packages/types** — domain types only.
- **packages/core** — PURE logic: childKey hash (school+class+roster slot+birth-year), triage
  scoring, role guards, zod schemas, inference post-processing/normalization, content-version refs.
- **packages/db** — Prisma schema + client (server-only; SQLite dev / Postgres prod). Migrations authoritative.
- **packages/sync** — platform-agnostic outbox + `ILocalStore` interface; adapters: expo-sqlite
  (mobile), Dexie/IndexedDB (web).
- **packages/config** — tsconfig / eslint / prettier.
- **packages/model** — ONNX weights + convert script (on-device inference).
- Dependency direction: `config → types → core → {db, sync} → apps`. No package imports an app.

## Fixed decisions (do not deviate)
1. Immutable `Screening` + `ToothFinding` + `Symptom` + `TriageResult`; the ONLY mutable layer is `FollowUp`.
2. Identity triple: **child_key × season × FDI tooth code** — every longitudinal/ranking feature keys off this.
3. PII (names, roster slot) lives ONLY in the roster; NEVER in the synced screening payload.
4. **Inference is a DROP-IN behind one fixed contract**: server (FastAPI) now, on-device ONNX
   swapped in later behind the same seam. **Triage logic always lives in TS (packages/core)**, never in the model service.
5. Roles: **screener / dentist-reviewer / follow-up-worker / admin**. One record, role-scoped views.
   Dentist confirm/override and follow-up status updates are **AUDITED events**, never silent edits.
6. All parent/education text comes from **dentist-approved, versioned content**; apps pin a content version.

## Safety non-negotiables
- "Screening-and-triage, not diagnosis" in UI + pitch. **Green = "no danger signs seen in these
  photos," never "no cavities."** Definite wording only on high confidence; otherwise hedged.
  Guardian consent recorded; minors' photos anonymized in the synced payload.

## Build order (contract-first; spine before polish)
1. Contract (`types` + `core`) → 2. `db` → 3. sync service (event ingest) → 4. mobile capture loop
(**using server inference first**) → 5. board read-only → 6. mutations + roles + audit → 7. on-device
ONNX swap (behind the inference seam) → 8. ranking + longitudinal (needs 2 seasons; seed it) → 9. design polish.

## Commit gate (must pass before ANY commit)
- `tsc --noEmit` (every affected workspace; via `turbo typecheck`)
- lint
Do not commit with either failing. **The USER makes all commits — do not commit or push** (see project memory).

## Working style
Small increments; after each, run `tsc --noEmit` + lint and report. Ask before any major new
dependency. pnpm + Turborepo; one lockfile (pnpm).
