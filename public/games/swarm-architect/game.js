// ═══════════════════════════════════════════════════════════════
// PRIME.AI: SWARM ARCHITECT — Engine
// A Vampire-Survivors style auto-battler inspired by the 
// Digital Me themes (Samurai, Cyber CEO, Space Explorer).
// ═══════════════════════════════════════════════════════════════

const C = document.getElementById('game');
const X = C.getContext('2d');
function resize() { C.width = window.innerWidth; C.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();

// ═══ STATE & SETUP ═══
let state = 'TITLE'; // TITLE, PLAYING, LEVELUP, GAMEOVER
let time = 0, lastFrame = 0, kills = 0, level = 1, xp = 0, nextXp = 5;
let player, agents = [], enemies = [], gems = [], damageTexts = [], particles = [];
let camera = { x: 0, y: 0 };
const keys = { w: false, a: false, s: false, d: false };

// Listeners
window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });

let mouseX = C.width / 2, mouseY = C.height / 2;
let targetX = C.width / 2, targetY = C.height / 2;
C.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

// ═══ GAME OBJECTS ═══

class Player {
    constructor() {
        this.x = 0; this.y = 0;
        this.radius = 20;
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 3.5; // pixel per frame
        this.vx = 0; this.vy = 0;
    }
    update() {
        // Move towards mouse or use WASD
        let dx = 0, dy = 0;
        if (keys.w) dy -= 1; if (keys.s) dy += 1;
        if (keys.a) dx -= 1; if (keys.d) dx += 1;

        if (dx === 0 && dy === 0) {
            // Mouse follow
            const mx = mouseX + camera.x - C.width / 2;
            const my = mouseY + camera.y - C.height / 2;
            const dist = Math.hypot(mx - this.x, my - this.y);
            if (dist > 10) {
                dx = (mx - this.x) / dist;
                dy = (my - this.y) / dist;
            }
        } else {
            const mag = Math.hypot(dx, dy);
            dx /= mag; dy /= mag;
        }

        this.vx += (dx * this.speed - this.vx) * 0.1;
        this.vy += (dy * this.speed - this.vy) * 0.1;

        this.x += this.vx; this.y += this.vy;

        // Auto-heal slightly
        if (this.hp < this.maxHp && Math.random() < 0.02) this.hp += 1;
    }
    draw() {
        const px = this.x - camera.x + C.width / 2;
        const py = this.y - camera.y + C.height / 2;

        // Cyberpunk CEO Core (Glowing Orb)
        X.shadowBlur = 30; X.shadowColor = '#00f3ff';
        X.fillStyle = '#00f3ff';
        X.beginPath(); X.arc(px, py, this.radius, 0, Math.PI * 2); X.fill();

        X.shadowBlur = 10; X.fillStyle = '#fff';
        X.beginPath(); X.arc(px, py, this.radius * 0.6, 0, Math.PI * 2); X.fill();
        X.shadowBlur = 0;
    }
}

// ─── AGENTS (Avatars orbiting the core) ───
const AGENT_TYPES = {
    SAMURAI: { name: 'MODERN SAMURAI', color: '#ff0055', icon: '⚔️', desc: 'Melee orbital blade. High continuous damage around the core.', type: 'orbital', dmg: 20, speed: 0.1, dist: 80, cd: 0 },
    EXPLORER: { name: 'SPACE EXPLORER', color: '#ffcc00', icon: '🚀', desc: 'Fires lasers at the nearest target from medium range.', type: 'shooter', dmg: 15, speed: 0.05, dist: 120, cd: 60 },
    ARCHITECT: { name: 'ZEN ARCHITECT', color: '#00ffaa', icon: '⛩️', desc: 'Slow barrier aura that repels and damages enemies.', type: 'aura', dmg: 5, radius: 150, cd: 0 },
    ATHLETE: { name: 'CYBER ATHLETE', color: '#00f3ff', icon: '⚡', desc: 'Darts randomly between enemies at high speed.', type: 'ricochet', dmg: 35, speed: 12, cd: 0 }
};

