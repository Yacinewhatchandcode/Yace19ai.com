import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { mountAzIrEm } from "./azirem.js?v=18";
import { createHyperspace } from "./hyperspace.js?v=18";
import { mountNeuralMesh } from "./neural-mesh.js?v=18";

const COLORS = {
  void: 0x07060c,
  ink: 0xb8c0d4,
  muted: 0x6a738a,
  gold: 0xe0b45a,
  goldCore: 0xffd78a,
  line: 0x4a5568,
  arm: 0x7a8cff,
  leaf: 0x9aa8c8,
};
const KIND_RADIUS = { root: 2.6, pillar: 1.05, leaf: 0.18 };
const TIER_GAP = 48;
const IDLE_DELAY_MS = 2800;
const FADE_SPEED = 0.14;
const FLY_DURATION_MS = 980;
const STAR_COUNT = 900;
const DUST_COUNT = 160;

const hostElement = document.getElementById("graph-host");
const searchInput = document.getElementById("deck-search");
const kindFilters = document.getElementById("kind-filters");
const tierFilters = document.getElementById("tier-filters");
const detailPanel = document.getElementById("detail-panel");
const deckCountChip = document.getElementById("deck-count-chip");
const graphHint = document.getElementById("graph-hint");

let registryData = null;
let nodeMeshes = [];
let edgeLines = [];
let accentRings = [];
let labelObjects = [];
let selectedMesh = null;
let hoveredMesh = null;
let activeKindFilter = "pillar";
let activeTierFilter = "B";
let searchQuery = "";
let graphOpacity = 1;
let fadeTarget = 1;
let pendingRebuild = false;
let isDragging = false;
let lastInteractionMs = 0;
let idleOrbitAngle = 0;
let cameraFlight = null;
let deckByIdGlobal = new Map();
let lastFrameMs = performance.now();
let starField = null;
let dustField = null;
let aziremCompanion = null;
let hyperspaceFx = null;
let neuralMeshFx = null;

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.void);
scene.fog = new THREE.FogExp2(COLORS.void, 0.011);

const camera = new THREE.PerspectiveCamera(52, 1, 0.2, 420);
camera.position.set(0, 12, 42);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = false;
hostElement.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.style.cssText = "position:absolute;inset:0;pointer-events:none;background:transparent;z-index:2";
hostElement.appendChild(labelRenderer.domElement);
renderer.domElement.style.cssText = "display:block;position:relative;z-index:1;width:100%;height:100%;touch-action:none";

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 140;
controls.maxPolarAngle = Math.PI * 0.92;
controls.minPolarAngle = 0.08;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.rotateSpeed = 0.72;
controls.zoomSpeed = 1.15;
controls.panSpeed = 0.85;
controls.target.set(0, 0, 0);
controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

scene.add(new THREE.AmbientLight(0x6a7898, 0.55));
const keyLight = new THREE.PointLight(COLORS.goldCore, 2.4, 90, 2);
keyLight.position.set(0, 4, 0);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x8899ff, 0.55);
fillLight.position.set(-18, 12, -10);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0xffc878, 0.35);
rimLight.position.set(12, -6, 18);
scene.add(rimLight);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function createParticleField(count, spread, size, color, opacity) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const radius = Math.pow(Math.random(), 0.55) * spread;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = (Math.random() - 0.5) * spread * 0.28;
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    sizeAttenuation: true,
  });
  return new THREE.Points(geometry, material);
}

function mountGalaxyBackdrop() {
  starField = createParticleField(STAR_COUNT, 95, 0.045, 0xdde6ff, 0.55);
  dustField = createParticleField(DUST_COUNT, 42, 0.12, 0x7a8cff, 0.14);
  scene.add(starField);
  scene.add(dustField);
}

function showBootError(message) {
  const box = document.getElementById("boot-error");
  if (box) { box.classList.remove("is-hidden"); box.textContent = message; }
  if (graphHint) graphHint.textContent = message;
}

