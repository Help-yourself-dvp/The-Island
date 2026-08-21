# AI guide — Остров снова жив

This is the active guide for the new project. Files under `reference/` describe SKYFORGE history only.

## Guardrail

Current authorized scope is **Stage 0.5 final art pass only**. Setting is `TIMELESS COZY MEDIEVAL ISLAND`. Do not implement harvesting, inventory, sawmill restoration, workers, economy, story progression or later zones until the user explicitly says `ACCEPT ART` and requests Stage 1. Concept/story documents 02/03 await a separate controlled setting revision after art acceptance.

## Architecture

- `src/main.js` — one bootstrap and one guarded RAF loop; renderer, light, camera, diagnostics and player movement.
- `src/world.js` — irregular land silhouette, analytical ground/shore height, terrain volume, path, stylized water and distant atmosphere.
- `src/assets.js` — explicit production manifest, GLTF loading, bounds-based scale/grounding, scene placement and player animation.
- `src/input.js` — one virtual joystick plus keyboard debug input.
- `src/audio.js` — gesture-unlocked offline ambience and bounded footstep playback.
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

Player = 1.78 world units; main workshop = 5.9; covered bay = 3.35; green trees = 6.2–7.6. `fitAndPlace()` derives scale from world bounds, stores each model's ground offset and grounds it with `groundHeight()`.

Preserve authored material identity. Scene normalization only imposes matte roughness, low metalness, foliage alpha test/double side, ACES and consistent sunlight. Avoid replacing all assets with a global toon shader.

## Camera and input

Camera is a bounded 42° elevated third-person/soft-isometric view focused on one clearing. It follows the player and cannot go below terrain because its offset is fixed above it. The alternate angle/button is debug-only. Tree placement keeps the primary camera-player corridor clear, so Stage 0 needs no camera physics or foliage-fade system.

Joystick up maps to camera-forward projected on XZ; right uses `forward × up`. Keyboard uses WASD/arrows. Player movement is constrained inside the island and has no physics/jump.

## Player animations

KayKit Rogue contains 76 authored clips. Stage 0.5 cross-fades `Idle`, `Walking_A` and `Running_A` from joystick magnitude. `Knife`, `Crossbow` and `Throwable` character nodes are hidden. A separate static KayKit axe dresses the sawmill. Do not expose combat assets or mechanics.

## Quality

HIGH: DPR ≤ 2, antialiasing, 2048 shadow map, full audition decoration.

MEDIUM: DPR ≤ 1.35, 1024 shadow map, two fewer decorations.

Quality is chosen at boot and frozen to avoid runtime render-target churn. Query `?quality=medium` or `window.__GAME.setQuality()` stores a preference and reloads.

## Debug and screenshots

Only `window.__GAME` is global. It exposes version, plain-object diagnostics, quality setter and screenshot hook names. Never expose Three.js scene objects globally.

Shot hashes: `#shot-art`, `#shot-player`, `#shot-sawmill`, `#shot-coast`. They fix the camera and freeze animation in the same real scene. `?debug` shows a small once-per-second diagnostics card.

## Audio

`tools/generate-audio.py` reproducibly creates the four CC0 WAV files; no external recordings are used. Audio loads locally, unlocks on first pointer/key gesture and suspends with the document. Keep exactly three ambient loops bounded; each transient footstep must disconnect on `ended`. Music is intentionally absent.

## Android

- Package: `com.helpyourself.islandrevival`
- Landscape + immersive system bars + keep screen on.
- INTERNET permission explicitly removed; no other sensitive permission.
- `version.txt` is the human source; Gradle reads it and CI uses `GITHUB_RUN_NUMBER` for versionCode.
- `tools/island-alpha.p12` is a committed development-only key. Never use it for store signing.
- APK comes from GitHub Actions. Do not claim success merely because workflow YAML exists; inspect the actual run.

## Git workflow

Stay on the Arena session branch. Fetch before work, preserve unknown files, run build/audit/soak, inspect diff, commit and push. Keep `STATUS.md` honest. Do not switch branches or rewrite source asset history.
