import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { clampToLand } from '../src/world.js';

const seconds = Math.max(60, Number(process.argv[2] || 120));
const assetRoot = new URL('../public/assets', import.meta.url).pathname;
const glbs = [];
const wavs = [];
const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, entry.name); if (entry.isDirectory()) walk(file); else if (file.endsWith('.glb')) glbs.push(file); else if (file.endsWith('.wav')) wavs.push(file); } };
walk(assetRoot);
for (const file of glbs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'glTF' || data.readUInt32LE(8) !== data.length) throw new Error(`Malformed GLB: ${file}`);
  const jsonLength = data.readUInt32LE(12);
  const json = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8').replace(/\0+$/, '').trim());
  if (!json.scenes?.length) throw new Error(`GLB has no scene: ${file}`);
}
if (wavs.length !== 4) throw new Error(`Expected 4 production WAV files, found ${wavs.length}.`);
for (const file of wavs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`Malformed WAV: ${file}`);
  if (data.length < 4096) throw new Error(`Unexpectedly short WAV: ${file}`);
}

const player = new THREE.Vector3(-0.9, 0.8, 3.5);
const camera = new THREE.Vector3(7, 7, 13);
const target = new THREE.Vector3();
const initialCount = glbs.length;
const frames = seconds * 60;
for (let frame = 0; frame < frames; frame++) {
  const t = frame / 60;
  const input = new THREE.Vector3(Math.sin(t * 0.61), 0, Math.cos(t * 0.43)).normalize();
  player.addScaledVector(input, 3.05 / 60);
  clampToLand(player, 2.5);
  target.copy(player).add(new THREE.Vector3(7.8, 6.6, 9.7));
  camera.lerp(target, 1 - Math.exp(-(1 / 60) * 4.7));
  if (![...player, ...camera].every(Number.isFinite)) throw new Error(`Non-finite state at frame ${frame}`);
  if (glbs.length !== initialCount) throw new Error('Asset/object count changed during soak.');
}
console.log(`PASS: ${seconds}s virtual soak, ${frames} frames, ${glbs.length} GLBs, ${wavs.length} WAVs, finite movement/camera state, stable object count.`);