function disposeMesh(mesh) {
  scene.remove(mesh);
  mesh.geometry.dispose();
  if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
  else mesh.material.dispose();
}

function clearGraph() {
  nodeMeshes.forEach(disposeMesh);
  edgeLines.forEach(disposeMesh);
  accentRings.forEach(disposeMesh);
  labelObjects.forEach((label) => scene.remove(label));
  nodeMeshes = [];
  edgeLines = [];
  accentRings = [];
  labelObjects = [];
  hoveredMesh = null;
}

function buildChildrenMap(decks) {
  const childrenMap = new Map();
  decks.forEach((deck) => {
    if (!deck.parent) return;
    const siblings = childrenMap.get(deck.parent) ?? [];
    siblings.push(deck);
    childrenMap.set(deck.parent, siblings);
  });
  childrenMap.forEach((siblings, parentId) => {
    siblings.sort((a, b) => a.id.localeCompare(b.id));
    childrenMap.set(parentId, siblings);
  });
  return childrenMap;
}

function tierShift(deck) {
  if (activeTierFilter !== "all") return 0;
  return (deck.tier ?? "B") === "C" ? TIER_GAP : -TIER_GAP;
}

function hashUnit(text) {
  let value = 0;
  for (let index = 0; index < text.length; index += 1) value = (value * 31 + text.charCodeAt(index)) >>> 0;
  return (value % 1000) / 1000;
}

function assignGalaxyPositions(decks) {
  const positions = new Map();
  const childrenMap = buildChildrenMap(decks);
  const roots = decks.filter((d) => d.kind === "root" || !d.parent);

  roots.forEach((root, rootIndex) => {
    const shift = tierShift(root);
    const originX = shift + (rootIndex - (roots.length - 1) / 2) * 14;
    positions.set(root.id, new THREE.Vector3(originX, 0, 0));

    const pillars = childrenMap.get(root.id) ?? [];
    const pillarOrbit = 16 + Math.min(pillars.length, 18) * 0.22;
    pillars.forEach((pillar, pillarIndex) => {
      const angle = (pillarIndex / Math.max(pillars.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const wobble = (hashUnit(pillar.id) - 0.5) * 0.9;
      const x = originX + Math.cos(angle) * pillarOrbit;
      const z = Math.sin(angle) * pillarOrbit * 0.88;
      const y = Math.sin(angle * 2) * 1.6 + wobble;
      positions.set(pillar.id, new THREE.Vector3(x, y, z));

      const leaves = childrenMap.get(pillar.id) ?? [];
      const armTwist = 0.7 + hashUnit(pillar.id) * 0.8;
      leaves.forEach((leaf, leafIndex) => {
        const t = leaves.length === 1 ? 0 : leafIndex / (leaves.length - 1);
        const spiral = angle + t * armTwist + leafIndex * 0.14;
        const radius = 2.4 + t * (4.2 + Math.min(leaves.length, 40) * 0.05);
        const jitter = (hashUnit(leaf.id) - 0.5) * 0.7;
        positions.set(leaf.id, new THREE.Vector3(
          x + Math.cos(spiral) * radius + jitter,
          y - 0.6 - t * 2.2 + jitter * 0.35,
          z + Math.sin(spiral) * radius * 0.82 + jitter * 0.25
        ));
      });
    });
  });

  decks.forEach((deck) => {
    if (!positions.has(deck.id)) positions.set(deck.id, new THREE.Vector3(tierShift(deck), 0, 0));
  });
  return positions;
}

function createLabel(text, kind, deckId) {
  const element = document.createElement("div");
  element.className = `node-label node-label--${kind} hud-chip`;
  element.dataset.deckId = deckId;
  const badge = kind === "root" ? "CORE" : kind === "pillar" ? "ORBIT" : "STAR";
  element.innerHTML = `<span class="node-badge">${badge}</span><span class="node-title">${text}</span>`;
  return new CSS2DObject(element);
}

function createNodeMaterial(deck) {
  const isRoot = deck.kind === "root";
  const isPillar = deck.kind === "pillar";
  return new THREE.MeshStandardMaterial({
    color: isRoot ? COLORS.goldCore : isPillar ? COLORS.ink : COLORS.leaf,
    emissive: isRoot ? COLORS.gold : isPillar ? COLORS.arm : 0x334466,
    emissiveIntensity: isRoot ? 0.55 : isPillar ? 0.28 : 0.18,
    metalness: isRoot ? 0.55 : 0.25,
    roughness: isRoot ? 0.28 : 0.45,
    transparent: true,
    opacity: 1,
  });
}

function addAccentRing(mesh, deck) {
  if (deck.kind === "leaf") return;
  const radius = (KIND_RADIUS[deck.kind] ?? KIND_RADIUS.leaf) + 0.28;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, deck.kind === "root" ? 0.045 : 0.028, 8, 64),
    new THREE.MeshBasicMaterial({ color: COLORS.gold, transparent: true, opacity: deck.kind === "root" ? 0.75 : 0.45 })
  );
  ring.position.copy(mesh.position);
  ring.rotation.x = Math.PI / 2.4;
  ring.userData = { deckId: deck.id, spin: deck.kind === "root" ? 0.00035 : 0.00055 };
  scene.add(ring);
  accentRings.push(ring);
}