class Agent {
    constructor(typeObj) {
        this.type = typeObj;
        this.lvl = 1;
        this.angle = Math.random() * Math.PI * 2;
        this.cdTimer = 0;
        this.x = player.x; this.y = player.y; // for athlete
        this.vx = 0; this.vy = 0;
        this.target = null;
    }
    update() {
        const t = this.type;
        // Orbital logic
        if (t.type === 'orbital' || t.type === 'shooter') {
            this.angle += t.speed * (1 + this.lvl * 0.1);
            this.x = player.x + Math.cos(this.angle) * (t.dist + this.lvl * 10);
            this.y = player.y + Math.sin(this.angle) * (t.dist + this.lvl * 10);
        }
        else if (t.type === 'aura') {
            this.x = player.x; this.y = player.y;
            this.angle += 0.02; // Visual spin
        }
        else if (t.type === 'ricochet') {
            this.x += this.vx; this.y += this.vy;
            if (!this.target || !this.target.alive) {
                this.target = getNearestEnemy(this.x, this.y, 400);
                if (this.target) {
                    const ang = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                    const sp = t.speed + this.lvl * 2;
                    this.vx = Math.cos(ang) * sp; this.vy = Math.sin(ang) * sp;
                } else {
                    this.vx *= 0.9; this.vy *= 0.9;
                    if (Math.hypot(this.x - player.x, this.y - player.y) > 200) {
                        this.x += (player.x - this.x) * 0.05; this.y += (player.y - this.y) * 0.05;
                    }
                }
            } else {
                if (Math.hypot(this.x - this.target.x, this.y - this.target.y) < 20) {
                    damageEnemy(this.target, t.dmg + this.lvl * 5, t.color);
                    this.target = null;
                }
            }
        }

        // Attacks
        if (t.type === 'orbital') {
            enemies.forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) < 30) {
                    damageEnemy(e, (t.dmg + this.lvl * 5) / 10, t.color); // continuous
                }
            });
        }
        else if (t.type === 'shooter') {
            this.cdTimer--;
            if (this.cdTimer <= 0) {
                const tr = getNearestEnemy(this.x, this.y, 300 + this.lvl * 50);
                if (tr) {
                    createLaser(this.x, this.y, tr, t.dmg * this.lvl, t.color);
                    this.cdTimer = t.cd / (1 + this.lvl * 0.2);
                    playSound('shoot');
                }
            }
        }
        else if (t.type === 'aura') {
            const rad = t.radius + this.lvl * 20;
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist < rad) {
                    damageEnemy(e, t.dmg + this.lvl, t.color); // very fast tick
                    // Repel
                    e.x += (e.x - this.x) / dist * (1 + this.lvl * 0.5);
                    e.y += (e.y - this.y) / dist * (1 + this.lvl * 0.5);
                }
            });
        }
    }
    draw() {
        const px = this.x - camera.x + C.width / 2;
        const py = this.y - camera.y + C.height / 2;
        const t = this.type;

        X.shadowBlur = 15; X.shadowColor = t.color;

        if (t.type === 'orbital') {
            X.fillStyle = t.color;
            X.save(); X.translate(px, py); X.rotate(this.angle * 5);
            X.fillRect(-10, -3, 20, 6);
            X.restore();
        }
        else if (t.type === 'shooter') {
            X.fillStyle = '#fff';
            X.beginPath(); X.arc(px, py, 6, 0, Math.PI * 2); X.fill();
            X.strokeStyle = t.color; X.lineWidth = 3;
            X.beginPath(); X.arc(px, py, 12, this.angle, this.angle + Math.PI); X.stroke();
        }
        else if (t.type === 'aura') {
            X.strokeStyle = t.color; X.lineWidth = 2;
            X.setLineDash([10, 20]);
            X.beginPath(); X.arc(px, py, t.radius + this.lvl * 20, this.angle, this.angle + Math.PI * 2); X.stroke();
            X.setLineDash([]);
        }
        else if (t.type === 'ricochet') {
            X.fillStyle = t.color;
            X.beginPath(); X.moveTo(px + 10, py); X.lineTo(px - 10, py - 5); X.lineTo(px - 10, py + 5); X.fill();
        }
        X.shadowBlur = 0;
    }
}

// ─── EFFECTS ───
let lasers = [];
function createLaser(x, y, target, dmg, color) {
    lasers.push({ x, y, tx: target.x, ty: target.y, color, life: 10 });
    damageEnemy(target, dmg, color);
}

