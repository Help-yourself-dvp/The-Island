import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    this.colliders = [];
  }

  addCircle(x, z, radius, id = 'circle', role = 'solid') {
    this.colliders.push({ type: 'circle', x, z, radius, id, role });
    return this;
  }

  addBox(cx, cz, halfWidth, halfDepth, yaw = 0, id = 'box', role = 'solid') {
    this.colliders.push({ type: 'box', cx, cz, hw: halfWidth, hd: halfDepth, yaw, id, role });
    return this;
  }

  addSegment(x1, z1, x2, z2, radius = 0.2, id = 'segment', role = 'solid') {
    this.colliders.push({ type: 'segment', x1, z1, x2, z2, radius, id, role });
    return this;
  }

  clear() {
    this.colliders = [];
  }

  get count() {
    return this.colliders.length;
  }

  resolve(position, playerRadius = 0.38, iterations = 4) {
    let px = position.x;
    let pz = position.z;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < this.colliders.length; i++) {
        const col = this.colliders[i];

        if (col.type === 'circle') {
          const dx = px - col.x;
          const dz = pz - col.z;
          const distSq = dx * dx + dz * dz;
          const minDist = playerRadius + col.radius;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 1e-5) {
              const overlap = minDist - dist;
              px += (dx / dist) * overlap;
              pz += (dz / dist) * overlap;
            } else {
              px += minDist;
            }
          }
        } else if (col.type === 'box') {
          const cosY = Math.cos(col.yaw);
          const sinY = Math.sin(col.yaw);
          const dx = px - col.cx;
          const dz = pz - col.cz;
          const lx = cosY * dx + sinY * dz;
          const lz = -sinY * dx + cosY * dz;

          const clampedX = Math.max(-col.hw, Math.min(col.hw, lx));
          const clampedZ = Math.max(-col.hd, Math.min(col.hd, lz));

          const diffX = lx - clampedX;
          const diffZ = lz - clampedZ;
          const distSq = diffX * diffX + diffZ * diffZ;

          if (distSq < playerRadius * playerRadius) {
            let pushLx = 0;
            let pushLz = 0;
            if (distSq > 1e-6) {
              const dist = Math.sqrt(distSq);
              const overlap = playerRadius - dist;
              pushLx = (diffX / dist) * overlap;
              pushLz = (diffZ / dist) * overlap;
            } else {
              const dLeft = lx + col.hw;
              const dRight = col.hw - lx;
              const dTop = lz + col.hd;
              const dBottom = col.hd - lz;
              const minPen = Math.min(dLeft, dRight, dTop, dBottom);
              if (minPen === dLeft) pushLx = -(dLeft + playerRadius);
              else if (minPen === dRight) pushLx = dRight + playerRadius;
              else if (minPen === dTop) pushLz = -(dTop + playerRadius);
              else pushLz = dBottom + playerRadius;
            }
            const pushWx = cosY * pushLx - sinY * pushLz;
            const pushWz = sinY * pushLx + cosY * pushLz;
            px += pushWx;
            pz += pushWz;
          }
        } else if (col.type === 'segment') {
          const vx = col.x2 - col.x1;
          const vz = col.z2 - col.z1;
          const lenSq = vx * vx + vz * vz;
          let t = lenSq > 1e-6 ? ((px - col.x1) * vx + (pz - col.z1) * vz) / lenSq : 0;
          t = Math.max(0, Math.min(1, t));
          const cx = col.x1 + t * vx;
          const cz = col.z1 + t * vz;
          const dx = px - cx;
          const dz = pz - cz;
          const distSq = dx * dx + dz * dz;
          const minDist = playerRadius + col.radius;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 1e-5) {
              const overlap = minDist - dist;
              px += (dx / dist) * overlap;
              pz += (dz / dist) * overlap;
            } else {
              px += minDist;
            }
          }
        }
      }
    }

    position.x = px;
    position.z = pz;
    return position;
  }

  createDebugMesh(groundHeightFn) {
    const group = new THREE.Group();
    group.name = 'ColliderDebugVisualizer';

    const circleMat = new THREE.MeshBasicMaterial({ color: 0xff4444, wireframe: true, transparent: true, opacity: 0.8 });
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true, transparent: true, opacity: 0.8 });
    const segmentMat = new THREE.MeshBasicMaterial({ color: 0x44aaff, wireframe: true, transparent: true, opacity: 0.8 });

    for (const col of this.colliders) {
      if (col.type === 'circle') {
        const y = groundHeightFn ? groundHeightFn(col.x, col.z) : 0;
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(col.radius, col.radius, 1.4, 16), circleMat);
        mesh.position.set(col.x, y + 0.7, col.z);
        group.add(mesh);
      } else if (col.type === 'box') {
        const y = groundHeightFn ? groundHeightFn(col.cx, col.cz) : 0;
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(col.hw * 2, 1.4, col.hd * 2), boxMat);
        mesh.position.set(col.cx, y + 0.7, col.cz);
        mesh.rotation.y = col.yaw;
        group.add(mesh);
      } else if (col.type === 'segment') {
        const midX = (col.x1 + col.x2) / 2;
        const midZ = (col.z1 + col.z2) / 2;
        const len = Math.hypot(col.x2 - col.x1, col.z2 - col.z1);
        const yaw = Math.atan2(col.x2 - col.x1, col.z2 - col.z1);
        const y = groundHeightFn ? groundHeightFn(midX, midZ) : 0;
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(col.radius, col.radius, len, 8), segmentMat);
        mesh.rotation.x = Math.PI / 2;
        mesh.rotation.z = -yaw;
        mesh.position.set(midX, y + 0.7, midZ);
        group.add(mesh);
      }
    }
    return group;
  }
}
