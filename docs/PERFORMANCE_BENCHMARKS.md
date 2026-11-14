# Performance Benchmarking Guide

## Overview

This guide helps measure and track Solar System 3D's rendering performance. Use benchmarks to verify optimizations work and catch regressions.

## Quick Benchmarks

### 1. Frame Rate (FPS)

**Method 1: Chrome DevTools**

```
1. Open DevTools (F12)
2. Press Ctrl+Shift+P, type "fps"
3. Enable "Show frames per second"
4. Observe top-left corner while interacting
5. Target: 45-60 FPS consistently
```

**Method 2: Browser Console**

```javascript
// Add to index.html <script> or console
let frameCount = 0;
let lastTime = Date.now();

function measureFPS() {
  frameCount++;
  const now = Date.now();
  if (now - lastTime >= 1000) {
    console.log('FPS:', frameCount);
    frameCount = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}
measureFPS();
```

### 2. Memory Usage

**Chrome DevTools:**

```
1. DevTools → Memory tab
2. Click "Take heap snapshot"
3. Sort by "Detached DOM nodes" (indicates leaks)
4. Search "THREE" or "Texture" to isolate objects
5. Target: <150MB steady state
```

### 3. Bundle Size

**Command:**

```bash
npm run build
du -sh dist/
du -sh dist/assets/
```

**Expected output:**

```
25M     dist/              (total)
15M     dist/assets/       (textures)
10M     dist/*.js          (code)
```

### 4. Load Time

**Chrome DevTools → Network tab:**

```
1. DevTools → Network
2. Throttle: "Fast 3G" or "Slow 3G"
3. Reload page
4. Check "DOMContentLoaded" and "Finish" times
```

**Expected times (Fast 3G):**

- HTML: <500ms
- JavaScript: <2000ms
- Textures: <3000ms
- **Total: <5000ms**

## Detailed Benchmarks

### Polygon Count

**Before optimization:**

```
Main Belt (1000 asteroids × 512 polys each): 512k
Kuiper Belt (3000 asteroids × 512 polys each): 1.5M
Planets & Moons: 500k
Total: 2.5M+ polygons
```

**After LOD optimization (far view):**

```
Main Belt (low detail): 128k
Kuiper Belt (low detail): 384k
Planets & Moons (LOD): 200k
Total: ~700k polygons (72% reduction!)
```

**Verify in Chrome DevTools:**

```
1. DevTools → More tools → WebGL Inspector
2. Look for "Polygon count" stat
3. Compare when zoomed out (LOD active) vs zoomed in
```

### Texture Memory

**Command to analyze:**

```bash
# Check actual file sizes
ls -lh assets/textures/
ls -lh assets/textures/optimized/

# Calculate compression ratio
du -sh assets/textures/ assets/textures/optimized/
```

**Expected compression:**

```
Original JPG (8K): 5.2 MB
WebP (2K): 1.1 MB      (79% reduction)
AVIF (2K): 0.8 MB      (85% reduction)
```

### JavaScript Performance

**Measure frame time:**

```javascript
let startTime = performance.now();
// ... render call ...
let endTime = performance.now();
console.log('Frame time:', (endTime - startTime).toFixed(2), 'ms');
// Target: <16ms for 60 FPS
```

**Profile in DevTools:**

```
1. DevTools → Performance
2. Record for 10 seconds
3. Look for:
   - Main thread tasks (green)
   - Rendering (red)
   - Scripting (blue)
4. Target: <8ms scripting, <8ms rendering per frame
```

## Automated Benchmarks

### Setup Vitest Benchmarks

**Create `src/utils/perf.bench.js`:**

```javascript
import { bench, describe } from 'vitest';
import * as kepler from './kepler.js';

describe('Performance', () => {
  bench('solveKepler 1000x', () => {
    for (let i = 0; i < 1000; i++) {
      kepler.solveKepler(0.5, 0.1);
    }
  });
});
```

**Run:**

```bash
npm run test -- --run --reporter=verbose  # includes perf
```

### GitHub Actions Tracking

Add performance comment to CI (future enhancement):

