# 07 — Polish

> **Status: 🟡 Partially done (2026-07-09).**
> Done already: golden-hour lighting pass, data-driven rain (>40mm lakes), overflow rim
> shimmer, load fill-up animation + header count-up, OG/twitter meta + og.jpg card,
> favicon, attribution footer, share button.

Read `PRD.md` first. Depends on all prior.

## Remaining tasks

- Loading state: skeleton/fade-in while the DEM loads; no flash of empty canvas
  (Suspense fallback is currently `null`).
- Mobile QA sweep on a real phone: touch controls, bottom sheet, perf (particle
  counts), text sizes, share button via native sheet.
- Perf check on mid-range phone: terrain vertex count, rain + flow particle load.
- Color/contrast pass on the status palette for accessibility.
- Cross-browser: Safari (canvas share path uses `navigator.canShare` — verify).

## Acceptance

- Cold load → pleasant reveal, no jank.
- Phone experience solid end-to-end; link preview card looks right in WhatsApp/Twitter.
