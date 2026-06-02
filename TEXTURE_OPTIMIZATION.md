# Texture Optimization Guide

## Overview

This Solar System project includes texture optimization infrastructure to reduce bundle size and improve load times. Textures are the largest assets in WebGL applications and often the main performance bottleneck.

## Current Texture Strategy

### Source Textures
- **Location:** `assets/textures/`
- **Formats:** JPG, PNG (8K resolution typically)
- **Total size:** ~500MB+ unoptimized

### Optimization Tools

#### 1. WebP Conversion (`convert_textures.js`)

```bash
npm run convert-textures
```

**Features:**
- Batch converts JPG/PNG/TGA → WebP
- Reduces file size by ~40-50% vs original
- Resizes to 2048×2048px max (from 8K)
- Creates `assets/textures/optimized/` directory

**Example results:**
- Original JPG (8K): 5.2 MB → WebP (2K): 1.1 MB (79% reduction!)

#### 2. AVIF Format (Even Better Compression)

The convert script also generates AVIF files:
- ~60% smaller than original
- ~20% smaller than WebP
- Better quality at lower file size
- Browser support: Chrome/Edge 92+, Firefox 93+

**Format selection in `src/bodies/creator.js`:**
```javascript
// High browser compatibility (WebP widely supported)
const url = `/assets/textures/optimized/${key}.webp`;

// Best compression (requires modern browser)
// const url = `/assets/textures/optimized/${key}.avif`;
```

### Quick Start

1. **Copy original textures** to `assets/textures/`
2. **Run conversion:**
   ```bash
   npm install
   npm run convert-textures
   ```
3. **Select format** in code (WebP or AVIF)
4. **Test locally:**
   ```bash
   npm run dev
   ```

## Performance Impact

### Before Optimization
- 4K textures: ~50-100MB download (full solar system)
- Load time: 20-30 seconds on 4G

### After Optimization (WebP)
- 2K textures: ~10-15MB download
- Load time: 3-5 seconds on 4G
- **Speedup: 5-10x faster**

### After Optimization (AVIF)
- 2K textures: ~4-8MB download
- Load time: 1-2 seconds on 4G
- **Speedup: 10-15x faster**

## Best Practices

### Resolution Selection
- **Distant bodies** (Mars, Jupiter): 1024×1024 is sufficient
- **Close-up bodies** (Earth, Moon): 2048×2048 recommended
- **Small moons**: 512×512 adequate

### Format Fallback Strategy

HTML/CSS approach (use in future if adding direct image assets):
```html
<picture>
  <source srcset="texture.avif" type="image/avif" />
  <source srcset="texture.webp" type="image/webp" />
  <img src="texture.jpg" alt="Planet texture" />
</picture>
```

### Texture Atlasing

For many small textures (asteroid/particle textures), combine into single atlas:
- Reduces draw calls
- Improves batch efficiency
- `convert_textures.js` can be modified to generate atlases

## Advanced Topics

### Dynamic Quality Selection

Load quality based on device capabilities:
```javascript
const isLowEndDevice = navigator.deviceMemory <= 4;
const textureQuality = isLowEndDevice ? '1k' : '2k';
const url = `/assets/textures/optimized/${key}_${textureQuality}.webp`;
```

### GPU Texture Compression

For real-time performance, use basis compression (KTX2 format):
- 40× smaller than uncompressed
- Decompressed directly on GPU (no CPU overhead)
- Requires basis converter tool

### Streaming Large Textures

For 4K+ content, implement mipmap streaming:
- Load LOD 0 (thumbnail) first
- Progressive load higher LODs
- Already partially implemented via `THREE.LoadingManager`

## Troubleshooting

**Issue:** Converted textures don't load
- Check browser console for 404 errors
- Verify `assets/textures/optimized/` directory exists
- Confirm texture file naming matches code references

**Issue:** Blurry textures
- Use `textureFilter = THREE.LinearFilter` (current)
- For sharpness: `LinearMipMapLinearFilter` + proper mipmaps

**Issue:** Memory leak with many textures
- `AsyncTextureLoader` handles caching automatically
- Monitor GPU memory: DevTools → Performance → GPU

## Resources

- [MDN WebP Support](https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types#webp)
- [AVIF Browser Support](https://caniuse.com/avif)
- [Sharp.js Documentation](https://sharp.pixelplumbing.com/)
- [THREE.js Texture Optimization](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
