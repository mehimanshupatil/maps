# 07 — Polish

Read `PRD.md` first. Depends on all prior.

## Goal

Make it screenshot-worthy and share-ready.

## Tasks

- Lighting/fog/palette pass: golden-hour directional light, soft fog at horizon, cohesive color script (terrain greens/browns, water teal, city warm grey).
- Rain visual: on lakes where `rainTodayMm` high (e.g. >50mm), light particle rain over that basin. Subtle.
- Overflow state: lakes at 100% (`pctUseful >= 100`) get overflow shimmer/spill hint at rim + "Overflowing" badge in tooltip/panel.
- Loading state: skeleton/fade-in while scene builds; no flash of empty canvas.
- Meta: title, description, OG image (static screenshot), favicon. Share card looks good in WhatsApp/Twitter preview.
- Mobile QA sweep: real phone — controls, sheet, perf, text sizes.
- Attribution footer: "Data: BMC Hydraulic Engineer's Department (daily report). Approximate visualization — not official."

## Acceptance

- Cold load → pleasant reveal, no jank.
- Link preview shows proper card.
- Phone experience solid end-to-end.
