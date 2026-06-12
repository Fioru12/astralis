/**
 * Dev heartbeat - keeps Vite server alive while browser is open
 * Only active if dev-server.js is running on port 5174
 */

if (import.meta.env.DEV) {
  let portAvailable = false;

  // Quick check on first load
  fetch('http://localhost:5174/dev-ping', {
    method: 'GET',
    credentials: 'omit',
    mode: 'no-cors',
  })
    .then(() => {
      portAvailable = true;
    })
    .catch(() => {
      portAvailable = false;
    });

  // Only ping if port is available
  setInterval(async () => {
    if (!portAvailable) return;
    try {
      await fetch('http://localhost:5174/dev-ping', {
        method: 'GET',
        credentials: 'omit',
        mode: 'no-cors',
      });
    } catch {
      portAvailable = false; // Stop pinging if monitor dies
    }
  }, 5000);
}
