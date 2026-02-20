// ═══════════════════════════════════════════════════════════════
// PRIME.AI — FULL GAME ENGINE
// A complete Mario-style platformer with physics, enemies,
// coins, power-ups, levels, gamepad support, and pixel rendering
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// ─── STATE MACHINE ───
const STATE = { TITLE: 0, LEVEL_SELECT: 1, CONTROLS: 2, PLAYING: 3, PAUSED: 4, GAMEOVER: 5, LEVELCLEAR: 6 };
let gameState = STATE.TITLE;
let currentLevelIndex = 0;
let score = 0;
let coins = 0;
let lives = 3;
let timer = 400;
let timerInterval = null;

// ─── Canvas Sizing ───
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ─── TITLE BACKGROUND ANIMATION ───
const titleCanvas = document.getElementById('title-bg-canvas');
const titleCtx = titleCanvas.getContext('2d');
let titleStars = [];

function initTitleBg() {
    titleCanvas.width = window.innerWidth;
    titleCanvas.height = window.innerHeight;
    titleStars = [];
    for (let i = 0; i < 150; i++) {
        titleStars.push({
            x: Math.random() * titleCanvas.width,
            y: Math.random() * titleCanvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1 + 0.3,
            brightness: Math.random()
        });
    }
}

function drawTitleBg() {
    if (gameState !== STATE.TITLE) return;
    titleCtx.fillStyle = '#050510';
    titleCtx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
    titleStars.forEach(s => {
        s.y += s.speed;
        if (s.y > titleCanvas.height) { s.y = 0; s.x = Math.random() * titleCanvas.width; }
        s.brightness = 0.5 + 0.5 * Math.sin(Date.now() * 0.003 + s.x);
        titleCtx.fillStyle = `rgba(0, 243, 255, ${s.brightness})`;
        titleCtx.fillRect(s.x, s.y, s.size, s.size);
    });
    // Ground blocks scrolling
    const time = Date.now() * 0.03;
    for (let x = -40; x < titleCanvas.width + 40; x += 40) {
        const drawX = ((x - time) % (titleCanvas.width + 80)) - 40;
        titleCtx.fillStyle = '#00a800';
        titleCtx.fillRect(drawX < 0 ? drawX + titleCanvas.width + 80 : drawX, titleCanvas.height - 80, 38, 38);
        titleCtx.fillStyle = '#c84c0c';
        titleCtx.fillRect(drawX < 0 ? drawX + titleCanvas.width + 80 : drawX, titleCanvas.height - 40, 38, 38);
    }
    requestAnimationFrame(drawTitleBg);
}
initTitleBg();
drawTitleBg();

