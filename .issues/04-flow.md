# 04 — Flow: city + animated supply pipes

Read `PRD.md` first. Depends on 02 (03 can be parallel).

## Goal

The scene reads as a supply *system*: water flows from lakes through pipes to a low-poly Mumbai.

## Tasks

- Low-poly Mumbai at SW: simple extruded peninsula silhouette + box-cluster skyline. No detail obsession.
- Pipes: curved tube/line per lake from basin edge → city (lakes in same corridor may merge visually, e.g. Vaitarna cluster feeding one trunk — match real Tansa/Vaitarna mains loosely). Thickness ∝ `supplyShare`.
- Flow animation: particles or dash-offset shader moving lake→city. Speed/density can scale with share.
- Hovering a pipe or lake highlights the whole route.
- City hover/click: shows totals (stock %, days of supply, vs 2025/2024) — same data as header, richer copy.
- Perf check on phone: particle counts modest.

## Acceptance

- Flow direction unambiguous (toward city).
- Bhatsa pipe visibly dominant; Tulsi/Vehar thin.
- No frame drops on mid phone.
