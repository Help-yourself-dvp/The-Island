# Остров снова жив / Island Revival

A new offline-first Android game project. It is **not** a SKYFORGE sequel and does not reuse SKYFORGE gameplay architecture.

## Current stage: Pre-Production Foundation Lock

Version `0.1.3` locks the physical, spatial, and acoustic foundation:

- Timeless cozy pre-industrial / medieval-inspired island setting;
- Pure-math 2D horizontal collision framework (player circle, tree/rock circles, workshop/storage OBBs, fence segments);
- Island boundary preserved;
- Synchronized Walk / Run speeds, animations, and differentiated footsteps cadence;
- Non-tonal clean soundscape (tonal 92Hz hum removed; sparse randomized bird calls 8–35s);
- Real-time surface acoustics (`grass`, `dirt`, `wood`, `stone`);
- World structure plan documented in `docs/WORLD_PLAN.md` (10 districts, ASCII map, Zone 1 25–40 slot layout, cargo visual stack specification);
- Concept (02) and story (03) documents adapted to pre-industrial setting with Mill & Tavern farm chain;
- Offline Vite build in a Capacitor 6 Android wrapper;
- Signed alpha APK built by GitHub Actions.

Harvesting, economy, workers, bridge building, and later zones are intentionally **not implemented** until the creative director verifies the foundation on device.

## Stack

- Three.js 0.160.1
- Vite 5.4.21
- Vanilla JavaScript + HTML/CSS
- Capacitor 6.2.1 / Android
- No heavy external physics engine, CDN, analytics, ads, billing or runtime network dependency

Android package identifier: `com.helpyourself.islandrevival`.

## Run and build

```bash
npm ci
npm run dev
npm run assets:audit
npm run build
npm run test:soak
npx cap sync android
```

Desktop controls: WASD or arrow keys. Touch: left virtual joystick. The lower-right button switches between two constrained camera angles.

Quality can be selected with `?quality=high` or `?quality=medium`; `?debug` shows compact renderer diagnostics. It can also be changed with `window.__GAME.setQuality('MEDIUM')`.

## Screenshots and diagnostics

- `#shot-zone1-start`
- `#shot-zone1-forest`
- `#shot-zone1-sawmill`
- `#shot-zone1-future-path`
- `#shot-zone1-overview`
- `?colliders=1` enables 3D wireframe collision volumes.
- `window.__GAME.getDiagnostics()` returns a plain, non-cyclic snapshot with collision count and surface type.

## Android APK

Every push to `arena/01a023b0-the-island` runs **Android Art Audition** in GitHub Actions. Open the run, select its successful `apk` job and download artifact:

`island-revival-0.1.3-art-audition`

The archive contains `island-revival-0.1.3-art-audition.apk`. The APK is signed with the committed development-only PKCS#12 key so successive closed-alpha builds remain installable as updates.

## Assets

Source libraries remain under `models/`. Only selected, converted production assets under `public/assets/` enter the APK.

- Inventory and quality audit: [`docs/ASSET_INVENTORY.md`](docs/ASSET_INVENTORY.md)
- World plan & districts: [`docs/WORLD_PLAN.md`](docs/WORLD_PLAN.md)
- Licenses/provenance: [`docs/ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)
- Visual rules: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md)

All selected art is CC0.
