import './style.css';
import * as THREE from 'three';
import { createWorld, groundHeight, clampToLand, getSurfaceType } from './world.js';
import { loadAssets, populateScene, createPlayer } from './assets.js';
import { CollisionSystem } from './collision.js';
import { createInput } from './input.js';
import { createAudioSystem } from './audio.js';

const VERSION = '0.1.3';
const params = new URLSearchParams(location.search);
const quality = (params.get('quality') || localStorage.getItem('island-quality') || (Math.min(innerWidth, innerHeight) < 600 ? 'MEDIUM' : 'HIGH')).toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'HIGH';
const debugEnabled = params.has('debug');
const showColliders = params.get('colliders') === '1' || params.get('colliders') === 'true';
const shotMode = location.hash.startsWith('#shot-') ? location.hash.slice(1) : null;

const canvas = document.querySelector('#game');
const loading = document.querySelector('#loading');
const loadingBar = loading.querySelector('i');
const errorBox = document.querySelector('#error');
const debugBox = document.querySelector('#debug');
const cameraButton = document.querySelector('#camera-button');
debugBox.hidden = !debugEnabled;
cameraButton.hidden = !debugEnabled;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'HIGH', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'HIGH' ? 2 : 1.35));
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xb3cbc1, 45, 130);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 240);
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(140, 24, 12),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: 'varying float h; void main(){ h=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'varying float h; void main(){ vec3 horizon=vec3(0.72,0.80,0.72); vec3 zenith=vec3(0.29,0.56,0.70); float t=smoothstep(-0.12,0.72,h); gl_FragColor=vec4(mix(horizon,zenith,t),1.0); }'
  })
);
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xc7dff0, 0x566746, 1.45);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffd9a3, 3.75);
sun.position.set(-28, 38, 22);
sun.castShadow = true;
sun.shadow.mapSize.set(quality === 'HIGH' ? 2048 : 1024, quality === 'HIGH' ? 2048 : 1024);
sun.shadow.camera.left = -45;
sun.shadow.camera.right = 45;
sun.shadow.camera.top = 45;
sun.shadow.camera.bottom = -45;
sun.shadow.camera.near = 2;
sun.shadow.camera.far = 110;
sun.shadow.bias = -0.0002;
sun.shadow.normalBias = 0.035;
scene.add(sun);

const world = createWorld(scene, quality);
const collisionSystem = new CollisionSystem();
const input = createInput();

let player;
let audioSystem;
let sceneData;
let cameraAngle = 0;
let frameHandle = 0;
let lastTime = performance.now();
let elapsed = 0;
let fps = 0, fpsFrames = 0, fpsStamp = lastTime;
let fatalError = null;
let lastSurface = 'dirt';
let lastSpeed = 0;
let prevAnimPhase = 0;

const cameraOffsets = [new THREE.Vector3(8.5, 7.2, 10.5), new THREE.Vector3(-9.2, 6.8, 9.4)];
const cameraTarget = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const move = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

const WALK_SPEED = 2.15;
const RUN_SPEED = 3.50;
const PLAYER_COLLISION_RADIUS = 0.38;

// Footstrike phase calibration for KayKit Rogue
const FOOT_CONTACTS = {
  walk: [0.30, 0.80],
  run: [0.40, 0.90]
};

function setAction(next) {
  if (player.active === next) return;
  next.reset().fadeIn(0.2).play();
  player.active.fadeOut(0.2);
  player.active = next;
  prevAnimPhase = 0;
}

