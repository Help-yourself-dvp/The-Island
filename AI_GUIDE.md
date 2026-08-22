# AI guide — Остров снова жив

This is the active guide for the project. Files under `reference/` describe SKYFORGE history only.

## Guardrail

Current authorized scope is **PRE-PRODUCTION FOUNDATION LOCK (v0.1.3)**. Setting is `TIMELESS COZY PRE-INDUSTRIAL / MEDIEVAL-INSPIRED ISLAND`. Do not implement harvesting, inventory, resource loop, workers, economy, bridge building, farm gameplay, dialogue quests, or later zones until the user explicitly issues the command `START STAGE 1`. Concept and story documents (02, 03) and art direction have been updated and locked.

## Architecture

- `src/main.js` — bootstrap and guarded RAF loop; renderer, light, camera, diagnostics, collision integration, and player movement.
- `src/collision.js` — pure-math 2D collision system (circles, OBB boxes, capsule segments, penetration resolution).
- `src/world.js` — irregular land silhouette, analytical ground/shore height, terrain volume, path spline, surface type detection, stylized water, and distant atmosphere.
- `src/assets.js` — explicit production manifest, GLTF loading, bounds-based scale/grounding, collider registration, scene placement and player animation.
- `src/input.js` — virtual joystick plus keyboard debug input.
- `src/audio.js` — gesture-unlocked offline ambience, non-tonal sea/wind loops, sparse randomized bird calls (8–35s), surface-type DSP acoustics, and walk/run footsteps.
- `src/style.css` / `index.html` — pre-production UI.
- `public/assets/` — selected runtime art (18 GLBs, 6 WAVs) and retained licenses.
- `models/` — user-provided source library; never import this directory from runtime.
- `android/` — Capacitor wrapper, immersive landscape activity and alpha signing.
- `.github/workflows/android.yml` — reproducible APK artifact delivery.

There is one `requestAnimationFrame` chain. Its frame body catches exceptions so one runtime fault does not silently freeze the chain. Resume resets `lastTime`; no giant catch-up step is possible (`dt` is capped at 0.05).

## Collision & Movement Conventions

- **Player footprint:** Circle radius `0.38`.
- **Static obstacles:**
  - Trees/Pines: Circles (`r = 0.50 – 0.60`).
  - Rocks: Circles (`r = 0.45 – 0.80`).
  - Workshop/Storage: Oriented Bounding Boxes (OBBs).
  - Fences: Capsule segments (`radius = 0.22`).
- **Locomotion:** Walk (`2.15 m/s` -> `Walking_A`), Run (`3.50 m/s` -> `Running_A`).
- **Velocity gating:** When blocked by obstacles (actual displacement < 0.25), footsteps are held and sliding is suppressed.

## Audio & Soundscape

- `tools/generate-audio.py` reproducibly generates 6 CC0 WAV files:
  - `sea-loop.wav` (clean ocean surf, filtered pink noise, zero low-frequency tonal hum);
  - `wind-loop.wav` (soft atmospheric breeze, highpass filtered, zero low drone);
  - `bird-1.wav`, `bird-2.wav`, `bird-3.wav` (discrete chirp phrases for sparse randomized playback every 8–35s);
  - `footstep-earth.wav` (natural organic ground step).
- Surface acoustics (`grass`, `dirt`, `wood`, `stone`) dynamically modulate Web Audio filters and gains.

## Quality

HIGH: DPR ≤ 2, antialiasing, 2048 shadow map, full decoration.
MEDIUM: DPR ≤ 1.35, 1024 shadow map, optimized decoration.

## Debug and screenshots

Only `window.__GAME` is global. It exposes version, plain-object diagnostics (including collision count and surface type), quality setter and screenshot hook names. Never expose Three.js scene objects globally.

Shot hashes: `#shot-art`, `#shot-player`, `#shot-sawmill`, `#shot-coast`.

## Android & CI

- Package: `com.helpyourself.islandrevival`
- Landscape + immersive system bars + keep screen on.
- INTERNET permission explicitly removed; offline build.
- `version.txt` is the version source of truth.
- APK artifact is delivered via GitHub Actions.
