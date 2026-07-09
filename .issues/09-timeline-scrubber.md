# 09 — Timeline scrubber

> **Status: ✅ Done (2026-07-09). Play/pause + slider, all surfaces follow scrubbed date, smooth water/count transitions, ?date= deep links.**

## Goal

Drag through the season: a date slider that drives every lake's water level,
label %, status dots, rain shafts and header stats from `data/history.json` —
watch the monsoon fill the lakes.

## Notes

- UI: slim slider along the bottom (desktop) / above the sheet (mobile), with a
  play ▸ button that advances ~4 days/sec. Default position: latest record.
- State: `selectedDate` in the selection store; `useWaterData(date?)` returns
  the record for that date (nearest earlier record for gaps).
- Water discs animate between records (lerp fill over ~200ms) so scrubbing is
  smooth, not steppy.
- Header "lasts till" and status pills recompute per scrubbed date.
- Deep-linkable: `?date=2026-07-09` for sharing a specific day.
- This is the screen-recording feature: scrub June→today = the monsoon story.

## Acceptance

- Scrubbing is smooth with 60+ records; gaps don't jump wildly.
- Play mode runs the whole season and stops at today.
- Reload with `?date=` lands on that day.
