# 05 — Pipeline: OCR Action + Pages deploy. SHIP GATE.

Read `PRD.md` first. Depends on 02. After this issue: public link goes out.

## Goal

Daily loop works phone-only: save BMC tweet image → upload to `data/inbox/` via GitHub app → Action OCRs, validates, appends to `data/history.json`, commits, site redeploys.

## Tasks

- `scripts/ocr.ts` (or .mjs, runnable in Node 20): takes image path, calls Claude API (model `claude-fable-5` or `claude-sonnet-5`, vision) with a prompt that extracts the full table into the PRD schema. Force structured output (tool use / JSON mode). `ANTHROPIC_API_KEY` from env.
- Validation (fail loudly, non-zero exit):
  - Sum of lake liveStorageML == totals ±1%
  - Recomputed pct (storage ÷ fslUseful from config × 100) == printed pct ±0.5
  - levelM within [LDL−2, FSL+2]
  - Date parses, not already in history, all 7 lakes present
- Append record to `data/history.json` sorted by date; move processed image to `data/archive/<date>.png` (or delete — keep archive, images are small).
- `.github/workflows/ingest.yml`: triggers on push touching `data/inbox/**`; runs OCR script; commits result with `[skip ci]`-safe loop guard; on failure, Action fails (email notification) and leaves inbox image in place.
- `.github/workflows/deploy.yml`: build + deploy to GitHub Pages on push to main (including data commits). Vite `base: '/maps/'`.
- README section: the daily 30-second ritual, and manual fallback (edit history.json by hand when OCR fails).
- User adds `ANTHROPIC_API_KEY` repo secret (document exact steps).

## Acceptance

- Drop a copy of `data/image.png` into inbox on a test branch → Action produces correct JSON (compare against existing 2026-07-09 record), commits, deploys.
- Corrupt/duplicate-date image → Action fails with clear message, no bad commit.
- Site live at GitHub Pages URL, shows latest data.