// ─── INPUT ───
const keys = {};
window.addEventListener('keydown', e => {
    keys[e.code] = true;
    handleMenuInput(e.code, 'down');
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// ─── GAMEPAD ───
let gpConnected = false;
let gpIndex = null;
let gpPrev = {};

window.addEventListener('gamepadconnected', e => {
    gpConnected = true;
    gpIndex = e.gamepad.index;
});
window.addEventListener('gamepaddisconnected', () => {
    gpConnected = false;
    gpIndex = null;
});

function pollGamepad() {
    if (!gpConnected) return {};
    const gp = navigator.getGamepads()[gpIndex];
    if (!gp) return {};
    const state = {
        left: gp.axes[0] < -0.5 || (gp.buttons[14] && gp.buttons[14].pressed),
        right: gp.axes[0] > 0.5 || (gp.buttons[15] && gp.buttons[15].pressed),
        up: gp.axes[1] < -0.5 || (gp.buttons[12] && gp.buttons[12].pressed),
        down: gp.axes[1] > 0.5 || (gp.buttons[13] && gp.buttons[13].pressed),
        jump: gp.buttons[0] && gp.buttons[0].pressed,
        run: gp.buttons[1] && gp.buttons[1].pressed,
        start: gp.buttons[9] && gp.buttons[9].pressed,
        select: gp.buttons[8] && gp.buttons[8].pressed,
    };
    // Edge detection for menus
    const edges = {};
    for (const k in state) {
        edges[k] = state[k] && !gpPrev[k];
    }
    gpPrev = { ...state };
    return { state, edges };
}

// ─── MENU NAVIGATION ───
let menuSelection = 0;
let pauseSelection = 0;

function handleMenuInput(code, type) {
    audio.init();

    if (gameState === STATE.TITLE) {
        const items = document.querySelectorAll('.menu-item');
        if (code === 'ArrowUp' || code === 'KeyW') {
            menuSelection = Math.max(0, menuSelection - 1);
            audio.menuSelect();
        }
        if (code === 'ArrowDown' || code === 'KeyS') {
            menuSelection = Math.min(items.length - 1, menuSelection + 1);
            audio.menuSelect();
        }
        items.forEach((el, i) => el.classList.toggle('selected', i === menuSelection));

        if (code === 'Enter' || code === 'Space') {
            const action = items[menuSelection].dataset.action;
            audio.menuConfirm();
            if (action === 'start') startGame(0);
            else if (action === 'levels') showScreen(STATE.LEVEL_SELECT);
            else if (action === 'controls') showScreen(STATE.CONTROLS);
        }
    } else if (gameState === STATE.LEVEL_SELECT) {
        if (code === 'Escape' || code === 'Backspace') showScreen(STATE.TITLE);
        // Click handling is on world cards
    } else if (gameState === STATE.CONTROLS) {
        if (code === 'Escape' || code === 'Backspace') showScreen(STATE.TITLE);
    } else if (gameState === STATE.PLAYING) {
        if (code === 'KeyP' || code === 'Escape') pauseGame();
        if (code === 'KeyM') audio.toggleMute();
    } else if (gameState === STATE.PAUSED) {
        const items = document.querySelectorAll('.pause-item');
        if (code === 'ArrowUp' || code === 'KeyW') { pauseSelection = Math.max(0, pauseSelection - 1); audio.menuSelect(); }
        if (code === 'ArrowDown' || code === 'KeyS') { pauseSelection = Math.min(items.length - 1, pauseSelection + 1); audio.menuSelect(); }
        items.forEach((el, i) => el.classList.toggle('selected', i === pauseSelection));
        if (code === 'Enter' || code === 'Space') {
            const action = items[pauseSelection].dataset.action;
            audio.menuConfirm();
            if (action === 'resume') resumeGame();
            else if (action === 'restart') { resumeGame(); startGame(currentLevelIndex); }
            else if (action === 'quit') { resumeGame(); showScreen(STATE.TITLE); audio.stopMusic(); }
        }
        if (code === 'KeyP' || code === 'Escape') resumeGame();
    } else if (gameState === STATE.GAMEOVER) {
        if (code === 'Enter' || code === 'Space') { showScreen(STATE.TITLE); }
    } else if (gameState === STATE.LEVELCLEAR) {
        if (code === 'Enter' || code === 'Space') {
            if (currentLevelIndex + 1 < LEVELS.length) startGame(currentLevelIndex + 1);
            else showScreen(STATE.TITLE);
        }
    }
}

// ─── SCREEN MANAGEMENT ───
function showScreen(state) {
    gameState = state;
    document.getElementById('title-screen').classList.toggle('hidden', state !== STATE.TITLE);
    document.getElementById('level-select').classList.toggle('hidden', state !== STATE.LEVEL_SELECT);
    document.getElementById('controls-screen').classList.toggle('hidden', state !== STATE.CONTROLS);
    document.getElementById('game-hud').classList.toggle('hidden', state !== STATE.PLAYING && state !== STATE.PAUSED);
    document.getElementById('pause-overlay').classList.toggle('hidden', state !== STATE.PAUSED);
    document.getElementById('gameover-overlay').classList.toggle('hidden', state !== STATE.GAMEOVER);
    document.getElementById('levelcomplete-overlay').classList.toggle('hidden', state !== STATE.LEVELCLEAR);
    canvas.classList.toggle('hidden', state !== STATE.PLAYING && state !== STATE.PAUSED && state !== STATE.LEVELCLEAR);

    if (state === STATE.TITLE) { initTitleBg(); drawTitleBg(); }
}

// Level select click handlers
document.querySelectorAll('.world-card.unlocked').forEach(card => {
    card.addEventListener('click', () => {
        audio.init();
        audio.menuConfirm();
        const lvl = parseInt(card.dataset.level) - 1;
        if (lvl < LEVELS.length) startGame(lvl);
    });
});

// ─── PLAYER CLASS ───
class Player {
    constructor(x, y) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.w = 28;
        this.h = 36;
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.facing = 1; // 1=right, -1=left
        this.big = false;
        this.powered = false;
        this.invincible = 0;
        this.animFrame = 0;
        this.animTimer = 0;
        this.dead = false;
        this.ducking = false;
        this.runFrame = 0;
    }

    get hitbox() {
        const h = this.ducking ? 20 : (this.big ? 56 : 36);
        const y = this.ducking ? this.y + 16 : (this.big ? this.y - 20 : this.y);
        return { x: this.x + 4, y: y, w: this.w - 8, h: h };
    }
}

// ─── ENEMY CLASS ───
class Enemy {
    constructor(x, y, type) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.w = 36;
        this.h = 36;
        this.vx = -1.5;
        this.vy = 0;
        this.type = type; // 'goomba', 'koopa'
        this.alive = true;
        this.squished = false;
        this.squishTimer = 0;
        this.animFrame = 0;
        this.animTimer = 0;
    }
}

