import './style.css';
import * as THREE from 'three';
import { createWorld, groundHeight, clampToLand } from './world.js';
import { loadAssets, populateScene, createPlayer } from './assets.js';
import { createInput } from './input.js';
import { createAudioSystem } from './audio.js';

const VERSION = '0.1.2';
const params = new URLSearchParams(location.search);
const quality = (params.get('quality') || localStorage.getItem('island-quality') || (Math.min(innerWidth, innerHeight) < 600 ? 'MEDIUM' : 'HIGH')).toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'HIGH';
const debugEnabled = params.has('debug');
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
scene.fog = new THREE.Fog(0xb3cbc1, 34, 92);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 150);
const sky = new THREE.Mesh(new THREE.SphereGeometry(85, 24, 12), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  vertexShader: 'varying float h; void main(){ h=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: 'varying float h; void main(){ vec3 horizon=vec3(0.72,0.80,0.72); vec3 zenith=vec3(0.29,0.56,0.70); float t=smoothstep(-0.12,0.72,h); gl_FragColor=vec4(mix(horizon,zenith,t),1.0); }'
}));
scene.add(sky);

const hemi = new THREE.HemisphereLight(0xc7dff0, 0x566746, 1.45); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd9a3, 3.75);
sun.position.set(-16, 22, 14); sun.castShadow = true;
sun.shadow.mapSize.set(quality === 'HIGH' ? 2048 : 1024, quality === 'HIGH' ? 2048 : 1024);
sun.shadow.camera.left = -22; sun.shadow.camera.right = 22; sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
sun.shadow.camera.near = 2; sun.shadow.camera.far = 55; sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.035;
scene.add(sun);

const world = createWorld(scene, quality);
const input = createInput();
let player;
let audioSystem;
let cameraAngle = 0;
let frameHandle = 0;
let lastTime = performance.now();
let elapsed = 0;
let fps = 0, fpsFrames = 0, fpsStamp = lastTime;
let fatalError = null;
const cameraOffsets = [new THREE.Vector3(7.8, 6.6, 9.7), new THREE.Vector3(-8.6, 6.2, 8.5)];
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
  const inputStrength = Math.hypot(stick.x, stick.y);
  const moving = inputStrength > 0.08;
  if (shotMode) { setAction(player.actions.idle); return false; }
  if (!moving) { setAction(player.actions.idle); return false; }
  camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
  right.crossVectors(forward, camera.up).normalize();
  move.copy(forward).multiplyScalar(stick.y).addScaledVector(right, stick.x).normalize();
  const running = inputStrength > 0.78;
  player.root.position.addScaledVector(move, dt * (running ? 3.5 : 2.15));
  clampToLand(player.root.position, 2.5);
  player.root.position.y += player.root.userData.groundOffset || 0;
  const targetYaw = Math.atan2(move.x, move.z);
  let delta = (targetYaw - player.root.rotation.y + Math.PI) % (Math.PI * 2) - Math.PI;
  player.root.rotation.y += delta * Math.min(1, dt * 10);
  setAction(running ? player.actions.run : player.actions.walk);
  return true;
}

function updateCamera(dt, snap = false) {
  if (shotMode === 'shot-art') { camera.position.set(12.8, 9.0, 15.0); cameraTarget.set(0.2, 1.25, -1.4); }
  else if (shotMode === 'shot-player') { camera.position.copy(player.root.position).add(new THREE.Vector3(4.6, 3.7, 5.8)); cameraTarget.copy(player.root.position).add(new THREE.Vector3(0, 1.05, 0)); }
  else if (shotMode === 'shot-sawmill') { camera.position.set(14.2, 6.4, 7.0); cameraTarget.set(6.9, 1.9, -3.9); }
  else if (shotMode === 'shot-coast') { camera.position.set(1.8, 7.8, 14.5); cameraTarget.set(3.0, 0.55, -9.0); }
  else {
    desiredCamera.copy(player.root.position).add(cameraOffsets[cameraAngle]);
    camera.position.lerp(desiredCamera, snap ? 1 : 1 - Math.exp(-dt * 4.7));
    cameraTarget.copy(player.root.position).add(new THREE.Vector3(0, 1.05, 0));
  }
  camera.lookAt(cameraTarget);
}

function diagnostics() {
  return {
    version: VERSION, stage: '0.5', quality, fps: Math.round(fps),
    drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    textures: renderer.info.memory.textures, geometries: renderer.info.memory.geometries,
    sceneObjects: scene.children.length,
    playerPosition: player ? { x: +player.root.position.x.toFixed(2), y: +player.root.position.y.toFixed(2), z: +player.root.position.z.toFixed(2) } : null,
    animation: player?.active?._clip?.name || null,
    audio: audioSystem?.getState() || { ready: false, started: false, state: 'loading', loops: 0 },
    shotMode, fatalError: fatalError?.message || null
  };
}

function renderFrame(now) {
  frameHandle = requestAnimationFrame(renderFrame);
  try {
    const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now; elapsed += dt;
    const moving = updatePlayer(dt); player.mixer.update(dt); audioSystem?.update(dt, moving); world.update(elapsed); updateCamera(dt);
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
    const [library, audio] = await Promise.all([
      loadAssets((progress) => { loadingBar.style.width = `${Math.round(progress * 100)}%`; }),
      createAudioSystem()
    ]);
    audioSystem = audio;
    populateScene(scene, library, quality);
    player = createPlayer(scene, library);
    player.root.position.y = groundHeight(player.root.position.x, player.root.position.z) + (player.root.userData.groundOffset || 0);
    if (shotMode) { player.mixer.setTime(0.35); player.mixer.timeScale = 0; }
    updateCamera(0, true);
    window.__GAME = Object.freeze({
      version: VERSION,
      getDiagnostics: diagnostics,
      setQuality(next) { const value = String(next).toUpperCase() === 'MEDIUM' ? 'MEDIUM' : 'HIGH'; localStorage.setItem('island-quality', value); location.reload(); },
      screenshotHooks: ['#shot-art', '#shot-player', '#shot-sawmill', '#shot-coast']
    });
    loading.classList.add('done');
    frameHandle = requestAnimationFrame(renderFrame);
  } catch (error) {
    console.error('[ISLAND boot]', error); fatalError = error;
    errorBox.hidden = false; errorBox.textContent = `Сцена не загрузилась: ${error.message}`;
    loading.querySelector('span').textContent = 'не удалось загрузить сцену';
  }
}

cameraButton.addEventListener('click', () => { cameraAngle = (cameraAngle + 1) % cameraOffsets.length; });
window.addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); });
document.addEventListener('visibilitychange', () => {
  lastTime = performance.now();
  if (document.hidden) input.reset();
  audioSystem?.setSuspended(document.hidden);
});
window.addEventListener('beforeunload', () => cancelAnimationFrame(frameHandle));
boot();
