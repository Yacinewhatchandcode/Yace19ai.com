(function initPrimeShell() {
  "use strict";

  const MOBILE_BREAKPOINT = 720;
  const TABLET_BREAKPOINT = 1024;

  const body = document.body;
  const leftDrawer = document.getElementById("filter-drawer");
  const rightDrawer = document.getElementById("detail-panel");
  const scrim = document.getElementById("drawer-scrim");
  const leftToggle = document.getElementById("drawer-left-toggle");
  const leftClose = document.getElementById("filter-drawer-close");
  const detailClose = document.getElementById("detail-close");
  const helpToggle = document.getElementById("help-legend-toggle");
  const helpPanel = document.getElementById("help-legend");
  const helpClose = document.getElementById("help-legend-close");

  const state = {
    isLeftOpen: false,
    isRightOpen: false,
    isHelpOpen: false,
    isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
    isTablet: window.innerWidth <= TABLET_BREAKPOINT,
  };

  function isTreePage() {
    return body.classList.contains("page-tree");
  }

  function setExpanded(button, isExpanded) {
    if (!button) return;
    button.setAttribute("aria-expanded", String(isExpanded));
  }

  function setHidden(panel, isHidden) {
    if (!panel) return;
    panel.setAttribute("aria-hidden", String(isHidden));
  }

  function syncBodyClasses() {
    body.classList.toggle("drawer-left-open", state.isLeftOpen);
    body.classList.toggle("drawer-right-open", state.isRightOpen);
    body.classList.toggle("help-open", state.isHelpOpen);
    body.classList.toggle("drawer-scrim-visible", state.isLeftOpen || state.isRightOpen);
  }

  function openLeftDrawer() {
    state.isLeftOpen = true;
    setExpanded(leftToggle, true);
    setHidden(leftDrawer, false);
    syncBodyClasses();
  }

  function closeLeftDrawer() {
    state.isLeftOpen = false;
    setExpanded(leftToggle, false);
    setHidden(leftDrawer, true);
    syncBodyClasses();
  }

  function openRightDrawer() {
    state.isRightOpen = true;
    setHidden(rightDrawer, false);
    syncBodyClasses();
  }

  function callTreeApi(methodName, ...args) {
    const api = window.PrimeTreeAPI;
    const method = api && api[methodName];
    if (typeof method !== "function") return false;
    method.apply(api, args);
    return true;
  }

  function closeRightDrawer() {
    if (!callTreeApi("hideDetail") && rightDrawer) {
      rightDrawer.classList.add("is-hidden");
      setHidden(rightDrawer, true);
    }
    state.isRightOpen = false;
    syncBodyClasses();
  }

  function toggleLeftDrawer() {
    if (state.isLeftOpen) closeLeftDrawer();
    else openLeftDrawer();
  }

  function openHelpLegend() {
    state.isHelpOpen = true;
    setExpanded(helpToggle, true);
    setHidden(helpPanel, false);
    syncBodyClasses();
  }

  function closeHelpLegend() {
    state.isHelpOpen = false;
    setExpanded(helpToggle, false);
    setHidden(helpPanel, true);
    body.classList.remove("help-open");
  }

  function toggleHelpLegend() {
    if (state.isHelpOpen) closeHelpLegend();
    else openHelpLegend();
  }

  function handleResize() {
    state.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    state.isTablet = window.innerWidth > MOBILE_BREAKPOINT && window.innerWidth <= TABLET_BREAKPOINT;
    body.classList.toggle("is-mobile", state.isMobile);
    body.classList.toggle("is-tablet", state.isTablet);
    if (window.innerWidth > TABLET_BREAKPOINT) {
      closeLeftDrawer();
      if (leftDrawer) setHidden(leftDrawer, false);
    } else if (leftDrawer && !state.isLeftOpen) {
      setHidden(leftDrawer, true);
    }
  }

  function syncDetailDrawerFromPanel() {
    if (!rightDrawer || !isTreePage()) return;
    const isVisible = !rightDrawer.classList.contains("is-hidden");
    if (isVisible && !state.isRightOpen) {
      if (state.isMobile || state.isTablet) closeLeftDrawer();
      openRightDrawer();
    }
    if (!isVisible && state.isRightOpen) {
      state.isRightOpen = false;
      syncBodyClasses();
    }
  }

  function bindTreeChrome() {
    if (!isTreePage()) return;

    leftToggle?.addEventListener("click", toggleLeftDrawer);
    leftClose?.addEventListener("click", closeLeftDrawer);
    scrim?.addEventListener("click", () => {
      closeLeftDrawer();
      closeRightDrawer();
    });

    detailClose?.addEventListener("click", () => {
      closeRightDrawer();
    });

    if (rightDrawer) {
      const observer = new MutationObserver(syncDetailDrawerFromPanel);
      observer.observe(rightDrawer, { attributes: true, attributeFilter: ["class"] });
    }

    helpToggle?.addEventListener("click", toggleHelpLegend);
    helpClose?.addEventListener("click", closeHelpLegend);

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeHelpLegend();
      closeLeftDrawer();
      if (state.isRightOpen) closeRightDrawer();
    });
  }

  function initFilmReveal() {
    const cards = document.querySelectorAll(".film-card[data-reveal]");
    if (cards.length === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      cards.forEach((card) => card.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  function exposeShellAPI() {
    window.PrimeShell = {
      openFilters: openLeftDrawer,
      closeFilters: closeLeftDrawer,
      openDetail: openRightDrawer,
      closeDetail: closeRightDrawer,
      openLegend: openHelpLegend,
      closeLegend: closeHelpLegend,
    };
  }

  handleResize();
  bindTreeChrome();
  initFilmReveal();
  exposeShellAPI();
  window.addEventListener("resize", handleResize);

  function connectTreeApi() {
    callTreeApi("onReady", window.PrimeShell);
  }

  connectTreeApi();
  window.addEventListener("load", connectTreeApi, { once: true });
})();