// ─── COIN / PARTICLE / FIREBALL ───
class FloatingCoin {
    constructor(x, y) { this.x = x; this.y = y; this.vy = -6; this.life = 30; }
}
class Particle {
    constructor(x, y, vx, vy, color, size) {
        this.x = x; this.y = y; this.vx = vx; this.vy = vy;
        this.color = color; this.size = size || 6; this.life = 40;
    }
}
class Fireball {
    constructor(x, y, dir) {
        this.x = x; this.y = y; this.vx = dir * 7; this.vy = 0;
        this.w = 10; this.h = 10; this.bounces = 0; this.alive = true;
    }
}
class ScorePopup {
    constructor(x, y, text) { this.x = x; this.y = y; this.text = text; this.life = 40; this.vy = -2; }
}

// ─── GAME VARIABLES ───
let player, camera, levelData, tileMap;
let enemies = [], floatingCoins = [], particles = [], fireballs = [], scorePopups = [];
let questionBlocks = {}; // track hit question blocks

// ─── START GAME ───
function startGame(levelIndex) {
    currentLevelIndex = levelIndex;
    levelData = LEVELS[levelIndex];

    // Build tile map
    tileMap = [];
    for (let row = 0; row < levelData.tiles.length; row++) {
        tileMap[row] = [];
        for (let col = 0; col < levelData.tiles[row].length; col++) {
            tileMap[row][col] = levelData.tiles[row][col];
        }
    }

    // Player
    player = new Player(levelData.playerStart.x, levelData.playerStart.y);

    // Camera
    camera = { x: 0, y: 0 };

    // Enemies from tiles
    enemies = [];
    for (let row = 0; row < tileMap.length; row++) {
        for (let col = 0; col < tileMap[row].length; col++) {
            if (tileMap[row][col] === 'E') {
                enemies.push(new Enemy(col, row, 'goomba'));
                tileMap[row][col] = ' ';
            } else if (tileMap[row][col] === 'K') {
                enemies.push(new Enemy(col, row, 'koopa'));
                tileMap[row][col] = ' ';
            }
        }
    }

    floatingCoins = [];
    particles = [];
    fireballs = [];
    scorePopups = [];
    questionBlocks = {};

    // Timer
    timer = 400;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (gameState === STATE.PLAYING) {
            timer--;
            updateHUD();
            if (timer <= 0) playerDie();
        }
    }, 1000);

    // Music
    audio.init();
    audio.stopMusic();
    if (audio[levelData.musicFn]) audio[levelData.musicFn]();

    showScreen(STATE.PLAYING);
    updateHUD();
    if (!gameLoopRunning) { gameLoopRunning = true; requestAnimationFrame(gameLoop); }
}

// ─── PAUSE ───
function pauseGame() {
    gameState = STATE.PAUSED;
    pauseSelection = 0;
    document.getElementById('pause-overlay').classList.remove('hidden');
    document.querySelectorAll('.pause-item').forEach((el, i) => el.classList.toggle('selected', i === 0));
    audio.pause();
}

function resumeGame() {
    gameState = STATE.PLAYING;
    document.getElementById('pause-overlay').classList.add('hidden');
}

// ─── HUD ───
function updateHUD() {
    document.getElementById('hud-score').textContent = String(score).padStart(6, '0');
    document.getElementById('hud-coins').textContent = '×' + String(coins).padStart(2, '0');
    document.getElementById('hud-world').textContent = levelData ? levelData.name : '1-1';
    document.getElementById('hud-time').textContent = String(Math.max(0, timer));
    document.getElementById('hud-lives').textContent = '×' + String(lives).padStart(2, '0');
}

// ─── TILE COLLISION ───
function getTile(col, row) {
    if (row < 0 || row >= tileMap.length || col < 0 || col >= tileMap[0].length) return ' ';
    return tileMap[row][col];
}

function isSolid(tile) {
    return 'GBSPp?MXH'.includes(tile);
}

function tileCollision(entity, dx, dy) {
    const ex = entity.x + dx;
    const ey = entity.y + dy;
    const ew = entity.w || 28;
    const eh = entity.h || 36;

    const left = Math.floor((ex + 4) / TILE_SIZE);
    const right = Math.floor((ex + ew - 4) / TILE_SIZE);
    const top = Math.floor(ey / TILE_SIZE);
    const bottom = Math.floor((ey + eh - 1) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (isSolid(getTile(col, row))) return true;
        }
    }
    return false;
}

