import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

export const JUMP_MS = 2800;
const STREAK_COUNT = 120;
const PEAK_FOV_BOOST = 4;
const ROAD_TUBE_RADIUS = 0.22;

export function createHyperspace(scene, camera) {
  const streakGroup = new THREE.Group();
  streakGroup.name = "HyperspaceStreaks";
  streakGroup.visible = false;
  scene.add(streakGroup);

  const geometry = new THREE.CylinderGeometry(0.01, 0.01, 1, 4);
  geometry.rotateX(Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffe2a0,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const streaks = new THREE.InstancedMesh(geometry, material, STREAK_COUNT);
  streaks.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  streakGroup.add(streaks);

  const dummy = new THREE.Object3D();
  const velocities = new Float32Array(STREAK_COUNT);
  const radii = new Float32Array(STREAK_COUNT);
  seedStreaks(dummy, streaks, velocities, radii);

  const roadGroup = new THREE.Group();
  roadGroup.name = "HyperspaceRoad";
  scene.add(roadGroup);

  const state = {
    isJumping: false,
    startMs: 0,
    baseFov: camera.fov,
    curve: null,
    traveled: null,
    shipMarker: null,
    crumbs: [],
    route: null,
  };

  const overlay = document.getElementById("hyperspace-overlay");

  function jump(route) {
    const info = normalizeRoute(route);
    clearRoad(roadGroup, state);
    state.isJumping = true;
    state.startMs = performance.now();
    state.baseFov = camera.fov;
    state.route = info;
    streakGroup.visible = true;
    seedStreaks(dummy, streaks, velocities, radii);
    state.curve = buildRoadCurve(info.fromWorld, info.toWorld, camera);
    mountRoad(roadGroup, state, info);
    paintRoute(overlay, info, 0);
  }

  function update(now, deltaMs) {
    if (!state.isJumping) return;
    const t = Math.min(1, (now - state.startMs) / JUMP_MS);
    const envelope = warpEnvelope(t);
    const progress = easeInOut(t);

    camera.fov = state.baseFov + PEAK_FOV_BOOST * envelope * 0.35;
    camera.updateProjectionMatrix();
    streakGroup.position.copy(camera.position);
    streakGroup.quaternion.copy(camera.quaternion);
    updateStreaks(dummy, streaks, velocities, radii, material, envelope, deltaMs);
    updateRoadProgress(state, progress);
    paintRoute(overlay, state.route, progress);

    if (overlay) {
      overlay.style.setProperty("--hs-intensity", String(envelope * 0.35));
      overlay.classList.toggle("is-peak", envelope > 0.65);
    }
    if (t >= 1) finishJump(state, streakGroup, camera, overlay, roadGroup);
  }

  return {
    jump,
    update,
    get isJumping() { return state.isJumping; },
    get curve() { return state.curve; },
  };
}

function finishJump(state, streakGroup, camera, overlay, roadGroup) {
  state.isJumping = false;
  streakGroup.visible = false;
  camera.fov = state.baseFov;
  camera.updateProjectionMatrix();
  if (overlay) {
    overlay.classList.remove("is-active", "is-peak");
    overlay.style.setProperty("--hs-intensity", "0");
    overlay.setAttribute("aria-hidden", "true");
  }
  window.setTimeout(() => clearRoad(roadGroup, state), 1400);
}

function normalizeRoute(route) {
  if (typeof route === "string") {
    return {
      fromTitle: "Here",
      fromId: "—",
      toTitle: route,
      toId: "—",
      episode: "",
      pathStops: [],
      fromIndex: 0,
      toIndex: 1,
      fromWorld: null,
      toWorld: null,
    };
  }
  return {
    fromTitle: route?.fromTitle || "Here",
    fromId: route?.fromId || "—",
    toTitle: route?.toTitle || "Next",
    toId: route?.toId || "—",
    episode: route?.episode || "",
    pathStops: Array.isArray(route?.pathStops) ? route.pathStops : [],
    fromIndex: Number.isFinite(route?.fromIndex) ? route.fromIndex : 0,
    toIndex: Number.isFinite(route?.toIndex) ? route.toIndex : 1,
    fromWorld: toVector(route?.fromWorld),
    toWorld: toVector(route?.toWorld),
  };
}

function toVector(value) {
  if (!value) return null;
  if (value.isVector3) return value.clone();
  if (Number.isFinite(value.x) && Number.isFinite(value.y) && Number.isFinite(value.z)) {
    return new THREE.Vector3(value.x, value.y, value.z);
  }
  return null;
}

function buildRoadCurve(fromWorld, toWorld, camera) {
  const from = fromWorld || camera.position.clone().add(new THREE.Vector3(0, -1.2, -4));
  const to = toWorld || camera.position.clone().add(new THREE.Vector3(0, 0.4, -18));
  const mid = from.clone().lerp(to, 0.5);
  const span = Math.max(4, from.distanceTo(to));
  mid.y += Math.min(8, span * 0.22);
  const side = new THREE.Vector3().subVectors(to, from).cross(new THREE.Vector3(0, 1, 0));
  if (side.lengthSq() < 0.001) side.set(1, 0, 0);
  side.normalize().multiplyScalar(Math.min(5, span * 0.14));
  mid.add(side);
  return new THREE.CatmullRomCurve3([from, mid, to]);
}

function mountRoad(roadGroup, state, info) {
  if (!state.curve) return;
  const upcoming = new THREE.Mesh(
    new THREE.TubeGeometry(state.curve, 80, ROAD_TUBE_RADIUS, 10, false),
    new THREE.MeshBasicMaterial({
      color: 0xc9a15a,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  roadGroup.add(upcoming);

  const halo = new THREE.Mesh(
    new THREE.TubeGeometry(state.curve, 80, ROAD_TUBE_RADIUS * 2.4, 10, false),
    new THREE.MeshBasicMaterial({
      color: 0xffd78a,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );
  roadGroup.add(halo);

  const traveled = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(state.curve.getPoints(2)),
    new THREE.LineBasicMaterial({
      color: 0xfff1c2,
      transparent: true,
      opacity: 1,
      linewidth: 2,
    })
  );
  roadGroup.add(traveled);
  state.traveled = traveled;

  const shipMarker = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 1.1, 6),
    new THREE.MeshBasicMaterial({ color: 0xffd78a })
  );
  shipMarker.rotation.x = Math.PI / 2;
  roadGroup.add(shipMarker);
  state.shipMarker = shipMarker;

  const start = state.curve.getPointAt(0);
  const end = state.curve.getPointAt(1);
  roadGroup.add(makeBeacon(start, "FROM", info.fromTitle, 0x7a8cff));
  roadGroup.add(makeBeacon(end, "TO", info.toTitle, 0xe0b45a));

  state.crumbs = [];
  for (let index = 1; index <= 6; index += 1) {
    const crumb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffd78a, transparent: true, opacity: 0.35 })
    );
    crumb.position.copy(state.curve.getPointAt(index / 7));
    crumb.userData.at = index / 7;
    roadGroup.add(crumb);
    state.crumbs.push(crumb);
  }
  updateRoadProgress(state, 0);
}

