#!/usr/bin/env node
/**
 * Auto-closing Vite dev server
 * Monitors browser heartbeat - closes server 30s after last ping
 */
import { spawn } from 'child_process';
import http from 'http';

const VITE_PORT = 5173;
const MONITOR_PORT = 5174;
const TIMEOUT_MS = 30000;

let lastPing = Date.now();
let hasConnected = false;
let vite = null;
let timer = null;

// Launch Vite
console.log('🚀 ASTRALIS dev server starting...');
vite = spawn('npx', ['vite', '--port', VITE_PORT.toString()], {
  stdio: 'inherit',
  shell: true,
});

// Heartbeat monitor
const monitor = http.createServer((req, res) => {
  if (req.url === '/dev-ping') {
    lastPing = Date.now();
    hasConnected = true;
    if (timer) clearTimeout(timer);
    res.writeHead(200);
    res.end('ok');
  } else {
    res.writeHead(404);
    res.end();
  }
});

monitor.listen(MONITOR_PORT);

// Watchdog: close if no ping for TIMEOUT_MS
setInterval(() => {
  if (hasConnected && Date.now() - lastPing > TIMEOUT_MS) {
    console.log('\n👋 Browser closed, shutting down...\n');
    process.exit(0);
  }
}, 5000);

process.on('SIGINT', () => {
  console.log('\n🛑 Shutdown\n');
  process.exit(0);
});
