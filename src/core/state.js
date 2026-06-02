export function createSimState() {
  return {
    paused: false,
    timeOffsetMs: 0,
    lastPerf: performance.now(),
    selectedBody: null,
    customDate: null,
    galaxyMapMode: false,
    hintTimer: null,
    invDistFrame: 0,
    lastOrbitT: null,
  };
}

export function simDate(state) {
  return state.customDate || new Date(Date.now() + state.timeOffsetMs);
}
