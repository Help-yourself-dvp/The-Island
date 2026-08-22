# Status — 0.1.3 Pre-Production Foundation Lock

Updated: 2026-08-22

Review state: **PRE-PRODUCTION FOUNDATION LOCK COMPLETED. READY FOR DEVICE CHECK ON HONOR MAGIC 8 PRO.** Stage 1 gameplay remains blocked until explicit `START STAGE 1`.

Setting decision: **TIMELESS COZY PRE-INDUSTRIAL / MEDIEVAL-INSPIRED ISLAND** — firmly locked across `02_КОНЦЕПЦИЯ_ИГРЫ.md`, `03_СЮЖЕТ_И_ТЕКСТЫ.md`, `docs/ART_DIRECTION.md` and `docs/WORLD_PLAN.md`.

| Area | Status | Evidence / details |
|---|---|---|
| Collision framework | **WORKING** | Pure-math 2D horizontal collision system: player circle footprint (`r=0.38`), tree cylinders, rock circles, building oriented bounding boxes (OBBs) and fence segments. Player cannot pass through trees, rocks, workshop or fences. Boundary clamp preserved. |
| Locomotion & animation sync | **WORKING** | Walk (`2.15 m/s` -> `Walking_A`) and Run (`3.50 m/s` -> `Running_A`) matched to eliminate foot sliding. Velocity gating detects blocked movement against obstacles. |
| Footsteps & surface acoustics | **WORKING** | Cadence and volume differentiated: Walk is softer (~0.48s cadence), Run is crisper (~0.30s cadence). Dynamic surface detection (`grass`, `dirt`, `wood`, `stone`) modulates audio DSP filtering, gain, and rate. Footsteps pause when movement is blocked. |
| Soundscape (hum & birds) | **WORKING** | Eliminated constant 92 Hz tonal hum from sea/wind. Sea and wind use non-tonal filtered pink noise. Cyclic 3-second bird loop replaced by sparse randomized one-shot calls (intervals 8–35s) with pitch/gain variation and natural pauses. |
| World plan & scale | **WORKING** | `docs/WORLD_PLAN.md` created: 10 districts, ASCII map, relative scale (~5–8× larger than audition clearing), landmarks, unlocks, Zone 1 25–40 tree slot layout, multi-step sawmill progression, and visual cargo stack specification. |
| Concept & story docs | **WORKING** | `02_КОНЦЕПЦИЯ_ИГРЫ.md` and `03_СЮЖЕТ_И_ТЕКСТЫ.md` updated: modern elements replaced by medieval equivalents (tavern, inn, carts, paved/dirt roads, small harbor), added **WHEAT → MILL → FLOUR → BAKERY/TAVERN** chain. |
| Asset quality re-audit | **WORKING** | `docs/ASSET_INVENTORY.md` updated with `CURRENT`, `BETTER CANDIDATE`, `BACKGROUND ONLY`, and `REJECT` categories for all uploaded user packs. |
| Production asset licenses | **WORKING** | Quaternius and KayKit models are CC0 with license copies in `public/assets/licenses/`; generated audio is CC0 under `public/assets/audio/LICENSE.txt`. |
| Production asset bundle | **WORKING** | Total runtime assets ~11.05 MiB (18 GLB models, 6 WAV audio files, license texts). Source archives/formats excluded. |
| Automated soak test | **WORKING** | 120-second / 7,200-frame test validates 18 GLBs, 6 WAVs, 16 obstacle colliders, collision penetration resolution, surface detection, finite player/camera state. |
| Build & Android pipeline | **WORKING** | Offline Vite build passing, Capacitor Android build config validated, no sensitive permissions, version updated to `0.1.3`. |
| Stage 1 gameplay (Chop/Collect/Economy/Workers/Bridge) | **NOT IMPLEMENTED BY DESIGN** | Explicitly blocked pending creative director verification of foundation. |
