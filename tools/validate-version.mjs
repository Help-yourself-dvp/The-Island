import fs from 'node:fs';
const version = fs.readFileSync(new URL('../version.txt', import.meta.url), 'utf8').trim();
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid version.txt: ${version}`);
if (pkg.version !== version) throw new Error(`Version mismatch: version.txt=${version}, package.json=${pkg.version}`);
console.log(`Version ${version} validated.`);
