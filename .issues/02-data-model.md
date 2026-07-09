# 02 — Data model: schema types, real fill levels

Read `PRD.md` first. Depends on 01.

## Goal

Water levels in the scene driven by the real data in `data/history.json` (latest record).

## Tasks

- `src/types/data.ts`: TypeScript types matching the `data/history.json` schema in PRD (DailyRecord, LakeReading, Totals, PreviousYear).
- Load `data/history.json` at build/runtime (static import fine), select latest record by date.
- Derive per-lake fill fraction from `pctUseful` (0–100 → 0–1); water plane height in each basin = fill fraction of basin depth. 100% = at rim (Vehar, Tulsi currently overflow-full), low % exposes banks.
- Small runtime guard: if a lake key missing from record, keep last-known/50% and warn.
- Export a `useWaterData()` hook returning latest record + derived per-lake view models (fill fraction, formatted storage, etc.) for later issues.

## Acceptance

- Scene reflects 2026-07-09 data: Vehar and Tulsi brim-full, Upper Vaitarna visibly low (~27%), Bhatsa/Middle Vaitarna ~42%.
- Types compile strictly; no `any` in data path.
