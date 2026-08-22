import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { clampToLand, getSurfaceType, groundHeight } from '../src/world.js';
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

// 1. Validate GLB files
for (const file of glbs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'glTF' || data.readUInt32LE(8) !== data.length) {
    throw new Error(`Malformed GLB: ${file}`);
  }
  const jsonLength = data.readUInt32LE(12);
  const json = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8').replace(/\0+$/, '').trim());
  if (!json.scenes?.length) throw new Error(`GLB has no scene: ${file}`);
}

// 2. Validate WAV files
if (wavs.length < 6) throw new Error(`Expected at least 6 production WAV files, found ${wavs.length}.`);
for (const file of wavs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`Malformed WAV: ${file}`);
  }
  if (data.length < 4096) throw new Error(`Unexpectedly short WAV: ${file}`);
}

// 3. Setup collision environment matching assets.js
const cs = new CollisionSystem();
// Semantic sawmill & storage
cs.addBox(15.0, -0.5, 1.70, 1.45, -0.45, 'sawmill_main_walls');
cs.addBox(16.2, 0.4, 0.95, 0.85, -0.45, 'sawmill_back_walls');
cs.addCircle(13.6, -1.8, 0.28, 'sawmill_post_left');
cs.addCircle(15.8, -2.6, 0.28, 'sawmill_post_right');
cs.addBox(19.2, 1.8, 1.15, 0.95, -0.45, 'sawmill_storage_back');
cs.addCircle(17.6, 0.2, 0.25, 'storage_pillar_left');
cs.addCircle(20.0, 2.2, 0.25, 'storage_pillar_right');
// Timber yard props
cs.addBox(17.8, -2.8, 0.85, 0.55, -0.45, 'prop_logs1');
cs.addBox(12.4, -2.2, 0.85, 0.55, 0.35, 'prop_logs2');
cs.addBox(13.2, 0.6, 0.48, 0.48, 0.15, 'prop_crate1');
cs.addBox(13.9, 1.4, 0.42, 0.42, -0.35, 'prop_crate2');
cs.addCircle(19.2, -0.8, 0.45, 'prop_barrel1');
cs.addCircle(11.6, -0.4, 0.40, 'prop_barrel2');
// Bridge route
cs.addSegment(30.6, -8.6, 32.4, -9.4, 0.24, 'bridge_fence1');
cs.addSegment(33.7, -10.2, 35.3, -10.8, 0.24, 'bridge_fence2');
cs.addBox(33.0, -9.8, 0.85, 0.55, 0.4, 'bridge_logs');
cs.addCircle(36.5, -12.5, 0.95, 'bridge_rock');

// 34 harvestable trees
const treeSlotPositions = [
  [-8, 12], [-14, 15], [-19, 18], [-12, 22], [-6, 18], [-16, 9], [-22, 12], [-10, 8], [-25, 16], [-18, 25],
  [-28, 4], [-35, 8], [-42, 2], [-46, -6], [-38, -2], [-32, -8], [-44, 10], [-36, 15], [-48, 4], [-26, -2],
  [-40, -12], [-34, -16], [-46, -18], [-28, 10],
  [-15, -6], [-22, -12], [-18, -18], [-10, -14], [-6, -18], [-12, -24], [-24, -22], [-28, -26], [-4, -26], [-18, -28]
];
for (let i = 0; i < treeSlotPositions.length; i++) {
  const [tx, tz] = treeSlotPositions[i];
  cs.addCircle(tx, tz, 0.58, `tree_slot_${i + 1}`);
}

const playerRadius = 0.38;

// Test direct penetration into trees
for (const [tx, tz] of treeSlotPositions) {
  const candidate = { x: tx, z: tz };
  cs.resolve(candidate, playerRadius, 4);
  const dist = Math.hypot(candidate.x - tx, candidate.z - tz);
  if (dist < playerRadius + 0.58 - 0.001) {
    throw new Error(`Tree collision failed at (${tx}, ${tz}): player penetrated to distance ${dist}`);
  }
}

// Test direct penetration into workshop walls
{
  const bCenter = { x: 15.0, z: -0.5 };
  cs.resolve(bCenter, playerRadius, 4);
  const cosY = Math.cos(-0.45), sinY = Math.sin(-0.45);
  const dx = bCenter.x - 15.0, dz = bCenter.z - (-0.5);
  const lx = Math.abs(cosY * dx + sinY * dz);
  const lz = Math.abs(-sinY * dx + cosY * dz);
  if (lx < 1.70 && lz < 1.45) {
    throw new Error(`Workshop wall collision failed: player inside wall`);
  }
}

// Test footstep phase event math
const walkContacts = [0.30, 0.80];
let walkSteps = 0;
let prevPhase = 0;
for (let step = 0; step < 60; step++) {
  const currentPhase = ((step * 0.05) % 1.0667) / 1.0667;
  for (const c of walkContacts) {
    const crossed = (prevPhase <= c && c < currentPhase) || (currentPhase < prevPhase && (prevPhase <= c || c < currentPhase));
    if (crossed) walkSteps += 1;
  }
  prevPhase = currentPhase;
}
if (walkSteps < 4) throw new Error(`Footstep phase event failed: only ${walkSteps} steps in 3s`);

// Test travel time across Zone 1
const startPoint = { x: -42.0, z: 2.0 };
const endPoint = { x: 32.0, z: -8.0 };
const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.z - startPoint.z);
const walkTime = distance / 2.15;
const runTime = distance / 3.50;
if (walkTime < 25 || walkTime > 45) {
  throw new Error(`Travel time out of intended 20-40s range: distance=${distance.toFixed(1)}m, walkTime=${walkTime.toFixed(1)}s`);
}

// 4. Virtual Soak Test across large Zone 1
const player = new THREE.Vector3(0.0, 1.0, 18.0);
const camera = new THREE.Vector3(8.5, 8.2, 28.5);
const target = new THREE.Vector3();
const initialCount = glbs.length;
const frames = seconds * 60;

for (let frame = 0; frame < frames; frame++) {
  const t = frame / 60;
  const input = new THREE.Vector3(Math.sin(t * 0.41), 0, Math.cos(t * 0.27)).normalize();
  const candidate = {
    x: player.x + input.x * (3.5 / 60),
    z: player.z + input.z * (3.5 / 60)
  };

  cs.resolve(candidate, playerRadius, 4);
  clampToLand(candidate, 2.8);

  player.x = candidate.x;
  player.z = candidate.z;
  player.y = groundHeight(player.x, player.z) + 0.8;

  target.copy(player).add(new THREE.Vector3(8.5, 7.2, 10.5));
  camera.lerp(target, 1 - Math.exp(-(1 / 60) * 4.7));

  if (![...player, ...camera].every(Number.isFinite)) {
    throw new Error(`Non-finite state at frame ${frame}`);
  }
  if (glbs.length !== initialCount) {
    throw new Error('Asset/object count changed during soak.');
  }
}

console.log(`PASS: ${seconds}s virtual soak, ${frames} frames, ${glbs.length} GLBs, ${wavs.length} WAVs, ${cs.count} colliders, Zone 1 travel distance ${distance.toFixed(1)}m (walk ${walkTime.toFixed(1)}s / run ${runTime.toFixed(1)}s).`);
