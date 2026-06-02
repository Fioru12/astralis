# Development Workflow Guide

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run serve-dist

# Code quality checks
npm run lint         # Check code for errors
npm run lint:fix     # Auto-fix linting errors (if available)
npm run format       # Auto-format code

# Testing
npm run test         # Run test suite

# Texture optimization
npm run convert-textures

# View feature roadmap
npm run roadmap
```

## Development Workflow

### 1. Starting Development

```bash
npm run dev
```

This starts a local dev server on `http://localhost:5173` with:
- Hot module reloading (HMR) - changes appear instantly
- Source maps for debugging
- Fast rebuild times

### 2. Making Changes

As you edit files in `src/`, changes are instantly reflected in the browser.

**Before committing, ensure code quality:**

```bash
# Lint check
npm run lint

# Auto-format
npm run format

# Run tests
npm run test
```

**Or let Husky do it automatically:**

```bash
git add .
git commit -m "Fix: improve performance"

# Husky will:
# 1. Run prettier (auto-format)
# 2. Run eslint (check for errors)
# 3. Allow commit only if both pass
```

### 3. Testing Changes

```bash
# Run unit tests
npm run test

# With watch mode (re-run on file change)
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage
```

### 4. Building for Production

```bash
npm run build
```

This creates an optimized bundle in `dist/` with:
- Code minification
- Bundle splitting (three, gui, utils chunks)
- No source maps (smaller size)
- All assets optimized

### 5. Verifying Production Build

```bash
# Preview the build locally
npm run serve-dist
```

Visit `http://localhost:5000` to test the production build.

## Project Structure

```
src/
├── main.js              (2100+ lines: render loop, scene setup)
├── style.css            (Styling)
├── bodies/
│   ├── creator.js       (Planet/moon creation)
│   ├── sun.js
│   └── data.js          (Orbital data)
└── utils/
    ├── kepler.js        (Orbital mechanics)
    ├── textureLoader.js (Async texture loading)
    └── tests/           (Unit tests)
```

## Key Files to Edit

### Add new planet/moon
Edit: `src/bodies/data.js`
```javascript
export const PLANETS = [
  {
    name: 'Neptune',
    radius: 24622,
    distance: 4495.1,
    // ... properties
  },
  // ... more planets
];
```

### Change rendering/animation
Edit: `src/main.js` (main render loop in `animate()` function)

### Modify UI styling
Edit: `src/style.css`

### Add orbital data
Edit: `src/bodies/data.js`

## Common Tasks

### Optimize a Large Texture

```bash
# Convert all textures to WebP/AVIF
npm run convert-textures
```

See [TEXTURE_OPTIMIZATION.md](./TEXTURE_OPTIMIZATION.md) for details.

### Add a Test

Create `src/utils/my-feature.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-feature.js';

describe('myFunction', () => {
  it('should work correctly', () => {
    const result = myFunction(5);
    expect(result).toBe(10);
  });
});
```

Run: `npm run test`

### Profile Performance

```bash
# Chrome DevTools → Performance tab
# Record → Interact → Stop
# Analyze: FPS, memory, GPU time
```

See [PERFORMANCE_BENCHMARKS.md](./PERFORMANCE_BENCHMARKS.md) for detailed benchmarking.

### Deploy to GitHub Pages

```bash
git push main  # Automatically triggers CI/CD
```

Deployment status: Settings → Pages or Actions tab

See [GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md) for details.

## Debugging Tips

### Browser Console Errors

```javascript
// In browser console (F12):
// Check for WebGL errors
gl.getError()

// Monitor frame time
console.time('frame');
// ... code ...
console.timeEnd('frame');
```

### ESLint Errors

```bash
npm run lint -- --debug
```

### Test Failures

```bash
npm run test -- --reporter=verbose
```

## Best Practices

1. **Always run tests before pushing**
   ```bash
   npm run lint && npm run test
   ```

2. **Keep commits small and focused**
   ```bash
   git commit -m "feature: add comet tail shader"
   git commit -m "fix: correct Kepler equation convergence"
   ```

3. **Use meaningful branch names**
   ```bash
   git checkout -b feature/mobile-optimization
   ```

4. **Document complex code**
   ```javascript
   // Kepler's equation solver using Newton-Raphson method
   // Converges to <1e-9 in typically 3-5 iterations
   function solveKepler(M, e) { ... }
   ```

5. **Test after optimization**
   ```bash
   # Before: npm run build → measure size/speed
   # Make optimization
   # After: npm run build → compare
   ```

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Vitest Documentation](https://vitest.dev/)
- [npm Scripts](https://docs.npmjs.com/cli/v10/using-npm/scripts)

## Getting Help

1. Check existing documentation in project root
2. Review code comments in relevant files
3. Run `npm run roadmap` to see planned features
4. Check GitHub Issues for similar problems

---

Happy coding! 🚀
