# Status — 0.1.0 Stage 0

Updated: 2026-08-21

| Area | Status | Evidence / limitation |
|---|---|---|
| Input asset inventory | **WORKING** | All six user-provided packs/directories audited in `docs/ASSET_INVENTORY.md`. |
| Production licenses | **WORKING** | Selected Quaternius and KayKit assets are CC0; license copies retained. Unlicensed Buildings Pack rejected. |
| Production asset selection | **WORKING** | 13 GLBs + 3 license files, ~9.3 MiB; source formats excluded from runtime. |
| Art audition scene | **WORKING** | Authored player/nature/building/props, volumetric terrain edge, path, water, sky, lighting and shadows load from local assets. |
| Player locomotion | **WORKING** | KayKit rig; Idle/Walking_A blend; joystick and WASD/arrow movement. |
| Camera | **WORKING** | Two bounded elevated angles; follows player; deterministic shot views. |
| HIGH/MEDIUM profiles | **WORKING** | Fixed boot-time DPR, shadow size and decoration density. |
| Offline web build | **WORKING** | Vite production build contains local code/assets only; no CDN/runtime network calls. |
| Diagnostics | **WORKING** | `window.__GAME.getDiagnostics()`, debug card, single guarded RAF loop. |
| Screenshot hooks | **WORKING** | Three fixed hash states implemented. |
| Screenshot PNG files | **NOT IMPLEMENTED (environment limitation)** | No installed browser; Playwright Chromium CDN download failed. No fabricated screenshots. |
| Automated soak | **PARTIAL** | 120-second virtual state/asset integrity soak passes. No real browser renderer soak was possible in this environment. |
| Android wrapper | **WORKING (configuration)** | Capacitor Android project, landscape, immersive, keep-awake, no sensitive permissions, stable alpha signing configuration. |
| Local Android build | **NOT IMPLEMENTED (environment limitation)** | Java/Android SDK are absent locally. |
| GitHub Actions APK pipeline | **PARTIAL until CI result** | Workflow is configured; status becomes WORKING only after a successful remote run and artifact verification. |
| Honor Magic 8 Pro FPS/art | **NOT TESTED** | Requires the user's real-device APK review. |
| Gameplay zones | **NOT IMPLEMENTED BY DESIGN** | Stage 1 is explicitly blocked pending Stage 0 acceptance. |
| Harvest/carry/delivery/build/worker/economy/save/story | **NOT IMPLEMENTED BY DESIGN** | Not part of Stage 0. |
