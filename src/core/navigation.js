/**
 * navigation — movimenti della camera e selezione dei corpi.
 * Estratto da main.js: stessa logica, dipendenze iniettate via `ctx`.
 *
 * ctx: {
 *   CAM, camera, renderer, ui, allBodies, hintTimerRef,
 *   selectBody(body), setCamLabel(mode), showHint(ui, msg, timer)
 * }
 */
import {
  enterFly as enterFlyModule,
  exitFly as exitFlyModule,
  enterFollow as enterFollowModule,
} from './camera.js';

export function createNavigation(ctx) {
  const { CAM, camera, renderer, ui, hintTimerRef } = ctx;
  const setLabel = (mode) => ctx.setCamLabel(ui, mode);
  const hint = (msg) => ctx.showHint(ui, msg, hintTimerRef);

  function enterFly() {
    enterFlyModule(CAM, camera, renderer, setLabel, hint);
  }

  function exitFly() {
    exitFlyModule(CAM, setLabel, hint);
  }

  function enterFollow(body) {
    enterFollowModule(CAM, body, setLabel, hint);
    CAM.followDist = Math.max(body.visualR * 10, 40);
    CAM.isTransitioning = true;
  }

  function zoomToBody(body, duration = 1000) {
    if (!body || !body.pivot) return;
    CAM.zoomTarget = {
      body,
      finalRadius: Math.max(body.visualR * 8, 26),
      startTime: performance.now(),
      duration,
      startRadius: CAM.radius,
      startPivot: CAM.pivot.clone(),
    };
    CAM.isTransitioning = true;
    CAM.mode = 'orbit';
    CAM.followBody = null;
    setLabel('orbit');
  }

  function zoomToPosition(position, radius = 200) {
    CAM.tRadius = radius;
    CAM.tPivot.copy(position);
    CAM.tPhi = Math.atan2(Math.sqrt(position.x * position.x + position.z * position.z), position.y);
    CAM.tTheta = Math.atan2(position.z, position.x);
    CAM.mode = 'orbit';
    CAM.followBody = null;
    setLabel('orbit');
  }

  function exploreBody(key) {
    const body = ctx.allBodies.find((candidate) => candidate.key === key);
    if (body) ctx.selectBody(body);
  }

  function exploreRandomBody() {
    const candidates = ctx.allBodies.filter((body) =>
      ['planet', 'dwarf', 'moon'].includes(body.type)
    );
    const body = candidates[Math.floor(Math.random() * candidates.length)];
    if (body) ctx.selectBody(body);
  }

  return {
    enterFly,
    exitFly,
    enterFollow,
    zoomToBody,
    zoomToPosition,
    exploreBody,
    exploreRandomBody,
  };
}
