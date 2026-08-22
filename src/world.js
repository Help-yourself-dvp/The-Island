import * as THREE from 'three';

const BASE_X_RADIUS = 21.5;
const BASE_Z_RADIUS = 17.5;

export function shoreRadius(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const ellipse = 1 / Math.sqrt((c * c) / (BASE_X_RADIUS * BASE_X_RADIUS) + (s * s) / (BASE_Z_RADIUS * BASE_Z_RADIUS));
  const irregular = 1 + 0.065 * Math.sin(angle * 3 + 0.7) + 0.04 * Math.sin(angle * 5 - 1.1) + 0.025 * Math.sin(angle * 9);
  return ellipse * irregular;
}

export function landFraction(x, z) {
  const angle = Math.atan2(z, x);
  return Math.hypot(x, z) / shoreRadius(angle);
}

export function groundHeight(x, z) {
  const fraction = landFraction(x, z);
  const forestRise = 0.8 * Math.exp(-((x + 8) ** 2 + (z + 1) ** 2) / 75);
  const workshopRise = 0.24 * Math.exp(-((x - 7) ** 2 + (z + 4) ** 2) / 50);
  const broad = 0.22 * Math.sin(x * 0.19 + 0.5) * Math.cos(z * 0.16 - 0.2);
  const edgeDrop = THREE.MathUtils.smoothstep(fraction, 0.72, 1.0) * 0.7;
  return 0.62 + forestRise + workshopRise + broad * Math.max(0, 1 - fraction * fraction) - edgeDrop;
}

export function clampToLand(position, margin = 2.4) {
  const angle = Math.atan2(position.z, position.x);
  const limit = shoreRadius(angle) - margin;
  const radius = Math.hypot(position.x, position.z);
  if (radius > limit) {
    position.x *= limit / radius;
    position.z *= limit / radius;
  }
  position.y = groundHeight(position.x, position.z);
}

export const PATH_POINTS = [
  new THREE.Vector2(-8.8, 8.0),
  new THREE.Vector2(-5.4, 5.8),
  new THREE.Vector2(-2.0, 3.4),
  new THREE.Vector2(1.1, 1.0),
  new THREE.Vector2(3.8, -1.5),
  new THREE.Vector2(6.5, -4.1),
  new THREE.Vector2(8.8, -5.35),
  new THREE.Vector2(11.2, -6.5)
];

const pathCurve = new THREE.SplineCurve(PATH_POINTS);
const pathSamplePoints = pathCurve.getPoints(60);

export function getSurfaceType(x, z) {
  // Check workshop timber deck / yard zone
  if (x >= 5.0 && x <= 10.5 && z >= -3.8 && z <= -1.8) return 'wood';

  // Check path proximity
  let minPathDistSq = Infinity;
  for (let i = 0; i < pathSamplePoints.length; i++) {
    const p = pathSamplePoints[i];
    const dx = x - p.x;
    const dz = z - p.y;
    const dSq = dx * dx + dz * dz;
    if (dSq < minPathDistSq) minPathDistSq = dSq;
  }
  if (minPathDistSq < 1.25 * 1.25) return 'dirt';

  // Check coastal shoreline / rocky edge
  const fraction = landFraction(x, z);
  if (fraction > 0.86) return 'stone';

  return 'grass';
}

