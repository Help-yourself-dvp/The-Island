import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';
import { groundHeight } from './world.js';

const FILES = {
  player: '/assets/characters/player-rogue.glb',
  commonTree1: '/assets/nature/CommonTree_1.glb',
  commonTree2: '/assets/nature/CommonTree_2.glb',
  commonTree3: '/assets/nature/CommonTree_3.glb',
  commonTree4: '/assets/nature/CommonTree_4.glb',
  pine1: '/assets/nature/Pine_1.glb',
  pine2: '/assets/nature/Pine_2.glb',
  pine3: '/assets/nature/Pine_3.glb',
  bush: '/assets/nature/Bush_Common.glb',
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
      if (material.map?.format === THREE.RGBAFormat) {
        material.alphaTest = 0.35;
        material.side = THREE.DoubleSide;
      }
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
    loaded += 1;
    onProgress(loaded / entries.length, key);
    return [key, gltf];
  }));
  return Object.fromEntries(pairs);
}

export function populateScene(scene, library, quality, collisionSystem = null) {
  const placed = [];
  const harvestableTreeSlots = [];
  const decorTrees = [];

  const add = (key, pos, height, yaw = 0, role = 'detail') => {
    const root = prepare(library[key].scene.clone(true));
    fitAndPlace(root, pos, height, yaw);
    root.userData.role = role;
    scene.add(root);
    placed.push(root);
    return root;
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

  // =========================================================================
  // 1. SAWMILL WORKSHOP & TIMBER YARD (EAST ZONE)
  // =========================================================================
  const workshop = add('house', [15.0, 0, -0.5], 5.9, -0.45, 'workshop');
  const logBay = add('storage', [18.5, 0, 1.2], 3.35, -0.45, 'workshop');
  muteWorkshop(workshop);
  muteWorkshop(logBay);

  // Semantic detailed colliders for workshop & storage:
  // - Main enclosed workshop walls:
  collisionSystem?.addBox(15.0, -0.5, 1.70, 1.45, -0.45, 'sawmill_main_walls');
  // - Back section of workshop:
  collisionSystem?.addBox(16.2, 0.4, 0.95, 0.85, -0.45, 'sawmill_back_walls');
  // - Front porch posts:
  collisionSystem?.addCircle(13.6, -1.8, 0.28, 'sawmill_post_left');
  collisionSystem?.addCircle(15.8, -2.6, 0.28, 'sawmill_post_right');
  // - Storage frame solid back:
  collisionSystem?.addBox(19.2, 1.8, 1.15, 0.95, -0.45, 'sawmill_storage_back');
  // - Storage side pillars:
  collisionSystem?.addCircle(17.6, 0.2, 0.25, 'storage_pillar_left');
  collisionSystem?.addCircle(20.0, 2.2, 0.25, 'storage_pillar_right');

  // Timber yard props & solid obstacles
  add('logs', [17.8, 0, -2.8], 0.88, -0.45, 'prop');
  collisionSystem?.addBox(17.8, -2.8, 0.85, 0.55, -0.45, 'prop_logs1');

  add('logs', [12.4, 0, -2.2], 0.88, 0.35, 'prop');
  collisionSystem?.addBox(12.4, -2.2, 0.85, 0.55, 0.35, 'prop_logs2');

  add('crate', [13.2, 0, 0.6], 0.72, 0.15, 'prop');
  collisionSystem?.addBox(13.2, 0.6, 0.48, 0.48, 0.15, 'prop_crate1');

  const oldCrate = add('crate', [13.9, 0, 1.4], 0.56, -0.35, 'prop');
  oldCrate.rotation.z = -0.18;
  oldCrate.position.y += 0.04;
  collisionSystem?.addBox(13.9, 1.4, 0.42, 0.42, -0.35, 'prop_crate2');

  add('barrel', [19.2, 0, -0.8], 0.92, -0.18, 'prop');
  collisionSystem?.addCircle(19.2, -0.8, 0.45, 'prop_barrel1');

  const fallenBarrel = add('barrel', [11.6, 0, -0.4], 0.74, 0.35, 'prop');
  fallenBarrel.rotation.z = 1.42;
  fallenBarrel.position.y += 0.28;
  collisionSystem?.addCircle(11.6, -0.4, 0.40, 'prop_barrel2');

  const axe = add('axe', [13.5, 0, -1.2], 0.82, -0.1, 'prop');
  axe.rotation.x = -1.28;
  axe.rotation.z = 0.22;
  axe.position.y += 0.06;

  // =========================================================================
  // 2. BLOCKED ROUTE TO FUTURE FARM (EAST RIVER RAVINE)
  // =========================================================================
  add('fence', [31.5, 0, -9.0], 1.1, -0.42, 'prop');
  collisionSystem?.addSegment(30.6, -8.6, 32.4, -9.4, 0.24, 'bridge_fence1');

  const brokenFence = add('fence', [34.5, 0, -10.5], 0.9, -0.35, 'prop');
  brokenFence.rotation.z = 0.18;
  collisionSystem?.addSegment(33.7, -10.2, 35.3, -10.8, 0.24, 'bridge_fence2');

  add('logs', [33.0, 0, -9.8], 0.92, 0.4, 'prop');
  collisionSystem?.addBox(33.0, -9.8, 0.85, 0.55, 0.4, 'bridge_logs');

  add('rock2', [36.5, 0, -12.5], 1.6, -0.2, 'rock');
  collisionSystem?.addCircle(36.5, -12.5, 0.95, 'bridge_rock');

  // =========================================================================
  // 3. HARVESTABLE TREE SLOTS (34 PRODUCTION ENTITIES ACROSS 3 SECTORS)
  // =========================================================================
  const treeSlotDefs = [
    // --- Sector A: Lower Grove (South/Central Forest, 10 slots) ---
    { id: 'tree_slot_01', variant: 'commonTree2', pos: [-8.0, 0, 12.0], h: 6.4, yaw: 0.3, colR: 0.55 },
    { id: 'tree_slot_02', variant: 'commonTree1', pos: [-14.0, 0, 15.0], h: 6.8, yaw: -0.6, colR: 0.58 },
    { id: 'tree_slot_03', variant: 'commonTree3', pos: [-19.0, 0, 18.0], h: 7.2, yaw: 1.1, colR: 0.60 },
    { id: 'tree_slot_04', variant: 'commonTree4', pos: [-12.0, 0, 22.0], h: 6.5, yaw: -0.4, colR: 0.55 },
    { id: 'tree_slot_05', variant: 'commonTree2', pos: [-6.0, 0, 18.0], h: 6.2, yaw: 0.8, colR: 0.52 },
    { id: 'tree_slot_06', variant: 'commonTree1', pos: [-16.0, 0, 9.0], h: 7.0, yaw: -1.2, colR: 0.58 },
    { id: 'tree_slot_07', variant: 'commonTree3', pos: [-22.0, 0, 12.0], h: 6.6, yaw: 0.5, colR: 0.55 },
    { id: 'tree_slot_08', variant: 'commonTree4', pos: [-10.0, 0, 8.0], h: 6.3, yaw: 1.4, colR: 0.52 },
    { id: 'tree_slot_09', variant: 'commonTree2', pos: [-25.0, 0, 16.0], h: 6.9, yaw: -0.8, colR: 0.58 },
    { id: 'tree_slot_10', variant: 'commonTree1', pos: [-18.0, 0, 25.0], h: 6.7, yaw: 0.2, colR: 0.56 },

    // --- Sector B: Deep West Forest (14 slots) ---
    { id: 'tree_slot_11', variant: 'commonTree1', pos: [-28.0, 0, 4.0], h: 7.4, yaw: 0.7, colR: 0.62 },
    { id: 'tree_slot_12', variant: 'commonTree3', pos: [-35.0, 0, 8.0], h: 7.1, yaw: -0.9, colR: 0.60 },
    { id: 'tree_slot_13', variant: 'commonTree2', pos: [-42.0, 0, 2.0], h: 6.8, yaw: 1.3, colR: 0.58 },
    { id: 'tree_slot_14', variant: 'pine2', pos: [-46.0, 0, -6.0], h: 7.8, yaw: -0.3, colR: 0.58 },
    { id: 'tree_slot_15', variant: 'commonTree4', pos: [-38.0, 0, -2.0], h: 7.0, yaw: 0.4, colR: 0.58 },
    { id: 'tree_slot_16', variant: 'pine1', pos: [-32.0, 0, -8.0], h: 7.5, yaw: -1.4, colR: 0.56 },
    { id: 'tree_slot_17', variant: 'commonTree1', pos: [-44.0, 0, 10.0], h: 6.9, yaw: 0.9, colR: 0.58 },
    { id: 'tree_slot_18', variant: 'commonTree3', pos: [-36.0, 0, 15.0], h: 6.5, yaw: -0.5, colR: 0.55 },
    { id: 'tree_slot_19', variant: 'pine3', pos: [-48.0, 0, 4.0], h: 7.6, yaw: 1.2, colR: 0.58 },
    { id: 'tree_slot_20', variant: 'commonTree2', pos: [-26.0, 0, -2.0], h: 6.8, yaw: -0.7, colR: 0.56 },
    { id: 'tree_slot_21', variant: 'pine2', pos: [-40.0, 0, -12.0], h: 7.7, yaw: 0.6, colR: 0.58 },
    { id: 'tree_slot_22', variant: 'pine1', pos: [-34.0, 0, -16.0], h: 7.3, yaw: -1.1, colR: 0.56 },
    { id: 'tree_slot_23', variant: 'pine3', pos: [-46.0, 0, -18.0], h: 7.9, yaw: 0.3, colR: 0.60 },
    { id: 'tree_slot_24', variant: 'commonTree4', pos: [-28.0, 0, 10.0], h: 6.7, yaw: -0.2, colR: 0.56 },

    // --- Sector C: North Pine Ridge (10 slots) ---
    { id: 'tree_slot_25', variant: 'pine1', pos: [-15.0, 0, -6.0], h: 7.2, yaw: 0.8, colR: 0.55 },
    { id: 'tree_slot_26', variant: 'pine2', pos: [-22.0, 0, -12.0], h: 7.8, yaw: -0.6, colR: 0.58 },
    { id: 'tree_slot_27', variant: 'pine3', pos: [-18.0, 0, -18.0], h: 7.5, yaw: 1.0, colR: 0.56 },
    { id: 'tree_slot_28', variant: 'pine1', pos: [-10.0, 0, -14.0], h: 6.9, yaw: -0.4, colR: 0.54 },
    { id: 'tree_slot_29', variant: 'pine2', pos: [-6.0, 0, -18.0], h: 7.1, yaw: 0.5, colR: 0.55 },
    { id: 'tree_slot_30', variant: 'pine3', pos: [-12.0, 0, -24.0], h: 7.6, yaw: -1.3, colR: 0.58 },
    { id: 'tree_slot_31', variant: 'pine1', pos: [-24.0, 0, -22.0], h: 7.7, yaw: 0.2, colR: 0.58 },
    { id: 'tree_slot_32', variant: 'pine2', pos: [-28.0, 0, -26.0], h: 8.0, yaw: -0.8, colR: 0.60 },
    { id: 'tree_slot_33', variant: 'pine3', pos: [-4.0, 0, -26.0], h: 7.4, yaw: 0.7, colR: 0.56 },
    { id: 'tree_slot_34', variant: 'pine1', pos: [-18.0, 0, -28.0], h: 7.6, yaw: -0.5, colR: 0.58 }
  ];

  for (const def of treeSlotDefs) {
    const mesh = add(def.variant, def.pos, def.h, def.yaw, 'tree_harvestable');
    collisionSystem?.addCircle(def.pos[0], def.pos[2], def.colR, def.id, 'solid');

    const entity = {
      id: def.id,
      kind: 'tree',
      harvestable: true,
      variant: def.variant,
      state: 'mature',
      position: { x: def.pos[0], y: mesh.position.y, z: def.pos[2] },
      yaw: def.yaw,
      height: def.h,
      resourceYield: 4, // placeholder for Stage 1
      growthProgress: 1.0, // placeholder
      mesh,
      colliderId: def.id
    };
    harvestableTreeSlots.push(entity);
  }

  // =========================================================================
  // 4. PERIMETER DECORATIVE TREES (BOUNDARY FRAMING, 16 TREES)
  // =========================================================================
  const decorTreeDefs = [
    { variant: 'commonTree3', pos: [-48.0, 0, 18.0], h: 7.5, yaw: 0.4 },
    { variant: 'commonTree1', pos: [-52.0, 0, 10.0], h: 7.8, yaw: -0.7 },
    { variant: 'pine2', pos: [-52.0, 0, -10.0], h: 8.2, yaw: 0.6 },
    { variant: 'pine3', pos: [-48.0, 0, -26.0], h: 8.0, yaw: -0.3 },
    { variant: 'pine1', pos: [-36.0, 0, -30.0], h: 7.6, yaw: 1.1 },
    { variant: 'pine2', pos: [-20.0, 0, -32.0], h: 8.4, yaw: -0.5 },
    { variant: 'pine3', pos: [-2.0, 0, -32.0], h: 7.8, yaw: 0.2 },
    { variant: 'pine1', pos: [12.0, 0, -28.0], h: 7.2, yaw: -0.8 },
    { variant: 'pine2', pos: [24.0, 0, -24.0], h: 7.5, yaw: 0.5 },
    { variant: 'commonTree4', pos: [34.0, 0, -22.0], h: 6.8, yaw: -1.2 },
    { variant: 'commonTree2', pos: [42.0, 0, -16.0], h: 6.5, yaw: 0.3 },
    { variant: 'commonTree1', pos: [2.0, 0, 30.0], h: 7.0, yaw: -0.6 },
    { variant: 'commonTree3', pos: [-8.0, 0, 30.0], h: 7.2, yaw: 0.9 },
    { variant: 'commonTree2', pos: [-24.0, 0, 30.0], h: 7.0, yaw: -0.4 },
    { variant: 'commonTree4', pos: [-38.0, 0, 24.0], h: 6.8, yaw: 0.7 },
    { variant: 'commonTree1', pos: [-46.0, 0, 22.0], h: 7.4, yaw: -0.2 }
  ];

  for (let i = 0; i < decorTreeDefs.length; i++) {
    const d = decorTreeDefs[i];
    const mesh = add(d.variant, d.pos, d.h, d.yaw, 'tree_decor');
    collisionSystem?.addCircle(d.pos[0], d.pos[2], 0.58, `tree_decor_${i}`, 'solid');
    decorTrees.push(mesh);
  }

  // =========================================================================
  // 5. ROCKS, UNDERGROWTH & BUSHES
  // =========================================================================
  const rockDefs = [
    { key: 'rock2', pos: [-4.0, 0, 10.0], h: 1.25, yaw: 0.3, colR: 0.75 },
    { key: 'rock1', pos: [-18.0, 0, 3.0], h: 1.10, yaw: -0.5, colR: 0.65 },
    { key: 'rock2', pos: [-30.0, 0, 12.0], h: 1.45, yaw: 0.8, colR: 0.85 },
    { key: 'rock1', pos: [-38.0, 0, -8.0], h: 1.30, yaw: -1.1, colR: 0.75 },
    { key: 'rock2', pos: [-8.0, 0, -8.0], h: 1.15, yaw: 0.4, colR: 0.70 },
    { key: 'rock1', pos: [6.0, 0, 6.0], h: 0.95, yaw: 0.6, colR: 0.55 },
    { key: 'rock2', pos: [22.0, 0, -8.0], h: 1.20, yaw: -0.3, colR: 0.70 },
    { key: 'rock1', pos: [-10.0, 0, 28.0], h: 0.90, yaw: 0.2, colR: 0.55 },
    { key: 'rock2', pos: [14.0, 0, 22.0], h: 1.05, yaw: -0.7, colR: 0.65 },
    { key: 'rock1', pos: [-48.0, 0, -12.0], h: 1.40, yaw: 0.5, colR: 0.80 },
    { key: 'rock2', pos: [40.0, 0, -4.0], h: 1.50, yaw: -0.6, colR: 0.90 }
  ];

  for (let i = 0; i < rockDefs.length; i++) {
    const r = rockDefs[i];
    add(r.key, r.pos, r.h, r.yaw, 'rock');
    collisionSystem?.addCircle(r.pos[0], r.pos[2], r.colR, `rock_${i}`, 'solid');
  }

  // Bushes & lush undergrowth clusters
  [
    [-11.0, 13.0, 1.2, 0.4], [-21.0, 7.0, 1.4, -0.6], [-33.0, 2.0, 1.3, 0.8],
    [-14.0, -4.0, 1.2, -0.3], [-5.0, -14.0, 1.5, 1.1], [8.0, 4.0, 1.1, -0.5],
    [-27.0, 14.0, 1.3, 0.2], [-37.0, -14.0, 1.4, -0.9]
  ].forEach(([x, z, h, yaw]) => add('bush', [x, 0, z], h, yaw, 'bush'));

  // Ferns
  [
    [-6.5, 11.5, 0.78, 0.4], [-15.5, 7.5, 0.66, -0.4], [10.5, -3.5, 0.62, 0.15],
    [-23.0, 10.5, 0.58, -0.2], [-32.0, -2.5, 0.76, 0.4], [-16.0, -7.5, 0.70, -0.5],
    [11.0, 2.5, 0.62, 0.9], [4.5, 8.0, 0.66, -0.4], [-29.0, 6.0, 0.72, 0.3],
    [-39.0, 4.0, 0.68, -0.6], [-19.0, -15.0, 0.75, 0.8]
  ].forEach(([x, z, h, yaw]) => add('fern', [x, 0, z], h, yaw, 'plant'));

  // Grass tufts
  [
    [-5.0, 14.0, 0.3], [-12.0, 6.0, -0.5], [-22.0, 4.0, 0.8],
    [5.0, 3.0, -0.4], [9.0, -1.0, 0.6], [16.0, -4.5, -0.2],
    [24.0, -6.0, 0.9], [-16.0, 18.0, -0.7], [-31.0, -5.0, 0.4],
    [-3.0, 22.0, 0.2], [3.0, 16.0, -0.6]
  ].forEach(([x, z, yaw], index) => add(index % 2 ? 'grassWispy' : 'grassShort', [x, 0, z], index % 2 ? 0.46 : 0.36, yaw, 'grass'));

  // =========================================================================
  // 6. DISTANT LANDMARKS
  // =========================================================================
  const windmill = prepare(library.windmill.scene.clone(true));
  fitAndPlace(windmill, [18.0, 0, -95.0], 14.0, -0.35);
  windmill.position.y = 4.0 + (windmill.userData.groundOffset || 0);
  windmill.userData.role = 'landmark';
  scene.add(windmill);
  placed.push(windmill);

  return {
    placed,
    harvestableTreeSlots,
    decorTrees
  };
}

export function createPlayer(scene, library) {
  const root = prepare(cloneSkeleton(library.player.scene));
  root.traverse((object) => {
    if (/Knife|Crossbow|Throwable/i.test(object.name)) object.visible = false;
  });
  // Starting position in the southern clearing near the shore approach
  fitAndPlace(root, [0.0, 0, 18.0], 1.78, Math.PI * 0.92);
  scene.add(root);

  const mixer = new THREE.AnimationMixer(root);
  const clips = library.player.animations;
  const find = (...names) => clips.find((clip) => names.includes(clip.name));
  const idle = mixer.clipAction(find('Idle', 'Unarmed_Idle'));
  const walk = mixer.clipAction(find('Walking_A', 'Walking_B'));
  const run = mixer.clipAction(find('Running_A', 'Running_B'));
  idle.play();

  return {
    root,
    mixer,
    actions: { idle, walk, run },
    active: idle,
    clips: clips.map((clip) => clip.name)
  };
}
