// Multi-Agent Orchestration — Real-Time Streamer Service
// Node.js Event Streaming for Visualization — January 2026

import { Kafka, Consumer, Producer } from 'kafkajs';
import { WebSocketServer, WebSocket } from 'ws';
import { createCanvas } from 'canvas';
import * as fs from 'fs';
import { spawn } from 'child_process';

// ═══════════════════════════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════════════════════════
const config = {
    kafka: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        topics: ['proposals', 'votes', 'events', 'metrics'],
    },
    websocket: { port: parseInt(process.env.WS_PORT || '8888') },
    frames: { outputDir: './frames', width: 1920, height: 1080 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Kafka Consumer
// ═══════════════════════════════════════════════════════════════════════════════
const kafka = new Kafka({
    clientId: 'orchestrator-streamer',
    brokers: config.kafka.brokers,
});

const consumer: Consumer = kafka.consumer({ groupId: 'streamer-group' });
const producer: Producer = kafka.producer();

// ═══════════════════════════════════════════════════════════════════════════════
// WebSocket Server
// ═══════════════════════════════════════════════════════════════════════════════
const wss = new WebSocketServer({ port: config.websocket.port });
const clients: Set<WebSocket> = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`Client connected. Total: ${clients.size}`);

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`Client disconnected. Total: ${clients.size}`);
    });
});

function broadcast(event: object): void {
    const message = JSON.stringify(event);
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Frame Generator
// ═══════════════════════════════════════════════════════════════════════════════
let frameCount = 0;

interface AgentEvent {
    type: string;
    agent: string;
    action: string;
    timestamp: string;
    data?: Record<string, unknown>;
}

function generateFrame(event: AgentEvent): string {
    const canvas = createCanvas(config.frames.width, config.frames.height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, config.frames.width, config.frames.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.frames.width, config.frames.height);

    // Header
    ctx.fillStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.fillRect(0, 0, config.frames.width, 80);

    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#00d4ff';
    ctx.fillText('🧠 Multi-Agent Orchestration', 40, 50);

    // Event info
    ctx.font = '24px monospace';
    ctx.fillStyle = '#e0e0e0';
    ctx.fillText(`Agent: ${event.agent}`, 40, 150);
    ctx.fillText(`Action: ${event.action}`, 40, 190);
    ctx.fillText(`Timestamp: ${event.timestamp}`, 40, 230);

    // Agent visualization
    const agentColors: Record<string, string> = {
        CodeScanner: '#4ade80',
        UnitTester: '#60a5fa',
        SecurityAgent: '#f472b6',
        FixGenerator: '#fbbf24',
        MergeGate: '#a78bfa',
    };

    ctx.fillStyle = agentColors[event.agent] || '#7c3aed';
    ctx.beginPath();
    ctx.arc(config.frames.width / 2, config.frames.height / 2, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(event.agent, config.frames.width / 2, config.frames.height / 2 + 10);

    // Save frame
    const framePath = `${config.frames.outputDir}/frame_${String(frameCount++).padStart(6, '0')}.png`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(framePath, buffer);

    return framePath;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Video Compilation (ffmpeg)
// ═══════════════════════════════════════════════════════════════════════════════
function compileVideo(outputPath: string, audioPath?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const args = [
            '-framerate', '1',
            '-pattern_type', 'glob',
            '-i', `${config.frames.outputDir}/*.png`,
        ];

        if (audioPath) {
            args.push('-i', audioPath);
            args.push('-c:a', 'aac');
        }

        args.push(
            '-c:v', 'libx264',
            '-r', '25',
            '-pix_fmt', 'yuv420p',
            '-shortest',
            '-y',
            outputPath
        );

        const ffmpeg = spawn('ffmpeg', args);
        ffmpeg.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
        ffmpeg.on('error', reject);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════
async function main(): Promise<void> {
    fs.mkdirSync(config.frames.outputDir, { recursive: true });

    await consumer.connect();
    await producer.connect();

    for (const topic of config.kafka.topics) {
        await consumer.subscribe({ topic, fromBeginning: false });
    }

    console.log(`Streamer running on ws://localhost:${config.websocket.port}`);

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            const event: AgentEvent = JSON.parse(message.value?.toString() || '{}');

            broadcast({ topic, ...event });
            generateFrame(event);

            console.log(`[${topic}] ${event.agent}: ${event.action}`);
        },
    });
}

main().catch(console.error);
