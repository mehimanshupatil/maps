# 03 — Interaction: hover, info panel, header stats

Read `PRD.md` first. Depends on 02.

## Goal

Hover + click interactions and the two UI surfaces: per-lake info panel and headline stat bar. Mobile-first.

## Tasks

- Hover (desktop): lake highlight (emissive/outline) + tooltip: name, fill %.
- Click/tap lake → info panel:
  - Name, current level (m) vs FSL/LDL, live storage (ML), % useful, 24h rise, rainfall today + season total.
  - Same-date 2025/2024 comparison (from record's `previousYears`).
  - Active remarks matching this lake (e.g. overflowing since…).
- Panel: side card on desktop, bottom sheet on mobile (drag/tap to dismiss). Tap empty terrain closes.
- Header stat bar: "Mumbai water stock: 48.59%" + estimated days of supply = totals.liveStorageML ÷ 3900 ML/day (label "approx"), + report date. Compact on mobile.
- Selected lake gets subtle camera nudge/zoom (optional, cheap only).

## Acceptance

- All 7 lakes hoverable/clickable, including tiny Tulsi (fat raycast target if needed).
- Panel data matches `data/history.json` exactly.
- Usable on phone viewport: bottom sheet, readable text, no overlap with stat bar.
