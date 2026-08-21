# Art direction — Stage 0 baseline

## Direction

A warm, painterly, stylized mobile island: optimistic but not toy-neon. The scene should feel like a quiet corner worth restoring, not an asset viewer or a miniature combat map.

## Selected family

- Painterly Quaternius Stylized Nature as the visual anchor.
- Restrained Quaternius RTS building/props as secondary architecture.
- KayKit Rogue as the friendly, readable player candidate.
- External models remain in their authored style; normalization is limited to scale, roughness, shadow settings and scene-level light.

The character/building compatibility is a **device acceptance question**, not assumed final. If either is rejected, replace that class without discarding the accepted nature baseline.

## Palette

- Sky: teal-blue `#3f9fc7` to pale sea-green horizon `#b8e0d3`.
- Grass: moss and meadow greens around `#6c9e49` / `#7eae55`, never pure green.
- Path: warm sand `#c5a66c`.
- Water: turquoise `#4aaebe` over deeper `#277c91`.
- Architecture: authored wood, cream and terracotta.
- Character: forest green, warm leather and readable skin tones.

Avoid pure black shadows, neon grass, white void skies and a global saturation filter.

## Scale convention

- Player visual height: 1.78 world units.
- Small house: ~4.25 units high.
- Main trees: 6.4–8.6 units.
- Bushes: 0.7–1.2 units.
- Rocks: 1.0–1.55 units.
- Props: crate 0.62, barrel 0.82.

Models are fitted from world-space bounds at load time and grounded against the analytical terrain height.

## Composition and density

- One 31-unit-wide island vignette, not a full map.
- A curved sandy path leads from the tree-framed foreground toward the house.
- Dense clusters frame edges; the central route stays readable.
- Foreground: player, path, flowers/rocks.
- Midground: house and props.
- Background: three authored tree families and water edge.
- HIGH adds only two small decorative objects; MEDIUM lowers render density and quality without changing the design.

Never distribute vegetation on a uniform grid or fill the scene with the entire source pack.

## Lighting and materials

- One warm directional sun plus cool sky/green ground hemisphere fill.
- ACES Filmic tone mapping, exposure 1.12, sRGB output.
- Soft PCF shadows: 2048 HIGH, 1024 MEDIUM.
- Materials keep authored color/texture; roughness is kept at least 0.72 and metalness at most 0.08 for a cohesive matte world.
- Alpha foliage uses alpha test and double-sided rendering.
- Daylight only in Stage 0; no bloom or mobile post-processing chain.

## Camera

Elevated third-person / soft-isometric, 48° FOV. It follows from one of two bounded offsets and always looks at the player. There is no free orbit, underground angle or collision-heavy spring arm. A single button toggles the two composed views.

## Character

The hero must read at phone size, use authored skinning and switch between `Idle` and `Walking_A`. Weapons are hidden: the character is presented as an island restorer, not a rogue/combatant. The rounded proportions are intentional but require explicit device approval.

## Forbidden mismatches

- Photogrammetry/realistic rocks or buildings.
- Primitive box/capsule production characters.
- Voxel, pixel-art or hard sci-fi additions.
- Flat unlit materials mixed beside painterly PBR without normalization.
- Huge 4K textures or entire source packs in the APK.
- Medieval weapons visible on the player.
- Procedural cone trees or sphere rocks replacing authored models.

## Screenshot states

- `#shot-art` — full vignette and composition.
- `#shot-player` — player scale/character review.
- `#shot-building` — architecture/nature compatibility.

Automated PNG capture was not possible in the agent environment because no browser was installed and the Chromium download endpoint was unavailable. No screenshot has been fabricated. These deterministic hooks are ready for browser/device capture; `docs/screens/README.md` records the commands/URLs.
