/**
 * Preset di qualità grafica (dati puri, senza dipendenze da three/DOM).
 * Il pixel ratio è limitato dal devicePixelRatio del dispositivo.
 */
export const GRAPHICS_QUALITIES = ['low', 'medium', 'high', 'ultra'];

/**
 * @param {string} quality - 'low' | 'medium' | 'high' | 'ultra'
 * @param {number} dpr - window.devicePixelRatio
 * @returns {{quality: string, pixelRatio: number, shadows: boolean, bloom: number,
 *   outline: boolean, dust: boolean, oort: boolean}}
 *   Un valore sconosciuto ricade su 'high'.
 */
export function getGraphicsPreset(quality, dpr = 1) {
  const q = GRAPHICS_QUALITIES.includes(quality) ? quality : 'high';
  const presets = {
    low: { pixelRatio: 0.85, shadows: false, bloom: 0, outline: false, dust: false, oort: false },
    medium: {
      pixelRatio: Math.min(dpr, 1.25),
      shadows: false,
      bloom: 0.75,
      outline: true,
      dust: true,
      oort: false,
    },
    high: {
      pixelRatio: Math.min(dpr, 1.75),
      shadows: true,
      bloom: 1.1,
      outline: true,
      dust: true,
      oort: true,
    },
    ultra: {
      pixelRatio: Math.min(dpr, 2.5),
      shadows: true,
      bloom: 1.35,
      outline: true,
      dust: true,
      oort: true,
    },
  };
  return { quality: q, ...presets[q] };
}
