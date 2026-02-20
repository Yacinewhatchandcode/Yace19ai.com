// Clip UX Grid setup
const gridContainer = document.getElementById('pad-grid');
const terminalFeed = document.getElementById('terminal-feed');
const padElements = [];

// Create 16 pads
for (let i = 0; i < 16; i++) {
    const pad = document.createElement('div');
    pad.className = 'pad';
    pad.id = `pad-${i}`;
    
    const padId = document.createElement('span');
    padId.className = 'pad-id';
    padId.innerText = (i < 9 ? '0' : '') + (i + 1);
    
    const padLabel = document.createElement('span');
    padLabel.className = 'pad-label';
    padLabel.innerText = getLabelForPad(i);
    
    pad.appendChild(padId);
    pad.appendChild(padLabel);
    
    // Mouse fallback for testing
    pad.addEventListener('mousedown', () => simulatePadPress(i));
    pad.addEventListener('mouseup', () => simulatePadRelease(i));
    pad.addEventListener('mouseleave', () => simulatePadRelease(i));
    
    gridContainer.appendChild(pad);
    padElements.push(pad);
}

function getLabelForPad(index) {
    const labels = [
        "INIT CORE", "FETCH REPO", "BUILD UI", "FIRE PROXY",
        "SYNC AGENT", "BOOT S2S", "MCP LINK", "EXEC SWARM",
        "PULL CLOUD", "ACTIVATE DB", "ORBITAL", "DEBUG RPA",
        "TEST PING", "ALLOC VAST", "GPU INFER", "OVERDRIVE"
    ];
    return labels[index] || "NODE";
}

// Terminal Logic
function addTerminalLine(text, type = 'system') {
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    const timestamp = new Date().toISOString().substring(11, 19);
    line.innerText = `[${timestamp}] ${text}`;
    terminalFeed.appendChild(line);
    terminalFeed.scrollTop = terminalFeed.scrollHeight;
}

// Gamepad API Logic
let gamepadConnected = false;
let gamepadIndex = null;
let previousPadStates = new Array(16).fill(false);
let totalXp = 0;
let currentLevel = 0;

window.addEventListener("gamepadconnected", (e) => {
    gamepadConnected = true;
    gamepadIndex = e.gamepad.index;
    
    const statusText = document.getElementById("gamepad-status");
    const activeDot = document.getElementById("gamepad-dot");
    
    statusText.innerText = `CONNECTED: ${e.gamepad.id.substring(0, 25)}...`;
    statusText.style.color = "var(--neon-cyan)";
    activeDot.classList.add("active");
    
    addTerminalLine(`Hardware connected: ${e.gamepad.id}`, 'hardware');
    addTerminalLine(`[GEMINI] Direct MCP telemetry link locked on ${e.gamepad.axes.length} axes, ${e.gamepad.buttons.length} switches.`, 'agent');
    
    advanceLevel(1);
    
    requestAnimationFrame(updateLoop);
});

window.addEventListener("gamepaddisconnected", (e) => {
    gamepadConnected = false;
    gamepadIndex = null;
    
    const statusText = document.getElementById("gamepad-status");
    const activeDot = document.getElementById("gamepad-dot");
    
    statusText.innerText = "WAITING FOR JOYSTICK (USB-C)...";
    statusText.style.color = "var(--text-main)";
    activeDot.classList.remove("active");
    
    addTerminalLine(`Hardware disconnected. Lost link.`, 'warning');
});

function simulatePadPress(i) {
    if(padElements[i]) padElements[i].classList.add('pressed');
    handleInputFire(i);
}

function simulatePadRelease(i) {
    if(padElements[i]) padElements[i].classList.remove('pressed');
}

function handleInputFire(i) {
    addTerminalLine(`Command ${getLabelForPad(i)} executed.`, 'system');
    
    // Add XP
    totalXp += 5;
    if(totalXp > 100) totalXp = 100;
    
    document.getElementById('sync-percent').innerText = totalXp;
    document.getElementById('level-progress').style.width = `${totalXp}%`;
    
    if(totalXp >= 33 && currentLevel < 2) advanceLevel(2);
    if(totalXp >= 66 && currentLevel < 3) advanceLevel(3);
    
    // Agent random replies
    if (Math.random() > 0.7) {
        const agentPhrases = [
            `[GEMINI] Processing ${getLabelForPad(i)} protocol via MCP.`,
            `[GEMINI] Validating node structure. All green.`,
            `[GEMINI] Integrating joystick parameters into swarm logic.`,
            `[GEMINI] Zero-Illusion verification applied to node ${i}.`,
            `[GEMINI] Qilive module response time: ${Math.floor(Math.random()*15+2)}ms. Optimal.`
        ];
        setTimeout(() => {
            const phrase = agentPhrases[Math.floor(Math.random() * agentPhrases.length)];
            addTerminalLine(phrase, 'agent');
        }, 400);
    }
}

function advanceLevel(level) {
    currentLevel = level;
    document.querySelectorAll('.level-box').forEach((el, index) => {
        if (index < level) {
            el.classList.remove('active');
            el.classList.add('completed');
        } else if (index === level) {
            el.classList.add('active');
        }
    });
    
    const phases = ["STANDBY", "DEVICE SYNC", "DATA STREAM", "OVERDRIVE"];
    document.getElementById('current-phase').innerText = phases[level];
    
    addTerminalLine(`[SYSTEM] Escalated to Phase: ${phases[level]}`, 'warning');
    if(level === 3) {
        addTerminalLine(`[GEMINI] OVERDRIVE ENGAGED. Full sovereign payload delivery ready.`, 'agent');
        document.body.style.boxShadow = "inset 0 0 50px rgba(0, 243, 255, 0.2)";
    }
}

function updateLoop() {
    if (!gamepadConnected) return;

    const gamepads = navigator.getGamepads();
    const gp = gamepads[gamepadIndex];
    if (gp) {
        // Update Buttons (map first 16 to pads)
        for (let i = 0; i < Math.min(gp.buttons.length, 16); i++) {
            const isPressed = gp.buttons[i].pressed;
            if (isPressed && !previousPadStates[i]) {
                simulatePadPress(i);
            } else if (!isPressed && previousPadStates[i]) {
                simulatePadRelease(i);
            }
            previousPadStates[i] = isPressed;
        }

        // Diagnostics update
        if(gp.axes.length >= 2) {
            document.getElementById('l-stick-val').innerText = `${gp.axes[0].toFixed(2)}, ${gp.axes[1].toFixed(2)}`;
        }
        if(gp.axes.length >= 4) {
            document.getElementById('r-stick-val').innerText = `${gp.axes[2].toFixed(2)}, ${gp.axes[3].toFixed(2)}`;
        }
        if(gp.buttons.length >= 8) {
             document.getElementById('trigger-val').innerText = `${gp.buttons[6].value.toFixed(2)}, ${gp.buttons[7].value.toFixed(2)}`;
        }
    }

    requestAnimationFrame(updateLoop);
}

// Initial agent prompt
setTimeout(() => {
    addTerminalLine("[GEMINI] Antigravity MCP tunnel established. Waiting for hardware handshake...", "agent");
}, 1000);
