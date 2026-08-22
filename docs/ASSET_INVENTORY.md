# Asset inventory & Quality Audit — v0.1.3

Audit date: 2026-08-22. Source packs remain untouched under `models/`. Sizes below are binary MiB unless stated otherwise.

---

## 1. Input Source Packs Summary

| Pack | Author / provenance | License evidence | Source size | Contents and formats | Animation / rig | Mobile assessment | Decision / intended role |
|---|---|---|---:|---|---|---|---|
| **Stylized Nature MegaKit** (Standard) | Quaternius | `License_Standard.txt`: CC0 1.0 | 87.0 MiB; 182 files | 68 glTF models + BIN; 40 PNG; 4 previews. Trees, pines, bushes, flowers, ferns, grass, mushrooms, pebbles, rocks. | None | Meshes average ~2.2k triangles (13–10,104); excellent after selecting models and optimizing textures. | **ACCEPT.** Primary nature family. 9 current models + 14 candidate models for expanded Zone 1 layout. |
| **Ultimate Fantasy RTS** (Aug 2022) | Quaternius | `License.txt`: CC0 1.0 | 70.3 MiB; 268 files | 128 self-contained glTF models and 138 PNG renders: buildings, farms, docks, markets, props, resources, roads/walls. | None | Flat-shaded stylized medieval assets; average ~3.9k triangles. Highly mobile-friendly. | **ACCEPT / selective.** Workshop, storage, windmill, props, and future farm/market/port candidates. Combat assets rejected. |
| **Farm Buildings** (Sept 2018) ZIP | Quaternius | Included `License.txt`: CC0 1.0 | 3.52 MiB compressed / 10.90 MiB unpacked; 54 files | 13 models in Blend, FBX, OBJ/MTL: barn, sheds, fences, well, silo, windmills, coop. | None | Light geometry, conversion required. Cozy rustic aesthetic. | **ACCEPT / selective.** Converted Fence in runtime; Well/Silo/Barns reserved for Farm district. |
| **Farm Animals** ZIP | Quaternius | Included `License.txt`: CC0 1.0 | 6.75 MiB compressed / 15.39 MiB unpacked; 30 files | 7 animals in Blend, FBX, OBJ/MTL: cow, horse, llama, pig, pug, sheep, zebra. | Static meshes (no reusable gameplay animation clips proven). | Modest geometry; suitable for static pasture dressing. | **MAYBE / selective.** Cow/Sheep/Horse/Pig accepted as static background only; Zebra/Llama/Pug rejected. |
| **Universal Animation Library** (Standard) ZIP | Quaternius | Included `License.txt` and README: CC0 1.0 | 15.17 MiB compressed / 60.70 MiB unpacked; 9 files | 2 FBX + 2 GLB variants, 43 clips. GLB includes a skinned `Mannequin`. | Humanoid rig: idle, walk, jog, sprint, interact, pickup, fixing. | 7.6 MiB per GLB. Valuable animation clip reference. | **ACCEPT as animation library; REJECT mannequin as character.** |
| **Buildings Pack** (Aug 2017) ZIP | Author not established | **No LICENSE/README in archive** | 2.65 MiB compressed / 9.33 MiB unpacked; 47 files | 10 buildings duplicated as Blend, FBX, OBJ/MTL. | None | Blocked by missing license provenance. | **REJECT for production.** |
| **KayKit Character Pack: Adventurers 1.0** | Kay Lousberg / KayKit | Included `LICENSE.txt`: CC0 1.0 | Five rigged GLB characters (~6.4k tris, 76 clips). | Complete humanoid locomotion & actions. | Excellent readability, optimized meshes and textures. | **ACCEPT.** `Rogue.glb` active player; other variants reserved for NPC workers. |

---

## 2. Quality Re-Audit & Detailed Model Categorization

### A. Stylized Nature MegaKit (Quaternius)
- **CURRENT (Active in runtime):**
  - `CommonTree_2`, `CommonTree_4` — leafy green deciduous trees for sawmill clearing;
  - `Pine_1`, `Pine_3` — conifer trees for upper forest ridge;
  - `Rock_Medium_1`, `Rock_Medium_2` — natural mossy boulders and coastal rocks;
  - `Fern_1`, `Grass_Common_Short`, `Grass_Wispy_Short` — undergrowth and edge ground cover.
