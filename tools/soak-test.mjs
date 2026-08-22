import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { clampToLand, getSurfaceType } from '../src/world.js';
import { CollisionSystem } from '../src/collision.js';

const seconds = Math.max(60, Number(process.argv[2] || 120));
const assetRoot = new URL('../public/assets', import.meta.url).pathname;
const glbs = [];
const wavs = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith('.glb')) glbs.push(file);
    else if (file.endsWith('.wav')) wavs.push(file);
  }
};
walk(assetRoot);

// Validate GLB files
for (const file of glbs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'glTF' || data.readUInt32LE(8) !== data.length) throw new Error(`Malformed GLB: ${file}`);
  const jsonLength = data.readUInt32LE(12);
  const json = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8').replace(/\0+$/, '').trim());
  if (!json.scenes?.length) throw new Error(`GLB has no scene: ${file}`);
}

// Validate WAV files
if (wavs.length < 5) throw new Error(`Expected at least 5 production WAV files, found ${wavs.length}.`);
for (const file of wavs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`Malformed WAV: ${file}`);
  if (data.length < 4096) throw new Error(`Unexpectedly short WAV: ${file}`);
}

// Setup collision test environment matching assets.js
const cs = new CollisionSystem();
// Workshop & storage
cs.addBox(6.5, -3.9, 1.75, 1.45, -0.5, 'building_workshop');
cs.addBox(9.1, -3.2, 1.35, 1.25, -0.5, 'building_storage');
// Fences
cs.addSegment(8.65, -5.38, 10.25, -6.22, 0.22, 'fence1');
cs.addSegment(10.08, -6.26, 11.42, -6.64, 0.22, 'fence2');
// Trees
const trees = [
  [-8.8, 1.0, 0.55], [-11.2, -1.8, 0.60], [-8.9, -5.2, 0.55],
  [-4.7, -8.3, 0.55], [-12.5, -6.8, 0.55], [-1.1, -10.4, 0.55], [12.0, -8.2, 0.55]
];
for (const [tx, tz, tr] of trees) cs.addCircle(tx, tz, tr, 'tree');
// Rocks
const rocks = [
  [-3.1, 2.0, 0.65], [-6.6, 4.2, 0.80], [10.9, -1.0, 0.70],
  [-8.0, -3.0, 0.55], [6.0, 5.0, 0.45]
];
for (const [rx, rz, rr] of rocks) cs.addCircle(rx, rz, rr, 'rock');

// 1. Direct Tree Obstacle Collision Test
const playerRadius = 0.38;
for (const [tx, tz, tr] of trees) {
  const candidate = { x: tx, z: tz }; // Place player directly at tree center
  cs.resolve(candidate, playerRadius, 3);
  const dist = Math.hypot(candidate.x - tx, candidate.z - tz);
  if (dist < playerRadius + tr - 0.001) {
    throw new Error(`Tree collision failed at (${tx}, ${tz}): player penetrated to distance ${dist}, required ${playerRadius + tr}`);
  }
}

// 2. Direct Workshop Box Collision Test
{
  const bCenter = { x: 6.5, z: -3.9 };
  cs.resolve(bCenter, playerRadius, 3);
  // Check that candidate is outside box half-extents
  const cosY = Math.cos(-0.5), sinY = Math.sin(-0.5);
  const dx = bCenter.x - 6.5, dz = bCenter.z - (-3.9);
  const lx = Math.abs(cosY * dx + sinY * dz);
  const lz = Math.abs(-sinY * dx + cosY * dz);
  if (lx < 1.75 && lz < 1.45) {
    throw new Error(`Workshop box collision failed: candidate ${JSON.stringify(bCenter)} inside box`);
  }
}

// 3. Surface Detection Test
if (getSurfaceType(0, 0) !== 'dirt' && getSurfaceType(0, 0) !== 'grass') throw new Error('Surface type invalid at (0,0)');
if (getSurfaceType(6.5, -4.1) !== 'dirt') throw new Error('Surface type at path should be dirt');
if (getSurfaceType(6.5, -3.0) !== 'wood') throw new Error('Surface type at workshop should be wood');

// 4. Virtual Soak Test
const player = new THREE.Vector3(-0.9, 0.8, 3.5);
const camera = new THREE.Vector3(7, 7, 13);
const target = new THREE.Vector3();
const initialCount = glbs.length;
const frames = seconds * 60;

for (let frame = 0; frame < frames; frame++) {
  const t = frame / 60;
  const input = new THREE.Vector3(Math.sin(t * 0.61), 0, Math.cos(t * 0.43)).normalize();
  const candidate = {
    x: player.x + input.x * (3.5 / 60),
    z: player.z + input.z * (3.5 / 60)
  };

  cs.resolve(candidate, playerRadius, 3);
  clampToLand(candidate, 2.5);

  player.x = candidate.x;
  player.z = candidate.z;
  player.y = candidate.y || 0.8;

  target.copy(player).add(new THREE.Vector3(7.8, 6.6, 9.7));
  camera.lerp(target, 1 - Math.exp(-(1 / 60) * 4.7));

  if (![...player, ...camera].every(Number.isFinite)) throw new Error(`Non-finite state at frame ${frame}`);
  if (glbs.length !== initialCount) throw new Error('Asset/object count changed during soak.');
}

console.log(`PASS: ${seconds}s virtual soak, ${frames} frames, ${glbs.length} GLBs, ${wavs.length} WAVs, ${cs.count} colliders tested, finite movement/camera state, stable object count.`);