// ─── BLOCK INTERACTION ───
function hitBlockBelow(col, row) {
    const tile = getTile(col, row);
    const key = `${col},${row}`;

    if (tile === '?') {
        if (!questionBlocks[key]) {
            questionBlocks[key] = true;
            tileMap[row][col] = 'M'; // used block

            // Random: coin or power-up
            if (Math.random() > 0.3) {
                coins++;
                score += 200;
                audio.coin();
                floatingCoins.push(new FloatingCoin(col * TILE_SIZE + 10, row * TILE_SIZE - 20));
                scorePopups.push(new ScorePopup(col * TILE_SIZE, row * TILE_SIZE - 30, '200'));
            } else {
                // Power up
                if (!player.big) {
                    player.big = true;
                    audio.powerUp();
                    scorePopups.push(new ScorePopup(col * TILE_SIZE, row * TILE_SIZE - 30, 'POWER UP!'));
                } else {
                    player.powered = true;
                    audio.powerUp();
                    scorePopups.push(new ScorePopup(col * TILE_SIZE, row * TILE_SIZE - 30, 'FIRE!'));
                }
                score += 1000;
            }
        }
    } else if (tile === 'B') {
        if (player.big) {
            tileMap[row][col] = ' ';
            audio.breakBlock();
            for (let i = 0; i < 6; i++) {
                particles.push(new Particle(
                    col * TILE_SIZE + 20, row * TILE_SIZE + 20,
                    (Math.random() - 0.5) * 6, -Math.random() * 8 - 2,
                    '#a0522d', 8
                ));
            }
            score += 50;
        } else {
            audio.bump();
        }
    } else if (tile === 'H') {
        if (!questionBlocks[key]) {
            questionBlocks[key] = true;
            tileMap[row][col] = 'M';
            coins++;
            score += 200;
            audio.coin();
            floatingCoins.push(new FloatingCoin(col * TILE_SIZE + 10, row * TILE_SIZE - 20));
        }
    }
}

// ─── COIN COLLECTION (floating C tiles) ───
function checkCoinTiles() {
    const pcx = Math.floor((player.x + 14) / TILE_SIZE);
    const pcy = Math.floor((player.y + 18) / TILE_SIZE);
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const col = pcx + dx;
            const row = pcy + dy;
            if (getTile(col, row) === 'C') {
                const cx = col * TILE_SIZE;
                const cy = row * TILE_SIZE;
                if (Math.abs(player.x + 14 - cx - 20) < 24 && Math.abs(player.y + 18 - cy - 20) < 24) {
                    tileMap[row][col] = ' ';
                    coins++;
                    score += 200;
                    audio.coin();
                    scorePopups.push(new ScorePopup(cx, cy - 10, '200'));
                    if (coins % 100 === 0 && coins > 0) {
                        lives++;
                        audio.oneUp();
                        scorePopups.push(new ScorePopup(cx, cy - 30, '1UP!'));
                    }
                }
            }
        }
    }
}

// ─── FLAGPOLE CHECK ───
function checkFlagpole() {
    const pcx = Math.floor((player.x + 14) / TILE_SIZE);
    const pcy = Math.floor((player.y + 18) / TILE_SIZE);
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = 0; dx <= 1; dx++) {
            if (getTile(pcx + dx, pcy + dy) === 'F' || getTile(pcx + dx, pcy + dy) === 'f') {
                levelComplete();
                return;
            }
        }
    }
}

function levelComplete() {
    gameState = STATE.LEVELCLEAR;
    audio.stopMusic();
    audio.flagpole();
    if (timerInterval) clearInterval(timerInterval);

    const timeBonus = timer * 50;
    score += timeBonus;

    document.getElementById('time-bonus').textContent = timeBonus;
    document.getElementById('clear-coins').textContent = coins;
    document.getElementById('clear-score').textContent = score;
    document.getElementById('levelcomplete-overlay').classList.remove('hidden');
}

// ─── PLAYER DEATH ───
function playerDie() {
    if (player.dead) return;
    player.dead = true;
    audio.stopMusic();
    audio.die();

    lives--;
    if (timerInterval) clearInterval(timerInterval);

    setTimeout(() => {
        if (lives <= 0) {
            document.getElementById('final-score-val').textContent = score;
            showScreen(STATE.GAMEOVER);
            audio.gameOver();
            score = 0; coins = 0; lives = 3;
        } else {
            startGame(currentLevelIndex);
        }
    }, 2000);
}

