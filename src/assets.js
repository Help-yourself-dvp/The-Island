import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { groundHeight } from './world.js';

const FILES = {
  player: '/assets/characters/player-rogue.glb',
  commonTree: '/assets/nature/CommonTree_2.glb',
  twistedTree: '/assets/nature/TwistedTree_2.glb',
  pine: '/assets/nature/Pine_3.glb',
  rock1: '/assets/nature/Rock_Medium_1.glb',
  rock2: '/assets/nature/Rock_Medium_2.glb',
  bush: '/assets/nature/Bush_Common.glb',
  flowerBush: '/assets/nature/Bush_Common_Flowers.glb',
  fern: '/assets/nature/Fern_1.glb',
  house: '/assets/buildings/Houses_FirstAge_1_Level1.glb',
  barrel: '/assets/props/Barrel.glb',
  crate: '/assets/props/Crate.glb',
  logs: '/assets/props/Logs.glb'
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
  const add = (key, pos, height, yaw = 0, scaleVariation = 1) => {
    const root = prepare(library[key].scene.clone(true));
    fitAndPlace(root, pos, height * scaleVariation, yaw);
    scene.add(root); placed.push(root); return root;
  };

  add('house', [7.2, 0, -4.9], 4.25, -0.56);
  add('commonTree', [-9.8, 0, 4.2], 7.2, 0.3);
  add('commonTree', [-11.4, 0, -2.7], 6.4, -0.8, 0.88);
  add('twistedTree', [10.7, 0, 3.2], 7.8, -0.55);
  add('pine', [-5.3, 0, 9.5], 8.6, 0.2);
  add('pine', [12.3, 0, -5.8], 7.0, -0.4, 0.82);
  add('rock1', [-5.9, 0, -5.1], 1.55, 0.3);
  add('rock2', [4.6, 0, 6.8], 1.25, -0.5);
  add('rock1', [10.8, 0, 7.2], 1.0, 1.1, 0.72);
  add('bush', [-7.2, 0, 6.4], 1.15, 0.4);
  add('flowerBush', [4.9, 0, -5.1], 1.15, -0.2);
  add('flowerBush', [9.7, 0, -2.2], 0.9, 0.7, 0.82);
  add('fern', [-4.4, 0, -6.2], 0.8, 0.4);
  add('fern', [5.8, 0, 5.7], 0.72, -0.5);
  add('crate', [5.3, 0, -3.5], 0.62, 0.25);
  add('barrel', [6.15, 0, -3.45], 0.82, -0.15);
  add('logs', [8.8, 0, -6.1], 0.62, -0.5);

  if (quality === 'HIGH') {
    add('bush', [-12.3, 0, 1.0], 0.9, -0.3, 0.85);
    add('fern', [1.8, 0, 8.8], 0.62, 1.2);
  }
  return placed;
}

export function createPlayer(scene, library) {
  const root = prepare(cloneSkeleton(library.player.scene));
  root.traverse((object) => {
    if (/Knife|Crossbow|Throwable/i.test(object.name)) object.visible = false;
  });
  fitAndPlace(root, [-1.2, 0, 1.2], 1.78, Math.PI * 0.72);
  scene.add(root);
  const mixer = new THREE.AnimationMixer(root);
  const clips = library.player.animations;
  const find = (...names) => clips.find((clip) => names.includes(clip.name));
  const idle = mixer.clipAction(find('Idle', 'Unarmed_Idle'));
  const walk = mixer.clipAction(find('Walking_A', 'Walking_B'));
  idle.play();
  return { root, mixer, actions: { idle, walk }, active: idle, clips: clips.map((clip) => clip.name) };
}
