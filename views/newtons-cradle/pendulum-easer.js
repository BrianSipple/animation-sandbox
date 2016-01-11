// const API = {
//   elapsedTime: 0,
//   beginningRotation: 0,
//   durationThroughout: 0,
//   changeThroughout: 0
// };
//
// function getNextRotation(opts = API) {
//   return opts.changeThroughout * (opts.elapsedTime / opts.durationThroughout) + opts.beginningRotation;
// }

function makeEaseOut (power) {
  return function easeOut (t, d) {
    return 1 - Math.pow(1 - (t / d), power);
  }
}

function makeEaseIn (power) {
  return function (t, d) {
    return Math.pow(t / d, power);
  }
}


export const easeOutLinear = makeEaseOut(1);
export const easeOutQuadratic = makeEaseOut(2);
export const easeOutCubic = makeEaseOut(3);
export const easeOutQuartic = makeEaseOut(4);
export const easeOutQuint = makeEaseOut(5);
export const easeOutStrong = makeEaseOut(5);

export const easeInLinear = makeEaseIn(1);
export const easeInQuadratic = makeEaseIn(2);
export const easeInCubic = makeEaseIn(3);
export const easeInQuartic = makeEaseIn(4);
export const easeInQuint = makeEaseIn(5);
export const easeInStrong = makeEaseIn(5);


export default {
  easeOutLinear,
  easeOutQuadratic,
  easeOutCubic,
  easeOutQuartic,
  easeOutQuint,
  easeOutStrong,
  easeInLinear,
  easeInQuadratic,
  easeInCubic,
  easeInQuartic,
  easeInQuint,
  easeInStrong
}
