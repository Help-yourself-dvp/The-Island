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

export function populateScene(scene, library, quality, collisionSystem = null) {
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
  collisionSystem?.addBox(6.5, -3.9, 1.75, 1.45, -0.5, 'building_workshop');
  collisionSystem?.addBox(9.1, -3.2, 1.35, 1.25, -0.5, 'building_storage');

  // Workshop area props
  add('logs', [8.7, 0, -5.35], 0.82, -0.5, 'prop');
  collisionSystem?.addBox(8.7, -5.35, 0.75, 0.55, -0.5, 'prop_logs1');

  add('logs', [4.25, 0, -4.95], 0.82, 0.25, 'prop');
  collisionSystem?.addBox(4.25, -4.95, 0.75, 0.55, 0.25, 'prop_logs2');

  add('crate', [4.65, 0, -3.2], 0.72, 0.15, 'prop');
  collisionSystem?.addBox(4.65, -3.2, 0.45, 0.45, 0.15, 'prop_crate1');

  const oldCrate = add('crate', [5.3, 0, -2.6], 0.56, -0.35, 'prop');
  oldCrate.rotation.z = -0.18; oldCrate.position.y += 0.04;
  collisionSystem?.addBox(5.3, -2.6, 0.40, 0.40, -0.35, 'prop_crate2');

  add('barrel', [9.6, 0, -1.95], 0.92, -0.18, 'prop');
  collisionSystem?.addCircle(9.6, -1.95, 0.45, 'prop_barrel1');

  const fallenBarrel = add('barrel', [3.75, 0, -3.35], 0.74, 0.35, 'prop');
  fallenBarrel.rotation.z = 1.42; fallenBarrel.position.y += 0.28;
  collisionSystem?.addCircle(3.75, -3.35, 0.40, 'prop_barrel2');

  const axe = add('axe', [5.05, 0, -4.05], 0.82, -0.1, 'prop');
  axe.rotation.x = -1.28; axe.rotation.z = 0.22; axe.position.y += 0.06;

  // A broken fence and unused stock hint that the route once continued past the mill.
  add('fence', [9.45, 0, -5.8], 1.05, -0.48, 'prop');
  collisionSystem?.addSegment(8.65, -5.38, 10.25, -6.22, 0.22, 'fence1');

  const brokenFence = add('fence', [10.75, 0, -6.45], 0.86, -0.28, 'prop');
  brokenFence.rotation.z = 0.16;
  collisionSystem?.addSegment(10.08, -6.26, 11.42, -6.64, 0.22, 'fence2');

  // A coherent green forest edge on the left and in the rear; the clearing stays open.
  add('commonTree', [-8.8, 0, 1.0], 6.4, 0.3, 'tree');
  collisionSystem?.addCircle(-8.8, 1.0, 0.55, 'tree1');

  add('commonTreeAlt', [-11.2, 0, -1.8], 7.1, -0.7, 'tree');
  collisionSystem?.addCircle(-11.2, -1.8, 0.60, 'tree2');

  add('commonTree', [-8.9, 0, -5.2], 6.8, 1.1, 'tree');
  collisionSystem?.addCircle(-8.9, -5.2, 0.55, 'tree3');

  add('commonTreeAlt', [-4.7, 0, -8.3], 6.2, -0.1, 'tree');
  collisionSystem?.addCircle(-4.7, -8.3, 0.55, 'tree4');

  add('pine', [-12.5, 0, -6.8], 7.6, 0.45, 'tree');
  collisionSystem?.addCircle(-12.5, -6.8, 0.55, 'pine1');

  add('pineAlt', [-1.1, 0, -10.4], 7.0, -0.25, 'tree');
  collisionSystem?.addCircle(-1.1, -10.4, 0.55, 'pine2');

  add('pine', [12.0, 0, -8.2], 6.4, -0.5, 'tree');
  collisionSystem?.addCircle(12.0, -8.2, 0.55, 'pine3');

  // One non-interactive future landmark: an existing compatible medieval windmill.
  const windmill = prepare(library.windmill.scene.clone(true));
  fitAndPlace(windmill, [8.0, 0, -57.0], 6.8, -0.35);
  windmill.position.y = 2.0 + (windmill.userData.groundOffset || 0);
  windmill.userData.role = 'landmark';
  scene.add(windmill); placed.push(windmill);

  // Forest-floor clusters frame the path without filling the walkable clearing.
  add('rock1', [-3.1, 0, 2.0], 1.05, 0.3, 'rock');
  collisionSystem?.addCircle(-3.1, 2.0, 0.65, 'rock1');

  add('rock2', [-6.6, 0, 4.2], 1.35, -0.45, 'rock');
  collisionSystem?.addCircle(-6.6, 4.2, 0.80, 'rock2');

  add('rock1', [10.9, 0, -1.0], 1.15, 1.0, 'rock');
  collisionSystem?.addCircle(10.9, -1.0, 0.70, 'rock3');

  add('rock2', [-8.0, 0, -3.0], 0.86, 0.2, 'rock');
  collisionSystem?.addCircle(-8.0, -3.0, 0.55, 'rock4');

  add('fern', [-7.1, 0, 1.9], 0.78, 0.4, 'plant');
  add('fern', [-9.8, 0, -4.1], 0.66, -0.4, 'plant');
  add('fern', [3.5, 0, -4.6], 0.62, 0.15, 'plant');
  add('fern', [-4.9, 0, 4.1], 0.58, -0.2, 'plant');
  add('fern', [-5.3, 0, 0.8], 0.76, 0.4, 'plant');
  add('fern', [-7.2, 0, -4.9], 0.7, -0.5, 'plant');
  add('fern', [3.0, 0, -5.7], 0.62, 0.9, 'plant');
  add('fern', [4.2, 0, 5.8], 0.66, -0.4, 'plant');

  add('rock1', [6.0, 0, 5.0], 0.58, 0.55, 'rock');
  collisionSystem?.addCircle(6.0, 5.0, 0.45, 'rock5');

  // Low grass is concentrated at the forest edge and around abandoned structures.
  [
    [-6.0, 3.0, 0.3], [-5.2, -2.0, -0.5], [-2.8, -3.8, 0.8],
    [2.2, 5.9, -0.4], [3.4, 4.8, 0.6], [7.3, -6.1, -0.2],
    [9.9, -4.9, 0.9], [10.6, -1.0, -0.7]
  ].forEach(([x, z, yaw], index) => add(index % 2 ? 'grassWispy' : 'grassShort', [x, 0, z], index % 2 ? 0.46 : 0.36, yaw, 'grass'));

  // Three restrained coastal stones break the shoreline without clutter.
  add('rock2', [-14.7, 0, -9.4], 0.78, 0.4, 'coast');
  collisionSystem?.addCircle(-14.7, -9.4, 0.55, 'coast1');

  add('rock1', [14.1, 0, -9.1], 0.66, -0.3, 'coast');
  collisionSystem?.addCircle(14.1, -9.1, 0.50, 'coast2');

  add('rock2', [17.1, 0, -1.8], 0.52, 0.8, 'coast');
  collisionSystem?.addCircle(17.1, -1.8, 0.45, 'coast3');

  if (quality === 'HIGH') {
    add('fern', [-10.0, 0, 0.3], 0.6, 1.2, 'plant');
    add('fern', [11.0, 0, -5.6], 0.62, -0.7, 'plant');
    add('rock2', [1.1, 0, -7.8], 0.62, 0.8, 'rock');
    collisionSystem?.addCircle(1.1, -7.8, 0.45, 'rock_hq');
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
