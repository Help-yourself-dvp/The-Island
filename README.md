# Остров снова жив / Island Revival

A new offline-first Android game project. It is **not** a SKYFORGE sequel and does not reuse SKYFORGE gameplay architecture.

## Current stage: Stage 0 — art audition

Version `0.1.0` proves the visual foundation and delivery pipeline only:

- small composed island vignette using audited production assets;
- animated player with touch joystick and desktop WASD/arrows;
- bounded elevated camera with two angles;
- HIGH/MEDIUM quality profiles;
- deterministic screenshot hooks and diagnostics;
- offline Vite build in a Capacitor 6 Android wrapper;
- signed alpha APK built by GitHub Actions.

Harvesting, economy, sawmill restoration, workers and all gameplay zones are intentionally **not implemented** until the user accepts Stage 0 on the real device.

## Stack

- Three.js 0.160.1
- Vite 5.4.21
- Vanilla JavaScript + HTML/CSS
- Capacitor 6.2.1 / Android
- No physics engine, CDN, analytics, ads, billing or runtime network dependency

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

- `#shot-art`
- `#shot-player`
- `#shot-building`
- `window.__GAME.getDiagnostics()` returns a plain, non-cyclic snapshot.

## Android APK

Every push to `arena/01a023b0-the-island` runs **Android Art Audition** in GitHub Actions. Open the run, select its successful `apk` job and download artifact:

`island-revival-0.1.0-art-audition`

The archive contains `island-revival-0.1.0-art-audition.apk`. The APK is signed with the committed development-only PKCS#12 key so successive closed-alpha builds remain installable as updates. This key must never be used for a store release.

The workflow validates versions and production assets, builds the web bundle, syncs Capacitor, builds the signed release APK, verifies that INTERNET permission is absent, prints the certificate identity, and uploads the artifact. It does not create a public Release.

## Assets

Source libraries remain under `models/`. Only selected, converted production assets under `public/assets/` enter the APK.

- Inventory and selection: [`docs/ASSET_INVENTORY.md`](docs/ASSET_INVENTORY.md)
- Licenses/provenance: [`docs/ASSET_LICENSES.md`](docs/ASSET_LICENSES.md)
- Visual rules: [`docs/ART_DIRECTION.md`](docs/ART_DIRECTION.md)

All selected Stage 0 art is CC0. Never connect runtime code directly to the source-pack directories.