function terrainGeometry(radialSegments = 96, rings = 18) {
  const positions = [];
  const colors = [];
  const indices = [];
  const color = new THREE.Color();
  positions.push(0, groundHeight(0, 0), 0);
  color.setHex(0x668f47); colors.push(color.r, color.g, color.b);

  for (let ring = 1; ring <= rings; ring++) {
    const fraction = ring / rings;
    for (let i = 0; i < radialSegments; i++) {
      const angle = i / radialSegments * Math.PI * 2;
      const radius = shoreRadius(angle) * fraction;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = groundHeight(x, z);
      positions.push(x, y, z);
      const patch = Math.sin(x * 0.39 + z * 0.27) * 0.5 + 0.5;
      if (fraction > 0.94) color.setHex(0xc3aa72);
      else if (fraction > 0.84) color.setHex(patch > 0.55 ? 0xa98b5e : 0xb69b69);
      else color.setHex(patch > 0.58 ? 0x739d50 : patch < 0.22 ? 0x557d40 : 0x638e46);
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

  const edge = 1 + (rings - 1) * radialSegments;
  const lower = positions.length / 3;
  for (let i = 0; i < radialSegments; i++) {
    const angle = i / radialSegments * Math.PI * 2;
    const radius = shoreRadius(angle) * 0.93;
    positions.push(Math.cos(angle) * radius, -2.7 - 0.25 * Math.sin(angle * 4), Math.sin(angle) * radius);
    color.setHex(i % 4 === 0 ? 0x665446 : 0x79614a); colors.push(color.r, color.g, color.b);
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

function pathGeometry(width = 1.12) {
  const curve = new THREE.SplineCurve(PATH_POINTS);
  const samples = curve.getPoints(54);
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
      positions.push(x, groundHeight(x, z) + 0.035, z);
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
        float w = sin(p.x * 0.16 + uTime * 0.75) * 0.07 + cos(p.y * 0.13 - uTime * 0.55) * 0.05;
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
          0.06 * cos(vWorld.x * 0.16 + uTime * 0.75),
          1.0,
          -0.05 * sin(vWorld.z * 0.13 - uTime * 0.55)
        ));
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 2.2);
        float bands = sin((vWorld.x + vWorld.z) * 0.22 + uTime * 0.7) * 0.5 + 0.5;
        vec3 color = mix(uDeep, uShallow, 0.28 + bands * 0.12 + vWave);
        color = mix(color, uSky, fresnel * 0.52);
        float glint = pow(max(dot(reflect(-uSun, normal), viewDir), 0.0), 64.0);
        color += vec3(1.0, 0.83, 0.55) * glint * 0.7;
        float haze = smoothstep(45.0, 105.0, distance(cameraPosition, vWorld));
        color = mix(color, uSky, haze * 0.72);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
}

function createDistantIsland(x, z, scale, color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 2.4, 9), material);
  base.scale.set(scale, scale * 0.75, scale * 0.75); base.position.y = -0.35; group.add(base);
  const hill = new THREE.Mesh(new THREE.ConeGeometry(5.8, 7.5, 8), material);
  hill.scale.set(scale, scale * 0.62, scale * 0.78); hill.position.set(-1.2 * scale, 2.2 * scale, 0); group.add(hill);
  group.position.set(x, -0.8, z);
  return group;
}

function createCloud(x, y, z, scale) {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: 0xddebe2, transparent: true, opacity: 0.72, depthWrite: false });
  [[0, 0, 0, 2.8], [2.2, 0.1, 0, 2.1], [-2.1, -0.15, 0, 1.9], [0.5, 0.8, 0, 2.0]].forEach(([px, py, pz, r]) => {
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), material);
    puff.position.set(px, py, pz); puff.scale.y = 0.55; group.add(puff);
  });
  group.position.set(x, y, z); group.scale.setScalar(scale); group.userData.baseX = x;
  return group;
}

export function createWorld(scene, quality) {
  const terrain = new THREE.Mesh(
    terrainGeometry(quality === 'HIGH' ? 96 : 72, quality === 'HIGH' ? 18 : 14),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0 })
  );
  terrain.receiveShadow = true; scene.add(terrain);

  const path = new THREE.Mesh(pathGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  path.receiveShadow = true; scene.add(path);

  const water = new THREE.Mesh(new THREE.PlaneGeometry(180, 180, 48, 48), waterMaterial());
  water.rotation.x = -Math.PI / 2; water.position.y = -0.55; scene.add(water);

  const distant = new THREE.Group();
  distant.add(createDistantIsland(-21, -48, 1.0, 0x628b75));
  distant.add(createDistantIsland(8, -58, 1.35, 0x6c927e));
  distant.add(createDistantIsland(31, -51, 0.72, 0x789b88));
  distant.add(createCloud(-18, 17, -58, 1.1));
  distant.add(createCloud(22, 20, -68, 0.8));
  scene.add(distant);

  return {
    terrain, path, water, distant,
    update(time) {
      water.material.uniforms.uTime.value = time;
      distant.children.filter((child) => child.position.y > 5).forEach((cloud, index) => {
        cloud.position.x = cloud.userData.baseX + Math.sin(time * 0.07 + index) * 1.4;
      });
    }
  };
}