```yaml
- name: Store benchmark result
  run: npm run test:bench > benchmark-results.json

- name: Comment on PR
  uses: actions/github-script@v6
  with:
    script: |
      const fs = require('fs');
      const results = JSON.parse(fs.readFileSync('benchmark-results.json'));
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        body: `⚡ Performance: ${results.fps} FPS`
      });
```

## Regression Testing

### Create Baseline

```bash
# Build with optimizations enabled
npm run build

# Measure baseline
echo "Baseline metrics:" > benchmark-baseline.txt
du -sh dist/ >> benchmark-baseline.txt
npm run test >> benchmark-baseline.txt
```

### Compare After Changes

```bash
# Make changes
# Rebuild
npm run build

# Compare
diff benchmark-baseline.txt <(du -sh dist/ && npm run test)
```

### Continuous Tracking

Use GitHub Actions to store metrics:

```yaml
- name: Measure performance
  run: |
    echo "Build size: $(du -sh dist/)" >> metrics.txt
    echo "Assets size: $(du -sh dist/assets/)" >> metrics.txt

- name: Store metrics
  uses: actions/upload-artifact@v2
  with:
    name: performance-metrics-${{ github.sha }}
    path: metrics.txt
```

## Performance Budgets

Define acceptable limits:

| Metric             | Limit   | Current   |
| ------------------ | ------- | --------- |
| **Bundle size**    | <15MB   | 10MB ✅   |
| **Load time (3G)** | <5000ms | 3500ms ✅ |
| **FPS**            | >45     | 50 ✅     |
| **Memory**         | <150MB  | 80MB ✅   |
| **Polygon count**  | <1M     | 700k ✅   |

## Tools & Resources

### Browser DevTools

- **Chrome DevTools** (built-in)
- **Firefox DevTools** (built-in)
- **Safari Web Inspector** (built-in)

### Command Line

- `npm run build` — Build size measurement
- `npm run test` — Test suite performance
- `du -sh` — File size analysis

### Online Tools

- [WebP Compression Calculator](https://developers.google.com/speed/webp/download)
- [Lighthouse](https://web.dev/lighthouse/) (DevTools built-in)
- [Bundlephobia](https://bundlephobia.com/) (NPM package sizes)

### THREE.js Specific

- [THREE.js Inspector](https://chrome.google.com/webstore/detail/threejs-inspector/egebmibhpjgkhpdeoliifofjgicdeihc) (Chrome extension)
- [SpectorJS](https://spector.babylonjs.com/) (WebGL debugger)

## Common Bottlenecks & Solutions

| Issue               | Symptom            | Solution         | Tool                       |
| ------------------- | ------------------ | ---------------- | -------------------------- |
| **Large textures**  | Load time >10s     | Use WebP/AVIF    | `npm run convert-textures` |
| **High poly count** | FPS drops <30      | Enable LOD       | DevTools WebGL Inspector   |
| **Memory leak**     | RAM grows 10MB/min | Dispose textures | DevTools Memory            |
| **Slow JS**         | Frame time >32ms   | Profile code     | DevTools Performance       |
| **Large bundle**    | >20MB download     | Code splitting   | `du -sh dist/`             |

## Reporting Results

### Example Benchmark Report

```
## Performance Benchmark (v1.0.0)

**Environment:**
- Browser: Chrome 120, MacBook Pro M1
- Throttle: No throttle (local network)
- Resolution: 2560×1600

**Results:**
- FPS: 58 avg (45-60 range)
- Load time: 1.2s
- Bundle size: 10.2MB
- Memory: 85MB steady
- Polygon count (far view): 750k

**Compared to v0.9.0:**
- FPS: +5 (LOD optimization) ✅
- Bundle: -8MB (texture conversion) ✅
- Memory: -20MB (texture caching) ✅
```

## Next Steps

1. **Establish baseline** with current build
2. **Record metrics** after each optimization
3. **Set budgets** (max acceptable values)
4. **Monitor CI/CD** for regressions
5. **Report** findings to team

---

See also: [ARCHITECTURE.md](./ARCHITECTURE.md) for implementation details