function visibleDecks() {
  if (!registryData) return [];
  return registryData.decks.filter((deck) => {
    const tier = deck.tier ?? "B";
    if (activeTierFilter !== "all" && tier !== activeTierFilter) return false;
    if (activeKindFilter === "pillar") {
      if (deck.kind !== "pillar" && deck.kind !== "root") return false;
    } else if (activeKindFilter !== "all" && deck.kind !== activeKindFilter) {
      return false;
    }
    if (searchQuery && !deckMatchesSearch(deck, searchQuery.trim().toLowerCase())) return false;
    return true;
  });
}

function applyGraphOpacity(opacity) {
  nodeMeshes.forEach((mesh) => {
    mesh.material.opacity = (mesh.userData.baseOpacity ?? 1) * opacity;
  });
  edgeLines.forEach((line) => {
    line.material.opacity = (line.userData.baseOpacity ?? 0.5) * opacity;
  });
  accentRings.forEach((ring) => {
    ring.material.opacity = (ring.userData.deckId && ring.userData.spin > 0.0004 ? 0.7 : 0.4) * opacity;
  });
  labelObjects.forEach((label) => { label.element.style.opacity = String(opacity); });
}

function rebuildVisibleGraph() {
  clearGraph();
  const decks = visibleDecks();
  deckByIdGlobal = new Map(decks.map((d) => [d.id, d]));
  if (decks.length === 0) {
    graphHint.textContent = "No stars match — try All tiers / All kinds";
    return;
  }
  const tierNote = activeTierFilter === "all" ? " · B left · C right" : "";
  const kindNote = activeKindFilter === "pillar" ? " · CORE + ORBITS" : "";
  graphHint.textContent = `${decks.length} bodies · fighter = AzIrEm · drag free / series = chase cam${kindNote}${tierNote}`;

  const positions = assignGalaxyPositions(decks);
  const deckById = new Map(decks.map((d) => [d.id, d]));

  decks.forEach((deck) => {
    const radius = KIND_RADIUS[deck.kind] ?? KIND_RADIUS.leaf;
    const segments = deck.kind === "leaf" ? 16 : 28;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), createNodeMaterial(deck));
    mesh.position.copy(positions.get(deck.id));
    mesh.userData = {
      deck,
      baseOpacity: deck.kind === "leaf" ? 0.82 : 1,
      twinkle: hashUnit(deck.id) * Math.PI * 2,
      home: mesh.position.clone(),
      radius,
    };
    scene.add(mesh);
    nodeMeshes.push(mesh);
    addAccentRing(mesh, deck);

    if (deck.kind === "root" || deck.kind === "pillar") {
      const label = createLabel(deck.title.replace(/^Kernel — /, "").slice(0, 28), deck.kind, deck.id);
      label.position.copy(mesh.position);
      label.position.y += radius + (deck.kind === "root" ? 1.6 : 1.15);
      scene.add(label);
      labelObjects.push(label);
    }

    if (deck.parent && deckById.has(deck.parent)) {
      const isPillarEdge = deck.kind === "pillar";
      const edgeOpacity = isPillarEdge ? 0.55 : 0.22;
      const edge = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([positions.get(deck.parent), positions.get(deck.id)]),
        new THREE.LineBasicMaterial({
          color: isPillarEdge ? COLORS.gold : COLORS.arm,
          transparent: true,
          opacity: edgeOpacity,
        })
      );
      edge.userData.baseOpacity = edgeOpacity;
      scene.add(edge);
      edgeLines.push(edge);
    }
  });

  const box = new THREE.Box3();
  nodeMeshes.forEach((m) => box.expandByObject(m));
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const fit = Math.max(size.x, size.z, 12);
  if (!cameraFlight) {
    controls.target.copy(center);
    const distance = fit * (hostElement.clientWidth < 720 ? 1.35 : 1.05);
    camera.position.set(center.x + fit * 0.15, center.y + fit * 0.28, center.z + distance);
  }
  keyLight.position.copy(center.clone().add(new THREE.Vector3(0, 2, 0)));
  graphOpacity = fadeTarget === 0 ? 0 : 1;
  applyGraphOpacity(graphOpacity);
}