- **BETTER CANDIDATE (Approved for expanded 25–40 slot Zone 1 layout):**
  - `CommonTree_1`, `CommonTree_3`, `CommonTree_5` — additional broadleaf tree variations to prevent visual tiling;
  - `Pine_2`, `Pine_4`, `Pine_5` — additional evergreen conifers;
  - `Bush_Common`, `Bush_Common_Flowers` — lush bush clusters between tree groves;
  - `Rock_Medium_3`, `Pebble_Round_1..5` — detailed forest-floor rock paths and scatter;
  - `Plant_1_Big`, `Mushroom_Common` — rich ground storytelling around fallen logs.
- **BACKGROUND ONLY:**
  - `DeadTree_1..5`, `TwistedTree_1..5` — reserved strictly for distant storm-damaged crags.
- **REJECT:** None (pack fully adheres to quality and licensing standards).

### B. Ultimate Fantasy RTS (Quaternius)
- **CURRENT (Active in runtime):**
  - `Houses_FirstAge_1_Level1` — weathered forest workshop building;
  - `Storage_FirstAge_Level1` — covered timber storage bay;
  - `Windmill_FirstAge` — hazed silhouette landmark;
  - `Barrel`, `Crate`, `Logs` — workshop yard props.
- **BETTER CANDIDATE (Approved for future districts):**
  - `Market_FirstAge_Level1..3` — Town / Market stalls;
  - `Port_FirstAge_Level1..3`, `Dock_FirstAge` — Harbor piers and warehouses;
  - `Farm_FirstAge_Level1_Wheat` — Farm crop fields;
  - `Mine`, `Resource_Rock_1..3` — Quarry extraction equipment;
  - `TownCenter_FirstAge_Level1..3` — Town hall and grand inn;
  - `TowerHouse_FirstAge` — Lighthouse base structure;
  - `Crate_Big_Stack2`, `Crate_Stack1..2` — bulk cargo storage piles.
- **BACKGROUND ONLY:**
  - `MountainLarge_Single`, `Mountain_Group_1..2` — distant mountain backdrops;
  - `Wonder_FirstAge_Level1..3` — ancient monolithic ruins on distant cliffs.
- **REJECT:**
  - `Archery_FirstAge_*`, `Barracks_FirstAge_*`, `WatchTower_FirstAge_*` (combat/military buildings rejected: project setting is peaceful cozy restoration, not combat fantasy/RTS war).

### C. Farm Buildings (Sept 2018)
- **CURRENT:** `Fence` (converted to GLB for path barrier).
- **BETTER CANDIDATE:** `Well` (stone well for town square/farm), `Silo`, `WaterTower`.
- **BACKGROUND ONLY:** `BigBarn`, `SmallBarn`, `OpenBarn`, `ChickenCoop`.
- **REJECT:** None.

### D. Farm Animals
- **BACKGROUND ONLY / PLACEHOLDER:** `Cow`, `Sheep`, `Horse`, `Pig` (static pasture dressing until rigged animation pipeline is added).
- **REJECT:** `Zebra`, `Llama`, `Pug` (thematically inconsistent with cozy temperate island setting).

### E. Character & Rigging Library
- **CURRENT:** `KayKit Rogue.glb` (weapons hidden, 76 authored animation clips).
- **BETTER CANDIDATE:** `KayKit Knight`, `Mage`, `Barbarian` (peaceful variants with tools instead of weapons) for future named NPCs (Tom, Lina, Rey, Noah, Eli).
- **REJECT as Hero:** `Universal Animation Library Mannequin` (grey test mesh rejected for production hero).

---

## 3. Production Selection Summary

Runtime assets live strictly under `public/assets/`:
- **Characters:** `player-rogue.glb` (76 clips; `Idle`, `Walking_A`, `Running_A` actively used);
- **Nature (13 models):** `CommonTree_1`, `CommonTree_2`, `CommonTree_3`, `CommonTree_4`, `Pine_1`, `Pine_2`, `Pine_3`, `Bush_Common`, `Rock_Medium_1`, `Rock_Medium_2`, `Fern_1`, `Grass_Common_Short`, `Grass_Wispy_Short`;
- **Buildings & Landmarks (3 models):** `Houses_FirstAge_1_Level1`, `Storage_FirstAge_Level1`, `Windmill_FirstAge`;
- **Props (5 models):** `Barrel`, `Crate`, `Logs`, `Fence`, `Axe`;
- **Audio (6 WAV files):** `sea-loop.wav`, `wind-loop.wav`, `bird-1.wav`, `bird-2.wav`, `bird-3.wav`, `footstep-earth.wav`.

Total runtime bundle footprint: **~14.54 MiB** (22 GLB models + 6 WAV files, verified by `npm run assets:audit`). All source formats (`.blend`, `.fbx`, `.obj`, `.png` source textures) are excluded from the distribution build.
