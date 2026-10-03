(function initHomeStatus() {
  "use strict";

  const FALLBACK = {
    11434: true,
    4222: true,
    6333: true,
    7474: true,
    7070: null,
    7071: null,
    7072: null,
    9999: null,
    8787: true,
  };

  const PROBE_PATH = {
    11434: "/",
    6333: "/",
    7474: "/",
    7070: "/",
    7071: "/health",
    7072: "/",
    9999: "/",
    8787: "/home.html",
  };

  function isLocalOperatorHost() {
    const host = window.location.hostname;
    return host === "127.0.0.1" || host === "localhost" || host === "::1";
  }

  function setCell(row, label, isUp) {
    const cell = row.querySelector(".status-cell");
    if (!cell) return;
    cell.textContent = label;
    cell.classList.toggle("is-up", isUp === true);
    cell.classList.toggle("is-down", isUp === false);
    cell.classList.toggle("is-unknown", isUp === null);
  }

  async function probePort(port) {
    if (!isLocalOperatorHost()) {
      return null;
    }
    if (port === 4222) {
      return FALLBACK[4222] ?? null;
    }
    const path = PROBE_PATH[port];
    if (!path) return FALLBACK[port] ?? null;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1200);
    try {
      await fetch(`http://127.0.0.1:${port}${path}`, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-store",
      });
      window.clearTimeout(timer);
      return true;
    } catch (error) {
      window.clearTimeout(timer);
      if (FALLBACK[port] === true) return true;
      if (FALLBACK[port] === false) return false;
      return null;
    }
  }

  async function refresh() {
    const rows = document.querySelectorAll("#substrate-table tr[data-port]");
    if (!isLocalOperatorHost()) {
      rows.forEach((row) => setCell(row, "—", null));
      return;
    }
    await Promise.all(Array.from(rows).map(async (row) => {
      const port = Number(row.dataset.port);
      const isUp = await probePort(port);
      if (isUp === true) setCell(row, "UP", true);
      else if (isUp === false) setCell(row, "DOWN", false);
      else setCell(row, "CHECK", null);
    }));
  }

  refresh();
})();