function deckMatchesSearch(deck, query) {
  const haystack = [deck.id, deck.title, deck.pillar, deck.kind, ...(deck.keywords ?? [])].join(" ").toLowerCase();
  return haystack.includes(query);
}

function showDetail(deck) {
  const tierLabel = deck.tier ? `Tier ${deck.tier}` : "Tier B";
  document.getElementById("detail-kind").textContent = `${tierLabel} · ${deck.kind}`;
  document.getElementById("detail-title").textContent = deck.title;
  document.getElementById("detail-id").textContent = deck.id;
  document.getElementById("detail-parent").textContent = deck.parent ?? "—";
  document.getElementById("detail-route").textContent = deck.route;
  document.getElementById("detail-pillar").textContent = deck.pillar;
  const keywordsHost = document.getElementById("detail-keywords");
  keywordsHost.replaceChildren();
  (deck.keywords ?? []).forEach((keyword) => {
    const tag = document.createElement("span");
    tag.className = "keyword-tag";
    tag.textContent = keyword;
    keywordsHost.appendChild(tag);
  });
  const downloadLink = document.getElementById("detail-download");
  downloadLink.href = `public/decks/${deck.id}.pptx`;
  downloadLink.textContent = `Download ${deck.id}.pptx`;
  detailPanel.classList.remove("is-hidden");
  detailPanel.setAttribute("aria-hidden", "false");
}

function hideDetail() {
  detailPanel.classList.add("is-hidden");
  detailPanel.setAttribute("aria-hidden", "true");
  selectedMesh = null;
  syncLabelStates();
}

function flyOffsetForKind(kind) {
  if (kind === "root") return new THREE.Vector3(4.5, 5.5, 14);
  if (kind === "pillar") return new THREE.Vector3(3.2, 2.8, 7.5);
  return new THREE.Vector3(1.8, 1.6, 4.2);
}

function startCameraFlight(worldPos, kind) {
  const offset = flyOffsetForKind(kind);
  cameraFlight = {
    fromPos: camera.position.clone(),
    toPos: new THREE.Vector3(worldPos.x + offset.x, worldPos.y + offset.y, worldPos.z + offset.z),
    fromTarget: controls.target.clone(),
    toTarget: worldPos.clone(),
    startMs: performance.now(),
  };
  markInteraction();
}

