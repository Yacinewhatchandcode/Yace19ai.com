(() => {
  const matrix = location.pathname.startsWith('/sovereign/');
  const platformer = location.pathname.includes('/platformer/');
  const swarm = location.pathname.includes('/swarm-architect/');
  const canvasGame = matrix || platformer || swarm;
  if (canvasGame) document.body.classList.add('canvas-archive');
  const banner = document.createElement('aside');
  banner.className = 'archive-banner';
  banner.innerHTML = '<a href="/games">Games</a><span>Local · Illustrative · EN</span>';
  document.body.prepend(banner);

  if (matrix) {
    document.body.classList.add('matrix-archive');
    const labels = new MutationObserver(() => {
      const status = document.querySelector('.hud-status');
      const instructions = document.querySelector('.hud-controls');
      if (status && instructions) {
        status.textContent = 'Illustrative · Offline';
        instructions.textContent = 'WASD · Move';
        labels.disconnect();
      }
    });
    labels.observe(document.body, { childList: true, subtree: true });
    // The archived compiled scene otherwise posts to an unrelated service on port 8000.
    for (const type of ['keydown', 'keyup']) {
      window.addEventListener(type, event => {
        if (event.code === 'KeyE' || event.code === 'Space' || event.key.toLowerCase() === 'e' || event.key === ' ') {
          event.preventDefault();
          event.stopImmediatePropagation();
          banner.querySelector('span').textContent = 'Offline. Execution disabled.';
        }
      }, true);
    }
  }
  if (!canvasGame) return;
  const controls = document.createElement('div');
  controls.className = 'touch-controls';
  controls.setAttribute('aria-label', 'Game touch and keyboard controls');
  const mappings = matrix ? [['W', 'KeyW', 'w'], ['A', 'KeyA', 'a'], ['S', 'KeyS', 's'], ['D', 'KeyD', 'd']]
    : swarm ? [['Up', 'KeyW', 'w'], ['Left', 'KeyA', 'a'], ['Down', 'KeyS', 's'], ['Right', 'KeyD', 'd']]
      : [['Start', 'Enter', 'Enter'], ['↑', 'ArrowUp', 'ArrowUp'], ['↓', 'ArrowDown', 'ArrowDown'],
        ['←', 'ArrowLeft', 'ArrowLeft'], ['→', 'ArrowRight', 'ArrowRight'],
        ['Jump', 'Space', ' '], ['Run', 'ShiftLeft', 'Shift'], ['Pause', 'KeyP', 'p'], ['Mute', 'KeyM', 'm'],
        ['Back', 'Escape', 'Escape']];
  for (const [label, code, key] of mappings) {
    const button = document.createElement('button');
    button.textContent = label;
    button.type = 'button';
    const arrowLabels = { '←': 'Left', '→': 'Right', '↑': 'Up', '↓': 'Down' };
    button.setAttribute('aria-label', arrowLabels[label] || label);
    const emit = type => window.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true }));
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      emit('keydown');
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, () => emit('keyup'));
    }
    button.addEventListener('keydown', event => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        emit('keydown');
      }
    });
    button.addEventListener('keyup', event => {
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        emit('keyup');
      }
    });
    controls.append(button);
  }
  document.body.append(controls);
})();