// ─── MAIN UPDATE ───
function updateGame() {
    if (gameState !== STATE.PLAYING || player.dead) return;

    const gp = pollGamepad();
    const gpState = gp.state || {};
    const gpEdges = gp.edges || {};

    // Gamepad menu
    if (gpEdges.start) pauseGame();

    const moveLeft = keys['ArrowLeft'] || keys['KeyA'] || gpState.left;
    const moveRight = keys['ArrowRight'] || keys['KeyD'] || gpState.right;
    const jumpPressed = keys['Space'] || keys['KeyW'] || keys['ArrowUp'] || gpState.jump;
    const runPressed = keys['ShiftLeft'] || keys['ShiftRight'] || gpState.run;
    const duckPressed = keys['ArrowDown'] || keys['KeyS'] || gpState.down;

    const accel = runPressed ? 0.6 : 0.4;
    const maxSpeed = runPressed ? 6.5 : 4;
    const friction = 0.85;
    const gravity = 0.55;
    const jumpForce = player.big ? -11.5 : -10.5;

    // Ducking
    player.ducking = duckPressed && player.grounded && player.big;

    // Horizontal
    if (moveLeft && !player.ducking) { player.vx -= accel; player.facing = -1; }
    else if (moveRight && !player.ducking) { player.vx += accel; player.facing = 1; }
    else { player.vx *= friction; }

    if (player.vx > maxSpeed) player.vx = maxSpeed;
    if (player.vx < -maxSpeed) player.vx = -maxSpeed;
    if (Math.abs(player.vx) < 0.1) player.vx = 0;

    // Horizontal collision
    if (!tileCollision(player, player.vx, 0)) {
        player.x += player.vx;
    } else {
        // Slide against wall
        while (!tileCollision(player, Math.sign(player.vx), 0)) {
            player.x += Math.sign(player.vx);
        }
        player.vx = 0;
    }

    // Jump
    if (jumpPressed && player.grounded) {
        player.vy = jumpForce;
        player.grounded = false;
        audio.jump();
    }

    // Variable jump height
    if (!jumpPressed && player.vy < -3) {
        player.vy *= 0.6;
    }

    // Gravity
    player.vy += gravity;
    if (player.vy > 12) player.vy = 12;

    // Vertical collision
    if (!tileCollision(player, 0, player.vy)) {
        player.y += player.vy;
        player.grounded = false;
    } else {
        if (player.vy > 0) {
            // Landing
            while (!tileCollision(player, 0, 1)) player.y += 1;
            player.grounded = true;
        } else if (player.vy < 0) {
            // Hit head
            while (!tileCollision(player, 0, -1)) player.y -= 1;
            // Check which block was hit
            const headCol = Math.floor((player.x + 14) / TILE_SIZE);
            const headRow = Math.floor((player.y - 1) / TILE_SIZE);
            hitBlockBelow(headCol, headRow);
            // Check adjacent too
            const headCol2 = Math.floor((player.x + player.w - 4) / TILE_SIZE);
            if (headCol2 !== headCol) hitBlockBelow(headCol2, headRow);
        }
        player.vy = 0;
    }

    // Prevent going left of screen
    if (player.x < camera.x) player.x = camera.x;

    // Fall to death
    if (player.y > tileMap.length * TILE_SIZE + 100) playerDie();

    // Fireball
    if (runPressed && player.powered && gpEdges.run) {
        fireballs.push(new Fireball(player.x + 14, player.y + 10, player.facing));
        audio.fireball();
    }
    // Keyboard fireball (on press edge - simple cooldown)
    if (player.powered && keys['ShiftLeft'] && !player._fireCD) {
        player._fireCD = true;
        fireballs.push(new Fireball(player.x + 14, player.y + 10, player.facing));
        audio.fireball();
        setTimeout(() => player._fireCD = false, 300);
    }

    // Invincibility frames
    if (player.invincible > 0) player.invincible--;

    // Animation
    player.animTimer++;
    if (player.animTimer >= 6) {
        player.animTimer = 0;
        player.runFrame = (player.runFrame + 1) % 3;
    }

    // — Coins & Flagpole —
    checkCoinTiles();
    checkFlagpole();

    // — ENEMIES —
    enemies.forEach(enemy => {
        if (!enemy.alive) return;
        if (enemy.squished) {
            enemy.squishTimer--;
            if (enemy.squishTimer <= 0) enemy.alive = false;
            return;
        }

        // Only update if near camera
        if (Math.abs(enemy.x - camera.x) > canvas.width + 200) return;

        enemy.vy += gravity;
        if (enemy.vy > 10) enemy.vy = 10;

        // Horizontal
        if (!tileCollision(enemy, enemy.vx, 0)) {
            enemy.x += enemy.vx;
        } else {
            enemy.vx *= -1;
        }

        // Vertical
        if (!tileCollision(enemy, 0, enemy.vy)) {
            enemy.y += enemy.vy;
        } else {
            if (enemy.vy > 0) {
                while (!tileCollision(enemy, 0, 1)) enemy.y += 1;
            }
            enemy.vy = 0;
        }

        // Fall to death
        if (enemy.y > tileMap.length * TILE_SIZE + 100) { enemy.alive = false; return; }

        // Enemy anim
        enemy.animTimer++;
        if (enemy.animTimer >= 12) { enemy.animTimer = 0; enemy.animFrame = 1 - enemy.animFrame; }

        // Player collision
        if (player.dead || player.invincible > 0) return;
        const pb = player.hitbox;
        const eb = { x: enemy.x + 2, y: enemy.y + 2, w: enemy.w - 4, h: enemy.h - 4 };

        if (pb.x < eb.x + eb.w && pb.x + pb.w > eb.x && pb.y < eb.y + eb.h && pb.y + pb.h > eb.y) {
            // Check if jumping on top
            if (player.vy > 0 && pb.y + pb.h - 10 < eb.y + eb.h / 2) {
                // Stomp!
                enemy.squished = true;
                enemy.squishTimer = 20;
                player.vy = -8;
                score += 100;
                audio.stomp();
                scorePopups.push(new ScorePopup(enemy.x, enemy.y - 15, '100'));
            } else {
                // Damage player
                if (player.powered) {
                    player.powered = false;
                    player.invincible = 90;
                    audio.damage();
                } else if (player.big) {
                    player.big = false;
                    player.invincible = 90;
                    audio.damage();
                } else {
                    playerDie();
                }
            }
        }
    });

    // — FIREBALLS —
    fireballs.forEach(fb => {
        if (!fb.alive) return;
        fb.vy += 0.4;
        fb.x += fb.vx;
        fb.y += fb.vy;

        // Bounce off ground
        if (tileCollision({ x: fb.x, y: fb.y, w: fb.w, h: fb.h }, 0, fb.vy)) {
            fb.vy = -5;
            fb.bounces++;
            if (fb.bounces > 4) fb.alive = false;
        }
        // Hit wall
        if (tileCollision({ x: fb.x, y: fb.y, w: fb.w, h: fb.h }, fb.vx, 0)) {
            fb.alive = false;
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(fb.x, fb.y, (Math.random() - 0.5) * 4, -Math.random() * 4, '#ff6600', 4));
            }
        }
        // Hit enemy
        enemies.forEach(en => {
            if (!en.alive || en.squished) return;
            if (fb.x < en.x + en.w && fb.x + fb.w > en.x && fb.y < en.y + en.h && fb.y + fb.h > en.y) {
                en.alive = false;
                fb.alive = false;
                score += 200;
                audio.stomp();
                scorePopups.push(new ScorePopup(en.x, en.y - 15, '200'));
                for (let i = 0; i < 4; i++) {
                    particles.push(new Particle(en.x + 18, en.y + 18, (Math.random() - 0.5) * 6, -Math.random() * 6, '#ff4400', 6));
                }
            }
        });
        // Out of bounds
        if (fb.y > tileMap.length * TILE_SIZE + 50) fb.alive = false;
    });
    fireballs = fireballs.filter(f => f.alive);

    // — FLOATING COINS —
    floatingCoins.forEach(c => { c.y += c.vy; c.vy += 0.3; c.life--; });
    floatingCoins = floatingCoins.filter(c => c.life > 0);

    // — PARTICLES —
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--; });
    particles = particles.filter(p => p.life > 0);

    // — SCORE POPUPS —
    scorePopups.forEach(s => { s.y += s.vy; s.life--; });
    scorePopups = scorePopups.filter(s => s.life > 0);

    // — CAMERA —
    const targetX = player.x - canvas.width / 3;
    camera.x += (targetX - camera.x) * 0.08;
    if (camera.x < 0) camera.x = 0;
    camera.y = 0;

    updateHUD();
}

