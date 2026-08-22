import * as THREE from 'three';

const BASE_X_RADIUS = 52.0;
const BASE_Z_RADIUS = 38.0;

export function shoreRadius(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const ellipse = 1 / Math.sqrt((c * c) / (BASE_X_RADIUS * BASE_X_RADIUS) + (s * s) / (BASE_Z_RADIUS * BASE_Z_RADIUS));
  const irregular = 1 + 0.075 * Math.sin(angle * 3 + 0.6) + 0.045 * Math.sin(angle * 5 - 1.1) + 0.028 * Math.sin(angle * 8 + 0.4);
  return ellipse * irregular;
}

export function landFraction(x, z) {
  const angle = Math.atan2(z, x);
  return Math.hypot(x, z) / shoreRadius(angle);
}

export function groundHeight(x, z) {
  const fraction = landFraction(x, z);
  const forestHill = 1.45 * Math.exp(-((x + 22) ** 2 + (z + 10) ** 2) / 340);
  const northRidge = 0.95 * Math.exp(-((x + 6) ** 2 + (z + 22) ** 2) / 280);
  const westRidge = 0.85 * Math.exp(-((x + 36) ** 2 + (z - 2) ** 2) / 240);
  const sawmillRise = 0.42 * Math.exp(-((x - 15) ** 2 + (z - 1) ** 2) / 160);
  const broad = 0.32 * Math.sin(x * 0.07 + 0.4) * Math.cos(z * 0.06 - 0.3);
  const edgeDrop = THREE.MathUtils.smoothstep(fraction, 0.78, 1.0) * 1.15;
  return 0.65 + forestHill + northRidge + westRidge + sawmillRise + broad * Math.max(0, 1 - fraction * fraction) - edgeDrop;
}

export function clampToLand(position, margin = 2.8) {
  const angle = Math.atan2(position.z, position.x);
  const limit = shoreRadius(angle) - margin;
  const radius = Math.hypot(position.x, position.z);
  if (radius > limit) {
    position.x *= limit / radius;
    position.z *= limit / radius;
  }
  position.y = groundHeight(position.x, position.z);
}

export const PATH_MAIN_POINTS = [
  new THREE.Vector2(0, 24.0),
  new THREE.Vector2(0.5, 14.0),
  new THREE.Vector2(0.0, 4.0),
  new THREE.Vector2(7.5, 1.5),
  new THREE.Vector2(14.5, -0.5),
  new THREE.Vector2(22.0, -3.5),
  new THREE.Vector2(29.5, -7.5),
  new THREE.Vector2(37.0, -11.5)
];

export const PATH_FOREST_POINTS = [
  new THREE.Vector2(0.0, 4.0),
  new THREE.Vector2(-10.0, 5.5),
  new THREE.Vector2(-20.5, 3.0),
  new THREE.Vector2(-30.0, -3.5),
  new THREE.Vector2(-37.5, -12.0)
];

const mainCurve = new THREE.SplineCurve(PATH_MAIN_POINTS);
const forestCurve = new THREE.SplineCurve(PATH_FOREST_POINTS);
const mainSamples = mainCurve.getPoints(70);
const forestSamples = forestCurve.getPoints(50);

export function getSurfaceType(x, z) {
  // 1. Check sawmill wooden platform / yard
  if (x >= 9.5 && x <= 21.0 && z >= -5.0 && z <= 4.5) return 'wood';

  // 2. Check path proximity (main road + forest trail)
  let minPathDistSq = Infinity;
  for (let i = 0; i < mainSamples.length; i++) {
    const p = mainSamples[i];
    const dSq = (x - p.x) ** 2 + (z - p.y) ** 2;
    if (dSq < minPathDistSq) minPathDistSq = dSq;
  }
  for (let i = 0; i < forestSamples.length; i++) {
    const p = forestSamples[i];
    const dSq = (x - p.x) ** 2 + (z - p.y) ** 2;
    if (dSq < minPathDistSq) minPathDistSq = dSq;
  }
  if (minPathDistSq < 1.45 * 1.45) return 'dirt';

  // 3. Check rocky shoreline / bridge ravine
  const fraction = landFraction(x, z);
  if (fraction > 0.88 || (x > 33.0 && z < -6.0)) return 'stone';

  // 4. Default: forest floor / lush clearing
  return 'grass';
}

