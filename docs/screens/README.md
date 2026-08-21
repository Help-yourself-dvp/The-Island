# Stage 0.5 final art-direction screenshots — 0.1.2

These PNG files are authentic captures from the same running Vite/Three.js scene at 1280×720:

- `art-audition.png` — `#shot-art`
- `player-scale.png` — `#shot-player`
- `sawmill-style.png` — `#shot-sawmill`
- `coast-style.png` — `#shot-coast`

Capture date: 2026-08-21. The sandbox lacked a system browser, so a temporary headless Chromium 92 was run against the live local server with locally compiled NSPR libraries and SwiftShader. No scene geometry or state was created solely for screenshots. The four hooks freeze animation and select fixed cameras in the normal scene.

The software-renderer FPS shown during capture was approximately 1 FPS and is **not** a mobile performance measurement. Captures reported no fatal runtime error, 26 textures, 40–46 geometries and approximately 50–77 visible draw calls depending on camera. A separate gesture test decoded all four offline WAV files and confirmed exactly three active ambience loops.
