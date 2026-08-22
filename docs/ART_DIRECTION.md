# Art direction & Pre-production Foundation — v0.1.3

## Review status

**PRE-PRODUCTION FOUNDATION LOCK (v0.1.3).** The imported-asset pipeline, organic island scale, player locomotion, collision framework, green nature family, pre-industrial timber/stone architecture, camera direction, clean non-tonal soundscape and Android build pipeline are locked. Stage 1 gameplay remains blocked until explicit `START STAGE 1`.

The production foundation scene depicts the **old forest sawmill before restoration** with production collision, refined audio, and synchronized locomotion. All screenshot hooks use this authentic scene.

---

## Setting decision: TIMELESS COZY PRE-INDUSTRIAL / MEDIEVAL-INSPIRED ISLAND

The visual setting is firmly locked as a warm, stylized, timeless pre-industrial / medieval-inspired island:

- **Not a historical simulator / Not a combat fantasy / Not an RPG.**
- **No mandatory magic, monsters, swords, or warfare.**
- **Core theme:** Restoration of an abandoned island (*Восстановление заброшенного острова*).
- **Material language:** Wood, stone, cloth, fields, mills, carts, markets, harbor, craft, inn, lighthouse.
- **Organic substitutions:**
  - Modern restaurant → Tavern / Трактир;
  - Modern hotel → Inn / Постоялый двор;
  - Modern roads / asphalt → Dirt / Stone roads;
  - Cars / modern logistics → Carts / Ручные и конные тележки;
  - Modern town → Small harbor settlement / Прибрежное поселение;
  - Intermediate farm chain system: **WHEAT → MILL → FLOUR → BAKERY / TAVERN**.

Preferred visual vocabulary:
- Timber beams, boards, wooden shingles, rustic logs;
- Natural stone, fieldstone masonry, light mortar;
- Cloth awnings, jute sacks, canvas sails;
- Barrels, crates, hand axes, wicker baskets, fences, wooden carts;
- Windmills, waterwheels, harbor docks, stone lighthouses;
- Warm, rich natural palette: lush foliage greens, sunlit wheat gold, warm earth, teal ocean.

Prohibited elements:
- Modern vehicles, asphalt highways, traffic signs;
- Electric lighting, neon, powerlines, generators;
- Contemporary hotel/office architecture;
- Plastic furniture, synthetic tarps, modern heavy machinery;
- Swords, armor, siege weapons, monster spawners.

---

## Collision Foundation

The pre-production framework enforces physical solid boundaries without requiring a heavy external physics engine:

- **Player footprint:** 2D horizontal circle / capsule footprint with radius `r = 0.38`.
- **Static obstacle colliders:**
  - **Trees & Pines:** Cylinder / circle colliders with radius `0.50 – 0.60`.
  - **Rocks & Boulders:** Circle / sphere colliders with radius `0.45 – 0.80`.
  - **Buildings (Workshop & Storage):** Oriented Bounding Boxes (OBB) with precise local width/depth and yaw rotation.
  - **Fences & Obstacles:** Capsule segments and box colliders.
- **Collision response:** Sliding projection along obstacle contact normals with multi-iteration corner relaxation.
- **Island boundary:** Smooth `clampToLand` perimeter clamp preventing the player from falling into deep water.

---

## Locomotion & Audio Foundation

### Locomotion & Animation Sync
- **WALK:** Speed `2.15 m/s`, synchronized with `Walking_A` clip, softer footsteps cadence (~0.48s).
- **RUN:** Speed `3.50 m/s`, synchronized with `Running_A` clip, rapid crisper footsteps cadence (~0.30s).
- **Obstacle Slide / Blocking:** If actual displacement drops below threshold (e.g. running into a wall), footstep audio is held and animations transition cleanly without foot sliding.

### Clean Soundscape (Zero Tonal Hum & Sparse Birds)
- **Ambient Wind & Sea:** Offline-synthesized broad-spectrum filtered noise without sinusoidal low-frequency drone (no 50–90 Hz hum). Sea provides gentle rolling surf; wind provides soft atmospheric rustle.
- **Sparse Bird Ambiance:** Eliminated rigid 3-second repetitive loops. Bird calls are scheduled as sparse randomized one-shot events (intervals 8–35s) with randomized pitch, volume, and occasional extended silence.
- **Surface-type Audio Architecture:** Real-time ground classification (`grass`, `dirt`, `wood`, `stone`) with dynamic DSP filtering and rate/gain modulation per surface.

---

## World Structure & Plan

Refer to **`docs/WORLD_PLAN.md`** for the complete island layout, ASCII map, 10 core districts, 25–40 Zone 1 tree slots, sawmill progression stages, and cargo visual stacking specifications.
