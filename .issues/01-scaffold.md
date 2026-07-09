# 01 — Scaffold: app, terrain, basins, camera

> **Status: ✅ Done (2026-07-09). Superseded in part: procedural terrain replaced by real DEM — see PRD decision 11.**

Read `PRD.md` first.

## Goal

Running Vite + React + TypeScript + react-three-fiber app showing the stylized low-poly scene: procedural terrain, seven carved lake basins at rough real-world relative positions, water planes at a static 50% fill, constrained map-like camera. No data wiring yet.

## Tasks

- Scaffold Vite + React + TS. Deps: `three`, `@react-three/fiber`, `@react-three/drei`. Vite `base` config ready for GitHub Pages (`/maps/`).
- `src/config/lakes.ts`: the seven lakes with `displayName`, `fslM`, `ldlM`, `fslUsefulML`, `supplyShare` (approx), `datum`, and scene `position` (x, z). Values from PRD table + `data/history.json`. Positions hand-tuned from rough geography: Upper Vaitarna furthest N, Modak Sagar / Middle Vaitarna / Tansa clustered NE, Bhatsa E, Vehar + Tulsi small and close to city, Mumbai peninsula SW with sea to the W.
- Procedural terrain: single low-poly plane (segmented), simplex noise + hand-tuned ridge along the E (Western Ghats), flattening W toward coast; sea plane W/SW. Flat shading, stylized palette, fog, directional + ambient light.
- Lake basins: carved depressions at config positions. Basin area ∝ sqrt(fslUsefulML), normalized so Bhatsa is largest and Tulsi still visible/clickable. Water = simple animated material plane per basin at 50% height for now.
- Camera: drei `MapControls` — pan + zoom, fixed ~45° polar tilt (small allowance), azimuth clamped ±30°, zoom clamped between whole-system view and single-lake view. Touch works.
- Canvas fills viewport, resizes correctly, works on phone-sized viewport.

## Acceptance

- `npm run dev` shows the scene; all 7 basins visible and identifiable by position/size.
- Pan/zoom within clamps; cannot go under terrain or lose the scene.
- 60fps-ish on a laptop; no console errors.