// ─── ENEMIES & DROPS ───
class Enemy {
    constructor() {
        // Spawn edge of screen
        const r = Math.random();
        if (r < 0.25) { this.x = camera.x - 100; this.y = camera.y + Math.random() * C.height - C.height / 2; }
        else if (r < 0.5) { this.x = camera.x + C.width + 100; this.y = camera.y + Math.random() * C.height - C.height / 2; }
        else if (r < 0.75) { this.x = camera.x + Math.random() * C.width - C.width / 2; this.y = camera.y - 100; }
        else { this.x = camera.x + Math.random() * C.width - C.width / 2; this.y = camera.y + C.height + 100; }

        this.hp = 30 + Math.floor(time / 60) * 20; // scales with time
        this.maxHp = this.hp;
        this.speed = 1.5 + Math.random();
        this.alive = true;
        this.radius = 12;
    }
    update() {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        this.x += (player.x - this.x) / dist * this.speed;
        this.y += (player.y - this.y) / dist * this.speed;

        // Hit player
        if (dist < player.radius + this.radius) {
            player.hp -= 0.5;
            playSound('hurt', 0.1);
            if (player.hp <= 0) gameOver();
        }
    }
    draw() {
        const px = this.x - camera.x + C.width / 2;
        const py = this.y - camera.y + C.height / 2;

        X.fillStyle = '#ff0033';
        X.beginPath(); X.moveTo(px, py - this.radius); X.lineTo(px + this.radius, py + this.radius); X.lineTo(px - this.radius, py + this.radius); X.fill();
        // HP bar
        if (this.hp < this.maxHp) {
            X.fillStyle = '#f00'; X.fillRect(px - 10, py - 18, 20, 3);
            X.fillStyle = '#0f0'; X.fillRect(px - 10, py - 18, 20 * (this.hp / this.maxHp), 3);
        }
    }
}

class Gem {
    constructor(x, y) {
        this.x = x; this.y = y; this.radius = 6;
    }
    update() {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < 100) { // Magnet radius
            this.x += (player.x - this.x) / dist * 8;
            this.y += (player.y - this.y) / dist * 8;
        }
        if (dist < player.radius + this.radius) {
            this.collect = true;
            xp += 1;
            playSound('pickup', 0.05);
            document.getElementById('xp-bar').style.width = `${(xp / nextXp) * 100}%`;
            if (xp >= nextXp) levelUp();
        }
    }
    draw() {
        const px = this.x - camera.x + C.width / 2;
        const py = this.y - camera.y + C.height / 2;
        X.shadowBlur = 10; X.shadowColor = '#00f3ff';
        X.fillStyle = '#fff';
        X.fillRect(px - this.radius / 2, py - this.radius / 2, this.radius, this.radius);
        X.shadowBlur = 0;
    }
}

// ─── HELPERS ───
function getNearestEnemy(x, y, range) {
    let nearest = null, minDist = range;
    enemies.forEach(e => {
        const d = Math.hypot(e.x - x, e.y - y);
        if (d < minDist) { minDist = d; nearest = e; }
    });
    return nearest;
}

function damageEnemy(e, dmg, color) {
    if (!e.alive) return;
    e.hp -= dmg;
    // Damage text
    if (Math.random() < 0.2) {
        damageTexts.push({ x: e.x, y: e.y, text: Math.floor(dmg), color: color, life: 30 });
    }
    if (e.hp <= 0) {
        e.alive = false;
        kills++;
        playSound('hit', 0.1);
        gems.push(new Gem(e.x, e.y));
        for (let i = 0; i < 5; i++) particles.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10, life: 20, color: '#ff0055' });
    }
}

// ─── GAME LOOP ───
window.startGame = function () {
    state = 'PLAYING';
    document.getElementById('screen-title').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    player = new Player();
    agents = [new Agent(AGENT_TYPES.SAMURAI)]; // Start with samurai
    enemies = []; gems = []; damageTexts = []; particles = [];
    time = 0; kills = 0; level = 1; xp = 0; nextXp = 5;
    lastFrame = performance.now();
    audio.startMusic();
    requestAnimationFrame(loop);
};

function levelUp() {
    state = 'LEVELUP';
    level++; xp -= nextXp; nextXp = Math.floor(nextXp * 1.5);
    player.hp = player.maxHp; // heal
    document.getElementById('hud-lvl').textContent = 'LVL ' + level;

    // Generate 3 choices
    const choices = [];
    const keys = Object.keys(AGENT_TYPES);
    for (let i = 0; i < 3; i++) {
        const t = AGENT_TYPES[keys[Math.floor(Math.random() * keys.length)]];
        // check if we have it
        const existing = agents.find(a => a.type.name === t.name);
        choices.push({
            type: t,
            title: existing ? `UPGRADE ${t.name}` : `NEW: ${t.name}`,
            desc: existing ? `Level ${existing.lvl + 1} -> Increases damage, size, or speed.` : t.desc,
            exist: !!existing
        });
    }

    const cont = document.getElementById('upgrade-cards');
    cont.innerHTML = '';
    choices.forEach(ch => {
        const div = document.createElement('div');
        div.className = 'upgrade-card';
        div.style.borderColor = ch.type.color;
        div.innerHTML = `
            <div class="upgrade-icon" style="color:${ch.type.color}">${ch.type.icon}</div>
            <div class="upgrade-title" style="color:${ch.type.color}">${ch.title}</div>
            <div class="upgrade-desc">${ch.desc}</div>
        `;
        div.onclick = () => { selectUpgrade(ch.type, ch.exist); };
        cont.appendChild(div);
    });

    document.getElementById('screen-levelup').classList.remove('hidden');
}

