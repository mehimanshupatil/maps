# 11 — Three.js scene upgrade (wow pack)

> **Status: ✅ Done (2026-07-10).** Shipped: IST day-night (clamped, ?t= override), Sky + drifting clouds (dome yields to stars at deep night), water ripple shader (diagonal waves, distance-faded, night-darkened), overflow waterfalls, night city lights + zone glow + bright night particles, desktop-only Bloom+Vignette. Gauge pillars built, evaluated, REMOVED — no reference frame at map scale; chips already carry status. og-base.jpg regenerated.

From the 2026-07-10 grilling: Three.js is underused — scene is static planes while
UI carries the interest. Direction locked: **richer scene, DOM UI untouched**
(DOM stays for text/charts/controls; it's better at them).

## Decisions

1. **Water ripple shader** (sea + lakes): scrolling normal ripples, fresnel,
   sun-glint tied to the light direction. No reflective Water (2× render = mobile death).
2. **Sky + clouds**: drei `<Sky>` with sun matched to our key light; a few soft
   billboard clouds drifting over the Ghats. No real cloud shadows.
3. **Live IST day-night, clamped**: real clock drives sun angle + palette
   (morning-cool → noon → golden evening → dusk-blue night that never goes
   black — moon key light, stars, readable labels). `?t=<hour>` override for
   testing/recordings. The scrubber changes data only, never time-of-day.
4. **Bloom + vignette, desktop-only**: `@react-three/postprocessing`, mounted
   only when `(pointer: fine)` — phones keep raw renderer and 60fps. Ships only
   if laptop stays smooth.
5. **Water-level gauge pillars**: thin glowing pillar per lake, height = fill %,
   status-colored (red/amber/green), animates with the scrubber. The one
   in-scene data ornament; DOM chips remain the controls.
6. **Overflow waterfalls**: particle spill + mist at the rim of any lake ≥100%
   (replaces/joins the shimmer ring). Data-driven — appears exactly when BMC
   remarks say overflow.
7. **Night city lights**: emissive windows on the city cluster, brighter flow
   particles at night, faint zone-dot pulse — driven by the same time blend.

## Build order (dependencies)

time-of-day core → sky/clouds → water shader → pillars → waterfalls + city
lights → postprocessing last (perf gate).

## Post-conditions

- Regenerate `public/og-base.jpg` after the look settles (share cards must match).
- Real-phone check: no flicker, 60fps with effects off.
- Verify flythrough + night mode + scrubber-play all compose.
