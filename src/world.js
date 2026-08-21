import * as THREE from 'three';

export const ISLAND_RADIUS = 15.5;

export function groundHeight(x, z) {
  const r = Math.hypot(x, z) / ISLAND_RADIUS;
  const broad = 0.45 * Math.sin(x * 0.19) * Math.cos(z * 0.16);
  const knoll = 0.72 * Math.exp(-((x + 5) ** 2 + (z - 4) ** 2) / 38);
  return 0.3 + broad * Math.max(0, 1 - r * r) + knoll;
}

function islandGeometry(radialSegments = 64, rings = 13) {
  const positions = [];
  const colors = [];
  const indices = [];
  const color = new THREE.Color();
  positions.push(0, groundHeight(0, 0), 0);
  color.setHex(0x75a94d); colors.push(color.r, color.g, color.b);

  for (let ring = 1; ring <= rings; ring++) {
    const radius = ISLAND_RADIUS * (ring / rings);
    for (let i = 0; i < radialSegments; i++) {
      const a = i / radialSegments * Math.PI * 2;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const y = groundHeight(x, z) - (ring === rings ? 0.1 : 0);
      positions.push(x, y, z);
      const patch = Math.sin(x * 0.43 + z * 0.29) * 0.5 + 0.5;
      color.set(patch > 0.52 ? 0x7eae55 : 0x6c9e49);
      colors.push(color.r, color.g, color.b);
    }
  }
  for (let i = 0; i < radialSegments; i++) indices.push(0, 1 + i, 1 + (i + 1) % radialSegments);
  for (let ring = 1; ring < rings; ring++) {
    const inner = 1 + (ring - 1) * radialSegments;
    const outer = 1 + ring * radialSegments;
    for (let i = 0; i < radialSegments; i++) {
      const n = (i + 1) % radialSegments;
      indices.push(inner + i, outer + i, outer + n, inner + i, outer + n, inner + n);
    }
  }
  const edge = 1 + (rings - 1) * radialSegments;
  const lower = positions.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const a = i / radialSegments * Math.PI * 2;
    const x = Math.cos(a) * ISLAND_RADIUS * 0.93;
    const z = Math.sin(a) * ISLAND_RADIUS * 0.93;
    positions.push(x, -3.5 - 0.35 * Math.sin(a * 5), z);
    color.set(i % 3 ? 0x8b6a48 : 0x75563e); colors.push(color.r, color.g, color.b);
  }
  for (let i = 0; i < radialSegments; i++) {
    const n = (i + 1) % radialSegments;
    indices.push(edge + i, lower + i, lower + n, edge + i, lower + n, edge + n);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function pathGeometry() {
  const points = [new THREE.Vector2(-10, 7), new THREE.Vector2(-6, 4), new THREE.Vector2(-2, 2), new THREE.Vector2(2, 0), new THREE.Vector2(6, -2), new THREE.Vector2(10, -5)];
  const curve = new THREE.SplineCurve(points);
  const samples = curve.getPoints(44);
  const positions = [], uvs = [], indices = [];
  const half = 1.15;
  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const prev = samples[Math.max(0, i - 1)], next = samples[Math.min(samples.length - 1, i + 1)];
    const tangent = next.clone().sub(prev).normalize();
    const normal = new THREE.Vector2(-tangent.y, tangent.x);
    for (const side of [-1, 1]) {
      const x = p.x + normal.x * half * side, z = p.y + normal.y * half * side;
      positions.push(x, groundHeight(x, z) + 0.045, z);
      uvs.push((side + 1) / 2, i / (samples.length - 1));
    }
    if (i) { const a = i * 2 - 2; indices.push(a, a + 2, a + 1, a + 2, a + 3, a + 1); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createWorld(scene, quality) {
  const island = new THREE.Mesh(islandGeometry(quality === 'HIGH' ? 72 : 48, quality === 'HIGH' ? 14 : 10), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, metalness: 0 }));
  island.receiveShadow = true; scene.add(island);

  const path = new THREE.Mesh(pathGeometry(), new THREE.MeshStandardMaterial({ color: 0xc5a66c, roughness: 1 }));
  path.receiveShadow = true; scene.add(path);

  const water = new THREE.Mesh(new THREE.CircleGeometry(75, 80), new THREE.MeshPhysicalMaterial({ color: 0x4aaebe, roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.86, clearcoat: 0.35 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -2.25; scene.add(water);

  const seabed = new THREE.Mesh(new THREE.CircleGeometry(76, 64), new THREE.MeshBasicMaterial({ color: 0x277c91 }));
  seabed.rotation.x = -Math.PI / 2; seabed.position.y = -2.8; scene.add(seabed);

  return { island, path, water, update(time) { water.material.opacity = 0.84 + Math.sin(time * 0.55) * 0.025; } };
}
