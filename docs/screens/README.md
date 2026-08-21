# Stage 0 screenshot capture

The environment used for Stage 0 had no Chromium installation. A Playwright Chromium download was attempted on 2026-08-21 and failed at the browser CDN TLS connection. A second attempt using an npm-packaged headless Chromium reached the executable but the sandbox lacked required NSS/NSPR shared libraries. Therefore the views could not be captured honestly here.

Deterministic views are implemented and can be opened as:

- `/#shot-art` → save as `art-audition.png`
- `/#shot-player` → save as `player-scale.png`
- `/#shot-building` → save as `building-style.png`

In each shot mode, camera placement is fixed and animation time is frozen. Do not add hand-made or promotional images under these filenames; screenshots must come from the running build.