function updateCameraFlight(now) {
  if (!cameraFlight) return;
  const t = Math.min(1, (now - cameraFlight.startMs) / FLY_DURATION_MS);
  const eased = t * t * (3 - 2 * t);
  camera.position.lerpVectors(cameraFlight.fromPos, cameraFlight.toPos, eased);
  controls.target.lerpVectors(cameraFlight.fromTarget, cameraFlight.toTarget, eased);
  if (t >= 1) cameraFlight = null;
}

function syncLabelStates() {
  const hoverId = hoveredMesh?.userData.deck.id;
  const selectId = selectedMesh?.userData.deck.id;
  labelObjects.forEach((label) => {
    const id = label.element.dataset.deckId;
    label.element.classList.toggle("is-hovered", id === hoverId);
    label.element.classList.toggle("is-selected", id === selectId);
  });
}

function updateLabelLod() {
  labelObjects.forEach((label) => {
    const deckId = label.element.dataset.deckId;
    const mesh = findMeshById(deckId);
    if (!mesh) return;
    const distance = camera.position.distanceTo(mesh.position);
    const isFocus = mesh === selectedMesh || mesh === hoveredMesh;
    const isRoot = mesh.userData.deck.kind === "root";
    let opacity = 0;
    let scale = 0.5;
    if (isFocus) {
      opacity = 1;
      scale = 1;
    } else if (isRoot && distance < 60) {
      opacity = 0.92;
      scale = 0.78;
    } else if (distance < 18) {
      opacity = 0.88;
      scale = 0.68;
    } else if (distance < 28) {
      opacity = 0.28;
      scale = 0.48;
    }
    label.element.style.opacity = String(opacity * graphOpacity);
    label.element.style.transform = `translate(-50%, -120%) scale(${scale})`;
    label.element.classList.toggle("is-distant", opacity > 0 && opacity < 0.5);
    label.element.classList.toggle("is-focus", isFocus);
  });
}

function selectNode(mesh) {
  selectedMesh = mesh;
  showDetail(mesh.userData.deck);
  startCameraFlight(mesh.position.clone(), mesh.userData.deck.kind);
  syncLabelStates();
}

function findMeshById(deckId) {
  return nodeMeshes.find((m) => m.userData.deck.id === deckId) ?? null;
}

function requestGraphRebuild() {
  pendingRebuild = true;
  fadeTarget = 0;
}

function markInteraction() {
  lastInteractionMs = performance.now();
  idleOrbitAngle = Math.atan2(
    camera.position.x - controls.target.x,
    camera.position.z - controls.target.z
  );
}

function resizeRenderer() {
  const width = Math.max(hostElement.clientWidth, 1);
  const height = Math.max(hostElement.clientHeight, 320);
  const isNarrow = width < 720;
  camera.fov = isNarrow ? 58 : width < 1100 ? 50 : 46;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow ? 1.75 : 2));
  renderer.setSize(width, height, false);
  labelRenderer.setSize(width, height);
  controls.rotateSpeed = isNarrow ? 0.95 : 0.72;
  controls.zoomSpeed = isNarrow ? 1.35 : 1.15;
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickNode() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(nodeMeshes);
  return hits.length > 0 ? hits[0].object : null;
}

function onPointerMove(event) {
  updatePointer(event);
  if (isDragging) return;
  const hit = pickNode();
  if (hit !== hoveredMesh) {
    hoveredMesh = hit;
    hostElement.classList.toggle("is-node-hover", Boolean(hit));
    syncLabelStates();
  }
}

function onPointerDown(event) {
  if (event.button !== 0) return;
  markInteraction();
  isDragging = false;
  updatePointer(event);
  const hit = pickNode();
  if (hit) selectNode(hit);
}

function onPointerUp() {
  isDragging = false;
  hostElement.classList.remove("is-dragging");
}

function onControlsStart() {
  markInteraction();
  isDragging = true;
  hostElement.classList.add("is-dragging");
  hostElement.classList.remove("is-node-hover");
  cameraFlight = null;
  aziremCompanion?.releaseChase?.();
}

