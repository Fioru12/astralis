/**
 * Stub minimale del contesto Canvas2D per i test in jsdom (senza pacchetto
 * `canvas` nativo). Ritorna un oggetto fresco a ogni chiamata.
 */
export function installCanvas2DStub() {
  const gradient = () => ({ addColorStop() {} });
  HTMLCanvasElement.prototype.getContext = function (type) {
    if (type !== '2d') return null;
    return {
      canvas: this,
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      fillRect() {},
      clearRect() {},
      beginPath() {},
      arc() {},
      fill() {},
      stroke() {},
      save() {},
      restore() {},
      setTransform() {},
      drawImage() {},
      putImageData() {},
      measureText: () => ({ width: 0 }),
      createRadialGradient: gradient,
      createLinearGradient: gradient,
      createImageData: (w, h) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
      }),
      getImageData: (x, y, w, h) => ({
        width: w,
        height: h,
        data: new Uint8ClampedArray(w * h * 4),
      }),
    };
  };
}
