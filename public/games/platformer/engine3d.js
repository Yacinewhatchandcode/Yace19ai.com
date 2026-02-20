// ═══════════════════════════════════════════════════════════════
// PRIME.AI PS3 3D Engine — Core + Title Screen + Menu
// ═══════════════════════════════════════════════════════════════
const C = document.getElementById('game');
const X = C.getContext('2d');
const cursor = document.getElementById('custom-cursor');

// Resize
function resize() { C.width = window.innerWidth; C.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

// Custom cursor
document.addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; });
document.addEventListener('mousedown', () => cursor.classList.add('click'));
document.addEventListener('mouseup', () => cursor.classList.remove('click'));

// State
const ST = { TITLE: 0, LEVELS: 1, CONTROLS: 2, PLAYING: 3, PAUSED: 4, GAMEOVER: 5, CLEAR: 6 };
let state = ST.TITLE, menuSel = 0, pauseSel = 0, lvlSel = 0;
let score = 0, coins = 0, lives = 3, timer = 400, curLvl = 0;
let timerInt = null, player, cam, enemies, fcoins, particles, fireballs, popups, tileMap, questionHit;
const TS = 48; // tile size

// Input
const keys = {}; let kEdge = {};
window.addEventListener('keydown', e => { if (!keys[e.code]) kEdge[e.code] = true; keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Gamepad
let gpOn = false, gpIdx = null, gpPrev = {};
window.addEventListener('gamepadconnected', e => { gpOn = true; gpIdx = e.gamepad.index; });
window.addEventListener('gamepaddisconnected', () => { gpOn = false; });
function pollGP() {
    if (!gpOn) return { s: {}, e: {} };
    const g = navigator.getGamepads()[gpIdx]; if (!g) return { s: {}, e: {} };
    const s = {
        l: g.axes[0] < -0.5 || (g.buttons[14] && g.buttons[14].pressed), r: g.axes[0] > 0.5 || (g.buttons[15] && g.buttons[15].pressed),
        u: g.axes[1] < -0.5 || (g.buttons[12] && g.buttons[12].pressed), d: g.axes[1] > 0.5 || (g.buttons[13] && g.buttons[13].pressed),
        j: g.buttons[0] && g.buttons[0].pressed, b: g.buttons[1] && g.buttons[1].pressed, st: g.buttons[9] && g.buttons[9].pressed
    };
    const e = {}; for (const k in s) e[k] = s[k] && !gpPrev[k]; gpPrev = { ...s }; return { s, e };
}

// ═══ 3D HELPERS ═══
function drawGlow(x, y, r, color, alpha = 0.5) { const g = X.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba')); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(x - r, y - r, r * 2, r * 2); }
function draw3DBox(x, y, w, h, faceColor, topColor, rightColor, depth = 8) {
    X.fillStyle = faceColor; X.fillRect(x, y, w, h);
    X.fillStyle = topColor; X.beginPath(); X.moveTo(x, y); X.lineTo(x + depth, y - depth); X.lineTo(x + w + depth, y - depth); X.lineTo(x + w, y); X.fill();
    X.fillStyle = rightColor; X.beginPath(); X.moveTo(x + w, y); X.lineTo(x + w + depth, y - depth); X.lineTo(x + w + depth, y + h - depth); X.lineTo(x + w, y + h); X.fill();
}
function drawGloss(x, y, w, h) { const g = X.createLinearGradient(x, y, x, y + h * 0.5); g.addColorStop(0, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); X.fillStyle = g; X.fillRect(x, y, w, h * 0.5); }
function drawShadow(x, y, w) { X.fillStyle = 'rgba(0,0,0,0.35)'; X.beginPath(); X.ellipse(x + w / 2, y, w * 0.6, 6, 0, 0, Math.PI * 2); X.fill(); }

// ═══ PARTICLE SYSTEM (3D-style) ═══
class Spark {
    constructor(x, y, c) { this.x = x; this.y = y; this.vx = (Math.random() - 0.5) * 4; this.vy = -Math.random() * 5 - 2; this.c = c; this.life = 60; this.s = Math.random() * 4 + 2; }
    update() { this.x += this.vx; this.y += this.vy; this.vy += 0.12; this.life--; }
    draw() { const a = this.life / 60; X.globalAlpha = a; X.fillStyle = this.c; X.shadowBlur = 8; X.shadowColor = this.c; X.fillRect(this.x, this.y, this.s, this.s); X.shadowBlur = 0; X.globalAlpha = 1; }
}
let sparks = [];

// ═══ TITLE SCREEN ═══
let titleParticles = [];
function initTitle() { titleParticles = []; for (let i = 0; i < 200; i++)titleParticles.push({ x: Math.random() * C.width, y: Math.random() * C.height, z: Math.random() * 3 + 0.5, s: Math.random() * 2 + 1, b: Math.random() }); }
initTitle();

function drawTitle() {
    const t = Date.now() * 0.001;
    // Deep space gradient
    const bg = X.createLinearGradient(0, 0, 0, C.height);
    bg.addColorStop(0, '#020010'); bg.addColorStop(0.5, '#0a0030'); bg.addColorStop(1, '#000015');
    X.fillStyle = bg; X.fillRect(0, 0, C.width, C.height);
    // Stars with depth
    titleParticles.forEach(p => {
        p.y += p.z * 0.3; if (p.y > C.height) { p.y = 0; p.x = Math.random() * C.width; }
        const a = 0.3 + 0.7 * Math.sin(t * 2 + p.b * 10); X.globalAlpha = a * p.z / 3; X.fillStyle = p.z > 2 ? '#00d4ff' : '#fff'; X.fillRect(p.x, p.y, p.s * p.z * 0.5, p.s * p.z * 0.5);
    });
    X.globalAlpha = 1;
    // Volumetric light beam
    const lg = X.createRadialGradient(C.width / 2, C.height * 0.25, 0, C.width / 2, C.height * 0.25, C.width * 0.6);
    lg.addColorStop(0, 'rgba(0,100,255,0.08)'); lg.addColorStop(0.5, 'rgba(0,50,255,0.03)'); lg.addColorStop(1, 'rgba(0,0,0,0)');
    X.fillStyle = lg; X.fillRect(0, 0, C.width, C.height);
    // Ground reflection
    const gy = C.height * 0.82;
    X.fillStyle = 'rgba(0,150,255,0.03)'; X.fillRect(0, gy, C.width, C.height - gy);
    X.strokeStyle = 'rgba(0,200,255,0.15)'; X.lineWidth = 1;
    for (let i = 0; i < 20; i++) { const ly = gy + i * ((C.height - gy) / 20); X.globalAlpha = 1 - i / 20; X.beginPath(); X.moveTo(0, ly); X.lineTo(C.width, ly); X.stroke(); }
    X.globalAlpha = 1;
    // 3D perspective grid floor
    X.strokeStyle = 'rgba(0,150,255,0.1)';
    for (let i = 0; i < 30; i++) { const xo = (i - 15) * 60 + Math.sin(t) * 5; const x1 = C.width / 2 + xo * 0.2; const x2 = C.width / 2 + xo * 3; X.beginPath(); X.moveTo(x1, gy); X.lineTo(x2, C.height); X.stroke(); }
    // Title logo with 3D extrusion
    X.textAlign = 'center';
    const logoY = C.height * 0.28 + Math.sin(t * 1.5) * 8;
    // Shadow layers
    for (let i = 6; i > 0; i--) { X.fillStyle = `rgba(255,0,50,${0.03 * i})`; X.font = `900 ${Math.min(C.width * 0.1, 120)}px Orbitron`; X.fillText('PRIME.AI', C.width / 2 + i * 2, logoY + i * 2); }
    // Main title
    const tg = X.createLinearGradient(C.width / 2 - 200, logoY - 40, C.width / 2 + 200, logoY + 20);
    tg.addColorStop(0, '#ff0044'); tg.addColorStop(0.5, '#ff4488'); tg.addColorStop(1, '#ff0044');
    X.fillStyle = tg; X.font = `900 ${Math.min(C.width * 0.1, 120)}px Orbitron`; X.fillText('PRIME.AI', C.width / 2, logoY);
    // Gloss on text
    X.globalAlpha = 0.2; X.fillStyle = '#fff'; X.fillRect(C.width / 2 - 200, logoY - 50, 400, 30); X.globalAlpha = 1;
    // Subtitle
    X.font = '500 18px Orbitron'; X.fillStyle = '#00d4ff'; X.shadowBlur = 15; X.shadowColor = '#00d4ff';
    X.fillText('THE SOVEREIGN PLATFORMER', C.width / 2, logoY + 40); X.shadowBlur = 0;
    // PS3-style XMB menu
    const menuItems = ['START GAME', 'WORLD SELECT', 'CONTROLS', 'OPTIONS'];
    const my = C.height * 0.55;
    menuItems.forEach((item, i) => {
        const sel = i === menuSel; const iy = my + i * 55;
        if (sel) {
            // Selection bar (PS3 style glass)
            const sg = X.createLinearGradient(C.width / 2 - 200, iy - 18, C.width / 2 - 200, iy + 18);
            sg.addColorStop(0, 'rgba(0,150,255,0.3)'); sg.addColorStop(0.5, 'rgba(0,100,255,0.15)'); sg.addColorStop(1, 'rgba(0,150,255,0.3)');
            X.fillStyle = sg; roundRect(C.width / 2 - 200, iy - 18, 400, 36, 8);
            X.strokeStyle = 'rgba(0,200,255,0.6)'; X.lineWidth = 1; roundRectStroke(C.width / 2 - 200, iy - 18, 400, 36, 8);
            // Glow
            drawGlow(C.width / 2, iy, 250, 'rgb(0,150,255)', 0.08);
            X.fillStyle = '#fff'; X.font = '600 16px Orbitron';
        } else {
            X.fillStyle = 'rgba(255,255,255,0.4)'; X.font = '500 14px Orbitron';
        }
        X.textAlign = 'center'; X.fillText(item, C.width / 2, iy + 5);
    });
    // Button prompts
    X.font = '400 12px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.3)';
    X.fillText('ENTER / A — Select    ↑↓ — Navigate    GAMEPAD SUPPORTED', C.width / 2, C.height * 0.92);
    // Copyright
    X.font = '400 11px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.15)';
    X.fillText('© 2026 PRIME.AI SOVEREIGN SYSTEMS — ALL RIGHTS RESERVED', C.width / 2, C.height * 0.97);
    X.textAlign = 'left';
}

function roundRect(x, y, w, h, r) { X.beginPath(); X.moveTo(x + r, y); X.lineTo(x + w - r, y); X.quadraticCurveTo(x + w, y, x + w, y + r); X.lineTo(x + w, y + h - r); X.quadraticCurveTo(x + w, y + h, x + w - r, y + h); X.lineTo(x + r, y + h); X.quadraticCurveTo(x, y + h, x, y + h - r); X.lineTo(x, y + r); X.quadraticCurveTo(x, y, x + r, y); X.closePath(); X.fill(); }
function roundRectStroke(x, y, w, h, r) { X.beginPath(); X.moveTo(x + r, y); X.lineTo(x + w - r, y); X.quadraticCurveTo(x + w, y, x + w, y + r); X.lineTo(x + w, y + h - r); X.quadraticCurveTo(x + w, y + h, x + w - r, y + h); X.lineTo(x + r, y + h); X.quadraticCurveTo(x, y + h, x, y + h - r); X.lineTo(x, y + r); X.quadraticCurveTo(x, y, x + r, y); X.closePath(); X.stroke(); }

// ═══ LEVEL SELECT ═══
const WORLDS = [{ n: '1-1', t: 'NEURAL PLAINS', c1: '#0066ff', c2: '#00cc44' }, { n: '2-1', t: 'CYBER CAVERNS', c1: '#3300aa', c2: '#ff00aa' }, { n: '3-1', t: 'SOVEREIGN SKY', c1: '#ff6600', c2: '#ffcc00' }, { n: '4-1', t: 'OVERDRIVE', c1: '#ff0033', c2: '#000', locked: true }];
function drawLevels() {
    X.fillStyle = '#050510'; X.fillRect(0, 0, C.width, C.height);
    X.textAlign = 'center'; X.font = '700 28px Orbitron'; X.fillStyle = '#00d4ff'; X.shadowBlur = 10; X.shadowColor = '#00d4ff';
    X.fillText('SELECT WORLD', C.width / 2, 60); X.shadowBlur = 0;
    const cw = 200, ch = 140, gap = 30, totalW = WORLDS.length * (cw + gap) - gap;
    const sx = (C.width - totalW) / 2;
    WORLDS.forEach((w, i) => {
        const wx = sx + i * (cw + gap), wy = C.height / 2 - ch / 2;
        const sel = i === lvlSel;
        // Card with 3D depth
        if (sel) { drawGlow(wx + cw / 2, wy + ch / 2, cw, 'rgb(0,150,255)', 0.15); X.strokeStyle = 'rgba(0,200,255,0.8)'; X.lineWidth = 2; }
        else { X.strokeStyle = 'rgba(255,255,255,0.1)'; X.lineWidth = 1; }
        // Card face
        const cg = X.createLinearGradient(wx, wy, wx, wy + ch); cg.addColorStop(0, w.c1); cg.addColorStop(1, w.c2);
        X.fillStyle = cg; roundRect(wx, wy, cw, ch, 10); roundRectStroke(wx, wy, cw, ch, 10);
        drawGloss(wx, wy, cw, ch);
        if (w.locked) { X.globalAlpha = 0.5; X.fillStyle = 'rgba(0,0,0,0.7)'; roundRect(wx, wy, cw, ch, 10); X.globalAlpha = 1; X.font = '600 36px Rajdhani'; X.fillStyle = '#fff'; X.fillText('🔒', wx + cw / 2, wy + ch / 2 + 12); }
        X.font = sel ? '700 16px Orbitron' : '600 13px Orbitron'; X.fillStyle = '#fff'; X.fillText(w.n, wx + cw / 2, wy + ch + 30);
        X.font = '400 12px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.5)'; X.fillText(w.t, wx + cw / 2, wy + ch + 48);
    });
    X.font = '400 13px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.3)'; X.fillText('← → SELECT    ENTER CONFIRM    ESC BACK', C.width / 2, C.height - 40);
    X.textAlign = 'left';
}

// ═══ CONTROLS SCREEN ═══
function drawControls() {
    X.fillStyle = '#050510'; X.fillRect(0, 0, C.width, C.height);
    X.textAlign = 'center'; X.font = '700 28px Orbitron'; X.fillStyle = '#00d4ff'; X.shadowBlur = 10; X.shadowColor = '#00d4ff';
    X.fillText('CONTROLS', C.width / 2, 60); X.shadowBlur = 0;
    const rows = [['← → / A D', 'MOVE'], ['SPACE / W', 'JUMP'], ['SHIFT', 'RUN / FIRE'], ['↓ / S', 'DUCK'], ['P / ESC', 'PAUSE'], ['M', 'MUTE'], ['', ''], ['🎮 D-PAD', 'MOVE'], ['🎮 A / ×', 'JUMP'], ['🎮 B / ○', 'RUN / FIRE'], ['🎮 START', 'PAUSE']];
    const sy = 120;
    rows.forEach((r, i) => {
        if (!r[0]) { X.strokeStyle = 'rgba(255,255,255,0.1)'; X.beginPath(); X.moveTo(C.width / 2 - 180, sy + i * 36); X.lineTo(C.width / 2 + 180, sy + i * 36); X.stroke(); return; }
        X.font = '600 14px Rajdhani'; X.fillStyle = '#00d4ff'; X.textAlign = 'left'; X.fillText(r[0], C.width / 2 - 180, sy + i * 36);
        X.fillStyle = 'rgba(255,255,255,0.5)'; X.textAlign = 'right'; X.fillText(r[1], C.width / 2 + 180, sy + i * 36);
    });
    X.textAlign = 'center'; X.font = '400 13px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.3)'; X.fillText('ESC — BACK', C.width / 2, C.height - 40);
    X.textAlign = 'left';
}

// ═══ HUD (PS3 glass style) ═══
function drawHUD() {
    // Glass bar
    const hg = X.createLinearGradient(0, 0, 0, 50); hg.addColorStop(0, 'rgba(0,0,0,0.85)'); hg.addColorStop(1, 'rgba(0,20,40,0.7)');
    X.fillStyle = hg; X.fillRect(0, 0, C.width, 50);
    X.strokeStyle = 'rgba(0,200,255,0.3)'; X.lineWidth = 1; X.beginPath(); X.moveTo(0, 50); X.lineTo(C.width, 50); X.stroke();
    // Glow line
    const lg2 = X.createLinearGradient(0, 48, 0, 52); lg2.addColorStop(0, 'rgba(0,200,255,0.4)'); lg2.addColorStop(1, 'rgba(0,200,255,0)');
    X.fillStyle = lg2; X.fillRect(0, 48, C.width, 4);
    X.textAlign = 'center';
    const items = [{ l: 'SCORE', v: String(score).padStart(6, '0') }, { l: 'COINS', v: '×' + String(coins).padStart(2, '0') }, { l: 'WORLD', v: LEVELS[curLvl]?.name || '1-1' }, { l: 'TIME', v: String(Math.max(0, timer)) }, { l: 'LIVES', v: '×' + String(lives).padStart(2, '0') }];
    const spacing = C.width / (items.length + 1);
    items.forEach((it, i) => {
        const ix = spacing * (i + 1);
        X.font = '500 10px Orbitron'; X.fillStyle = 'rgba(0,200,255,0.6)'; X.fillText(it.l, ix, 18);
        X.font = '700 16px Orbitron'; X.fillStyle = '#fff'; X.fillText(it.v, ix, 38);
    });
    X.textAlign = 'left';
}

// ═══ PAUSE / GAMEOVER / CLEAR OVERLAYS ═══
function drawOverlay(title, titleColor, items, sel, extra) {
    X.fillStyle = 'rgba(0,0,0,0.8)'; X.fillRect(0, 0, C.width, C.height);
    // Glass card
    const bw = 400, bh = items ? items.length * 50 + 120 : 200, bx = (C.width - bw) / 2, by = (C.height - bh) / 2;
    X.fillStyle = 'rgba(10,15,30,0.9)'; roundRect(bx, by, bw, bh, 12);
    X.strokeStyle = 'rgba(0,200,255,0.3)'; X.lineWidth = 1; roundRectStroke(bx, by, bw, bh, 12);
    drawGloss(bx, by, bw, bh);
    X.textAlign = 'center'; X.font = '700 24px Orbitron'; X.fillStyle = titleColor; X.shadowBlur = 15; X.shadowColor = titleColor;
    X.fillText(title, C.width / 2, by + 50); X.shadowBlur = 0;
    if (extra) { X.font = '500 14px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.6)'; X.fillText(extra, C.width / 2, by + 75); }
    if (items) {
        items.forEach((it, i) => {
            const iy = by + 100 + i * 50; const s = i === sel;
            if (s) { const sg = X.createLinearGradient(bx + 20, iy - 14, bx + 20, iy + 14); sg.addColorStop(0, 'rgba(0,150,255,0.25)'); sg.addColorStop(1, 'rgba(0,100,255,0.1)'); X.fillStyle = sg; roundRect(bx + 20, iy - 14, bw - 40, 28, 6); }
            X.font = s ? '600 15px Orbitron' : '500 13px Orbitron'; X.fillStyle = s ? '#fff' : 'rgba(255,255,255,0.4)'; X.fillText(it, C.width / 2, iy + 5);
        });
    }
    X.font = '400 12px Rajdhani'; X.fillStyle = 'rgba(255,255,255,0.25)'; X.fillText('ENTER — SELECT', C.width / 2, by + bh - 20);
    X.textAlign = 'left';
}

// Forward declarations for game logic (loaded from engine3d_game.js)
// ... continued in part 2
