# Status — 0.1.3 Final Foundation Correction

Updated: 2026-08-22

Review state: **FINAL FOUNDATION CORRECTION COMPLETED. READY FOR RE-CHECK ON HONOR MAGIC 8 PRO.** Stage 1 gameplay remains blocked until explicit `START STAGE 1`.

Setting decision: **TIMELESS COZY PRE-INDUSTRIAL / MEDIEVAL-INSPIRED ISLAND** — firmly locked across `02_КОНЦЕПЦИЯ_ИГРЫ.md`, `03_СЮЖЕТ_И_ТЕКСТЫ.md`, `docs/ART_DIRECTION.md` and `docs/WORLD_PLAN.md`.

| Area | Status | Evidence / details |
|---|---|---|
| Zone 1 scale & travel time | **WORKING** | Landmass spans ~94 × 70 world units (`X: [-52, +42]`, `Z: [-38, +32]`). Traversing the district from west forest to east future path takes **~34.7s on foot** (distance 74.7m, walk speed 2.15 m/s) and **~21.3s on run**, satisfying the 20–40s travel target. |
| Camera framing | **WORKING** | Standard gameplay camera (42° isometric follow) frames a local ~20m radius, keeping the player immersed in local clearings, groves, and landmarks rather than exposing the entire island at once. |
| Forest harvesting slots | **WORKING** | **34 logical harvestable tree slots** across 3 distinct sectors (Lower Grove: 10, Deep West: 14, North Ridge: 10) with full entity data contract (`id`, `kind='tree'`, `harvestable=true`, `variant`, `state='mature'`, `position`, `resourceYield`, `growthProgress`). Plus **16 perimeter decorative trees**. |
| Tree models & performance | **WORKING** | 6 compatible models from Quaternius Stylized Nature (`CommonTree_1..4`, `Pine_1..3`, `Bush_Common`) with varied rotations, scales, and shared cached GLTF sources. Total 22 GLBs, ~14.54 MiB runtime footprint. |
| Semantic building colliders | **WORKING** | Replaced single rough box with semantic sub-colliders: enclosed main workshop walls (OBB), rear structure (OBB), front porch posts (`r=0.28`), storage frame (OBB), storage pillars (`r=0.25`), and yard props. Walkable open porch allows player standing without wall clipping. |
| Corner & wall sliding | **WORKING** | Axis-separation sliding solver lets the player glide smoothly along walls and fences when moving obliquely without getting stuck. |
| Collider debug visualizer | **WORKING** | URL parameter `?colliders=1` dynamically renders wireframe/semi-transparent 3D collision volumes (red/orange/blue) for scene inspection. Default: OFF. |
| Footsteps phase synchronization | **WORKING** | Timer-based footstep cadence eliminated. Footsteps trigger on exact animation phase crossings: `Walking_A` (`1.0667s`) at phases `[0.30, 0.80]`, `Running_A` (`0.8000s`) at phases `[0.40, 0.90]`. |
| Velocity gating & anti-sliding | **WORKING** | When player is stationary or blocked directly against a wall (actual speed < 0.25 m/s), footstep audio is completely suppressed and idle/walk blending prevents artificial running on the spot. |
| Clean soundscape | **WORKING** | Non-tonal broad-spectrum ocean surf and breeze (zero 92 Hz hum). Sparse random bird one-shots (8–35s intervals) with pitch/gain variation. Real-time surface acoustics (`grass`, `dirt`, `wood`, `stone`). |
| Screenshot hooks | **WORKING** | 5 hooks for distinct perspectives of the single production district: `#shot-zone1-start`, `#shot-zone1-forest`, `#shot-zone1-sawmill`, `#shot-zone1-future-path`, `#shot-zone1-overview`. |
| Automated soak test | **WORKING** | 120-second / 7,200-frame test validates 22 GLBs, 6 WAVs, 51 colliders, footstep phase crossings, travel distance/time, finite movement & camera stability. |
| Stage 1 gameplay (Harvest/Collect/Economy/Workers/Bridge) | **NOT IMPLEMENTED BY DESIGN** | Explicitly blocked pending creative director verification of foundation. |