function terrainGeometry(radialSegments = 128, rings = 28) {
  const positions = [];
  const colors = [];
  const indices = [];
  const color = new THREE.Color();
  positions.push(0, groundHeight(0, 0), 0);
  color.setHex(0x668f47);
  colors.push(color.r, color.g, color.b);

  for (let ring = 1; ring <= rings; ring++) {
    const fraction = ring / rings;
    for (let i = 0; i < radialSegments; i++) {
      const angle = (i / radialSegments) * Math.PI * 2;
      const radius = shoreRadius(angle) * fraction;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = groundHeight(x, z);
      positions.push(x, y, z);

      const patch = Math.sin(x * 0.21 + z * 0.17) * 0.5 + 0.5;
      if (fraction > 0.94) color.setHex(0xc3aa72); // sand shore
      else if (fraction > 0.85) color.setHex(patch > 0.55 ? 0xa98b5e : 0xb69b69); // soil transition
      else color.setHex(patch > 0.60 ? 0x739d50 : patch < 0.22 ? 0x557d40 : 0x638e46); // rich grass
      colors.push(color.r, color.g, color.b);
    }
  }

  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(0, 1 + next, 1 + i);
  }
  for (let ring = 1; ring < rings; ring++) {
    const inner = 1 + (ring - 1) * radialSegments;
    const outer = 1 + ring * radialSegments;
    for (let i = 0; i < radialSegments; i++) {
      const next = (i + 1) % radialSegments;
      indices.push(inner + i, inner + next, outer + next, inner + i, outer + next, outer + i);
    }
  }

  // Sub-water skirt
  const edge = 1 + (rings - 1) * radialSegments;
  const lower = positions.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = (i / radialSegments) * Math.PI * 2;
    const radius = shoreRadius(angle) * 0.94;
    positions.push(Math.cos(angle) * radius, -3.2 - 0.35 * Math.sin(angle * 4), Math.sin(angle) * radius);
    color.setHex(i % 4 === 0 ? 0x665446 : 0x79614a);
    colors.push(color.r, color.g, color.b);
  }
  for (let i = 0; i < radialSegments; i++) {
    const next = (i + 1) % radialSegments;
    indices.push(edge + i, lower + i, lower + next, edge + i, lower + next, edge + next);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildPathMesh(points, width = 1.25) {
  const curve = new THREE.SplineCurve(points);
  const samples = curve.getPoints(points.length * 9);
  const positions = [], colors = [], indices = [];
  const edgeColor = new THREE.Color(0x92724d), centerColor = new THREE.Color(0xc0a06a);

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const previous = samples[Math.max(0, i - 1)], next = samples[Math.min(samples.length - 1, i + 1)];
    const tangent = next.clone().sub(previous).normalize();
    const normal = new THREE.Vector2(-tangent.y, tangent.x);
    for (const lane of [-1, 0, 1]) {
      const x = p.x + normal.x * width * lane;
      const z = p.y + normal.y * width * lane;
      positions.push(x, groundHeight(x, z) + 0.038, z);
      const c = lane === 0 ? centerColor : edgeColor;
      colors.push(c.r, c.g, c.b);
    }
    if (i) {
      const a = i * 3 - 3;
      indices.push(a, a + 1, a + 3, a + 3, a + 1, a + 4, a + 1, a + 2, a + 4, a + 4, a + 2, a + 5);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function waterMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x17677b) },
      uShallow: { value: new THREE.Color(0x3d9e9f) },
      uSky: { value: new THREE.Color(0x8ec7c4) },
      uSun: { value: new THREE.Vector3(-0.45, 0.8, 0.35).normalize() }
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vWorld;
      varying float vWave;
      void main() {
        vec3 p = position;
        float w = sin(p.x * 0.09 + uTime * 0.75) * 0.08 + cos(p.y * 0.08 - uTime * 0.55) * 0.06;
        p.z += w;
        vec4 world = modelMatrix * vec4(p, 1.0);
        vWorld = world.xyz;
        vWave = w;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uSky;
      uniform vec3 uSun;
      varying vec3 vWorld;
      varying float vWave;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorld);
        vec3 normal = normalize(vec3(
          0.05 * cos(vWorld.x * 0.09 + uTime * 0.75),
          1.0,
          -0.05 * sin(vWorld.z * 0.08 - uTime * 0.55)
        ));
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.2);
        float bands = sin((vWorld.x + vWorld.z) * 0.14 + uTime * 0.7) * 0.5 + 0.5;
        vec3 color = mix(uDeep, uShallow, 0.28 + bands * 0.12 + vWave);
        color = mix(color, uSky, fresnel * 0.52);
        float glint = pow(max(dot(reflect(-uSun, normal), viewDir), 0.0), 64.0);
        color += vec3(1.0, 0.83, 0.55) * glint * 0.7;
        float haze = smoothstep(80.0, 180.0, distance(cameraPosition, vWorld));
        color = mix(color, uSky, haze * 0.72);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createDistantIsland(x, z, scale, color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(14, 18, 5.0, 9), material);
  base.scale.set(scale, scale * 0.75, scale * 0.75);
  base.position.y = -0.6;
  group.add(base);
  const hill = new THREE.Mesh(new THREE.ConeGeometry(12, 16, 8), material);
  hill.scale.set(scale, scale * 0.62, scale * 0.78);
  hill.position.set(-2.5 * scale, 4.5 * scale, 0);
  group.add(hill);
  group.position.set(x, -0.8, z);
  return group;
}