function makeBeacon(position, kicker, title, color) {
  const group = new THREE.Group();
  group.position.copy(position);
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 20, 20),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
  );
  group.add(core);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.15, 36),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  const label = document.createElement("div");
  label.className = "node-label node-label--beacon";
  label.innerHTML = `<span class="node-badge">${kicker}</span><span class="node-title">${title}</span>`;
  const labelObject = new CSS2DObject(label);
  labelObject.position.set(0, 1.1, 0);
  group.add(labelObject);
  return group;
}

function updateRoadProgress(state, progress) {
  if (!state.curve || !state.traveled) return;
  const samples = Math.max(2, Math.floor(2 + progress * 64));
  const points = [];
  for (let index = 0; index <= samples; index += 1) {
    points.push(state.curve.getPointAt((progress * index) / samples));
  }
  state.traveled.geometry.dispose();
  state.traveled.geometry = new THREE.BufferGeometry().setFromPoints(points);
  if (state.shipMarker) {
    const point = state.curve.getPointAt(progress);
    const tangent = state.curve.getTangentAt(progress).normalize();
    state.shipMarker.position.copy(point);
    state.shipMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
  }
  state.crumbs.forEach((crumb) => {
    const lit = progress >= crumb.userData.at;
    crumb.material.opacity = lit ? 0.95 : 0.25;
    crumb.scale.setScalar(lit ? 1.35 : 0.85);
  });
}

