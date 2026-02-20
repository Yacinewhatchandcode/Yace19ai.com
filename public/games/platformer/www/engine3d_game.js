// ═══════════════════════════════════════════════════════════════
// PRIME.AI PS3 3D Engine — GAME LOGIC (Part 2 — appended)
// ═══════════════════════════════════════════════════════════════

// ═══ LEVEL DATA ═══
const LEVELS = [
    {
        name: '1-1', title: 'NEURAL PLAINS', sky: ['#2a5caa', '#5c94fc', '#8ec8ff'], ground: '#1fa832', dirt: '#c84c0c', music: 'startOverworldMusic',
        tiles: [
            '                                                                                                                                            ',
            '                                                                                                                                            ',
            '                                                                                                                                            ',
            '                                                                                                                               f            ',
            '                                                                                                                               F            ',
            '                                                                                                                               F            ',
            '                                                                                                                               F            ',
            '                                                                                                                               F            ',
            '                         ?                     ?B?B?                                                                           F            ',
            '                                                                                              ?  ?                             F            ',
            '                                    B  B  B           E                SS                                                      F            ',
            '               E      E                                    E        SSSS        E    E                                        SF            ',
            '             E   E               pp      pp              SSSSSS                      C  C  C                                 SSF            ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGG  GGGGGGGGGGGGGGG           ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGG  GGGGGGGGGGGGGGG           '],
        clouds: [{ x: 8, y: 2, s: 1 }, { x: 22, y: 1, s: 2 }, { x: 40, y: 2, s: 1 }, { x: 60, y: 1, s: 2 }], hills: [{ x: 0, y: 11, s: 3 }, { x: 28, y: 11, s: 2 }, { x: 55, y: 11, s: 3 }]
    },
    {
        name: '2-1', title: 'CYBER CAVERNS', sky: ['#050015', '#0a0030', '#150050'], ground: '#555', dirt: '#333', music: 'startUndergroundMusic',
        tiles: [
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGG               ',
            'G                                                                                                                               ',
            'G                                                                                                                               ',
            'G                                                                                                   f                          ',
            'G                                                                                                   F                          ',
            'G                                                                                                   F                          ',
            'G                      C  C  C                                    ?                                  F                          ',
            'G                                      BBBBB                                                        F                          ',
            'G                                                    ?B?                      BBBB                   F                          ',
            'G                                                                                         ?   ?      F                          ',
            'G               BBBB          E     E                                   E                    SS       F                          ',
            'G         E                                    E              E                     E     SSSS       SF                          ',
            'G                  pp                    pp              pp                              SSSSSS      SSF                          ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG               ',
            'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGGGGGGGGGGGGGG  GGGGGGGGGGGGG               '],
        clouds: [], hills: []
    },
    {
        name: '3-1', title: 'SOVEREIGN SKY', sky: ['#ff6b35', '#ff9f1c', '#ffd700'], ground: '#eee', dirt: '#ccc', music: 'startSkyMusic',
        tiles: [
            '                                                                                                                                ',
            '                                                                                                                                ',
            '                                                                                                                                ',
            '                                                                                                           f                    ',
            '                                                                                                           F                    ',
            '                                                                                                           F                    ',
            '                       C  C  C  C                                                 C  C  C                  F                    ',
            '                                                                                                           F                    ',
            '                   ?       BBBB      ?             ?B?B?                BBB            ?   ?   ?             F                    ',
            '                                                                                                           F                    ',
            '            E       BBB          E        BBB             E       BBB          E       BBB     SS            F                    ',
            '                                                                                           SSSS      E    SF                    ',
            '                                                                                        SSSSSSS           SSF                    ',
            'GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGG                   ',
            'GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGG    GGGGGGGGGG    GGGGGGGGGGGGGGGGGGGGGGG                   '],
        clouds: [{ x: 5, y: 1, s: 2 }, { x: 25, y: 0, s: 1 }, { x: 45, y: 1, s: 2 }, { x: 65, y: 0, s: 1 }], hills: []
    }
];

