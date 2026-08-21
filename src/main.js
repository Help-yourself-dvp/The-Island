import './style.css';
import * as THREE from 'three';
import { createWorld, groundHeight, ISLAND_RADIUS } from './world.js';
import { loadAssets, populateScene, createPlayer } from './assets.js';
import { createInput } from './input.js';

const VERSION = '0.1.0';
const params = new URLSearchParams(location.search);
const quality = (params.get('quality') || localStorage.getItem('island-quality') || (Math.min(innerWidth, innerHeight) < 600 ? 'MEDIUM' : 'HIGH')).toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'HIGH';
const debugEnabled = params.has('debug');
const shotMode = location.hash.startsWith('#shot-') ? location.hash.slice(1) : null;
const canvas = document.querySelector('#game');
const loading = document.querySelector('#loading');
const loadingBar = loading.querySelector('i');
const errorBox = document.querySelector('#error');
const debugBox = document.querySelector('#debug');
debugBox.hidden = !debugEnabled;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality === 'HIGH', powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'HIGH' ? 2 : 1.35));
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xa7d3ce, 31, 68);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 130);
const sky = new THREE.Mesh(new THREE.SphereGeometry(85, 24, 12), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  vertexShader: 'varying float h; void main(){ h=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: 'varying float h; void main(){ vec3 horizon=vec3(0.72,0.88,0.83); vec3 zenith=vec3(0.24,0.62,0.78); float t=smoothstep(-0.12,0.7,h); gl_FragColor=vec4(mix(horizon,zenith,t),1.0); }'
}));
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xcce9ff, 0x5e7046, 2.0); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffefd0, 3.35);
sun.position.set(-14, 24, 12); sun.castShadow = true;
sun.shadow.mapSize.set(quality === 'HIGH' ? 2048 : 1024, quality === 'HIGH' ? 2048 : 1024);
sun.shadow.camera.left = -22; sun.shadow.camera.right = 22; sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
sun.shadow.camera.near = 2; sun.shadow.camera.far = 55; sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.035;
scene.add(sun);

const world = createWorld(scene, quality);
const input = createInput();
let player;
let cameraAngle = 0;
let frameHandle = 0;
let lastTime = performance.now();
let elapsed = 0;
let fps = 0, fpsFrames = 0, fpsStamp = lastTime;
let fatalError = null;
const cameraOffsets = [new THREE.Vector3(10.8, 10.2, 13.4), new THREE.Vector3(-12.5, 9.2, 11.6)];
const cameraTarget = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();
const move = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();

function setAction(next) {
  if (player.active === next) return;
  next.reset().fadeIn(0.2).play();
  player.active.fadeOut(0.2);
  player.active = next;
}

function updatePlayer(dt) {
  const stick = input.read();
  const moving = Math.hypot(stick.x, stick.y) > 0.08;
  if (shotMode) { setAction(player.actions.idle); return; }
  if (!moving) { setAction(player.actions.idle); return; }
  camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
  right.crossVectors(forward, camera.up).normalize();
  move.copy(forward).multiplyScalar(stick.y).addScaledVector(right, stick.x).normalize();
  player.root.position.addScaledVector(move, dt * 3.05);
  const radius = Math.hypot(player.root.position.x, player.root.position.z);
  const maxRadius = ISLAND_RADIUS - 2.1;
  if (radius > maxRadius) { player.root.position.x *= maxRadius / radius; player.root.position.z *= maxRadius / radius; }
  player.root.position.y = groundHeight(player.root.position.x, player.root.position.z);
  const targetYaw = Math.atan2(move.x, move.z);
  let delta = (targetYaw - player.root.rotation.y + Math.PI) % (Math.PI * 2) - Math.PI;
  player.root.rotation.y += delta * Math.min(1, dt * 10);
  setAction(player.actions.walk);
}

function updateCamera(dt, snap = false) {
  if (shotMode === 'shot-art') { camera.position.set(18, 13.5, 20); cameraTarget.set(0, 1.2, 0); }
  else if (shotMode === 'shot-player') { camera.position.set(5.2, 4.4, 7); cameraTarget.copy(player.root.position).add(new THREE.Vector3(0, 1.2, 0)); }
  else if (shotMode === 'shot-building') { camera.position.set(16.5, 8.2, 6.8); cameraTarget.set(7.1, 1.7, -4.7); }
  else {
    desiredCamera.copy(player.root.position).add(cameraOffsets[cameraAngle]);
    camera.position.lerp(desiredCamera, snap ? 1 : 1 - Math.exp(-dt * 4.7));
    cameraTarget.copy(player.root.position).add(new THREE.Vector3(0, 1.05, 0));
  }
  camera.lookAt(cameraTarget);
}

function diagnostics() {
  return {
    version: VERSION, stage: 0, quality, fps: Math.round(fps),
    drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries,
    sceneObjects: scene.children.length,
    playerPosition: player ? { x: +player.root.position.x.toFixed(2), y: +player.root.position.y.toFixed(2), z: +player.root.position.z.toFixed(2) } : null,
    animation: player?.active?._clip?.name || null,
    shotMode, fatalError: fatalError?.message || null
  };
}

function renderFrame(now) {
  frameHandle = requestAnimationFrame(renderFrame);
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now; elapsed += dt;
    updatePlayer(dt); player.mixer.update(dt); world.update(elapsed); updateCamera(dt);
    renderer.render(scene, camera);
    fpsFrames += 1;
    if (now - fpsStamp >= 1000) {
      fps = fpsFrames * 1000 / (now - fpsStamp); fpsFrames = 0; fpsStamp = now;
      if (debugEnabled) { const d = diagnostics(); debugBox.textContent = `${d.quality} · ${d.fps} FPS\n${d.drawCalls} calls · ${d.triangles} tris\n${d.textures} tex · ${d.geometries} geo`; }
    }
  } catch (error) {
    fatalError = error; console.error('[ISLAND render]', error);
    errorBox.hidden = false; errorBox.textContent = `Ошибка кадра: ${error.message}`;
  }
}

async function boot() {
  try {
    const library = await loadAssets((progress) => { loadingBar.style.width = `${Math.round(progress * 100)}%`; });
    populateScene(scene, library, quality);
    player = createPlayer(scene, library);
    player.root.position.y = groundHeight(player.root.position.x, player.root.position.z);
    if (shotMode) { player.mixer.setTime(0.35); player.mixer.timeScale = 0; }
    updateCamera(0, true);
    window.__GAME = Object.freeze({
      version: VERSION,
      getDiagnostics: diagnostics,
      setQuality(next) { const value = String(next).toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'HIGH'; localStorage.setItem('island-quality', value); location.reload(); },
      screenshotHooks: ['#shot-art', '#shot-player', '#shot-building']
    });
    loading.classList.add('done');
    frameHandle = requestAnimationFrame(renderFrame);
  } catch (error) {
    console.error('[ISLAND boot]', error); fatalError = error;
    errorBox.hidden = false; errorBox.textContent = `Сцена не загрузилась: ${error.message}`;
    loading.querySelector('span').textContent = 'не удалось загрузить сцену';
  }
}

document.querySelector('#camera-button').addEventListener('click', () => { cameraAngle = (cameraAngle + 1) % cameraOffsets.length; });
window.addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); });
document.addEventListener('visibilitychange', () => { lastTime = performance.now(); if (document.hidden) input.reset(); });
window.addEventListener('beforeunload', () => cancelAnimationFrame(frameHandle));
boot();
