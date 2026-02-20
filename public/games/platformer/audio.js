// ═══════════════════════════════════════════════════════════════
// PRIME.AI — Procedural Audio Engine (No external files needed)
// Generates all Mario-style sound effects via Web Audio API
// ═══════════════════════════════════════════════════════════════

class PrimeAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicGain = null;
        this.sfxGain = null;
        this.currentMusic = null;
    }

    init() {
        if (this.ctx) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.25;
        this.musicGain.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.4;
        this.sfxGain.connect(this.ctx.destination);
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.musicGain) this.musicGain.gain.value = this.muted ? 0 : 0.25;
        if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : 0.4;
    }

    // Utility: play a sequence of tones
    playTones(notes, destination) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        notes.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = n.type || 'square';
            osc.frequency.value = n.freq;
            gain.gain.setValueAtTime(n.vol || 0.3, now + n.start);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);
            osc.connect(gain);
            gain.connect(destination || this.sfxGain);
            osc.start(now + n.start);
            osc.stop(now + n.start + n.dur);
        });
    }

    // ─── SFX ───
    jump() {
        this.playTones([
            { freq: 400, start: 0, dur: 0.08 },
            { freq: 500, start: 0.04, dur: 0.08 },
            { freq: 600, start: 0.08, dur: 0.08 },
            { freq: 800, start: 0.1, dur: 0.12 },
        ]);
    }

    smallJump() {
        this.playTones([
            { freq: 300, start: 0, dur: 0.06 },
            { freq: 450, start: 0.04, dur: 0.08 },
            { freq: 550, start: 0.08, dur: 0.08 },
        ]);
    }

    coin() {
        this.playTones([
            { freq: 988, start: 0, dur: 0.06, type: 'square' },
            { freq: 1319, start: 0.06, dur: 0.2, type: 'square' },
        ]);
    }

    stomp() {
        this.playTones([
            { freq: 400, start: 0, dur: 0.04 },
            { freq: 200, start: 0.03, dur: 0.1 },
            { freq: 100, start: 0.08, dur: 0.15 },
        ]);
    }

    powerUp() {
        const notes = [];
        for (let i = 0; i < 12; i++) {
            notes.push({ freq: 200 + i * 80, start: i * 0.04, dur: 0.06, type: 'square' });
        }
        this.playTones(notes);
    }

    fireball() {
        this.playTones([
            { freq: 800, start: 0, dur: 0.04, type: 'sawtooth' },
            { freq: 400, start: 0.03, dur: 0.06, type: 'sawtooth' },
            { freq: 200, start: 0.06, dur: 0.08, type: 'sawtooth' },
        ]);
    }

    damage() {
        this.playTones([
            { freq: 300, start: 0, dur: 0.1, type: 'sawtooth' },
            { freq: 200, start: 0.08, dur: 0.15, type: 'sawtooth' },
            { freq: 100, start: 0.18, dur: 0.2, type: 'sawtooth' },
        ]);
    }

    die() {
        const notes = [];
        const freqs = [600, 580, 500, 450, 400, 350, 250, 200, 150];
        freqs.forEach((f, i) => {
            notes.push({ freq: f, start: i * 0.08, dur: 0.12, type: 'square' });
        });
        this.playTones(notes);
    }

    bump() {
        this.playTones([
            { freq: 250, start: 0, dur: 0.04 },
            { freq: 150, start: 0.03, dur: 0.06 },
        ]);
    }

    breakBlock() {
        this.playTones([
            { freq: 500, start: 0, dur: 0.03, type: 'noise' },
            { freq: 300, start: 0.02, dur: 0.04, type: 'sawtooth' },
            { freq: 150, start: 0.04, dur: 0.06, type: 'sawtooth' },
        ]);
    }

    flagpole() {
        const melody = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
        const notes = melody.map((f, i) => ({
            freq: f, start: i * 0.08, dur: 0.12, type: 'square'
        }));
        this.playTones(notes);
    }

    oneUp() {
        this.playTones([
            { freq: 330, start: 0, dur: 0.08, type: 'square' },
            { freq: 524, start: 0.08, dur: 0.08, type: 'square' },
            { freq: 660, start: 0.16, dur: 0.08, type: 'square' },
            { freq: 786, start: 0.24, dur: 0.08, type: 'square' },
            { freq: 1047, start: 0.32, dur: 0.15, type: 'square' },
        ]);
    }

    pipe() {
        this.playTones([
            { freq: 200, start: 0, dur: 0.15, type: 'triangle' },
            { freq: 150, start: 0.1, dur: 0.2, type: 'triangle' },
        ]);
    }

    menuSelect() {
        this.playTones([
            { freq: 660, start: 0, dur: 0.05 },
        ]);
    }

    menuConfirm() {
        this.playTones([
            { freq: 524, start: 0, dur: 0.06 },
            { freq: 660, start: 0.06, dur: 0.06 },
            { freq: 786, start: 0.12, dur: 0.1 },
        ]);
    }

    pause() {
        this.playTones([
            { freq: 500, start: 0, dur: 0.12, type: 'triangle' },
        ]);
    }

    gameOver() {
        const freqs = [392, 330, 262, 330, 294, 262, 220, 196, 165];
        const notes = freqs.map((f, i) => ({
            freq: f, start: i * 0.15, dur: 0.2, type: 'square', vol: 0.25
        }));
        this.playTones(notes);
    }

    levelClear() {
        const melody = [
            { freq: 392, start: 0, dur: 0.12 },
            { freq: 392, start: 0.1, dur: 0.12 },
            { freq: 392, start: 0.22, dur: 0.12 },
            { freq: 311, start: 0.34, dur: 0.18 },
            { freq: 349, start: 0.52, dur: 0.12 },
            { freq: 392, start: 0.66, dur: 0.12 },
            { freq: 349, start: 0.78, dur: 0.12 },
            { freq: 392, start: 0.9, dur: 0.5 },
        ];
        this.playTones(melody);
    }

    // ─── MUSIC (looping) ───
    startOverworldMusic() {
        this.stopMusic();
        this._playMusic([
            'C4', 'E4', 'G4', 'C5', 'A4', 'B4', 'A4', 'G4',
            'E4', 'G4', 'A4', 'F4', 'G4', 'E4', 'C4', 'D4',
            'B3', 'C4', 'D4', 'E4', 'C4', 'A3', 'B3', 'C4'
        ], 0.14);
    }

    startUndergroundMusic() {
        this.stopMusic();
        this._playMusic([
            'C3', 'C4', 'A3', 'A4', 'Ab3', 'Ab4', 'Bb3', 'Bb4',
            'C3', 'C4', 'A3', 'A4', 'Ab3', 'Ab4', 'Bb3', 'Bb4'
        ], 0.2, 'triangle');
    }

    startSkyMusic() {
        this.stopMusic();
        this._playMusic([
            'E5', 'D5', 'C5', 'D5', 'E5', 'E5', 'E5', 'D5',
            'D5', 'D5', 'E5', 'G5', 'G5', 'E5', 'D5', 'C5',
            'D5', 'E5', 'E5', 'E5', 'E5', 'D5', 'D5', 'E5', 'D5', 'C5'
        ], 0.13);
    }

    _playMusic(noteNames, speed, type = 'square') {
        if (!this.ctx) return;
        const noteFreqs = {
            'C3': 131, 'D3': 147, 'Eb3': 156, 'E3': 165, 'F3': 175, 'G3': 196, 'Ab3': 208, 'A3': 220, 'Bb3': 233, 'B3': 247,
            'C4': 262, 'D4': 294, 'Eb4': 311, 'E4': 330, 'F4': 349, 'G4': 392, 'Ab4': 415, 'A4': 440, 'Bb4': 466, 'B4': 494,
            'C5': 523, 'D5': 587, 'Eb5': 622, 'E5': 659, 'F5': 698, 'G5': 784, 'Ab5': 831, 'A5': 880, 'Bb5': 932, 'B5': 988
        };
        let index = 0;
        const loop = () => {
            if (!this.ctx) return;
            const note = noteNames[index % noteNames.length];
            const freq = noteFreqs[note] || 262;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            g.gain.setValueAtTime(0.15, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + speed * 0.9);
            osc.connect(g);
            g.connect(this.musicGain);
            osc.start();
            osc.stop(this.ctx.currentTime + speed);
            index++;
            this.currentMusic = setTimeout(loop, speed * 1000);
        };
        loop();
    }

    stopMusic() {
        if (this.currentMusic) {
            clearTimeout(this.currentMusic);
            this.currentMusic = null;
        }
    }
}

const audio = new PrimeAudio();
