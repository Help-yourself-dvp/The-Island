# Stage 0 revision screenshots — 0.1.1

These PNG files are authentic captures from the same running Vite/Three.js scene at 1280×720:

- `art-audition.png` — `#shot-art`
- `player-scale.png` — `#shot-player`
- `building-style.png` — `#shot-building`

Capture date: 2026-08-21. The sandbox lacked a system browser, so a temporary headless Chromium 92 was run against the live local server with compiled NSPR libraries and SwiftShader. No scene geometry or state was created solely for screenshots. The three hooks freeze animation and select fixed cameras in the normal scene.

The software-renderer FPS displayed by diagnostics during capture was approximately 1 FPS and is **not** a mobile performance measurement. Renderer diagnostics were stable for all captures: no fatal error, 23 textures, 36 geometries, and approximately 41–59 draw calls depending on camera visibility.