// ═══ GAME OBJECTS ═══
class Player { constructor(x, y) { this.x = x * TS; this.y = y * TS; this.w = 32; this.h = 40; this.vx = 0; this.vy = 0; this.gr = false; this.face = 1; this.big = false; this.fire = false; this.inv = 0; this.dead = false; this.duck = false; this.rf = 0; this.at = 0; this._fc = false; } }
class Enemy { constructor(x, y) { this.x = x * TS; this.y = y * TS; this.w = 40; this.h = 40; this.vx = -1.5; this.vy = 0; this.alive = true; this.sq = false; this.st = 0; this.af = 0; this.at = 0; } }
class FCoin { constructor(x, y) { this.x = x; this.y = y; this.vy = -6; this.life = 30; } }
class FB { constructor(x, y, d) { this.x = x; this.y = y; this.vx = d * 8; this.vy = 0; this.w = 12; this.h = 12; this.bn = 0; this.alive = true; } }
class PopUp { constructor(x, y, t) { this.x = x; this.y = y; this.t = t; this.life = 45; this.vy = -2; } }

function getTile(c, r) { if (r < 0 || r >= tileMap.length || c < 0 || c >= tileMap[0].length) return ' '; return tileMap[r][c]; }
function solid(t) { return 'GBSPp?MXH'.includes(t); }
function tileCol(e, dx, dy) {
    const x = e.x + dx, y = e.y + dy, w = e.w || 32, h = e.h || 40;
    const l = Math.floor((x + 6) / TS), r = Math.floor((x + w - 6) / TS), t = Math.floor(y / TS), b = Math.floor((y + h - 1) / TS);
    for (let row = t; row <= b; row++)for (let col = l; col <= r; col++)if (solid(getTile(col, row))) return true; return false;
}

function hitBlock(c, r) {
    const t = getTile(c, r), k = c + ',' + r;
    if (t === '?' && !questionHit[k]) {
        questionHit[k] = true; tileMap[r][c] = 'M';
        if (Math.random() > 0.3) {
            coins++; score += 200; audio.coin(); fcoins.push(new FCoin(c * TS + 10, r * TS - 20)); popups.push(new PopUp(c * TS, r * TS - 30, '200'));
        } else {
            if (!player.big) { player.big = true; audio.powerUp(); popups.push(new PopUp(c * TS, r * TS - 30, 'POWER UP!')); }
            else { player.fire = true; audio.powerUp(); popups.push(new PopUp(c * TS, r * TS - 30, 'FIRE!')); } score += 1000;
        }
    } else if (t === 'B') { if (player.big) { tileMap[r][c] = ' '; audio.breakBlock(); for (let i = 0; i < 8; i++)sparks.push(new Spark(c * TS + 24, r * TS + 24, '#c88040')); score += 50; } else audio.bump(); }
}

function startGame(li) {
    curLvl = li; const L = LEVELS[li]; tileMap = L.tiles.map(r => [...r]);
    player = new Player(3, L.tiles.length - 3); cam = { x: 0 }; enemies = []; fcoins = []; particles = []; fireballs = []; popups = []; sparks = []; questionHit = {};
    for (let r = 0; r < tileMap.length; r++)for (let c = 0; c < tileMap[r].length; c++) { if (tileMap[r][c] === 'E') { enemies.push(new Enemy(c, r)); tileMap[r][c] = ' '; } }
    timer = 400; if (timerInt) clearInterval(timerInt); timerInt = setInterval(() => { if (state === ST.PLAYING) { timer--; if (timer <= 0) pDie(); } }, 1000);
    audio.init(); audio.stopMusic(); if (audio[L.music]) audio[L.music](); state = ST.PLAYING;
}

function pDie() {
    if (player.dead) return; player.dead = true; player.vy = -8; audio.stopMusic(); audio.die(); lives--;
    if (timerInt) clearInterval(timerInt); setTimeout(() => { if (lives <= 0) { state = ST.GAMEOVER; audio.gameOver(); score = 0; coins = 0; lives = 3; } else startGame(curLvl); }, 2500);
}

function levelClear() { state = ST.CLEAR; audio.stopMusic(); audio.flagpole(); if (timerInt) clearInterval(timerInt); score += timer * 50; }

