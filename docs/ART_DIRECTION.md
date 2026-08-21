# Art direction — Stage 0.5 final pass 0.1.2

## Review status

**STAGE 0.5 — FINAL ART DIRECTION PASS.** The imported-asset pipeline, organic island, player, green nature family, wooden architecture, camera direction and Android foundation are retained. Stage 1 remains blocked until explicit `ACCEPT ART`.

The audition depicts one real diorama: the **old forest sawmill before restoration**. All four shot hooks use this same scene and differ only in camera placement.

## Setting decision: TIMELESS COZY MEDIEVAL ISLAND

The accepted visual setting is a warm, stylized medieval/fantasy-medieval island without mandatory magic. It is not a historical simulator. The same material language can support a sawmill, farm, windmill, bakery, tavern, inn, quarry, cobbled roads, carts, market, harbor and lighthouse/signal tower.

Preferred visual vocabulary:

- timber beams, boards and shingles;
- stone and muted plaster where appropriate;
- cloth awnings/flags;
- warm, restrained metal details;
- barrels, crates, hand tools, fences and carts;
- mills, markets, harbor structures and signal landmarks.

Avoid without a separately approved reason: modern cars, asphalt, electric signs/lights, modern hotel architecture, plastic furniture and modern industrial machinery.

This decision is recorded here and in `STATUS.md`. The core concept/story documents 02/03 intentionally remain unchanged until a separate controlled revision after art acceptance.

## Composition

The frame is organized as a readable future gameplay space rather than a circular asset display:

- **Left/midground:** clustered green forest edge.
- **Center/foreground:** player in an open clearing.
- **Leading line:** a packed-earth path from the player toward the workshop.
- **Right/midground:** weathered timber workshop, covered storage bay, log piles, hand axe, upright/tilted crates, barrels and incomplete fence.
- **Path continuation:** extends through the workshop and ends behind unused stock/broken fence, hinting at a future route without implementing a bridge.
- **Background:** layered sand/soil coast, animated sea, hazed islands, sparse clouds and one distant medieval windmill landmark.
- **Foreground framing:** restrained rocks, ferns and grass tufts; no tree is intentionally placed between the primary camera and player.

The land mass is an irregular ellipse modified by several low-frequency silhouette waves. It is not a circle or a ring. The terrain top winding was corrected: the previous top faces pointed away from the camera and exposed the water beneath, producing the reported “blue pool / green donut” failure.

## Terrain and shore

Land is the visual base of the shot. The playable center is continuous grass with gentle broad elevation changes. The perimeter transitions through vertex-color zones:

`warm green grass → muted soil → sand → teal water`

The island edge has visible soil/rock thickness below the shoreline. Water sits below the coast and cannot replace the central playable surface.

## Water and horizon

Water uses a lightweight local shader with:

- deep teal and lighter shallow variation;
- two subtle moving wave frequencies;
- view-angle Fresnel response;
- controlled warm sun glint;
- distance haze toward the sky hue.

The horizon is supported by three low-contrast distant island silhouettes and two sparse cloud groups. These are atmospheric secondary forms, not gameplay assets.

## Accepted player candidate

KayKit Rogue is now the **fixed production character choice for this art direction**, subject only to final Honor movement/performance acceptance:

- fitted to 1.78 world units;
- authored rig and locomotion;
- `Idle`, `Walking_A` and `Running_A` cross-fade by joystick magnitude;
- facing follows camera-relative movement direction;
- all weapon/crossbow/throwable character nodes remain hidden;
- positioned and framed large enough to inspect on a phone.

The static KayKit axe near the workshop is a separate environment prop, not player equipment or gameplay.

## Selected forest family

The first forest zone now uses only coherent green Quaternius variants:

- `CommonTree_2`
- `CommonTree_4`
- `Pine_3`
- `Pine_1`

Trees form clusters and an edge around an open clearing. The warm/red `TwistedTree_2` is removed from the current runtime scene and production copy, while its original source remains untouched in `models/Stylized Nature MegaKit[Standard]`. It may be reconsidered for a later autumn area; it is not part of the Zone 1 palette.

## Workshop assembly

The visual anchor is dressed as a cozy abandoned work site:

- `Houses_FirstAge_1_Level1` as the closed timber workshop;
- `Storage_FirstAge_Level1` as the adjacent covered log bay;
- two unused log piles;
- upright and slightly tilted crates;
- upright and fallen barrels;
- one static hand axe;
- complete + tilted fence pieces blocking the unused continuation;
- nearby ferns and grass reclaiming the edges;
- slightly muted/roughened workshop materials rather than destructive ruin edits.

The arrangement communicates “worked here → abandoned → repairable” without gloom. No gameplay, harvesting state, construction stage or economy is attached. This is a static art diorama.

## Palette

- Grass: warm/muted forest greens `#557d40`–`#739d50`.
- Soil/sand: `#92724d`–`#c3aa72`.
- Timber: authored warm Quaternius browns.
- Rock: muted authored grey.
- Water: deep teal `#17677b` to shallow teal `#3d9e9f`.
- Sky/haze: restrained blue-green.
- Sun: warm morning/late-afternoon cream, not orange sunset.
- Accents: player green/leather and limited flower color.

