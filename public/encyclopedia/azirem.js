import * as THREE from "three";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { createAzIrEmMesh } from "./azirem-mesh.js";
import { JUMP_MS } from "./hyperspace.js?v=18";

const FLIGHT_SPEED = 0.07;
const HOVER_AMP = 0.12;
const PARK_GAP = 2.35;
const CHASE_BACK = 5.2;
const CHASE_UP = 1.55;
const CHASE_LOOK_AHEAD = 9;
const WARP_MS = JUMP_MS;
const STORAGE_KEY = "azirem-persona-v3";
const DEFAULT_PERSONA = "fleet-series";

export async function mountAzIrEm(hooks) {
  const roads = await loadRoads();
  const mesh = createAzIrEmMesh();
  mesh.visible = false;
  hooks.scene.add(mesh);

  const shipLabel = document.createElement("div");
  shipLabel.className = "node-label node-label--ship";
  shipLabel.innerHTML = `<span class="node-badge">FIGHTER</span><span class="node-title">AzIrEm</span>`;
  const shipLabelObject = new CSS2DObject(shipLabel);
  shipLabelObject.position.set(0, 0.55, 0);
  mesh.add(shipLabelObject);

  const state = {
    personaId: localStorage.getItem(STORAGE_KEY) || DEFAULT_PERSONA,
    phaseIndex: 0,
    isGuiding: false,
    isPlaying: false,
    isChasing: false,
    flightTarget: null,
    lookTarget: new THREE.Vector3(),
    roads,
    autoTimer: null,
    explainTimer: null,
    warpCurve: null,
    warpStartMs: 0,
  };

  const handlers = {
    onPersona(personaId) {
      stopAutoplay();
      state.personaId = personaId;
      localStorage.setItem(STORAGE_KEY, personaId);
      state.phaseIndex = 0;
      renderSeriesChrome(roads, state);
      speak(roads.guide, "Series locked. Tap Play series — I will fly each document and explain it live.");
      showGuide(true);
    },
    onStart() {
      state.personaId = DEFAULT_PERSONA;
      localStorage.setItem(STORAGE_KEY, DEFAULT_PERSONA);
      mesh.visible = true;
      state.isGuiding = true;
      state.isPlaying = true;
      state.isChasing = true;
      hooks.setChaseActive?.(true);
      syncPlayButton(true);
      goToPhase(state.phaseIndex || 0, { autoContinue: true });
    },
    onPause() {
      state.isPlaying = false;
      stopAutoplay();
      syncPlayButton(false);
      speak(roads.guide, "Paused. Press Start tour to continue.");
    },
    onNext() {
      if (!state.isGuiding) return;
      stopAutoplay();
      state.isPlaying = false;
      state.isChasing = true;
      hooks.setChaseActive?.(true);
      syncPlayButton(false);
      goToPhase(state.phaseIndex + 1, { autoContinue: false });
    },
    onPrev() {
      if (!state.isGuiding || state.phaseIndex <= 0) return;
      stopAutoplay();
      state.isPlaying = false;
      state.isChasing = true;
      hooks.setChaseActive?.(true);
      syncPlayButton(false);
      goToPhase(state.phaseIndex - 1, { autoContinue: false });
    },
    onJump(index) {
      if (!state.personaId) return;
      stopAutoplay();
      state.isPlaying = false;
      syncPlayButton(false);
      mesh.visible = true;
      state.isGuiding = true;
      state.isChasing = true;
      hooks.setChaseActive?.(true);
      goToPhase(index, { autoContinue: false });
    },
    onDismiss() {
      stopAutoplay();
      state.isGuiding = false;
      state.isPlaying = false;
      state.isChasing = false;
      hooks.setChaseActive?.(false);
      mesh.visible = false;
      syncPlayButton(false);
      showGuide(false);
    },
  };

  state.personaId = DEFAULT_PERSONA;
  bindGuideUi(roads, handlers, state);
  renderSeriesChrome(roads, state);
  speak(roads.guide, "Press Start tour. I fly the gold road from one document to the next — watch the ship.");
  showGuide(false);

  function currentPhaseIds() {
    return roads.personas.find((p) => p.id === state.personaId)?.phases || [];
  }

  function stopAutoplay() {
    if (state.autoTimer) window.clearTimeout(state.autoTimer);
    if (state.explainTimer) window.clearTimeout(state.explainTimer);
    state.autoTimer = null;
    state.explainTimer = null;
  }

  function scheduleNext() {
    stopAutoplay();
    if (!state.isPlaying) return;
    const dwell = roads.series?.dwellMs ?? 9000;
    state.autoTimer = window.setTimeout(() => {
      if (!state.isPlaying) return;
      const ids = currentPhaseIds();
      if (state.phaseIndex >= ids.length - 1) {
        state.isPlaying = false;
        syncPlayButton(false);
        speak(roads.guide, "Series complete. Download any deck from the detail panel — or replay Full series.");
        return;
      }
      goToPhase(state.phaseIndex + 1, { autoContinue: true });
    }, dwell);
  }

  function goToPhase(index, options) {
    const autoContinue = Boolean(options?.autoContinue);
    const ids = currentPhaseIds();
    if (index < 0 || index >= ids.length) {
      speak(roads.guide, "End of this cut. Choose Full series to hear every document.");
      state.phaseIndex = Math.max(0, ids.length - 1);
      renderSeriesChrome(roads, state);
      state.isPlaying = false;
      syncPlayButton(false);
      return;
    }
    const previousIndex = state.phaseIndex;
    state.phaseIndex = index;
    const phase = roads.phases[ids[index]];
    const previousPhase = previousIndex !== index ? roads.phases[ids[previousIndex]] : null;
    const shouldWarp = state.isGuiding && index !== previousIndex;
    const pathStops = ids.map((phaseId, stopIndex) => ({
      id: roads.phases[phaseId]?.deckId || phaseId,
      title: roads.phases[phaseId]?.title || phaseId,
      index: stopIndex,
    }));
    const fromWorld = parkBesideDeck(previousPhase?.deckId, previousIndex) || mesh.position.clone();
    const toWorld = parkBesideDeck(phase.deckId, index) || fromWorld.clone();

    if (shouldWarp && typeof hooks.hyperspaceJump === "function") {
      mesh.visible = true;
      hooks.hyperspaceJump({
        fromTitle: previousPhase?.title || "Series start",
        fromId: previousPhase?.deckId || "START",
        toTitle: phase.title,
        toId: phase.deckId || phase.title,
        episode: `Flying ${previousIndex + 1} → ${index + 1} of ${ids.length}`,
        pathStops,
        fromIndex: previousIndex,
        toIndex: index,
        fromWorld,
        toWorld,
      });
      beginWarpFlight(fromWorld, toWorld);
      speak(roads.guide, `Watch the gold road: ${previousPhase?.title || "Start"} → ${phase.title}.`);
    }

    const titleEl = document.getElementById("azirem-phase-title");
    if (titleEl) titleEl.textContent = phase.title;
    renderSeriesChrome(roads, state);
    if (!shouldWarp) speak(roads.guide, phase.say);

    const arriveMs = shouldWarp ? WARP_MS : 0;
    window.setTimeout(() => arriveAtPhase(phase), arriveMs);

    const explainDelay = (roads.series?.explainDelayMs ?? 700) + arriveMs;
    state.explainTimer = window.setTimeout(() => {
      if (shouldWarp) speak(roads.guide, phase.say);
      if (phase.explain) {
        window.setTimeout(() => {
          if (phase.explain) speak(roads.guide, phase.explain);
        }, 1600);
      }
      if (autoContinue) scheduleNext();
    }, explainDelay);
  }

  function parkBesideDeck(deckId, sideIndex = state.phaseIndex) {
    if (!deckId) return null;
    const node = hooks.findMeshById(deckId);
    if (!node) return null;
    const radius = node.userData.radius ?? node.geometry?.parameters?.radius ?? 1;
    const side = sideIndex % 2 === 0 ? 1 : -1;
    const outward = node.position.clone().normalize();
    if (outward.lengthSq() < 0.01) outward.set(1, 0, 0);
    const tangent = new THREE.Vector3(-outward.z, 0, outward.x).normalize();
    return node.position.clone()
      .add(tangent.multiplyScalar(side * (radius + PARK_GAP)))
      .add(new THREE.Vector3(0, radius * 0.35 + 0.4, 0));
  }

  function beginWarpFlight(fromWorld, toWorld) {
    const mid = fromWorld.clone().lerp(toWorld, 0.5);
    const span = fromWorld.distanceTo(toWorld);
    mid.y += Math.min(6, span * 0.18);
    state.warpCurve = new THREE.CatmullRomCurve3([fromWorld.clone(), mid, toWorld.clone()]);
    state.warpStartMs = performance.now();
    state.flightTarget = null;
    mesh.position.copy(fromWorld);
    state.lookTarget.copy(toWorld);
    state.isChasing = true;
    hooks.setChaseActive?.(true);
  }

  function arriveAtPhase(phase) {
    if (!phase.deckId) return;
    const existing = hooks.findMeshById(phase.deckId);
    if (existing) {
      flyBesideDeck(phase.deckId);
      if (typeof hooks.selectById === "function") hooks.selectById(phase.deckId);
      return;
    }
    if (typeof hooks.focusTier === "function") hooks.focusTier("B");
    window.setTimeout(() => {
      flyBesideDeck(phase.deckId);
      if (typeof hooks.selectById === "function") hooks.selectById(phase.deckId);
    }, 1000);
  }

  function flyBesideDeck(deckId) {
    const park = parkBesideDeck(deckId);
    const node = hooks.findMeshById(deckId);
    if (!park || !node) {
      speak(roads.guide, `Document ${deckId} not in this sky — open Filters → Tier B → Pillars.`);
      return;
    }
    state.warpCurve = null;
    state.flightTarget = park;
    state.lookTarget.copy(node.position);
    mesh.visible = true;
    state.isChasing = true;
    hooks.setChaseActive?.(true);
    hooks.markInteraction?.();
  }

  function updateChaseCamera() {
    if (!state.isChasing || !hooks.camera || !hooks.controls || !mesh.visible) return;
    const back = new THREE.Vector3(0, CHASE_UP, -CHASE_BACK).applyQuaternion(mesh.quaternion);
    const desiredCam = mesh.position.clone().add(back);
    hooks.camera.position.lerp(desiredCam, 0.08);
    const ahead = new THREE.Vector3(0, 0, CHASE_LOOK_AHEAD).applyQuaternion(mesh.quaternion);
    const look = mesh.position.clone().add(ahead).lerp(state.lookTarget, 0.45);
    hooks.controls.target.lerp(look, 0.1);
  }

  function updateOverviewCamera(progress) {
    if (!hooks.camera || !hooks.controls || !state.warpCurve) return;
    const start = state.warpCurve.getPointAt(0);
    const end = state.warpCurve.getPointAt(1);
    const mid = state.warpCurve.getPointAt(0.5);
    const ship = state.warpCurve.getPointAt(progress);
    const span = Math.max(8, start.distanceTo(end));
    const side = new THREE.Vector3().subVectors(end, start).cross(new THREE.Vector3(0, 1, 0));
    if (side.lengthSq() < 0.001) side.set(1, 0, 0);
    side.normalize();
    const overview = mid.clone()
      .add(side.multiplyScalar(span * 0.7))
      .add(new THREE.Vector3(0, span * 0.42 + 6, 0));
    const chase = ship.clone().add(new THREE.Vector3(0, CHASE_UP + 1.2, -CHASE_BACK - 1.5).applyQuaternion(mesh.quaternion));
    const blend = progress < 0.18 ? 0 : progress > 0.82 ? (progress - 0.82) / 0.18 : 0;
    const desiredCam = overview.clone().lerp(chase, blend);
    hooks.camera.position.lerp(desiredCam, 0.1);
    const look = mid.clone().lerp(ship, 0.55).lerp(end, progress * 0.35);
    hooks.controls.target.lerp(look, 0.12);
  }

  function updateWarpFlight() {
    if (!state.warpCurve) return false;
    const elapsed = performance.now() - state.warpStartMs;
    const t = Math.min(1, elapsed / WARP_MS);
    const eased = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
    const point = state.warpCurve.getPointAt(eased);
    const tangent = state.warpCurve.getTangentAt(eased).normalize();
    mesh.position.copy(point);
    const desired = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    mesh.quaternion.slerp(desired, 0.2);
    state.lookTarget.copy(state.warpCurve.getPointAt(Math.min(1, eased + 0.08)));
    updateOverviewCamera(eased);
    if (t >= 1) state.warpCurve = null;
    return true;
  }

  function update(time, deltaMs) {
    if (!mesh.visible) return;
    const t = time * 0.001;
    (mesh.userData.engineMats || []).forEach((mat) => {
      mat.emissiveIntensity = 0.75 + Math.sin(t * 8) * 0.25;
    });
    if (mesh.userData.eye?.material) {
      mesh.userData.eye.material.emissiveIntensity = 0.4 + Math.sin(t * 3) * 0.2;
    }
    if (updateWarpFlight()) return;
    if (!state.flightTarget) {
      mesh.position.y += Math.sin(t * 2) * 0.002;
      updateChaseCamera();
      return;
    }
    const hover = new THREE.Vector3(
      state.flightTarget.x,
      state.flightTarget.y + Math.sin(t * 2.2) * HOVER_AMP,
      state.flightTarget.z
    );
    mesh.position.lerp(hover, Math.min(1, FLIGHT_SPEED * (deltaMs / 16)));
    const toLook = state.lookTarget.clone().sub(mesh.position);
    if (toLook.lengthSq() > 0.0001) {
      toLook.normalize();
      const desired = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toLook);
      mesh.quaternion.slerp(desired, 0.1);
    }
    mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, Math.sin(t * 1.4) * 0.06, 0.05);
    updateChaseCamera();
  }

  return {
    update,
    mesh,
    get isChasing() { return state.isChasing; },
    releaseChase() { state.isChasing = false; },
  };
}

