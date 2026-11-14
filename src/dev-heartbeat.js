/**
 * Dev heartbeat - keeps Vite server alive while browser is open
 * Only active when launched via dev-server.js (sets VITE_DEV_HEARTBEAT=1)
 */

if (import.meta.env.DEV && import.meta.env.VITE_DEV_HEARTBEAT === '1') {
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
