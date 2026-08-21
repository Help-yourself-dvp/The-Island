# Asset inventory — Stage 0

Audit date: 2026-08-21. Source packs remain untouched under `models/`. Sizes below are binary MiB unless stated otherwise.

## Input packs

| Pack | Author / provenance | License evidence | Source size | Contents and formats | Animation / rig | Mobile assessment | Decision / intended role |
|---|---|---|---:|---|---|---|---|
| Stylized Nature MegaKit (Standard) | Quaternius | `License_Standard.txt`: CC0 1.0 | 87.0 MiB; 182 files | 68 glTF models + BIN; 40 PNG; 4 previews. Trees, dead trees, pines, bushes, flowers, ferns, grass, mushrooms, pebbles and rocks. | None | Individual meshes average ~2.2k triangles (13–10,104); excellent after selecting models and resizing textures. | **ACCEPT.** Primary nature family. Eight selected production models. |
| Ultimate Fantasy RTS (Aug 2022) | Quaternius | `License.txt`: CC0 1.0 (header incorrectly says “Ultimate Platformer Pack”, but author/license are explicit) | 70.3 MiB; 268 files | 128 self-contained glTF models and 138 PNG renders: buildings, farms, docks, markets, props, resources, roads/walls. | None | Mostly light flat-shaded assets; average ~3.9k triangles, heaviest model 35,076. Selective use is mobile-safe. | **ACCEPT / selective.** One small house plus barrel, crate and log pile for audition. |
| Farm Buildings (Sept 2018) ZIP | Quaternius | Included `License.txt`: CC0 1.0 | 3.52 MiB compressed / 10.90 MiB unpacked; 54 files | 13 models in Blend, FBX and OBJ/MTL; barn, sheds, fences, well, silo, windmills, chicken coop. | None | Light geometry, but conversion required and older style is simpler than the primary nature pack. | **MAYBE.** Valid future farm library; not included in Stage 0 runtime. |
| Farm Animals ZIP | Quaternius | Included `License.txt`: CC0 1.0 | 6.75 MiB compressed / 15.39 MiB unpacked; 30 files | 7 animals in Blend, FBX and OBJ/MTL: cow, horse, llama, pig, pug, sheep, zebra. | No animation clips proven in audit; no reusable game rig established. | Geometry is modest, but static animals do not meet later gameplay needs without animation work. | **MAYBE.** Preserve for a later farm audition; not included now. |
| Universal Animation Library (Standard) ZIP | Quaternius | Included `License.txt` and README: CC0 1.0 | 15.17 MiB compressed / 60.70 MiB unpacked; 9 files | 2 FBX + 2 GLB variants (root motion and in-place), 43 clips. GLB includes a skinned `Mannequin`. | Humanoid rig; idle, walk, jog, sprint, interact, pickup, fixing and many non-project clips. | 7.6 MiB per GLB; useful as a future retargeting library. The grey mannequin is not a production hero. | **ACCEPT as source library, REJECT mannequin as player.** Not shipped in Stage 0 runtime. |
| Buildings Pack (Aug 2017) ZIP | Author not established by files; filename alone is insufficient | **No LICENSE/README in archive** | 2.65 MiB compressed / 9.33 MiB unpacked; 47 files | 10 buildings duplicated as Blend, FBX, OBJ/MTL; tiny palette PNG files. | None | Conversion possible, but provenance blocks use. | **REJECT for production.** Preserved untouched. |

## GitHub-researched critical category

The repository did not contain a production-quality player model. The UAL mannequin is an animation reference, not a character. Stage 0 therefore researched only this missing class.

| Pack | Repository | License | Contents | Decision |
|---|---|---|---|---|
| KayKit Character Pack: Adventurers 1.0 | `KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0` | Included `LICENSE.txt`: CC0 1.0 | Five rigged GLB characters, each about 6.4k triangles and 76 clips. | **ACCEPT.** `Rogue.glb` selected as the friendly, readable player candidate; weapon nodes are hidden. |

Retrieved from GitHub on 2026-08-21 at the repository's `main` branch. Only `Rogue.glb` and its license are copied into production; the external repository is not vendored wholesale.

## Art-family candidates

### A — selected: painterly Quaternius island + friendly KayKit player

- Quaternius Stylized Nature MegaKit for foliage/rocks.
- Quaternius Ultimate Fantasy RTS for one building and props.
- KayKit Rogue for player.
- Strengths: complete Stage 0 categories, CC0 throughout, authored locomotion, mobile-ready, warm readable palette.
- Risk: KayKit is rounder/chunkier and RTS architecture is flatter than the nature kit. Lighting, scale and restrained selection normalize the difference; device review must explicitly validate it.

### B — all-Quaternius source family

- Same nature/buildings plus UAL mannequin.
- Strengths: one author and compatible palette/rig tooling.
- Blocking weakness: mannequin is visibly an animation reference and fails the production-character requirement.
- **Rejected for audition.**

### C — older low-poly farm family

- Farm Buildings + Ultimate Fantasy RTS + KayKit character, with simple nature from RTS.
- Strengths: extremely light and internally low-poly.
- Weakness: visibly older/flatter, less aligned with the painterly target and would make the audition resemble a generic RTS board.
- **Alternative only; not connected.**

## Production selection

Runtime files live only under `public/assets/`:

- Player: `player-rogue.glb` — 76 clips; Stage 0 uses `Idle` and `Walking_A`.
- Nature: `CommonTree_2`, `TwistedTree_2`, `Pine_3`, `Rock_Medium_1`, `Rock_Medium_2`, `Bush_Common`, `Bush_Common_Flowers`, `Fern_1`.
- Building: `Houses_FirstAge_1_Level1`.
- Props: `Barrel`, `Crate`, `Logs`.

Production assets total approximately **9.3 MiB** including license files. Nature textures were embedded into GLB and capped at 512×512. No Blend, FBX, OBJ, preview image, source archive or duplicate runtime format is shipped by Vite/Capacitor.