// ─── DRAWING ───
function drawGame() {
    if (gameState !== STATE.PLAYING && gameState !== STATE.PAUSED && gameState !== STATE.LEVELCLEAR) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky
    ctx.fillStyle = levelData.skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ox = -camera.x;
    const oy = -camera.y;

    // Clouds (parallax)
    if (levelData.clouds) {
        levelData.clouds.forEach(c => {
            const cx = c.x * TILE_SIZE + ox * 0.4;
            const cy = c.y * TILE_SIZE + 20;
            drawCloud(cx, cy, c.size);
        });
    }

    // Hills
    if (levelData.hills) {
        levelData.hills.forEach(h => {
            const hx = h.x * TILE_SIZE + ox * 0.6;
            const hy = h.y * TILE_SIZE;
            drawHill(hx, hy, h.size);
        });
    }

    // Bushes
    if (levelData.bushes) {
        levelData.bushes.forEach(b => {
            const bx = b.x * TILE_SIZE + ox;
            const by = b.y * TILE_SIZE + 10;
            drawBush(bx, by, b.size);
        });
    }

    // Tiles
    const startCol = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
    const endCol = Math.min(tileMap[0].length, startCol + Math.ceil(canvas.width / TILE_SIZE) + 3);

    for (let row = 0; row < tileMap.length; row++) {
        for (let col = startCol; col < endCol; col++) {
            const tile = getTile(col, row);
            const tx = col * TILE_SIZE + ox;
            const ty = row * TILE_SIZE + oy;

            if (tile === 'G') {
                if (row > 0 && getTile(col, row - 1) !== 'G') {
                    ctx.fillStyle = levelData.groundColor;
                } else {
                    ctx.fillStyle = levelData.dirtColor;
                }
                ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
                // Grid lines
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
            } else if (tile === 'B') {
                drawBrick(tx, ty);
            } else if (tile === '?' || tile === 'H') {
                drawQuestionBlock(tx, ty);
            } else if (tile === 'M') {
                drawUsedBlock(tx, ty);
            } else if (tile === 'S') {
                drawStairBlock(tx, ty);
            } else if (tile === 'P' || tile === 'p') {
                drawPipe(tx, ty, tile);
            } else if (tile === 'C') {
                drawCoinTile(tx, ty);
            } else if (tile === 'F') {
                drawFlagpole(tx, ty);
            } else if (tile === 'f') {
                drawFlagTop(tx, ty);
            }
        }
    }

    // Floating coins
    floatingCoins.forEach(c => {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(c.x + ox, c.y + oy, 16, 16);
        ctx.fillStyle = '#fff';
        ctx.fillRect(c.x + ox + 4, c.y + oy + 2, 8, 4);
    });

    // Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x + ox, p.y + oy, p.size, p.size);
    });

    // Score popups
    ctx.font = '12px "Press Start 2P"';
    scorePopups.forEach(s => {
        const alpha = s.life / 40;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillText(s.text, s.x + ox, s.y + oy);
    });

    // Enemies
    enemies.forEach(e => {
        if (!e.alive) return;
        if (Math.abs(e.x - camera.x) > canvas.width + 200) return;
        const ex = e.x + ox;
        const ey = e.y + oy;
        if (e.squished) {
            // Flat goomba
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(ex + 2, ey + 28, 32, 8);
        } else {
            drawGoomba(ex, ey, e.animFrame);
        }
    });

    // Fireballs
    fireballs.forEach(fb => {
        const fx = fb.x + ox;
        const fy = fb.y + oy;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(fx + 5, fy + 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(fx + 5, fy + 5, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Player
    if (player && !player.dead) {
        if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 0) {
            // Blink
        } else {
            drawPlayer(player.x + ox, player.y + oy);
        }
    } else if (player && player.dead) {
        // Dead player rises then falls
        drawPlayerDead(player.x + ox, player.y + oy);
        player.vy += 0.3;
        player.y += player.vy;
    }
}

// ─── SPRITE DRAWING FUNCTIONS ───
function drawPlayer(x, y) {
    const p = player;
    const h = p.big ? 56 : 36;
    const yOff = p.big ? -20 : 0;
    const baseColor = p.powered ? '#fff' : '#ff0044';
    const bodyColor = p.powered ? '#ff0044' : '#0055dd';

    ctx.save();
    if (p.facing === -1) {
        ctx.translate(x + 14, 0);
        ctx.scale(-1, 1);
        ctx.translate(-(x + 14), 0);
    }

    // Hat
    ctx.fillStyle = baseColor;
    ctx.fillRect(x + 6, y + yOff, 20, 10);
    ctx.fillRect(x + 4, y + yOff + 4, 24, 6);

    // Face
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(x + 4, y + yOff + 10, 22, 12);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 16, y + yOff + 12, 4, 4);

    // Body
    ctx.fillStyle = bodyColor;
    if (p.ducking) {
        ctx.fillRect(x + 4, y + yOff + 22, 22, 10);
    } else {
        ctx.fillRect(x + 2, y + yOff + 22, 26, p.big ? 20 : 14);
    }

    // Feet
    if (!p.ducking) {
        if (p.grounded && Math.abs(p.vx) > 0.5) {
            // Run animation
            if (p.runFrame === 0) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 2, y + yOff + h - 8, 10, 8);
                ctx.fillRect(x + 16, y + yOff + h - 4, 10, 4);
            } else if (p.runFrame === 1) {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 4, y + yOff + h - 6, 8, 6);
                ctx.fillRect(x + 16, y + yOff + h - 6, 8, 6);
            } else {
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x + 16, y + yOff + h - 8, 10, 8);
                ctx.fillRect(x + 2, y + yOff + h - 4, 10, 4);
            }
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x + 2, y + yOff + h - 6, 10, 6);
            ctx.fillRect(x + 16, y + yOff + h - 6, 10, 6);
        }
    }

    ctx.restore();
}