// ═══ UPDATE ═══
function update() {
    if (state !== ST.PLAYING || player.dead) return;
    const gp = pollGP(), gs = gp.s || {}, ge = gp.e || {};
    if (ge.st || kEdge['KeyP'] || kEdge['Escape']) { state = ST.PAUSED; pauseSel = 0; audio.pause(); kEdge = {}; return; }
    if (kEdge['KeyM']) { audio.toggleMute(); kEdge['KeyM'] = false; }

    const ml = keys['ArrowLeft'] || keys['KeyA'] || gs.l, mr = keys['ArrowRight'] || keys['KeyD'] || gs.r;
    const jp = keys['Space'] || keys['KeyW'] || keys['ArrowUp'] || gs.j;
    const rn = keys['ShiftLeft'] || keys['ShiftRight'] || gs.b;
    const dk = keys['ArrowDown'] || keys['KeyS'] || gs.d;
    const ac = rn ? 0.7 : 0.45, mx = rn ? 7 : 4.5, fr = 0.84, gv = 0.6, jf = player.big ? -12.5 : -11;

    player.duck = dk && player.gr && player.big;
    if (ml && !player.duck) { player.vx -= ac; player.face = -1; } else if (mr && !player.duck) { player.vx += ac; player.face = 1; } else player.vx *= fr;
    player.vx = Math.max(-mx, Math.min(mx, player.vx)); if (Math.abs(player.vx) < 0.1) player.vx = 0;
    if (!tileCol(player, player.vx, 0)) player.x += player.vx; else { while (!tileCol(player, Math.sign(player.vx), 0)) player.x += Math.sign(player.vx); player.vx = 0; }
    if (jp && player.gr) { player.vy = jf; player.gr = false; audio.jump(); }
    if (!jp && player.vy < -3) player.vy *= 0.55;
    player.vy += gv; if (player.vy > 13) player.vy = 13;
    if (!tileCol(player, 0, player.vy)) { player.y += player.vy; player.gr = false; }
    else {
        if (player.vy > 0) { while (!tileCol(player, 0, 1)) player.y++; player.gr = true; }
        else { while (!tileCol(player, 0, -1)) player.y--; const hc = Math.floor((player.x + 16) / TS), hr = Math.floor((player.y - 1) / TS); hitBlock(hc, hr); const hc2 = Math.floor((player.x + player.w - 6) / TS); if (hc2 !== hc) hitBlock(hc2, hr); } player.vy = 0;
    }
    if (player.x < cam.x) player.x = cam.x;
    if (player.y > tileMap.length * TS + 100) pDie();
    // Fireball
    if (player.fire && rn && !player._fc) { player._fc = true; fireballs.push(new FB(player.x + 16, player.y + 12, player.face)); audio.fireball(); setTimeout(() => player._fc = false, 250); }
    if (player.inv > 0) player.inv--;
    player.at++; if (player.at >= 6) { player.at = 0; player.rf = (player.rf + 1) % 3; }
    // Coins
    const pcx = Math.floor((player.x + 16) / TS), pcy = Math.floor((player.y + 20) / TS);
    for (let dy = -1; dy <= 1; dy++)for (let dx = -1; dx <= 1; dx++) { const c = pcx + dx, r = pcy + dy; if (getTile(c, r) === 'C' && Math.abs(player.x + 16 - c * TS - 24) < 28 && Math.abs(player.y + 20 - r * TS - 24) < 28) { tileMap[r][c] = ' '; coins++; score += 200; audio.coin(); popups.push(new PopUp(c * TS, r * TS - 10, '200')); if (coins % 100 === 0) { lives++; audio.oneUp(); } } }
    // Flagpole
    for (let dy = -2; dy <= 2; dy++)for (let dx = 0; dx <= 1; dx++)if ('Ff'.includes(getTile(pcx + dx, pcy + dy))) { levelClear(); return; }
    // Enemies
    enemies.forEach(e => {
        if (!e.alive) return; if (e.sq) { e.st--; if (e.st <= 0) e.alive = false; return; }
        if (Math.abs(e.x - cam.x) > C.width + 200) return; e.vy += gv; if (e.vy > 10) e.vy = 10;
        if (!tileCol(e, e.vx, 0)) e.x += e.vx; else e.vx *= -1;
        if (!tileCol(e, 0, e.vy)) e.y += e.vy; else { if (e.vy > 0) while (!tileCol(e, 0, 1)) e.y++; e.vy = 0; }
        if (e.y > tileMap.length * TS + 100) { e.alive = false; return; }
        e.at++; if (e.at >= 12) { e.at = 0; e.af = 1 - e.af; }
        if (player.dead || player.inv > 0) return;
        const pb = { x: player.x + 6, y: player.big ? player.y - 20 : player.y, w: player.w - 12, h: player.big ? 56 : 40 };
        const eb = { x: e.x + 4, y: e.y + 4, w: e.w - 8, h: e.h - 8 };
        if (pb.x < eb.x + eb.w && pb.x + pb.w > eb.x && pb.y < eb.y + eb.h && pb.y + pb.h > eb.y) {
            if (player.vy > 0 && pb.y + pb.h - 12 < eb.y + eb.h / 2) { e.sq = true; e.st = 20; player.vy = -9; score += 100; audio.stomp(); popups.push(new PopUp(e.x, e.y - 15, '100')); for (let i = 0; i < 5; i++)sparks.push(new Spark(e.x + 20, e.y + 20, '#ffcc00')); }
            else { if (player.fire) { player.fire = false; player.inv = 90; audio.damage(); } else if (player.big) { player.big = false; player.inv = 90; audio.damage(); } else pDie(); }
        }
    });
    // Fireballs
    fireballs.forEach(f => {
        if (!f.alive) return; f.vy += 0.4; f.x += f.vx; f.y += f.vy;
        if (tileCol({ x: f.x, y: f.y, w: f.w, h: f.h }, 0, f.vy)) { f.vy = -5.5; f.bn++; if (f.bn > 4) f.alive = false; }
        if (tileCol({ x: f.x, y: f.y, w: f.w, h: f.h }, f.vx, 0)) { f.alive = false; for (let i = 0; i < 3; i++)sparks.push(new Spark(f.x, f.y, '#ff6600')); }
        enemies.forEach(en => { if (!en.alive || en.sq) return; if (f.x < en.x + en.w && f.x + f.w > en.x && f.y < en.y + en.h && f.y + f.h > en.y) { en.alive = false; f.alive = false; score += 200; audio.stomp(); popups.push(new PopUp(en.x, en.y - 15, '200')); for (let i = 0; i < 6; i++)sparks.push(new Spark(en.x + 20, en.y + 20, '#ff4400')); } });
        if (f.y > tileMap.length * TS + 50) f.alive = false;
    });
    fireballs = fireballs.filter(f => f.alive);
    fcoins.forEach(c => { c.y += c.vy; c.vy += 0.3; c.life--; }); fcoins = fcoins.filter(c => c.life > 0);
    sparks.forEach(s => s.update()); sparks = sparks.filter(s => s.life > 0);
    popups.forEach(p => { p.y += p.vy; p.life--; }); popups = popups.filter(p => p.life > 0);
    cam.x += (player.x - C.width / 3 - cam.x) * 0.08; if (cam.x < 0) cam.x = 0;
    kEdge = {};
}

