# 06 — History: backfill + trends

> **Status: 🟡 UI done + pushed (2026-07-09): gap-aware season sparklines in lake/city panels, appear at 2+ records. Batch OCR mode built into scripts/ocr.mjs (pass a folder). REMAINING (user): save June→today BMC report images, drop all into data/inbox/ in one push.**

Read `PRD.md` first. Depends on 05.

## Goal

Trendlines. Backfill June-onward BMC images; show per-lake sparkline and comparisons in the info panel.

## Tasks

- Batch mode for OCR script: process every image in a folder, sorted, append all (same validation per record; continue past failures, report summary).
- User task (manual, timeboxed ~30 min): scroll BMC/Hydraulic dept Twitter timeline, save daily report images June 1 → today into a folder, run batch.
- Info panel: sparkline (tiny SVG) of `pctUseful` over available history per lake; season range annotation.
- Header/city view: total stock % sparkline + 2025/2024 same-date markers.
- Handle gaps in dates gracefully (missing days = gap, not interpolation lie).

## Acceptance

- With backfilled data, sparklines show monsoon fill-up curve.
- A lake's sparkline matches its history rows.
- Missing days render as gaps.