function drawPlayerDead(x, y) {
    ctx.fillStyle = '#ff0044';
    ctx.fillRect(x + 6, y, 20, 10);
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(x + 4, y + 10, 22, 12);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 8, y + 14, 4, 2);
    ctx.fillRect(x + 16, y + 14, 4, 2);
    ctx.fillStyle = '#0055dd';
    ctx.fillRect(x + 2, y + 22, 26, 14);
}

function drawGoomba(x, y, frame) {
    // Body
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 4, y + 4, 28, 20);
    // Head
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + 2, y, 32, 16);
    ctx.fillRect(x, y + 4, 36, 10);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 8, 6, 6);
    ctx.fillRect(x + 22, y + 8, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + (frame === 0 ? 8 : 10), y + 10, 3, 4);
    ctx.fillRect(x + (frame === 0 ? 25 : 23), y + 10, 3, 4);
    // Feet
    ctx.fillStyle = '#000';
    if (frame === 0) {
        ctx.fillRect(x + 2, y + 28, 12, 8);
        ctx.fillRect(x + 22, y + 28, 12, 8);
    } else {
        ctx.fillRect(x + 6, y + 28, 10, 8);
        ctx.fillRect(x + 20, y + 28, 10, 8);
    }
}

function drawBrick(x, y) {
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    // Mortar lines
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.beginPath();
    ctx.moveTo(x, y + TILE_SIZE / 2); ctx.lineTo(x + TILE_SIZE, y + TILE_SIZE / 2);
    ctx.moveTo(x + TILE_SIZE / 2, y); ctx.lineTo(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    ctx.moveTo(x + TILE_SIZE / 4, y + TILE_SIZE / 2); ctx.lineTo(x + TILE_SIZE / 4, y + TILE_SIZE);
    ctx.moveTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE / 2); ctx.lineTo(x + TILE_SIZE * 3 / 4, y + TILE_SIZE);
    ctx.stroke();
}

