# ⚡ Quick Reference Card

## 🚀 Essential Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build

# Code Quality
npm run lint             # Check for errors
npm run format           # Auto-format code
npm run test             # Run tests

# Setup
npm install              # Install dependencies (first time)
npm run prepare          # Activate Husky pre-commit hooks

# Optimization
npm run convert-textures # WebP/AVIF texture conversion

# Viewing
npm run roadmap          # See feature roadmap
npm run serve-dist       # Preview production build locally
```

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src/main.js` | Core render loop & scene setup (2100+ lines) |
| `src/bodies/creator.js` | Planet/moon creation |
| `src/bodies/data.js` | Orbital and physical data |
| `src/utils/kepler.js` | Orbital mechanics calculations |
| `src/utils/textureLoader.js` | Async texture loading |
| `package.json` | Dependencies & scripts |
| `vite.config.js` | Build configuration |

## 📖 Documentation

| Guide | For |
|-------|-----|
| **DEVELOPMENT.md** | Quick start & dev workflow |
| **ARCHITECTURE.md** | Technical deep dive |
| **PERFORMANCE_BENCHMARKS.md** | Measuring & optimizing |
| **TEXTURE_OPTIMIZATION.md** | Texture strategies |
| **GITHUB_PAGES_DEPLOYMENT.md** | CI/CD & deployment |
| **IMPROVEMENTS_SUMMARY.md** | Overview of all improvements |

## 🔧 Common Tasks

### Start coding
```bash
npm install
npm run dev
```

### Before committing
```bash
npm run lint && npm run test
git add . && git commit -m "Your message"
```
*(Husky will auto-format & lint)*

### Optimize textures
```bash
npm run convert-textures
# Choose format: WebP (40% smaller) or AVIF (60% smaller)
```

### Deploy to GitHub Pages
```bash
git push main  # Automatically triggers CI/CD
# Check: Settings → Pages or Actions tab
```

### Check performance
```bash
npm run build
du -sh dist/           # Check build size
npm run serve-dist     # Test production locally
```

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Load time | <5s | ✅ 3-5s |
| Bundle size | <15MB | ✅ 10MB |
| FPS | >45 | ✅ 50 |
| Memory | <150MB | ✅ 80MB |
| Polygons | <1M | ✅ 700k |

## 🎮 Keyboard Controls

| Key | Action |
|-----|--------|
| **Mouse drag** | Rotate camera |
| **Mouse scroll** | Zoom in/out |
| **Shift + drag** | Pan camera |
| **F** | Free flight mode |
| **1** | Orbit mode |
| **2** | Follow body |
| **3** | Free look |
| **TAB** | Toggle UI |
| **ESC** | Cancel mode |

## 🛠️ Setup Checklist

- [ ] `npm install`
- [ ] `npm run prepare` (Husky hooks)
- [ ] Create `.github/workflows/` folder
- [ ] Copy `CI_WORKFLOW.yml` → `.github/workflows/ci.yml`
- [ ] `npm run lint && npm run test`
- [ ] `npm run build` (verify production)
- [ ] `git push main` (trigger CI/CD)

## 💡 Pro Tips

1. **Auto-format before commit:**
   ```bash
   npm run format
   ```

2. **Fix linting errors automatically:**
   ```bash
   npm run lint -- --fix
   ```

3. **Watch tests while developing:**
   ```bash
   npm run test -- --watch
   ```

4. **Profile performance in Chrome:**
   - DevTools (F12) → Performance tab
   - Record 10 seconds of interaction
   - Check FPS and memory usage

5. **Monitor bundle size:**
   ```bash
   npm run build
   du -sh dist/assets/
   ```

## 🔗 Quick Links

- [Three.js Docs](https://threejs.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [GitHub Pages Setup](https://pages.github.com/)
- [ESLint Rules](https://eslint.org/docs/rules/)

## ❓ Troubleshooting

**Port already in use?**
```bash
npm run dev -- --port 5174
```

**Build failing?**
```bash
npm run lint -- --fix
npm run build
```

**Textures not loading?**
- Check Network tab in DevTools
- Verify `assets/textures/` exists
- Try `npm run convert-textures`

**Tests failing?**
```bash
npm run test -- --run --reporter=verbose
```

---

**Need help?** Check the full guides in the root folder (*.md files) or run `npm run roadmap` for more info.