async function loadRoads() {
  const response = await fetch("public/azirem-roads.json");
  if (!response.ok) throw new Error(`azirem-roads HTTP ${response.status}`);
  return response.json();
}

function speak(guide, text) {
  const bubble = document.getElementById("azirem-speech");
  const name = document.getElementById("azirem-name");
  if (name) name.textContent = guide.name;
  if (bubble) {
    bubble.textContent = text;
    bubble.classList.remove("is-live");
    void bubble.offsetWidth;
    bubble.classList.add("is-live");
  }
}

function showGuide(isOpen) {
  const panel = document.getElementById("azirem-panel");
  const openBtn = document.getElementById("azirem-open");
  if (!panel) return;
  panel.classList.toggle("is-open", isOpen);
  panel.setAttribute("aria-hidden", String(!isOpen));
  openBtn?.setAttribute("aria-expanded", String(isOpen));
}

function syncPlayButton(isPlaying) {
  const startBtn = document.getElementById("azirem-start");
  if (!startBtn) return;
  startBtn.textContent = isPlaying ? "Pause" : "Start tour";
  startBtn.dataset.playing = String(isPlaying);
}

function renderSeriesChrome(roads, state) {
  const ids = roads.personas.find((p) => p.id === state.personaId)?.phases || [];
  const total = ids.length;
  const current = Math.min(state.phaseIndex + 1, total);
  const phase = roads.phases[ids[state.phaseIndex]];
  const episodeEl = document.getElementById("azirem-episode");
  if (episodeEl) {
    episodeEl.textContent = state.isGuiding
      ? `Stop ${current} of ${total}`
      : `One button · ${total} documents · gold road between each`;
  }
  const stepEl = document.getElementById("azirem-step");
  if (stepEl) {
    stepEl.textContent = state.isGuiding && phase
      ? `Now: ${phase.title}`
      : `Ready · ${total} stops`;
  }
  const buildEl = document.getElementById("azirem-build");
  if (buildEl) {
    const pct = total ? Math.round((state.phaseIndex / Math.max(total - 1, 1)) * 100) : 0;
    buildEl.style.width = `${state.isGuiding ? pct : 0}%`;
  }
}

function bindGuideUi(roads, handlers, state) {
  document.getElementById("azirem-open")?.addEventListener("click", () => showGuide(true));
  document.getElementById("azirem-close")?.addEventListener("click", () => handlers.onDismiss());
  document.getElementById("azirem-start")?.addEventListener("click", () => {
    const startBtn = document.getElementById("azirem-start");
    if (startBtn?.dataset.playing === "true") handlers.onPause();
    else handlers.onStart();
  });
  document.getElementById("azirem-next")?.addEventListener("click", () => handlers.onNext());
  void roads;
  void state;
}
