/**
 * Screenshot export
 */
export class Screenshot {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }
  capture(filename = null) {
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const name = filename || `solar-${Date.now()}.png`;
    const link = document.createElement('a');
    link.download = name;
    link.href = dataUrl;
    link.click();
    return dataUrl;
  }
}
