// ═══════════════════════════════════════════════════════════════
// PRIME.AI: SWARM ARCHITECT — Procedural Audio Engine
// Zero external files, generates synthwave/cyberpunk sounds
// ═══════════════════════════════════════════════════════════════

window.audio = (() => {
    let ctx = null;
    let bGM = null;

    function init() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playTone(freq, type, dur, vol = 0.5, sweep = 0) {
        if (!ctx) return;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, ctx.currentTime);
        if (sweep) o.frequency.exponentialRampToValueAtTime(freq * sweep, ctx.currentTime + dur);
        g.gain.setValueAtTime(vol, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + dur);
    }

    function noise(dur, vol = 0.5) {
        if (!ctx) return;
        const bs = ctx.createBufferSource();
        const bf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
        const data = bf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        bs.buffer = bf;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
        bs.connect(g); g.connect(ctx.destination);
        bs.start();
    }

    // --- CYBERPUNK MUSIC LOOP ---
    const bpm = 120;
    const step = 60 / bpm / 4; // 16th note
    let nextNote = 0;
    let seqIndex = 0;

    // Phrygian Dominant scale (cyberpunk feel)
    const scale = [220, 233, 277, 293, 329, 349, 415, 440];

    function processMusic() {
        if (!ctx || !bGM) return;
        while (nextNote < ctx.currentTime + 0.1) {
            playStep(seqIndex, nextNote);
            nextNote += step;
            seqIndex++;
            if (seqIndex >= 16) seqIndex = 0;
        }
        bGM = requestAnimationFrame(processMusic);
    }

    function playStep(idx, time) {
        // Kick
        if (idx % 4 === 0) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine'; o.frequency.setValueAtTime(120, time); o.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
            g.gain.setValueAtTime(0.6, time); g.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
            o.connect(g); g.connect(ctx.destination);
            o.start(time); o.stop(time + 0.5);
        }
        // Hihat
        if (idx % 2 !== 0) {
            const bp = ctx.createBiquadFilter(); bp.type = 'highpass'; bp.frequency.value = 5000;
            const g = ctx.createGain(); g.gain.setValueAtTime(0.1, time); g.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

            const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = 400; // Fake noise
            o.connect(bp); bp.connect(g); g.connect(ctx.destination);
            o.start(time); o.stop(time + 0.1);
        }
        // Bassline arp
        if (idx % 1 === 0) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const n = scale[(idx * 3) % scale.length];
            o.type = 'sawtooth'; o.frequency.setValueAtTime(n / 2, time);

            // Lowpass filter
            const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
            lp.frequency.setValueAtTime(800, time);
            lp.frequency.exponentialRampToValueAtTime(100, time + 0.2);

            g.gain.setValueAtTime(0.2, time); g.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            o.connect(lp); lp.connect(g); g.connect(ctx.destination);
            o.start(time); o.stop(time + 0.2);
        }
    }

    return {
        init: () => { init(); },
        startMusic: () => {
            if (!ctx) init();
            if (bGM) return;
            nextNote = ctx.currentTime + 0.1;
            seqIndex = 0;
            processMusic();
        },
        stopMusic: () => {
            if (bGM) cancelAnimationFrame(bGM);
            bGM = null;
        },
        shoot: (v) => playTone(800, 'square', 0.1, v, 0.5),
        hit: (v) => noise(0.1, v),
        hurt: (v) => playTone(150, 'sawtooth', 0.3, v, 0.5),
        pickup: (v) => playTone(600 + Math.random() * 400, 'sine', 0.1, v, 1.2),
        powerup: () => {
            playTone(400, 'square', 0.2, 0.3);
            setTimeout(() => playTone(600, 'square', 0.2, 0.3), 100);
            setTimeout(() => playTone(800, 'square', 0.4, 0.3), 200);
        },
        die: () => playTone(100, 'sawtooth', 1.5, 0.5, 0.1)
    };
})();

// Auto-init on click
document.addEventListener('click', () => { window.audio.init(); });
document.addEventListener('keydown', () => { window.audio.init(); });