// ═══ DRAW GAME ═══
function drawGame() {
    if (state !== ST.PLAYING && state !== ST.PAUSED && state !== ST.CLEAR) return;
    const L = LEVELS[curLvl], ox = -cam.x, t = Date.now() * 0.001;
    // Sky gradient
    const sg = X.createLinearGradient(0, 0, 0, C.height); sg.addColorStop(0, L.sky[0]); sg.addColorStop(0.5, L.sky[1]); sg.addColorStop(1, L.sky[2]);
    X.fillStyle = sg; X.fillRect(0, 0, C.width, C.height);
    // Clouds (3D parallax)
    L.clouds?.forEach(c => {
        const cx = c.x * TS + ox * 0.35, cy = c.y * TS + 30; const sz = c.s * 28;
        X.fillStyle = 'rgba(255,255,255,0.7)'; X.beginPath(); X.arc(cx, cy + sz, sz, 0, Math.PI * 2); X.arc(cx + sz, cy, sz * 1.3, 0, Math.PI * 2); X.arc(cx + sz * 2, cy + sz * 0.4, sz, 0, Math.PI * 2); X.fill();
        X.fillStyle = 'rgba(255,255,255,0.3)'; X.beginPath(); X.arc(cx, cy + sz - 4, sz - 2, Math.PI, 0); X.arc(cx + sz, cy - 4, sz * 1.3 - 2, Math.PI, 0); X.fill();
    });
    // Hills
    L.hills?.forEach(h => {
        const hx = h.x * TS + ox * 0.55, hy = h.y * TS; const s = h.s * TS;
        const hg = X.createLinearGradient(hx, hy - s * 0.5, hx, hy + TS); hg.addColorStop(0, '#2ecc40'); hg.addColorStop(1, '#1a8a28');
        X.fillStyle = hg; X.beginPath(); X.moveTo(hx - s, hy + TS); X.quadraticCurveTo(hx + s / 2, hy - s * 0.6, hx + s * 2, hy + TS); X.fill();
    });
    // Tiles
    const sc = Math.max(0, Math.floor(cam.x / TS) - 1), ec = Math.min(tileMap[0].length, sc + Math.ceil(C.width / TS) + 3);
    for (let r = 0; r < tileMap.length; r++)for (let c = sc; c < ec; c++) {
        const tile = getTile(c, r), tx = c * TS + ox, ty = r * TS;
        if (tile === 'G') {
            const isTop = r > 0 && getTile(c, r - 1) !== 'G';
            if (isTop) { const gg = X.createLinearGradient(tx, ty, tx, ty + TS); gg.addColorStop(0, L.ground); gg.addColorStop(1, L.dirt); X.fillStyle = gg; }
            else X.fillStyle = L.dirt; X.fillRect(tx, ty, TS, TS);
            X.strokeStyle = 'rgba(0,0,0,0.12)'; X.strokeRect(tx, ty, TS, TS);
            if (isTop) { X.fillStyle = 'rgba(255,255,255,0.15)'; X.fillRect(tx, ty, TS, 3); }
        } else if (tile === 'B') {
            draw3DBox(tx, ty, TS, TS, '#a0522d', '#c87040', '#8a4020', 5); X.strokeStyle = 'rgba(0,0,0,0.3)'; X.lineWidth = 1;
            X.beginPath(); X.moveTo(tx, ty + TS / 2); X.lineTo(tx + TS, ty + TS / 2); X.moveTo(tx + TS / 2, ty); X.lineTo(tx + TS / 2, ty + TS / 2); X.moveTo(tx + TS / 4, ty + TS / 2); X.lineTo(tx + TS / 4, ty + TS); X.moveTo(tx + TS * 3 / 4, ty + TS / 2); X.lineTo(tx + TS * 3 / 4, ty + TS); X.stroke();
        } else if (tile === '?' || tile === 'H') {
            const bob = Math.sin(t * 4 + c) * 3; draw3DBox(tx, ty + bob, TS, TS, '#daa520', '#f0c040', '#b8901a', 5); drawGloss(tx, ty + bob, TS, TS);
            X.fillStyle = '#fff'; X.font = 'bold 22px Orbitron'; X.textAlign = 'center'; X.shadowBlur = 8; X.shadowColor = '#fff'; X.fillText('?', tx + TS / 2, ty + bob + TS / 2 + 8); X.shadowBlur = 0; X.textAlign = 'left';
        } else if (tile === 'M') {
            draw3DBox(tx, ty, TS, TS, '#555', '#666', '#444', 4);
        } else if (tile === 'S') {
            draw3DBox(tx, ty, TS, TS, '#888', '#999', '#777', 4);
        } else if (tile === 'p') {
            X.fillStyle = '#00cc00'; X.fillRect(tx - 5, ty, TS + 10, TS); const pg = X.createLinearGradient(tx - 5, ty, tx + TS + 5, ty); pg.addColorStop(0, '#00ff00'); pg.addColorStop(0.3, '#00cc00'); pg.addColorStop(1, '#008800'); X.fillStyle = pg; X.fillRect(tx - 5, ty, TS + 10, TS);
        } else if (tile === 'P') {
            const pg = X.createLinearGradient(tx, ty, tx + TS, ty); pg.addColorStop(0, '#00ee00'); pg.addColorStop(0.3, '#00aa00'); pg.addColorStop(1, '#006600'); X.fillStyle = pg; X.fillRect(tx + 2, ty, TS - 4, TS);
        } else if (tile === 'C') {
            const bob = Math.sin(t * 5 + c) * 4; X.fillStyle = '#ffd700'; X.shadowBlur = 10; X.shadowColor = '#ffd700'; X.beginPath(); X.ellipse(tx + TS / 2, ty + TS / 2 + bob, 12, 16, 0, 0, Math.PI * 2); X.fill(); X.fillStyle = 'rgba(255,255,255,0.6)'; X.beginPath(); X.ellipse(tx + TS / 2, ty + TS / 2 + bob, 5, 9, 0, 0, Math.PI * 2); X.fill(); X.shadowBlur = 0;
        } else if (tile === 'F') {
            X.fillStyle = '#aaa'; X.fillRect(tx + TS / 2 - 3, ty, 6, TS); X.fillStyle = 'rgba(200,200,200,0.3)'; X.fillRect(tx + TS / 2 - 1, ty, 2, TS);
        } else if (tile === 'f') { X.fillStyle = '#aaa'; X.fillRect(tx + TS / 2 - 3, ty, 6, TS); X.fillStyle = '#ffd700'; X.shadowBlur = 8; X.shadowColor = '#ffd700'; X.beginPath(); X.arc(tx + TS / 2, ty + 5, 6, 0, Math.PI * 2); X.fill(); X.shadowBlur = 0; X.fillStyle = '#ff0044'; X.beginPath(); X.moveTo(tx + TS / 2 - 3, ty + 10); X.lineTo(tx + TS / 2 - 30, ty + 24); X.lineTo(tx + TS / 2 - 3, ty + 38); X.fill(); }
    }
    // Floating coins
    fcoins.forEach(c => { X.fillStyle = '#ffd700'; X.shadowBlur = 6; X.shadowColor = '#ffd700'; X.fillRect(c.x + ox, c.y, 18, 18); X.shadowBlur = 0; });
    // Sparks
    sparks.forEach(s => { s.draw(); });  // uses global X
    // Popups
    X.font = 'bold 14px Orbitron'; popups.forEach(p => { X.globalAlpha = p.life / 45; X.fillStyle = '#fff'; X.shadowBlur = 5; X.shadowColor = '#fff'; X.fillText(p.t, p.x + ox, p.y); X.shadowBlur = 0; }); X.globalAlpha = 1;
    // Enemies (3D shaded)
    enemies.forEach(e => {
        if (!e.alive) return; if (Math.abs(e.x - cam.x) > C.width + 200) return; const ex = e.x + ox, ey = e.y;
        if (e.sq) { X.fillStyle = '#8B4513'; X.fillRect(ex + 2, ey + 32, 36, 8); return; }
        drawShadow(ex, ey + e.h + 2, e.w);
        const eg = X.createRadialGradient(ex + 20, ey + 15, 5, ex + 20, ey + 25, 25); eg.addColorStop(0, '#c87040'); eg.addColorStop(1, '#6b3420');
        X.fillStyle = eg; X.beginPath(); X.arc(ex + 20, ey + 12, 18, Math.PI, 0); X.fillRect(ex + 2, ey + 12, 36, 20); X.fill();
        X.fillStyle = '#fff'; X.fillRect(ex + 8, ey + 10, 7, 7); X.fillRect(ex + 25, ey + 10, 7, 7);
        X.fillStyle = '#000'; X.fillRect(ex + (e.af === 0 ? 9 : 11), ey + 12, 3, 4); X.fillRect(ex + (e.af === 0 ? 27 : 25), ey + 12, 3, 4);
        X.fillStyle = '#222'; const fo = e.af === 0 ? 0 : 3; X.fillRect(ex + 2 + fo, ey + 34, 12, 6); X.fillRect(ex + 26 - fo, ey + 34, 12, 6);
    });
    // Fireballs
    fireballs.forEach(f => { const fx = f.x + ox; X.fillStyle = '#ff6600'; X.shadowBlur = 12; X.shadowColor = '#ff6600'; X.beginPath(); X.arc(fx + 6, f.y + 6, 6, 0, Math.PI * 2); X.fill(); X.fillStyle = '#ffff00'; X.beginPath(); X.arc(fx + 6, f.y + 6, 3, 0, Math.PI * 2); X.fill(); X.shadowBlur = 0; });
    // Player (3D shaded)
    if (player && !player.dead) {
        if (player.inv > 0 && Math.floor(player.inv / 4) % 2 === 0) { } else {
            const px = player.x + ox, py = player.y, f = player.face, h = player.big ? 60 : 40, yo = player.big ? -20 : 0;
            drawShadow(px, py + h + yo + 2, player.w);
            X.save(); if (f === -1) { X.translate(px + 16, 0); X.scale(-1, 1); X.translate(-(px + 16), 0); }
            // Hat (3D gradient)
            const hg = X.createLinearGradient(px + 4, py + yo, px + 28, py + yo + 12); hg.addColorStop(0, player.fire ? '#fff' : '#ff2255'); hg.addColorStop(1, player.fire ? '#ffcccc' : '#cc0033');
            X.fillStyle = hg; X.beginPath(); X.moveTo(px + 4, py + yo + 12); X.lineTo(px + 6, py + yo + 2); X.quadraticCurveTo(px + 16, py + yo - 2, px + 28, py + yo + 4); X.lineTo(px + 28, py + yo + 12); X.fill();
            // Face
            const fg = X.createRadialGradient(px + 16, py + yo + 16, 3, px + 16, py + yo + 18, 14); fg.addColorStop(0, '#ffe0b0'); fg.addColorStop(1, '#e8b878');
            X.fillStyle = fg; X.fillRect(px + 4, py + yo + 12, 24, 14);
            // Eyes
            X.fillStyle = '#000'; X.fillRect(px + 17, py + yo + 15, 4, 5); X.fillStyle = '#fff'; X.fillRect(px + 18, py + yo + 15, 2, 2);
            // Body
            const bg2 = X.createLinearGradient(px, py + yo + 26, px + 32, py + yo + 26); bg2.addColorStop(0, player.fire ? '#ff2255' : '#0055ee'); bg2.addColorStop(1, player.fire ? '#cc0033' : '#003399');
            X.fillStyle = bg2; X.fillRect(px + 2, py + yo + 26, 28, player.big ? 22 : 14);
            // Belt
            X.fillStyle = '#ffd700'; X.fillRect(px + 4, py + yo + 26, 24, 3);
            // Feet
            if (!player.duck) {
                X.fillStyle = '#5a2d0c'; const fh = player.big ? 8 : 6;
                if (player.gr && Math.abs(player.vx) > 0.5) {
                    if (player.rf === 0) { X.fillRect(px + 2, py + yo + h - fh, 12, fh); X.fillRect(px + 18, py + yo + h - fh + 2, 12, fh - 2); }
                    else if (player.rf === 1) { X.fillRect(px + 6, py + yo + h - fh, 10, fh); X.fillRect(px + 18, py + yo + h - fh, 10, fh); }
                    else { X.fillRect(px + 18, py + yo + h - fh, 12, fh); X.fillRect(px + 2, py + yo + h - fh + 2, 12, fh - 2); }
                }
                else { X.fillRect(px + 2, py + yo + h - fh, 12, fh); X.fillRect(px + 18, py + yo + h - fh, 12, fh); }
            }
            X.restore();
        }
    } else if (player && player.dead) { const px = player.x + ox; X.fillStyle = '#ff0044'; X.fillRect(px + 6, player.y, 20, 10); X.fillStyle = '#ffcc99'; X.fillRect(px + 4, player.y + 10, 24, 14); X.fillStyle = '#0055dd'; X.fillRect(px + 2, player.y + 24, 28, 16); player.vy += 0.3; player.y += player.vy; }
    drawHUD();
}