function updatePlayer(dt) {
  const stick = input.read();
  const inputStrength = Math.hypot(stick.x, stick.y);
  const moving = inputStrength > 0.08;

  if (shotMode) {
    setAction(player.actions.idle);
    lastSpeed = 0;
    return;
  }

  if (!moving) {
    setAction(player.actions.idle);
    lastSpeed = 0;
    lastSurface = getSurfaceType(player.root.position.x, player.root.position.z);
    return;
  }

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, camera.up).normalize();
  move.copy(forward).multiplyScalar(stick.y).addScaledVector(right, stick.x).normalize();

  const running = inputStrength > 0.75;
  const targetSpeed = running ? RUN_SPEED : WALK_SPEED;

  const prevX = player.root.position.x;
  const prevZ = player.root.position.z;

  const fullCandidate = {
    x: prevX + move.x * dt * targetSpeed,
    z: prevZ + move.z * dt * targetSpeed
  };

  // Primary obstacle collision resolution
  collisionSystem.resolve(fullCandidate, PLAYER_COLLISION_RADIUS, 4);
  clampToLand(fullCandidate, 2.8);

  let chosenCandidate = fullCandidate;
  const fullDisplacement = Math.hypot(fullCandidate.x - prevX, fullCandidate.z - prevZ);

  // Smooth Corner / Wall Sliding: if full move was severely obstructed, try component separation
  if (fullDisplacement < dt * targetSpeed * 0.35) {
    const candX = { x: prevX + move.x * dt * targetSpeed, z: prevZ };
    collisionSystem.resolve(candX, PLAYER_COLLISION_RADIUS, 3);
    clampToLand(candX, 2.8);
    const dispX = Math.hypot(candX.x - prevX, candX.z - prevZ);

    const candZ = { x: prevX, z: prevZ + move.z * dt * targetSpeed };
    collisionSystem.resolve(candZ, PLAYER_COLLISION_RADIUS, 3);
    clampToLand(candZ, 2.8);
    const dispZ = Math.hypot(candZ.x - prevX, candZ.z - prevZ);

    if (dispX > fullDisplacement && dispX >= dispZ) {
      chosenCandidate = candX;
    } else if (dispZ > fullDisplacement) {
      chosenCandidate = candZ;
    }
  }

  // Apply final resolved position
  player.root.position.x = chosenCandidate.x;
  player.root.position.z = chosenCandidate.z;
  player.root.position.y = groundHeight(chosenCandidate.x, chosenCandidate.z) + (player.root.userData.groundOffset || 0);

  const actualDisplacement = Math.hypot(player.root.position.x - prevX, player.root.position.z - prevZ);
  lastSpeed = actualDisplacement / Math.max(1e-4, dt);

  // Character yaw rotation
  if (actualDisplacement > 0.001) {
    const targetYaw = Math.atan2(move.x, move.z);
    let delta = (targetYaw - player.root.rotation.y + Math.PI) % (Math.PI * 2) - Math.PI;
    player.root.rotation.y += delta * Math.min(1, dt * 11);
  }

  // Animation selection
  if (lastSpeed < 0.25) {
    // Blocked directly against wall or tree
    setAction(player.actions.walk);
  } else {
    setAction(running ? player.actions.run : player.actions.walk);
  }

  lastSurface = getSurfaceType(player.root.position.x, player.root.position.z);

  // Event-based footstep crossing detection
  const clipName = player.active?._clip?.name || '';
  const isRunningClip = clipName.includes('Run');
  const isWalkingClip = clipName.includes('Walk');

  if ((isRunningClip || isWalkingClip) && moving && lastSpeed >= 0.25) {
    const duration = player.active._clip.duration || 1.0;
    const currentPhase = (player.active.time % duration) / duration;
    const contacts = isRunningClip ? FOOT_CONTACTS.run : FOOT_CONTACTS.walk;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const crossed = (prevAnimPhase <= contact && contact < currentPhase) ||
                      (currentPhase < prevAnimPhase && (prevAnimPhase <= contact || contact < currentPhase));
      if (crossed) {
        audioSystem?.triggerFootstep({ surface: lastSurface, running: isRunningClip });
      }
    }
    prevAnimPhase = currentPhase;
  } else {
    prevAnimPhase = 0;
  }
}

function updateCamera(dt, snap = false) {
  if (shotMode === 'shot-zone1-start' || shotMode === 'shot-art') {
    camera.position.set(6.5, 7.8, 28.5);
    cameraTarget.set(0.0, 1.4, 16.0);
  } else if (shotMode === 'shot-zone1-forest' || shotMode === 'shot-player') {
    camera.position.set(-18.5, 7.5, 12.0);
    cameraTarget.set(-26.0, 1.6, 2.0);
  } else if (shotMode === 'shot-zone1-sawmill' || shotMode === 'shot-sawmill') {
    camera.position.set(23.5, 7.2, 8.5);
    cameraTarget.set(15.0, 1.8, -0.5);
  } else if (shotMode === 'shot-zone1-future-path' || shotMode === 'shot-coast') {
    camera.position.set(26.0, 7.8, -2.5);
    cameraTarget.set(33.0, 1.2, -9.5);
  } else if (shotMode === 'shot-zone1-overview') {
    // High elevated bird's-eye documentation overview
    camera.position.set(0.0, 52.0, 48.0);
    cameraTarget.set(-4.0, 1.0, -2.0);
  } else {
    desiredCamera.copy(player.root.position).add(cameraOffsets[cameraAngle]);
    camera.position.lerp(desiredCamera, snap ? 1 : 1 - Math.exp(-dt * 4.7));
    cameraTarget.copy(player.root.position).add(new THREE.Vector3(0, 1.05, 0));
  }
  camera.lookAt(cameraTarget);
}

