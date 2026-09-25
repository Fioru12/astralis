/**
 * @file adaptiveQuality.js
 * @description Dynamic Performance Scaler and Adaptive Quality Monitor for Astralis 3D.
 * Automatically monitors real-time FPS and dynamically adjusts rendering fidelity,
 * post-processing effects, pixel ratio, and particle systems to maintain 60 FPS.
 */

export class AdaptiveQualityManager {
  constructor(options = {}) {
    this.targetFps = options.targetFps || 60;
    this.lowFpsThreshold = options.lowFpsThreshold || 42;
    this.highFpsThreshold = options.highFpsThreshold || 57;
    this.sampleWindow = options.sampleWindow || 60; // frames
    this.autoScale = options.autoScale !== undefined ? options.autoScale : true;

    this.qualityLevels = ['low', 'medium', 'high', 'ultra'];
    this.currentLevelIndex = options.initialLevel
      ? this.qualityLevels.indexOf(options.initialLevel)
      : 2; // high default
    if (this.currentLevelIndex === -1) this.currentLevelIndex = 2;

    this.fpsHistory = [];
    this.currentFps = 60;
    this.lastTime = performance.now();
    this.cooldownFrames = 0;
    this.cooldownDuration = 90; // frames to wait between auto-switches
    this.listeners = new Set();

    this.profiles = {
      low: {
        dpr: 0.85,
        bloom: false,
        particlesMultiplier: 0.35,
        shadows: false,
        maxAsteroids: 1500,
        antiAliasing: false,
      },
      medium: {
        dpr: 1.0,
        bloom: true,
        bloomStrength: 0.6,
        particlesMultiplier: 0.65,
        shadows: false,
        maxAsteroids: 3500,
        antiAliasing: true,
      },
      high: {
        dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 1.5),
        bloom: true,
        bloomStrength: 1.0,
        particlesMultiplier: 1.0,
        shadows: true,
        maxAsteroids: 6000,
        antiAliasing: true,
      },
      ultra: {
        dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2,
        bloom: true,
        bloomStrength: 1.25,
        particlesMultiplier: 1.3,
        shadows: true,
        maxAsteroids: 10000,
        antiAliasing: true,
      },
    };
  }

  /**
   * Subscribe to quality profile changes
   * @param {Function} callback (level, profile) => void
   * @returns {Function} unsubscribe function
   */
  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    const level = this.getQualityLevel();
    const profile = this.getCurrentProfile();
    for (const cb of this.listeners) {
      try {
        cb(level, profile);
      } catch {
        // Listener error ignored
      }
    }
  }

  getQualityLevel() {
    return this.qualityLevels[this.currentLevelIndex];
  }

  getCurrentProfile() {
    return { ...this.profiles[this.getQualityLevel()] };
  }

  /**
   * Manually sets quality level and disables autoScale if requested
   */
  setQualityLevel(level, disableAuto = false) {
    const idx = this.qualityLevels.indexOf(level);
    if (idx !== -1 && idx !== this.currentLevelIndex) {
      this.currentLevelIndex = idx;
      if (disableAuto) {
        this.autoScale = false;
      }
      this.cooldownFrames = this.cooldownDuration;
      this.notifyListeners();
    }
  }

  setAutoScale(enabled) {
    this.autoScale = Boolean(enabled);
  }

  /**
   * Updates FPS counter and evaluates automatic dynamic scaling
   * @param {number} currentTime performance.now() or timestamp
   */
  update(currentTime = performance.now()) {
    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (delta > 0 && delta < 1) {
      const instantFps = 1 / delta;
      this.fpsHistory.push(instantFps);
      if (this.fpsHistory.length > this.sampleWindow) {
        this.fpsHistory.shift();
      }

      const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
      this.currentFps = Math.round(sum / this.fpsHistory.length);
    }

    if (!this.autoScale) return;

    if (this.cooldownFrames > 0) {
      this.cooldownFrames--;
      return;
    }

    // Evaluate auto-scaling if enough samples
    if (this.fpsHistory.length >= Math.floor(this.sampleWindow / 2)) {
      if (this.currentFps < this.lowFpsThreshold && this.currentLevelIndex > 0) {
        // Degrade quality
        this.currentLevelIndex--;
        this.cooldownFrames = this.cooldownDuration;
        this.fpsHistory = [];
        this.notifyListeners();
      } else if (
        this.currentFps >= this.highFpsThreshold &&
        this.currentLevelIndex < this.qualityLevels.length - 1
      ) {
        // Upgrade quality
        this.currentLevelIndex++;
        this.cooldownFrames = this.cooldownDuration * 2; // longer cooldown before upgrade
        this.fpsHistory = [];
        this.notifyListeners();
      }
    }
  }

  getFps() {
    return this.currentFps;
  }

  reset() {
    this.fpsHistory = [];
    this.cooldownFrames = 0;
    this.currentFps = 60;
  }
}

export const adaptiveQuality = new AdaptiveQualityManager();