// ═══ MENU INPUT ═══
function handleInput() {
    const gp = pollGP(), ge = gp.e || {};
    if (state === ST.TITLE) {
        if (kEdge['ArrowUp'] || kEdge['KeyW'] || ge.u) { menuSel = Math.max(0, menuSel - 1); audio.menuSelect(); }
        if (kEdge['ArrowDown'] || kEdge['KeyS'] || ge.d) { menuSel = Math.min(3, menuSel + 1); audio.menuSelect(); }
        if (kEdge['Enter'] || kEdge['Space'] || ge.j || ge.st) { audio.menuConfirm(); if (menuSel === 0) startGame(0); else if (menuSel === 1) { state = ST.LEVELS; lvlSel = 0; } else if (menuSel === 2) state = ST.CONTROLS; }
    } else if (state === ST.LEVELS) {
        if (kEdge['ArrowLeft'] || kEdge['KeyA'] || ge.l) { lvlSel = Math.max(0, lvlSel - 1); audio.menuSelect(); }
        if (kEdge['ArrowRight'] || kEdge['KeyD'] || ge.r) { lvlSel = Math.min(WORLDS.length - 1, lvlSel + 1); audio.menuSelect(); }
        if ((kEdge['Enter'] || kEdge['Space'] || ge.j) && !WORLDS[lvlSel].locked && lvlSel < LEVELS.length) { audio.menuConfirm(); startGame(lvlSel); }
        if (kEdge['Escape'] || kEdge['Backspace'] || ge.b) { state = ST.TITLE; }
    } else if (state === ST.CONTROLS) { if (kEdge['Escape'] || kEdge['Backspace'] || ge.b) state = ST.TITLE; }
    else if (state === ST.PAUSED) {
        if (kEdge['ArrowUp'] || kEdge['KeyW'] || ge.u) { pauseSel = Math.max(0, pauseSel - 1); audio.menuSelect(); }
        if (kEdge['ArrowDown'] || kEdge['KeyS'] || ge.d) { pauseSel = Math.min(2, pauseSel + 1); audio.menuSelect(); }
        if (kEdge['Enter'] || kEdge['Space'] || ge.j) { audio.menuConfirm(); if (pauseSel === 0) state = ST.PLAYING; else if (pauseSel === 1) startGame(curLvl); else { state = ST.TITLE; audio.stopMusic(); } }
        if (kEdge['KeyP'] || kEdge['Escape'] || ge.st) state = ST.PLAYING;
    } else if (state === ST.GAMEOVER) { if (kEdge['Enter'] || kEdge['Space'] || ge.j || ge.st) state = ST.TITLE; }
    else if (state === ST.CLEAR) { if (kEdge['Enter'] || kEdge['Space'] || ge.j || ge.st) { if (curLvl + 1 < LEVELS.length) startGame(curLvl + 1); else state = ST.TITLE; } }
    kEdge = {};
}

// ═══ MAIN LOOP ═══
function loop() {
    handleInput();
    if (state === ST.TITLE) drawTitle();
    else if (state === ST.LEVELS) drawLevels();
    else if (state === ST.CONTROLS) drawControls();
    else if (state === ST.PLAYING) { update(); drawGame(); }
    else if (state === ST.PAUSED) { drawGame(); drawOverlay('PAUSED', '#00d4ff', ['RESUME', 'RESTART', 'QUIT TO TITLE'], pauseSel); }
    else if (state === ST.GAMEOVER) { X.fillStyle = '#000'; X.fillRect(0, 0, C.width, C.height); drawOverlay('GAME OVER', '#ff0044', null, 0, 'SCORE: ' + score); }
    else if (state === ST.CLEAR) { drawGame(); drawOverlay('WORLD CLEAR!', '#ffd700', null, 0, `TIME BONUS: ${timer * 50}  SCORE: ${score}`); }
    requestAnimationFrame(loop);
}
audio.init?.();
loop();
document.addEventListener('click', () => audio.init(), { once: true });
