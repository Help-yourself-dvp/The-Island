# AI guide — Остров снова жив

This is the active guide for the new project. Files under `reference/` describe SKYFORGE history only.

## Guardrail

Current authorized scope is **Stage 0 only**. Do not implement harvesting, inventory, sawmill restoration, workers, economy, story progression or later zones until the user explicitly accepts Stage 0 and requests Stage 1.

## Architecture

- `src/main.js` — one bootstrap and one guarded RAF loop; renderer, light, camera, diagnostics and player movement.
- `src/world.js` — analytical ground height, terrain volume, path and water.
- `src/assets.js` — explicit production manifest, GLTF loading, bounds-based scale/grounding, scene placement and player animation.
- `src/input.js` — one virtual joystick plus keyboard debug input.
- `src/style.css` / `index.html` — minimal art-audition UI.
- `public/assets/` — only selected runtime art and retained licenses.
- `models/` — user-provided source library; never import this directory from runtime.
- `android/` — Capacitor wrapper, immersive landscape activity and alpha signing.
- `.github/workflows/android.yml` — reproducible APK artifact delivery.

There is one `requestAnimationFrame` chain. Its frame body catches exceptions so one runtime fault does not silently freeze the chain. Resume resets `lastTime`; no giant catch-up step is possible (`dt` is capped at 0.05).

## Asset pipeline

`source pack → inventory/license audit → explicit selection → glTF-to-GLB copy → texture cap/optimization → public/assets category → static GLTFLoader manifest`

Rules:

1. A model is not production-eligible without provenance and compatible license.
2. Preserve source archives/files unless the user approves cleanup.
3. Never ship all formats or full packs.
4. Keep license copies under `public/assets/licenses/`.
5. Runtime assets must be local; no CDN or remote URLs.
6. Update both asset documents for any change.
7. Run `npm run assets:audit`.

Current nature GLBs embed textures capped at 512×512. Character and props use authored embedded data. Do not add compression extensions unless runtime decoder support is deliberately configured and device-tested.

## Scale and material conventions

Player = 1.78 world units; buildings ~4.25; main trees 6–9. `fitAndPlace()` derives scale from world bounds and grounds the result with `groundHeight()`.

Preserve authored material identity. Scene normalization only imposes matte roughness, low metalness, foliage alpha test/double side, ACES and consistent sunlight. Avoid replacing all assets with a global toon shader.

## Camera and input

Camera is a bounded elevated third-person/soft-isometric view with two offsets. It follows the player and cannot go below terrain because offsets are fixed above it. Stage 0 needs no camera physics.

Joystick up maps to camera-forward projected on XZ; right uses `forward × up`. Keyboard uses WASD/arrows. Player movement is constrained inside the island and has no physics/jump.

## Player animations

KayKit Rogue contains 76 authored clips. Stage 0 blends only `Idle` and `Walking_A`. `Knife`, `Crossbow` and `Throwable` named nodes are hidden. Do not expose combat assets or mechanics.

## Quality

HIGH: DPR ≤ 2, antialiasing, 2048 shadow map, full audition decoration.

MEDIUM: DPR ≤ 1.35, 1024 shadow map, two fewer decorations.

Quality is chosen at boot and frozen to avoid runtime render-target churn. Query `?quality=medium` or `window.__GAME.setQuality()` stores a preference and reloads.

## Debug and screenshots

Only `window.__GAME` is global. It exposes version, plain-object diagnostics, quality setter and screenshot hook names. Never expose Three.js scene objects globally.

Shot hashes: `#shot-art`, `#shot-player`, `#shot-building`. They fix the camera and freeze animation. `?debug` shows a small once-per-second diagnostics card.

## Android

- Package: `com.helpyourself.islandrevival`
- Landscape + immersive system bars + keep screen on.
- INTERNET permission explicitly removed; no other sensitive permission.
- `version.txt` is the human source; Gradle reads it and CI uses `GITHUB_RUN_NUMBER` for versionCode.
- `tools/island-alpha.p12` is a committed development-only key. Never use it for store signing.
- APK comes from GitHub Actions. Do not claim success merely because workflow YAML exists; inspect the actual run.

## Git workflow

Stay on the Arena session branch. Fetch before work, preserve unknown files, run build/audit/soak, inspect diff, commit and push. Keep `STATUS.md` honest. Do not switch branches or rewrite source asset history.