function clearRoad(roadGroup, state) {
  while (roadGroup.children.length) {
    const child = roadGroup.children[0];
    roadGroup.remove(child);
    child.traverse?.((node) => {
      if (node.isCSS2DObject && node.element?.parentNode) {
        node.element.parentNode.removeChild(node.element);
      }
      node.geometry?.dispose?.();
      if (node.material) node.material.dispose();
    });
    child.geometry?.dispose?.();
    if (child.material) child.material.dispose();
  }
  document.querySelectorAll(".node-label--beacon").forEach((el) => el.remove());
  state.curve = null;
  state.traveled = null;
  state.shipMarker = null;
  state.crumbs = [];
}

function paintRoute(overlay, info, progress) {
  if (!overlay || !info) return;
  overlay.classList.add("is-active");
  overlay.setAttribute("aria-hidden", "false");
  setText(overlay, "#hyperspace-episode", info.episode || "Flying between documents");
  setText(overlay, "#hyperspace-from-title", info.fromTitle);
  setText(overlay, "#hyperspace-from-id", info.fromId);
  setText(overlay, "#hyperspace-to-title", info.toTitle);
  setText(overlay, "#hyperspace-to-id", info.toId);
  const fill = overlay.querySelector("#hyperspace-path-fill");
  const ship = overlay.querySelector("#hyperspace-path-ship");
  const now = overlay.querySelector("#hyperspace-path-now");
  const pct = Math.round(progress * 100);
  if (fill) fill.style.width = `${pct}%`;
  if (ship) ship.style.left = `${pct}%`;
  if (now) {
    now.textContent = progress >= 1
      ? `Arrived at ${info.toTitle}`
      : `Ship on gold road · ${pct}% · ${info.fromTitle} → ${info.toTitle}`;
  }
}

function setText(root, selector, value) {
  const el = root.querySelector(selector);
  if (el) el.textContent = value;
}

function updateStreaks(dummy, streaks, velocities, radii, material, envelope, deltaMs) {
  const stretch = 1 + 6 * envelope;
  const rush = 0.2 + envelope * 1.2;
  for (let index = 0; index < STREAK_COUNT; index += 1) {
    streaks.getMatrixAt(index, dummy.matrix);
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
    dummy.position.z += velocities[index] * rush * (deltaMs / 16);
    if (dummy.position.z > 2) resetStreak(dummy, index, radii);
    dummy.scale.set(0.4 + envelope, 0.4 + envelope, stretch);
    dummy.updateMatrix();
    streaks.setMatrixAt(index, dummy.matrix);
  }
  streaks.instanceMatrix.needsUpdate = true;
  material.opacity = 0.08 + envelope * 0.18;
}

function warpEnvelope(t) {
  if (t < 0.12) return t / 0.12;
  if (t < 0.78) return 1;
  return 1 - (t - 0.78) / 0.22;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function seedStreaks(dummy, streaks, velocities, radii) {
  for (let index = 0; index < STREAK_COUNT; index += 1) {
    radii[index] = 0.5 + Math.random() * 6;
    velocities[index] = 0.25 + Math.random() * 1.1;
    resetStreak(dummy, index, radii);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    streaks.setMatrixAt(index, dummy.matrix);
  }
  streaks.instanceMatrix.needsUpdate = true;
}

function resetStreak(dummy, index, radii) {
  const angle = Math.random() * Math.PI * 2;
  const radius = radii[index];
  dummy.position.set(
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * 0.65,
    -6 - Math.random() * 28
  );
  dummy.rotation.set(0, 0, angle);
}