function drawQuestionBlock(x, y) {
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#8B6914';
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
    // Question mark
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Press Start 2P"';
    ctx.textAlign = 'center';
    const bob = Math.sin(Date.now() * 0.005 + x) * 2;
    ctx.fillText('?', x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 8 + bob);
    ctx.textAlign = 'left';
}

function drawUsedBlock(x, y) {
    ctx.fillStyle = '#555';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}

function drawStairBlock(x, y) {
    ctx.fillStyle = '#888';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
}

function drawPipe(x, y, type) {
    if (type === 'p') {
        // Pipe top (wider)
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x - 4, y, TILE_SIZE + 8, TILE_SIZE);
        ctx.fillStyle = '#00cc00';
        ctx.fillRect(x - 4, y, 8, TILE_SIZE);
        ctx.strokeStyle = '#005500';
        ctx.strokeRect(x - 4, y, TILE_SIZE + 8, TILE_SIZE);
    } else {
        ctx.fillStyle = '#00a800';
        ctx.fillRect(x + 2, y, TILE_SIZE - 4, TILE_SIZE);
        ctx.fillStyle = '#00cc00';
        ctx.fillRect(x + 2, y, 6, TILE_SIZE);
        ctx.strokeStyle = '#005500';
        ctx.strokeRect(x + 2, y, TILE_SIZE - 4, TILE_SIZE);
    }
}

function drawCoinTile(x, y) {
    const bob = Math.sin(Date.now() * 0.006 + x) * 3;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE / 2 + bob, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE / 2 + bob, 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawFlagpole(x, y) {
    ctx.fillStyle = '#888';
    ctx.fillRect(x + TILE_SIZE / 2 - 3, y, 6, TILE_SIZE);
}

function drawFlagTop(x, y) {
    ctx.fillStyle = '#888';
    ctx.fillRect(x + TILE_SIZE / 2 - 3, y, 6, TILE_SIZE);
    // Ball on top
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + TILE_SIZE / 2, y + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    // Flag triangle
    ctx.fillStyle = '#ff0044';
    ctx.beginPath();
    ctx.moveTo(x + TILE_SIZE / 2 - 3, y + 8);
    ctx.lineTo(x + TILE_SIZE / 2 - 28, y + 20);
    ctx.lineTo(x + TILE_SIZE / 2 - 3, y + 32);
    ctx.fill();
}

function drawCloud(x, y, size) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const s = size * 20;
    ctx.beginPath();
    ctx.arc(x, y + s, s, 0, Math.PI * 2);
    ctx.arc(x + s, y, s * 1.2, 0, Math.PI * 2);
    ctx.arc(x + s * 2, y + s * 0.5, s, 0, Math.PI * 2);
    ctx.fill();
}

function drawHill(x, y, size) {
    const s = size * TILE_SIZE;
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.moveTo(x - s, y + TILE_SIZE);
    ctx.quadraticCurveTo(x + s / 2, y - s * 0.6, x + s * 2, y + TILE_SIZE);
    ctx.fill();
}

function drawBush(x, y, size) {
    ctx.fillStyle = '#00a800';
    const s = size * 15;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.arc(x + s * 1.5, y - 3, s * 0.8, 0, Math.PI * 2);
    ctx.arc(x + s * 2.5, y, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
}

// ─── GAME LOOP ───
let gameLoopRunning = false;

function gameLoop() {
    updateGame();
    drawGame();

    // Gamepad polling for menus
    if (gameState !== STATE.PLAYING) {
        const gp = pollGamepad();
        if (gp.edges) {
            if (gp.edges.up) handleMenuInput('ArrowUp', 'down');
            if (gp.edges.down) handleMenuInput('ArrowDown', 'down');
            if (gp.edges.jump) handleMenuInput('Enter', 'down');
            if (gp.edges.start) handleMenuInput('Enter', 'down');
        }
    }

    requestAnimationFrame(gameLoop);
}

// ─── INITIAL BOOT ───
showScreen(STATE.TITLE);

// Click to init audio
document.addEventListener('click', () => audio.init(), { once: true });
document.addEventListener('keydown', () => audio.init(), { once: true });
