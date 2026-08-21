# Status — 0.1.2 Stage 0.5 final art pass

Updated: 2026-08-21

Review state: **FINAL STAGE 0 ART REVIEW PENDING ON HONOR MAGIC 8 PRO.** Stage 1 remains blocked until explicit `ACCEPT ART`.

Setting decision: **TIMELESS COZY MEDIEVAL ISLAND** — accepted for art direction. It is stylized fantasy-medieval without mandatory magic and not a historical simulator. Documents `02_КОНЦЕПЦИЯ_ИГРЫ.md` and `03_СЮЖЕТ_И_ТЕКСТЫ.md` require a later controlled setting revision after art acceptance; they were intentionally not rewritten in Stage 0.5.

| Area | Status | Evidence / limitation |
|---|---|---|
| Input asset inventory | **WORKING** | Existing user packs re-audited selectively; no broad nature/model search. |
| Production licenses | **WORKING** | Selected Quaternius/KayKit art and generated project audio are CC0 with runtime license copies. Unlicensed Buildings Pack remains rejected. |
| Production asset selection | **WORKING** | Explicit GLB/audio-only runtime selection; source formats excluded. New dressing uses existing pack families: grass, fence, axe and distant windmill. |
| Setting language | **ACCEPTED FOR FINAL REVIEW** | Wood, stone, hand tools, barrels, crates, fence, windmill and warm natural palette. Modern vehicles/asphalt/electric signage/plastic/modern architecture prohibited by ART_DIRECTION. |
| Terrain / shoreline | **WORKING, DEVICE REVIEW REQUIRED** | Continuous irregular land, soft elevations and grass→soil→sand→water transition. Three restrained coastal rocks added. |
| Forest edge / clearing | **WORKING, DEVICE REVIEW REQUIRED** | Green CommonTree/Pine clusters form one forest side; ferns, short grass and stones reclaim edges while central movement space remains open. |
| Workshop storytelling | **WORKING, DEVICE REVIEW REQUIRED** | Slightly weathered workshop + covered bay + two log piles + crates + upright/fallen barrel + axe + partial/tilted fence + vegetation. Static art only. |
| Path / future hint | **WORKING** | Packed-earth route begins around start space, passes the player/workshop and continues to an unused fenced/logged obstruction. No bridge or gameplay implemented. |
| Future landmark | **WORKING, DEVICE REVIEW REQUIRED** | Existing `Windmill_FirstAge` appears as a non-interactive hazed distant silhouette. |
| Water / background | **WORKING, DEVICE REVIEW REQUIRED** | Animated teal wave shader with Fresnel, variation, sun glint, shore transition, distant islands/clouds. |
| Player choice | **FIXED FOR ART DIRECTION, DEVICE REVIEW REQUIRED** | KayKit Rogue at 1.78 units; character weapons hidden; Idle/Walking_A/Running_A cross-fade by input magnitude and face movement direction. |
| Camera | **WORKING, DEVICE REVIEW REQUIRED** | 42° elevated follow camera preserves space and player readability; alternate angle/button remains debug-only. |
| Lighting | **WORKING, DEVICE REVIEW REQUIRED** | Bright warm late-morning/afternoon sun, cool fill, ACES exposure 1.04, soft PCF shadows and haze. No heavy post effects. |
| Audio audition | **WORKING, DEVICE REVIEW REQUIRED** | Offline generated sea/wind/birds loops and transient earth footsteps; unlock on first gesture, suspend/resume lifecycle and bounded sources. No music. |
| UI | **WORKING** | Minimal Stage 0 title, visually light joystick with large touch area, no gameplay buttons/menu. |
| HIGH/MEDIUM profiles | **WORKING** | Fixed boot-time DPR, 2048/1024 shadows and bounded dressing density. |
| Offline web build | **WORKING** | Local bundle only; no CDN/runtime downloads. |
| Diagnostics | **WORKING** | `window.__GAME.getDiagnostics()` includes renderer/player/audio state; one guarded RAF loop. |
| Screenshot hooks | **WORKING** | `#shot-art`, `#shot-player`, `#shot-sawmill`, `#shot-coast` use one real scene with fixed cameras. |
| Screenshot PNG files | **WORKING** | Four authentic 1280×720 runtime captures committed; no screenshot-only geometry. Headless capture reports no fatal errors. |
| Automated soak | **WORKING** | 120-second / 7,200-frame state harness validates finite movement/camera, stable counts, 18 GLBs and 4 WAVs. Browser regression confirms Idle→Run→Idle and partial-stick Walk transitions plus exactly 3 ambience loops. |
| Android wrapper | **WORKING** | Capacitor, sensor-landscape, fullscreen/cutout, keep-awake, no sensitive permissions, stable alpha signing. |
| GitHub Actions APK pipeline | **PENDING 0.1.2 RUN** | 0.1.1 pipeline verified; final Stage 0.5 artifact must pass after commit. |
| Gameplay zones | **NOT IMPLEMENTED BY DESIGN** | Diorama/locomotion/audio only. No zone mechanics. |
| Chop/resources/workers/construction/bridge/farm/dialogue/save/quests | **NOT IMPLEMENTED BY DESIGN** | Explicitly excluded from Stage 0.5. |
