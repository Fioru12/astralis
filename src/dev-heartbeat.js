/**
 * Dev heartbeat - keeps Vite server alive while browser is open
 * Server closes 30s after last ping (browser closed)
 */

if (import.meta.env.DEV) {
  setInterval(async () => {
    try {
      await fetch('http://localhost:5174/dev-ping', {
        method: 'GET',
        credentials: 'omit',
        mode: 'no-cors',
      });
    } catch {
      // Silently fail if heartbeat port unavailable
    }
  }, 5000);
}
