import * as THREE from "three";

const HULL = 0xd8dee8;
const ACCENT = 0xe0b45a;
const ENGINE = 0x7a8cff;
const DARK = 0x2a3144;

export function createAzIrEmMesh() {
  const root = new THREE.Group();
  root.name = "AzIrEm";

  const hullMat = new THREE.MeshStandardMaterial({
    color: HULL,
    metalness: 0.72,
    roughness: 0.28,
    emissive: 0x1a2030,
    emissiveIntensity: 0.15,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: ACCENT,
    metalness: 0.45,
    roughness: 0.35,
    emissive: ACCENT,
    emissiveIntensity: 0.35,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: DARK, metalness: 0.6, roughness: 0.4 });
  const engineMat = new THREE.MeshStandardMaterial({
    color: ENGINE,
    emissive: ENGINE,
    emissiveIntensity: 0.9,
    metalness: 0.2,
    roughness: 0.35,
  });

  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 1.35), hullMat);
  root.add(fuselage);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 10), accentMat);
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 0.85;
  root.add(nose);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({
      color: 0x9ad0ff,
      emissive: 0x3a6cff,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.85,
      metalness: 0.1,
      roughness: 0.2,
    })
  );
  cockpit.position.set(0, 0.18, 0.15);
  root.add(cockpit);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), hullMat);
  head.position.set(0, 0.22, -0.15);
  root.add(head);

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), accentMat);
  eye.position.set(0, 0.26, -0.02);
  root.add(eye);

  addWingPair(root, 1, hullMat, darkMat, engineMat, accentMat);
  addWingPair(root, -1, hullMat, darkMat, engineMat, accentMat);

  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 6), darkMat);
  antenna.position.set(0.12, 0.42, -0.2);
  root.add(antenna);

  root.scale.setScalar(0.42);
  root.userData.engineMats = [engineMat];
  root.userData.eye = eye;
  return root;
}

function addWingPair(root, side, hullMat, darkMat, engineMat, accentMat) {
  const wingGroup = new THREE.Group();
  wingGroup.position.set(side * 0.28, 0, -0.05);

  const upper = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.28), hullMat);
  upper.position.set(side * 0.55, 0.32, 0);
  upper.rotation.z = side * 0.35;
  wingGroup.add(upper);

  const lower = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.28), hullMat);
  lower.position.set(side * 0.55, -0.32, 0);
  lower.rotation.z = -side * 0.35;
  wingGroup.add(lower);

  const tipU = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), accentMat);
  tipU.position.set(side * 1.12, 0.48, 0.1);
  wingGroup.add(tipU);

  const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.55), accentMat);
  tipL.position.set(side * 1.12, -0.48, 0.1);
  wingGroup.add(tipL);

  const engineU = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.28, 10), engineMat);
  engineU.rotation.x = Math.PI / 2;
  engineU.position.set(side * 0.7, 0.32, -0.35);
  wingGroup.add(engineU);

  const engineL = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.28, 10), engineMat);
  engineL.rotation.x = Math.PI / 2;
  engineL.position.set(side * 0.7, -0.32, -0.35);
  wingGroup.add(engineL);

  const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), darkMat);
  strut.position.set(side * 0.35, 0, 0);
  wingGroup.add(strut);

  root.add(wingGroup);
}
