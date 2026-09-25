/**
 * Screenshot export
 */
export class Screenshot {
  constructor(renderer, scene, camera, composer = null) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.composer = composer;
  }
  capture(filename = null) {
    // Exports must match the viewport, including bloom, outline and grading.
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const name = filename || `solar-${Date.now()}.png`;
    const link = document.createElement('a');
    link.download = name;
    link.href = dataUrl;
    link.click();
    return dataUrl;
  }
}
