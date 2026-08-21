import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { groundHeight } from './world.js';

const FILES = {
  player: '/assets/characters/player-rogue.glb',
  commonTree: '/assets/nature/CommonTree_2.glb',
  commonTreeAlt: '/assets/nature/CommonTree_4.glb',
  pine: '/assets/nature/Pine_3.glb',
  pineAlt: '/assets/nature/Pine_1.glb',
  grassShort: '/assets/nature/Grass_Common_Short.glb',
  grassWispy: '/assets/nature/Grass_Wispy_Short.glb',
  rock1: '/assets/nature/Rock_Medium_1.glb',
  rock2: '/assets/nature/Rock_Medium_2.glb',
  fern: '/assets/nature/Fern_1.glb',
  house: '/assets/buildings/Houses_FirstAge_1_Level1.glb',
  storage: '/assets/buildings/Storage_FirstAge_Level1.glb',
  barrel: '/assets/props/Barrel.glb',
  crate: '/assets/props/Crate.glb',
  logs: '/assets/props/Logs.glb',
  fence: '/assets/props/Fence.glb',
  axe: '/assets/props/Axe.glb',
  windmill: '/assets/landmarks/Windmill_FirstAge.glb'
};

function prepare(root) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      material.roughness = Math.max(material.roughness ?? 0.8, 0.72);
      material.metalness = Math.min(material.metalness ?? 0, 0.08);
      if (material.map?.format === THREE.RGBAFormat) { material.alphaTest = 0.35; material.side = THREE.DoubleSide; }
    }
  });
  return root;
}

function fitAndPlace(root, position, targetHeight, yaw = 0) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const scale = targetHeight / Math.max(0.001, size.y);
  root.scale.multiplyScalar(scale);
  root.updateMatrixWorld(true);
  const scaledBox = new THREE.Box3().setFromObject(root);
  root.position.set(position[0], groundHeight(position[0], position[2]) - scaledBox.min.y, position[2]);
  root.rotation.y = yaw;
  root.userData.groundOffset = root.position.y - groundHeight(position[0], position[2]);
  return root;
}

export async function loadAssets(onProgress = () => {}) {
  const loader = new GLTFLoader();
  const entries = Object.entries(FILES);
  let loaded = 0;
  const pairs = await Promise.all(entries.map(async ([key, url]) => {
    const gltf = await loader.loadAsync(url);
    loaded += 1; onProgress(loaded / entries.length, key);
    return [key, gltf];
  }));
  return Object.fromEntries(pairs);
}

