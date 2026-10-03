import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

const NODE_COLORS = {
  core: 0xe0b45a,
  skill: 0x7a8cff,
  civ: 0x9ad0ff,
};

export async function mountNeuralMesh(scene) {
  const data = await loadSkillsMesh();
  const group = new THREE.Group();
  group.name = "SkillsNeuralMesh";
  scene.add(group);

  const nodeMap = new Map();
  const pulseMats = [];

  data.nodes.forEach((node) => {
    const position = orbitPosition(node.orbit, node.radius);
    const color = NODE_COLORS[node.kind] || NODE_COLORS.skill;
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: node.kind === "core" ? 0.85 : 0.45,
      metalness: 0.2,
      roughness: 0.45,
      transparent: true,
      opacity: 0.92,
    });
    pulseMats.push(material);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(node.kind === "core" ? 0.42 : 0.28, 16, 16),
      material
    );
    mesh.position.copy(position);
    mesh.userData = { skillId: node.id, kind: node.kind };
    group.add(mesh);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.5, 0.62, 28),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    halo.rotation.x = Math.PI / 2;
    mesh.add(halo);

    const label = document.createElement("div");
    label.className = "node-label node-label--skill";
    label.innerHTML = `<span class="node-badge">SKILL</span><span class="node-title">${node.label}</span>`;
    const labelObject = new CSS2DObject(label);
    labelObject.position.set(0, 0.55, 0);
    mesh.add(labelObject);
    nodeMap.set(node.id, mesh);
  });

  const synapseMats = [];
  data.links.forEach(([fromId, toId], index) => {
    const from = nodeMap.get(fromId);
    const to = nodeMap.get(toId);
    if (!from || !to) return;
    const mid = from.position.clone().lerp(to.position, 0.5);
    mid.y += 0.8 + (index % 3) * 0.25;
    const curve = new THREE.QuadraticBezierCurve3(from.position.clone(), mid, to.position.clone());
    const points = curve.getPoints(18);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: index % 2 === 0 ? 0xc9a15a : 0x7a8cff,
      transparent: true,
      opacity: 0.35,
    });
    synapseMats.push(material);
    group.add(new THREE.Line(geometry, material));
  });

  let visible = false;
  group.visible = false;

  function update(time) {
    if (!visible) return;
    const t = time * 0.001;
    group.rotation.y = t * 0.018;
    pulseMats.forEach((mat, index) => {
      mat.emissiveIntensity = 0.35 + Math.sin(t * 2.4 + index) * 0.25;
    });
    synapseMats.forEach((mat, index) => {
      mat.opacity = 0.18 + Math.sin(t * 3 + index * 0.4) * 0.12;
    });
  }

  function setVisible(isVisible) {
    visible = Boolean(isVisible);
    group.visible = visible;
    document.body.classList.toggle("skills-mesh-on", visible);
    group.traverse((node) => {
      if (node.isCSS2DObject && node.element) {
        node.element.style.display = visible ? "" : "none";
      }
    });
  }

  setVisible(false);
  return { update, setVisible, group, get isVisible() { return visible; } };
}

function orbitPosition(orbit, radius) {
  return new THREE.Vector3(
    Math.cos(orbit) * radius,
    Math.sin(orbit * 1.7) * 1.8,
    Math.sin(orbit) * radius
  );
}

async function loadSkillsMesh() {
  const response = await fetch("public/skills-mesh.json");
  if (!response.ok) throw new Error(`skills-mesh HTTP ${response.status}`);
  return response.json();
}
