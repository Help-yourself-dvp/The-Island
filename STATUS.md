# Status — 0.1.1 Stage 0 revision

Updated: 2026-08-21

Review state: **REVISE STAGE 0 — awaiting second Honor Magic 8 Pro art review.** Stage 1 remains blocked.

| Area | Status | Evidence / limitation |
|---|---|---|
| Input asset inventory | **WORKING** | All six user-provided packs/directories audited; no broad new asset search. |
| Production licenses | **WORKING** | Selected Quaternius and KayKit assets are CC0; license copies retained. Unlicensed Buildings Pack remains rejected. |
| Production asset selection | **WORKING** | Explicit GLB-only runtime selection; source formats excluded. Revised family adds two existing green variants and a storage module; red `TwistedTree_2` removed from current production scene. |
| Terrain / land readability | **WORKING, DEVICE REVIEW REQUIRED** | Terrain top winding bug fixed. Continuous irregular land mass, soft elevations and grass→soil→sand→water transition replace the blue-center/green-ring failure. |
| Forest composition | **WORKING, DEVICE REVIEW REQUIRED** | Green CommonTree/Pine family forms clustered forest edge around an open clearing. No radial placement. |
| Workshop diorama | **WORKING, DEVICE REVIEW REQUIRED** | Enlarged closed timber workshop + covered storage bay + logs/crates/barrel form the right-side visual anchor. Static art only. |
| Path / clearing | **WORKING** | Visible packed-earth ribbon leads from player through clearing to workshop; path face winding validated upward. |
| Water / background | **WORKING, DEVICE REVIEW REQUIRED** | Local animated teal Fresnel/glint shader, shoreline below land, distant hazed island silhouettes and clouds. |
| Player candidate | **WORKING, PROVISIONALLY ACCEPTED** | KayKit rig retained at 1.78 units; weapons hidden; Idle/Walking_A blend; enlarged camera framing. |
| Camera | **WORKING, DEVICE REVIEW REQUIRED** | 42° FOV, closer bounded elevated follow camera. Alternate angle/button is debug-only. Shot views updated. |
| Lighting | **WORKING, DEVICE REVIEW REQUIRED** | Warm low-angle sun, cooler restrained hemisphere fill, ACES exposure 1.04, PCF soft shadows and farther atmospheric haze. No post-processing cover-up. |
| UI | **WORKING** | Smaller/softer Stage 0 title; lighter joystick visual with unchanged touch hitbox; diamond hidden outside debug. |
| HIGH/MEDIUM profiles | **WORKING** | Fixed boot-time DPR, 2048/1024 shadows and bounded decoration density. |
| Offline web build | **WORKING** | Local bundle only; no CDN/runtime asset downloads. |
| Diagnostics | **WORKING** | `window.__GAME.getDiagnostics()`, debug card and one guarded RAF loop. |
| Screenshot hooks | **WORKING** | `#shot-art`, `#shot-player`, `#shot-building` use one real scene with fixed cameras. |
| Screenshot PNG files | **WORKING** | Three authentic 1280×720 captures from the live scene are committed in `docs/screens/`; capture used headless Chromium + SwiftShader, not a fabricated image. |
| Automated soak | **WORKING (non-render state harness)** | 120-second / 7,200-frame test passes with finite movement/camera state, valid GLBs and stable object count. Browser captures report no fatal runtime errors. |
| Android wrapper | **WORKING** | Capacitor, sensor-landscape, fullscreen theme/cutout support, keep-awake, no sensitive permissions, stable alpha signing. |
| GitHub Actions APK pipeline | **WORKING** | Run `32476144423` built, signed and permission-checked 0.1.1; artifact `island-revival-0.1.1-art-audition` uploaded. |
| Honor Magic 8 Pro FPS/art | **NOT TESTED FOR 0.1.1** | Requires second device art review. |
| Gameplay zones | **NOT IMPLEMENTED BY DESIGN** | No zone mechanics; diorama only. Stage 1 is blocked. |
| Harvest/carry/delivery/build/worker/economy/save/story | **NOT IMPLEMENTED BY DESIGN** | Explicitly excluded from this revision. |
