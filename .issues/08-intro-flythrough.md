# 08 — Intro flythrough

> **Status: ⬜ Not started.** Approved in the social-features discussion (2026-07-09).

## Goal

A ~6s cinematic camera intro on first load: sweep in over the Ghats, follow the
Vaitarna cascade down past the lakes, ride the mains corridor to Bhandup and the
city, then ease into the standard map view and hand control to MapControls.

## Notes

- Skippable (tap/click/scroll skips to the end state); play once per session
  (sessionStorage flag), `?intro=0` to disable, `?intro=1` to force (for screen
  recordings).
- Implement as a CatmullRom camera path with lookAt targets; drive with a single
  progress value in useFrame; disable controls until done.
- Sync with the existing lake fill-up animation (start fills when the camera
  reaches the lakes, ~2s in).
- Respect `prefers-reduced-motion`: skip straight to map view.

## Acceptance

- Intro → map view handoff has no camera jump.
- Skipping at any point lands exactly on the default view.
- 60fps on laptop, no jank on mid phone (or auto-skip on weak devices).