function selectUpgrade(type, exist) {
    if (exist) {
        const ag = agents.find(a => a.type.name === type.name);
        if (ag) ag.lvl++;
    } else {
        agents.push(new Agent(type));
    }
    playSound('powerup');
    document.getElementById('screen-levelup').classList.add('hidden');
    state = 'PLAYING';
    lastFrame = performance.now();
    requestAnimationFrame(loop);
}

function gameOver() {
    state = 'GAMEOVER';
    audio.stopMusic(); audio.die();
    document.getElementById('screen-gameover').classList.remove('hidden');
    const min = Math.floor(time / 60).toString().padStart(2, '0');
    const sec = Math.floor(time % 60).toString().padStart(2, '0');
    document.getElementById('final-time').textContent = `${min}:${sec}`;
    document.getElementById('final-lvl').textContent = level;
    document.getElementById('final-kills').textContent = kills;
}

function update() {
    // 60fps delta
    time += 1 / 60;

    // HUD update
    document.getElementById('hud-hp').textContent = Math.max(0, Math.ceil(player.hp)) + '%';
    const min = Math.floor(time / 60).toString().padStart(2, '0');
    const sec = Math.floor(time % 60).toString().padStart(2, '0');
    document.getElementById('hud-time').textContent = `${min}:${sec}`;

    // Spawn enemies
    const spawnRate = Math.max(5, 60 - Math.floor(time / 10)); // faster over time
    if (Math.random() < 1 / spawnRate) enemies.push(new Enemy());

    player.update();
    agents.forEach(a => a.update());
    enemies.forEach(e => e.update());
    gems.forEach(g => g.update());

    // Filter dead
    enemies = enemies.filter(e => e.alive);
    gems = gems.filter(g => !g.collect);

    // Camera follow player smoothly
    camera.x += (player.x - camera.x) * 0.1;
    camera.y += (player.y - camera.y) * 0.1;
}

function drawGrid() {
    const s = 100;
    const ox = (-camera.x) % s;
    const oy = (-camera.y) % s;

    X.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    X.lineWidth = 1;
    X.beginPath();
    for (let x = ox - s; x < C.width + s; x += s) { X.moveTo(x, 0); X.lineTo(x, C.height); }
    for (let y = oy - s; y < C.height + s; y += s) { X.moveTo(0, y); X.lineTo(C.width, y); }
    X.stroke();
}

function draw() {
    X.fillStyle = '#03000b';
    X.fillRect(0, 0, C.width, C.height);

    drawGrid();

    gems.forEach(g => g.draw());
    enemies.forEach(e => e.draw());
    player.draw();
    agents.forEach(a => a.draw());

    // Effects
    lasers.forEach(l => {
        X.strokeStyle = l.color; X.lineWidth = l.life / 2;
        X.shadowBlur = 10; X.shadowColor = l.color;
        X.beginPath(); X.moveTo(l.x - camera.x + C.width / 2, l.y - camera.y + C.height / 2);
        X.lineTo(l.tx - camera.x + C.width / 2, l.ty - camera.y + C.height / 2); X.stroke();
        X.shadowBlur = 0;
        l.life--;
    });
    lasers = lasers.filter(l => l.life > 0);

    particles.forEach(p => {
        X.fillStyle = p.color;
        X.fillRect(p.x - camera.x + C.width / 2, p.y - camera.y + C.height / 2, p.life / 4, p.life / 4);
        p.x += p.vx; p.y += p.vy; p.life--;
    });
    particles = particles.filter(p => p.life > 0);

    X.font = 'bold 16px Rajdhani';
    damageTexts.forEach(d => {
        X.fillStyle = d.color;
        X.globalAlpha = d.life / 30;
        X.fillText(d.text, d.x - camera.x + C.width / 2, d.y - camera.y + C.height / 2);
        d.y -= 1; d.life--;
    });
    X.globalAlpha = 1;
    damageTexts = damageTexts.filter(d => d.life > 0);
}

function loop(now) {
    if (state !== 'PLAYING') return;

    // Fixed timestep step
    update();
    draw();

    requestAnimationFrame(loop);
}

// Global Audio Helper (hooks into audio.js)
function playSound(name, vol = 0.5) {
    if (window.audio && window.audio[name]) window.audio[name](vol);
}