export function populateScene(scene, library, quality) {
  const placed = [];
  const add = (key, pos, height, yaw = 0, role = 'detail') => {
    const root = prepare(library[key].scene.clone(true));
    fitAndPlace(root, pos, height, yaw);
    root.userData.role = role;
    scene.add(root); placed.push(root); return root;
  };

  const muteWorkshop = (root) => root.traverse((object) => {
    if (!object.isMesh) return;
    const mute = (material) => {
      const copy = material.clone();
      if (copy.color) copy.color.multiplyScalar(0.86);
      copy.roughness = Math.max(copy.roughness ?? 0.8, 0.82);
      return copy;
    };
    object.material = Array.isArray(object.material) ? object.material.map(mute) : mute(object.material);
  });

  // Right/midground visual anchor: a closed, slightly weathered timber workshop.
  const workshop = add('house', [6.5, 0, -3.9], 5.9, -0.5, 'workshop');
  const logBay = add('storage', [9.1, 0, -3.2], 3.35, -0.5, 'workshop');
  muteWorkshop(workshop); muteWorkshop(logBay);
  add('logs', [8.7, 0, -5.35], 0.82, -0.5, 'prop');
  add('logs', [4.25, 0, -4.95], 0.82, 0.25, 'prop');
  add('crate', [4.65, 0, -3.2], 0.72, 0.15, 'prop');
  const oldCrate = add('crate', [5.3, 0, -2.6], 0.56, -0.35, 'prop');
  oldCrate.rotation.z = -0.18; oldCrate.position.y += 0.04;
  add('barrel', [9.6, 0, -1.95], 0.92, -0.18, 'prop');
  const fallenBarrel = add('barrel', [3.75, 0, -3.35], 0.74, 0.35, 'prop');
  fallenBarrel.rotation.z = 1.42; fallenBarrel.position.y += 0.28;
  const axe = add('axe', [5.05, 0, -4.05], 0.82, -0.1, 'prop');
  axe.rotation.x = -1.28; axe.rotation.z = 0.22; axe.position.y += 0.06;

  // A broken fence and unused stock hint that the route once continued past the mill.
  add('fence', [9.45, 0, -5.8], 1.05, -0.48, 'prop');
  const brokenFence = add('fence', [10.75, 0, -6.45], 0.86, -0.28, 'prop');
  brokenFence.rotation.z = 0.16;

  // A coherent green forest edge on the left and in the rear; the clearing stays open.
  add('commonTree', [-8.8, 0, 1.0], 6.4, 0.3, 'tree');
  add('commonTreeAlt', [-11.2, 0, -1.8], 7.1, -0.7, 'tree');
  add('commonTree', [-8.9, 0, -5.2], 6.8, 1.1, 'tree');
  add('commonTreeAlt', [-4.7, 0, -8.3], 6.2, -0.1, 'tree');
  add('pine', [-12.5, 0, -6.8], 7.6, 0.45, 'tree');
  add('pineAlt', [-1.1, 0, -10.4], 7.0, -0.25, 'tree');
  add('pine', [12.0, 0, -8.2], 6.4, -0.5, 'tree');

  // One non-interactive future landmark: an existing compatible medieval windmill.
  const windmill = prepare(library.windmill.scene.clone(true));
  fitAndPlace(windmill, [8.0, 0, -57.0], 6.8, -0.35);
  windmill.position.y = 2.0 + (windmill.userData.groundOffset || 0);
  windmill.userData.role = 'landmark';
  scene.add(windmill); placed.push(windmill);

  // Forest-floor clusters frame the path without filling the walkable clearing.
  add('rock1', [-3.1, 0, 2.0], 1.05, 0.3, 'rock');
  add('rock2', [-6.6, 0, 4.2], 1.35, -0.45, 'rock');
  add('rock1', [10.9, 0, -1.0], 1.15, 1.0, 'rock');
  add('rock2', [-8.0, 0, -3.0], 0.86, 0.2, 'rock');
  add('fern', [-7.1, 0, 1.9], 0.78, 0.4, 'plant');
  add('fern', [-9.8, 0, -4.1], 0.66, -0.4, 'plant');
  add('fern', [3.5, 0, -4.6], 0.62, 0.15, 'plant');
  add('fern', [-4.9, 0, 4.1], 0.58, -0.2, 'plant');
  add('fern', [-5.3, 0, 0.8], 0.76, 0.4, 'plant');
  add('fern', [-7.2, 0, -4.9], 0.7, -0.5, 'plant');
  add('fern', [3.0, 0, -5.7], 0.62, 0.9, 'plant');
  add('fern', [4.2, 0, 5.8], 0.66, -0.4, 'plant');
  add('rock1', [6.0, 0, 5.0], 0.58, 0.55, 'rock');

  // Low grass is concentrated at the forest edge and around abandoned structures.
  [
    [-6.0, 3.0, 0.3], [-5.2, -2.0, -0.5], [-2.8, -3.8, 0.8],
    [2.2, 5.9, -0.4], [3.4, 4.8, 0.6], [7.3, -6.1, -0.2],
    [9.9, -4.9, 0.9], [10.6, -1.0, -0.7]
  ].forEach(([x, z, yaw], index) => add(index % 2 ? 'grassWispy' : 'grassShort', [x, 0, z], index % 2 ? 0.46 : 0.36, yaw, 'grass'));

  // Three restrained coastal stones break the shoreline without clutter.
  add('rock2', [-14.7, 0, -9.4], 0.78, 0.4, 'coast');
  add('rock1', [14.1, 0, -9.1], 0.66, -0.3, 'coast');
  add('rock2', [17.1, 0, -1.8], 0.52, 0.8, 'coast');

  if (quality === 'HIGH') {
    add('fern', [-10.0, 0, 0.3], 0.6, 1.2, 'plant');
    add('fern', [11.0, 0, -5.6], 0.62, -0.7, 'plant');
    add('rock2', [1.1, 0, -7.8], 0.62, 0.8, 'rock');
  }
  return placed;
}

export function createPlayer(scene, library) {
  const root = prepare(cloneSkeleton(library.player.scene));
  root.traverse((object) => {
    if (/Knife|Crossbow|Throwable/i.test(object.name)) object.visible = false;
  });
  fitAndPlace(root, [-0.9, 0, 3.5], 1.78, Math.PI * 0.72);
  scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const clips = library.player.animations;
  const find = (...names) => clips.find((clip) => names.includes(clip.name));
  const idle = mixer.clipAction(find('Idle', 'Unarmed_Idle'));
  const walk = mixer.clipAction(find('Walking_A', 'Walking_B'));
  const run = mixer.clipAction(find('Running_A', 'Running_B'));
  idle.play();
  return { root, mixer, actions: { idle, walk, run }, active: idle, clips: clips.map((clip) => clip.name) };
}