function updateNodeVisuals(time) {
  const rootPulse = 1 + Math.sin(time * 0.0016) * 0.06;
  nodeMeshes.forEach((mesh) => {
    const deck = mesh.userData.deck;
    const isRoot = deck.kind === "root";
    const isHovered = mesh === hoveredMesh;
    const isSelected = mesh === selectedMesh;
    const twinkle = 1 + Math.sin(time * 0.0028 + mesh.userData.twinkle) * (deck.kind === "leaf" ? 0.12 : 0.03);
    const hoverScale = isHovered ? 1.22 : isSelected ? 1.12 : 1;
    const baseScale = isRoot ? rootPulse : twinkle;
    mesh.scale.setScalar(baseScale * hoverScale);

    if (isSelected) {
      mesh.material.emissive.setHex(COLORS.goldCore);
      mesh.material.emissiveIntensity = 0.85;
    } else if (isHovered) {
      mesh.material.emissive.setHex(COLORS.gold);
      mesh.material.emissiveIntensity = 0.55;
    } else {
      mesh.material.emissive.setHex(isRoot ? COLORS.gold : deck.kind === "pillar" ? COLORS.arm : 0x334466);
      mesh.material.emissiveIntensity = isRoot ? 0.55 : deck.kind === "pillar" ? 0.28 : 0.18;
    }
  });

  accentRings.forEach((ring) => {
    ring.rotation.z += (ring.userData.spin ?? 0.0004) * 16;
  });
}

function updateIdleOrbit(deltaMs) {
  if (aziremCompanion?.isChasing) return;
  if (isDragging || cameraFlight) return;
  if (performance.now() - lastInteractionMs < IDLE_DELAY_MS) return;
  idleOrbitAngle += deltaMs * 0.00022;
  const dx = camera.position.x - controls.target.x;
  const dz = camera.position.z - controls.target.z;
  const horiz = Math.hypot(dx, dz) || 1;
  camera.position.x = controls.target.x + Math.sin(idleOrbitAngle) * horiz;
  camera.position.z = controls.target.z + Math.cos(idleOrbitAngle) * horiz;
  camera.lookAt(controls.target);
}

function updateBackdrop(deltaMs) {
  if (starField) starField.rotation.y += deltaMs * 0.000012;
  if (dustField) {
    dustField.rotation.y -= deltaMs * 0.000028;
    dustField.rotation.x += deltaMs * 0.000006;
  }
}

function animate(time) {
  requestAnimationFrame(animate);
  const deltaMs = Math.min(40, time - lastFrameMs || 16);
  lastFrameMs = time;
  if (graphOpacity !== fadeTarget) {
    graphOpacity += (fadeTarget - graphOpacity) * FADE_SPEED;
    if (Math.abs(fadeTarget - graphOpacity) < 0.02) graphOpacity = fadeTarget;
    applyGraphOpacity(graphOpacity);
    if (pendingRebuild && graphOpacity <= 0.04) {
      pendingRebuild = false;
      rebuildVisibleGraph();
      fadeTarget = 1;
    }
  }
  updateCameraFlight(time);
  updateNodeVisuals(time);
  updateLabelLod();
  updateIdleOrbit(deltaMs);
  updateBackdrop(deltaMs);
  if (aziremCompanion) aziremCompanion.update(time, deltaMs);
  if (hyperspaceFx) hyperspaceFx.update(time, deltaMs);
  if (neuralMeshFx) neuralMeshFx.update(time);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

function setActiveButton(group, button) {
  group.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.toggle("is-active", btn === button));
}

function focusTier(tier) {
  activeTierFilter = tier;
  const button = tierFilters.querySelector(`[data-tier="${tier}"]`);
  if (button) setActiveButton(tierFilters, button);
  requestGraphRebuild();
}

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  requestGraphRebuild();
});

kindFilters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;
  activeKindFilter = button.dataset.kind;
  setActiveButton(kindFilters, button);
  requestGraphRebuild();
});

tierFilters.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;
  activeTierFilter = button.dataset.tier;
  setActiveButton(tierFilters, button);
  requestGraphRebuild();
});

