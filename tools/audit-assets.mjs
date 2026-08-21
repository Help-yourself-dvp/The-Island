import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = new URL('..', import.meta.url).pathname;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name));
const files = walk(path.join(root, 'public/assets'));
const bytes = files.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const glbs = files.filter((file) => file.endsWith('.glb'));
if (!glbs.length) throw new Error('No production GLB assets found.');
for (const file of glbs) {
  const data = fs.readFileSync(file);
  if (data.toString('ascii', 0, 4) !== 'glTF') throw new Error(`Invalid GLB: ${file}`);
}
for (const forbidden of ['.fbx', '.obj', '.blend']) {
  if (files.some((file) => file.toLowerCase().endsWith(forbidden))) throw new Error(`Forbidden runtime format ${forbidden}`);
}
console.log(JSON.stringify({ productionFiles: files.length, glbModels: glbs.length, bytes, mebibytes: +(bytes / 1048576).toFixed(2) }, null, 2));
