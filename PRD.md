# Mumbai Water Supply — 3D Visualization

## What

A stylized low-poly 3D map (Three.js) of Mumbai's water supply system: the seven lakes/dams that feed the city, positioned at rough real-world locations, with water levels driven by BMC's daily lake-level report. Animated pipes carry water south-west to a low-poly Mumbai. Updated daily via an OCR pipeline.

**This is a demo/visualization, not a scientific tool.** Goal: shareable, visually compelling, honest about the system's proportions.

Live at: GitHub Pages (repo: https://github.com/mehimanshupatil/maps)

## The system being visualized

Seven lakes supply Mumbai (~3,900 MLD demand). BMC's Hydraulic Engineer's Department publishes a daily 6 AM report as an image on Twitter (no API, no HTML page found).

| Lake | FSL useful capacity (ML) | Supply share* | MLD | District | Notes |
|---|---|---|---|---|---|
| Bhatsa | 717,037 | 48.3% | 2,020 | Thane | Biggest by far, ~110 km |
| Upper Vaitarna | 227,047 | 15.1% | 635 | Nashik | Furthest north, 163 km |
| Middle Vaitarna | 193,530 | 11% | 455 | Palghar | Newest dam (2014) |
| Tansa | 145,080 | 12% | 500 | Thane | 106 km |
| Modak Sagar (Lower Vaitarna) | 128,925 | 11% | 455 | Palghar | On Vaitarna river |
| Vihar ("Vehar" in BMC table) | 27,698 | 2.1% | 90 | Mumbai Suburban | Inside SGNP, oldest (1860) |
| Tulsi | 8,046 | 0.5% | 18 | Mumbai Suburban | Inside SGNP, tiniest |

*Shares from BMC "contribution per 100 litre" chart; MLD/distances from data/map/info.txt. Reference maps + supply-network diagram in `data/map/`.

Total FSL useful content: 1,447,363 ML. Total demand ≈ 4,173 MLD.

## Decisions (from grilling session, 2026-07-09)

1. **Replaces** the old flood-simulation plan entirely. Clean slate.
2. **Stylized 3D scene on real geography** (updated 2026-07-09, superseding "hand-placed rough positions"): terrain is built from real elevation data, lakes/rivers/districts at real lat/lon, but rendering stays stylized (flat shading, 2.5× vertical exaggeration, water discs, dam-rim bowls).
3. **Data**: daily BMC image → OCR → JSON, committed to repo, static site redeploys. No backend ever.
4. **History accumulates** — daily records append to `data/history.json`. Each image also carries same-date 2025/2024 figures (free year-over-year comparison).
5. **Ingestion is semi-auto**: user saves tweet image to `data/inbox/` (phone-friendly via GitHub app), GitHub Action OCRs via Claude API, validates, appends JSON, deletes inbox image, commits. Pages redeploys.
6. **Lake encoding**: basin area ∝ sqrt(capacity) (Bhatsa ~9× Tulsi's area, not 89×). Fill % = water plane height inside carved basin; low water exposes banks.
7. **Flow**: animated particle pipes from each lake to city, thickness ∝ supply share. City shows headline: total stock % + estimated days of supply (total live storage ÷ ~3,900 MLD).
8. **Camera**: map-like constrained — pan + zoom + fixed ~45° tilt, rotation clamped ±30°, zoom clamped between whole-system and single-lake.
9. **Interactions**: hover = highlight + tooltip (name, fill %). Click = info panel: level (m), live storage, 24h rise, rainfall today/season, 3-year same-date comparison, sparkline (once history exists), active remarks (e.g. "overflowing since 07/07").
10. **Stack**: Vite + React + TypeScript + react-three-fiber + drei. GitHub Pages hosting, GitHub Actions for OCR + deploy.
11. **Terrain**: real DEM (updated 2026-07-09, superseding procedural noise — user wanted geographic accuracy). `scripts/fetch-terrain.mjs` fetches AWS Terrain Tiles (terrarium, z11) for bbox 72.65–73.8E / 18.85–20.1N → `public/terrain/heights.bin` (Int16 metres, 448×640) + `meta.json`. Client (`src/scene/heightfield.ts`) loads it via Suspense, web-mercator-projects lon/lat → scene, bilinear-samples heights, and carves a stylized reservoir bowl (raised dam rim) per lake so fill level stays readable. District boundaries are real: `scripts/fetch-districts.mjs` (geoBoundaries IND ADM2) → `src/assets/districts.json`. Rivers are hand-traced lon/lat polylines draped on the DEM (no carving). Re-run both scripts to regenerate; outputs are committed.
12. **Mobile-first**: info panel becomes bottom sheet on small screens; touch pan/zoom via MapControls; test on phone every milestone.
13. **Backfill**: timeboxed ~30 min scroll of BMC's timeline for June-onward images, batch-OCR them (monsoon fill-up is the dramatic data).
14. **Ship gate**: public link after milestone 5 (live site + daily pipeline working). History + polish are fast-follows.

## Data model

### `data/history.json` — array of daily records, append-only

```json
{
  "date": "2026-07-09",
  "reportTime": "06:00",
  "totals": {
    "liveStorageML": 703260,
    "pctUseful": 48.59,
    "previousYears": [
      { "year": 2025, "liveStorageML": 1050912, "pctUseful": 72.61 },
      { "year": 2024, "liveStorageML": 296349, "pctUseful": 20.48 }
    ]
  },
  "lakes": {
    "bhatsa": {
      "levelM": 124.50,
      "rise24hM": 2.70,
      "liveStorageML": 306002,
      "pctUseful": 42.68,
      "rainTodayMm": 33.0,
      "rainSeasonMm": 1070.0,
      "previousYears": [
        { "year": 2025, "levelM": 131.20, "liveStorageML": 445801, "pctUseful": 62.17 },
        { "year": 2024, "levelM": 114.35, "liveStorageML": 130583, "pctUseful": 18.21 }
      ]
    }
  },
  "remarks": ["Vehar Lake started overflowing on 07.07.2026 at 21:00 Hrs"]
}
```

Lake keys: `upper_vaitarna`, `modak_sagar`, `tansa`, `middle_vaitarna`, `bhatsa`, `vehar`, `tulsi`.

### `src/config/lakes.ts` — static per-lake config (not in daily data)

- `fslM` / `ldlM` (full / low-draw levels, metres), `fslUsefulML` (capacity)
- `supplyShare` (approx fraction), `displayName`
- `position` (scene x/z, hand-tuned from rough lat/lon), `datum` ("M.S.L." or "T.H.D.")

Seed record for 2026-07-09 already parsed: `data/history.json` (committed). Source image: `data/image.png`.

### Validation rules (OCR Action fails loudly on violation)

- Sum of lake `liveStorageML` == totals `liveStorageML` ±1%
- Recomputed % (liveStorage ÷ fslUseful × 100) == printed % ±0.5
- `levelM` between LDL−2 and FSL+2
- Date not already in history; date parses; all 7 lakes present

## Milestones (one issue file each, fresh session per issue)

1. **Scaffold** (`.issues/01-scaffold.md`) — Vite+React+r3f+TS app, procedural terrain, 7 carved basins at config positions, sqrt-capacity sizing, constrained camera. Static 50% water everywhere.
2. **Data model** (`.issues/02-data-model.md`) — schema types, seed history.json, water heights driven by real fill %, config file with capacities/shares/positions.
3. **Interaction** (`.issues/03-interaction.md`) — hover highlight + tooltip, click → info panel (bottom sheet on mobile), header stat bar (total % + days of supply).
4. **Flow** (`.issues/04-flow.md`) — low-poly Mumbai, pipes with animated particles, thickness ∝ share.
5. **Pipeline** (`.issues/05-pipeline.md`) — OCR script (Claude API), GitHub Action on inbox push, validation, append+commit, Pages deploy workflow. **Ship: public link.**
6. **History** (`.issues/06-history.md`) — backfill June+ images, batch OCR mode, sparklines + 3-yr comparison in panel.
7. **Polish** (`.issues/07-polish.md`) — lighting/fog pass, monsoon rain visual on high-rainfall days, overflow indicator, OG/share meta tags, loading state, mobile QA.

## Non-goals

- Scientific accuracy of terrain or hydrology
- Real-time anything (daily cadence only)
- Backend/database
- Full Twitter automation (fetch stays manual; parse is automated)