function createCloud(x, y, z, scale) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xddebe2, transparent: true, opacity: 0.72, depthWrite: false });
  [[0, 0, 0, 4.8], [3.8, 0.2, 0, 3.8], [-3.6, -0.25, 0, 3.4], [0.8, 1.4, 0, 3.6]].forEach(([px, py, pz, r]) => {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), material);
    puff.position.set(px, py, pz);
    puff.scale.y = 0.55;
    group.add(puff);
  });
  group.position.set(x, y, z);
  group.scale.setScalar(scale);
  group.userData.baseX = x;
  return group;
}

export function createWorld(scene, quality) {
  const terrain = new THREE.Mesh(
    terrainGeometry(quality === 'HIGH' ? 128 : 96, quality === 'HIGH' ? 28 : 20),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0 })
  );
  terrain.receiveShadow = true;
  scene.add(terrain);

  const mainPath = new THREE.Mesh(buildPathMesh(PATH_MAIN_POINTS, 1.35), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  mainPath.receiveShadow = true;
  scene.add(mainPath);

  const forestPath = new THREE.Mesh(buildPathMesh(PATH_FOREST_POINTS, 1.15), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  forestPath.receiveShadow = true;
  scene.add(forestPath);

  const water = new THREE.Mesh(new THREE.PlaneGeometry(380, 380, 64, 64), waterMaterial());
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.55;
  scene.add(water);

  const distant = new THREE.Group();
  distant.add(createDistantIsland(-55, -95, 1.4, 0x628b75));
  distant.add(createDistantIsland(25, -115, 1.8, 0x6c927e));
  distant.add(createDistantIsland(75, -100, 1.1, 0x789b88));
  distant.add(createCloud(-45, 28, -110, 1.4));
  distant.add(createCloud(40, 32, -125, 1.1));
  scene.add(distant);

  return {
    terrain, mainPath, forestPath, water, distant,
    update(time) {
      water.material.uniforms.uTime.value = time;
      distant.children.filter((child) => child.position.y > 5).forEach((cloud, index) => {
        cloud.position.x = cloud.userData.baseX + Math.sin(time * 0.05 + index) * 2.2;
      });
    }
  };
}