No red tree, acid grass, cyan terrain or global color filter is used.

## Scale convention

Player is the reference:

| Category | Revised world height |
|---|---:|
| Player | 1.78 |
| Main closed workshop | 5.9 |
| Covered storage/log bay | 3.35 |
| Common trees | 6.2–7.1 |
| Pines | 6.4–7.6 |
| Fern/grass dressing | 0.26–0.78 |
| Rocks | 0.52–1.35 |
| Crate | 0.52–0.72 |
| Barrel | 0.74–0.92 |
| Partial fence | 0.86–1.05 |

Models are normalized from authored world bounds and grounded against the same analytical height function as player movement. Player foot offset is retained while walking.

## Camera convention

- Elevated third-person / soft-isometric.
- FOV: 42°.
- Primary offset: approximately `(7.8, 6.6, 9.7)` from the player.
- Camera shows one clearing, not the whole island.
- Land always fills the lower/main frame; coastline and distant environment sit behind it.
- The player stays readable and larger than in 0.1.0.
- Second camera angle is debug-only and its diamond button is hidden unless `?debug` is present.
- Trees are compositionally excluded from the main player-to-camera corridor, avoiding an unnecessary runtime foliage-fade system at Stage 0.

## Lighting convention

- Art-directed soft morning / late-afternoon daylight.
- Warm directional sun: `#ffd9a3`, intensity 3.75.
- Cooler sky and muted green ground hemisphere fill: intensity 1.45.
- ACES Filmic, exposure 1.04, sRGB output.
- PCF soft shadows: 2048 HIGH / 1024 MEDIUM.
- Shadow normal bias remains restrained so player, building, trees and props contact the ground.
- Atmospheric fog begins beyond the playable composition and shifts distant objects toward the blue-green horizon.
- No bloom, SSAO, vignette or post-processing is used to hide composition problems.

## Distant landmark

`Windmill_FirstAge` sits on a hazed distant island as a non-interactive future objective. It uses the accepted medieval architecture family and is intentionally subordinate to the sawmill. It has no trigger, collision, production or gameplay state.

## Audio audition

The offline ambience is intentionally minimal:

- quiet looping sea;
- soft looping wind;
- sparse bird calls with long silent gaps;
- earth footsteps triggered only while moving.

All four WAV files are generated reproducibly by `tools/generate-audio.py` from mathematical waveforms and seeded noise. No third-party sample or music is present. Audio unlocks on the first touch/key gesture, suspends in background and exposes bounded state in diagnostics. Three ambient sources loop; each footstep source disconnects when complete. Music is deliberately omitted.

## UI

The Stage 0 title is smaller and less opaque. The joystick keeps its 126px touch area but uses a lighter ring and smaller visual knob. The camera diamond is debug-only.

## Shot hooks

- `#shot-art` — complete forest/path/clearing/workshop composition.
- `#shot-player` — closer character-scale review beside ground detail.
- `#shot-sawmill` — dressed abandoned sawmill/workshop as the first-location anchor.
- `#shot-coast` — land/shore/water transition and distant windmill landmark.

The hooks freeze animation time and only change camera placement. They do not create screenshot-only geometry or state.

## Forbidden mismatches

- Procedural cone trees, sphere rocks or box-built workshop as key art.
- Photoreal assets beside the selected stylized family.
- Red/autumn tree in the first forest audition.
- Water occupying the playable center.
- Perfect circular island silhouette.
- Evenly spaced trees or props around a ring.
- Full-map camera or tiny player.
- Heavy post effects used as composition repair.
- Modern cars, asphalt, electric signage, plastic furniture or contemporary hotel/industrial architecture.

## Pre-commit self-critique of authentic captures

1. **Game screenshot or asset viewer?** The hero view now reads as one traversable clearing with a destination; it no longer arranges models around an empty center.
2. **Where is land?** Continuous green terrain occupies the lower/main 65–75% of the hero composition.
3. **Where is water?** Teal sea begins beyond a visible pale shore and remains background.
4. **Where can the player go?** The warm packed-earth path provides a clear left/center-to-workshop route.
5. **Is the workshop visible?** Yes; it is the dominant right-midground mass in `#shot-art`, fills `#shot-sawmill`, and now carries coherent abandonment details.
6. **Is the player large enough?** Readable in the hero view and deliberately larger in `#shot-player` for silhouette/material review.
7. **Do trees form one family?** Only green CommonTree and Pine variants remain; saturated red bushes and warm TwistedTree are excluded.
8. **Foreground/midground/background?** Foreground fern/rock and clearing; midground player/path/workshop/forest; background coast/sea/islands/clouds.
9. **Visual route?** Yes, player is placed directly on the path toward the workshop.
10. **Huge empty area?** No central blue void remains. The foreground is intentionally open movement space but receives two restrained framing details.
11. **Missing-material cyan/green geometry?** No. Teal is isolated to authored water shading; terrain uses warm greens and soil/sand bands.
12. **Worth observing longer?** The composition now establishes a credible production direction; final judgment remains the second Honor device review, not this self-assessment.