hostElement.addEventListener("pointermove", onPointerMove);
hostElement.addEventListener("pointerdown", onPointerDown);
hostElement.addEventListener("pointerup", onPointerUp);
hostElement.addEventListener("pointerleave", () => {
  hoveredMesh = null;
  hostElement.classList.remove("is-node-hover");
  syncLabelStates();
});
controls.addEventListener("start", onControlsStart);
controls.addEventListener("end", () => { isDragging = false; hostElement.classList.remove("is-dragging"); });
window.addEventListener("resize", resizeRenderer);

const treeReadyCallbacks = [];

function resolveDeck(deckOrId) {
  if (typeof deckOrId === "string") return deckByIdGlobal.get(deckOrId) ?? null;
  return deckOrId ?? null;
}

function notifyTreeReady() {
  treeReadyCallbacks.splice(0).forEach((callback) => {
    if (typeof callback === "function") callback(window.PrimeShell ?? null);
  });
}

window.PrimeTreeAPI = {
  flyTo(deckId) {
    const mesh = findMeshById(deckId);
    if (mesh) selectNode(mesh);
  },
  focusTier,
  selectById(deckId) {
    const mesh = findMeshById(deckId);
    if (mesh) selectNode(mesh);
    else {
      const deck = deckByIdGlobal.get(deckId);
      if (deck) showDetail(deck);
    }
  },
  showDetail(deckOrId) {
    const deck = resolveDeck(deckOrId);
    if (deck) showDetail(deck);
  },
  hideDetail,
  rebuildGraph: requestGraphRebuild,
  rebuildVisibleGraph,
  onReady(callback) {
    if (typeof callback !== "function") return;
    if (registryData) callback(window.PrimeShell ?? null);
    else treeReadyCallbacks.push(callback);
  },
};

async function init() {
  document.body.classList.add("theme-galaxy");
  mountGalaxyBackdrop();
  const response = await fetch("public/registry.json");
  if (!response.ok) throw new Error(`registry.json HTTP ${response.status}`);
  registryData = await response.json();
  const totalDecks = registryData.deck_count ?? registryData.decks.length;
  const tierBCount = registryData.tier_b_count ?? 79;
  const tierCCount = registryData.tier_c_count ?? 354;
  deckCountChip.textContent = `${totalDecks} decks (B ${tierBCount} · C ${tierCCount})`;
  const defaultTierButton = tierFilters.querySelector('[data-tier="B"]');
  if (defaultTierButton) setActiveButton(tierFilters, defaultTierButton);
  const defaultKindButton = kindFilters.querySelector('[data-kind="pillar"]');
  if (defaultKindButton) setActiveButton(kindFilters, defaultKindButton);
  lastInteractionMs = performance.now();
  resizeRenderer();
  rebuildVisibleGraph();
  hyperspaceFx = createHyperspace(scene, camera);
  neuralMeshFx = await mountNeuralMesh(scene);
  document.getElementById("skills-mesh-toggle")?.addEventListener("click", () => {
    if (!neuralMeshFx) return;
    neuralMeshFx.setVisible(!neuralMeshFx.isVisible);
  });
  aziremCompanion = await mountAzIrEm({
    scene,
    camera,
    controls,
    findMeshById,
    selectById: (deckId) => {
      const mesh = findMeshById(deckId);
      if (!mesh) {
        const deck = deckByIdGlobal.get(deckId);
        if (deck) showDetail(deck);
        return;
      }
      selectedMesh = mesh;
      showDetail(mesh.userData.deck);
      syncLabelStates();
    },
    focusTier,
    hyperspaceJump: (route) => hyperspaceFx?.jump(route),
    markInteraction,
    setChaseActive(isActive) {
      if (isActive) cameraFlight = null;
    },
  });
  notifyTreeReady();
  animate(performance.now());
}

init().catch((error) => {
  showBootError(`Failed to load deck tree: ${error.message}`);
  hostElement.textContent = "";
});