function diagnostics() {
  return {
    version: VERSION,
    stage: 'pre-production-foundation-lock',
    quality,
    fps: Math.round(fps),
    drawCalls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    textures: renderer.info.memory.textures,
    geometries: renderer.info.memory.geometries,
    sceneObjects: scene.children.length,
    collidersCount: collisionSystem.count,
    harvestableTreeSlots: sceneData?.harvestableTreeSlots?.length || 0,
    decorTreesCount: sceneData?.decorTrees?.length || 0,
    playerPosition: player ? { x: +player.root.position.x.toFixed(2), y: +player.root.position.y.toFixed(2), z: +player.root.position.z.toFixed(2) } : null,
    animation: player?.active?._clip?.name || null,
    movement: { speed: +lastSpeed.toFixed(2), surface: lastSurface },
    audio: audioSystem?.getState() || { ready: false, started: false, state: 'loading', loops: 0 },
    shotMode,
    fatalError: fatalError?.message || null
  };
}

function renderFrame(now) {
  frameHandle = requestAnimationFrame(renderFrame);
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    elapsed += dt;

    updatePlayer(dt);
    player.mixer.update(dt);
    audioSystem?.update(dt);
    world.update(elapsed);
    updateCamera(dt);

    renderer.render(scene, camera);
    fpsFrames += 1;
    if (now - fpsStamp >= 1000) {
      fps = (fpsFrames * 1000) / (now - fpsStamp);
      fpsFrames = 0;
      fpsStamp = now;
      if (debugEnabled) {
        const d = diagnostics();
        debugBox.textContent = `${d.quality} · ${d.fps} FPS · ${d.collidersCount} col · ${d.harvestableTreeSlots} slots\n${d.drawCalls} calls · ${d.triangles} tris\nsurf: ${d.movement.surface} · spd: ${d.movement.speed} m/s`;
      }
    }
  } catch (error) {
    fatalError = error;
    console.error('[ISLAND render]', error);
    errorBox.hidden = false;
    errorBox.textContent = `Ошибка кадра: ${error.message}`;
  }
}

async function boot() {
  try {
    const [library, audio] = await Promise.all([
      loadAssets((progress) => {
        loadingBar.style.width = `${Math.round(progress * 100)}%`;
      }),
      createAudioSystem()
    ]);
    audioSystem = audio;
    sceneData = populateScene(scene, library, quality, collisionSystem);

    if (showColliders) {
      const debugCollidersGroup = collisionSystem.createDebugMesh(groundHeight);
      scene.add(debugCollidersGroup);
    }

    player = createPlayer(scene, library);
    player.root.position.y = groundHeight(player.root.position.x, player.root.position.z) + (player.root.userData.groundOffset || 0);

    if (shotMode) {
      player.mixer.setTime(0.35);
      player.mixer.timeScale = 0;
    }

    updateCamera(0, true);

    window.__GAME = Object.freeze({
      version: VERSION,
      getDiagnostics: diagnostics,
      setQuality(next) {
        const value = String(next).toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'HIGH';
        localStorage.setItem('island-quality', value);
        location.reload();
      },
      screenshotHooks: [
        '#shot-zone1-start',
        '#shot-zone1-forest',
        '#shot-zone1-sawmill',
        '#shot-zone1-future-path',
        '#shot-zone1-overview'
      ],
      getTreeSlots() {
        return sceneData?.harvestableTreeSlots || [];
      }
    });

    loading.classList.add('done');
    frameHandle = requestAnimationFrame(renderFrame);
  } catch (error) {
    console.error('[ISLAND boot]', error);
    fatalError = error;
    errorBox.hidden = false;
    errorBox.textContent = `Сцена не загрузилась: ${error.message}`;
    loading.querySelector('span').textContent = 'не удалось загрузить сцену';
  }
}

cameraButton.addEventListener('click', () => {
  cameraAngle = (cameraAngle + 1) % cameraOffsets.length;
});
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});
document.addEventListener('visibilitychange', () => {
  lastTime = performance.now();
  if (document.hidden) input.reset();
  audioSystem?.setSuspended(document.hidden);
});
window.addEventListener('beforeunload', () => cancelAnimationFrame(frameHandle));

boot();
