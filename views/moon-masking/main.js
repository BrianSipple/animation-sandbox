import TweenMax from 'TweenMax';

const { assign, keys } = Object;

const SELECTOR_MAP = {
  singles: {
    phaseSliderInputElem: '.js-moon-phase-slider__input',
    phaseSliderOutputElem: '.js-moon-phase-slider__output',
    earthShadowCircleMaskElem: '#earth-shadow-circle',
    moon: '#moon',
  },
  groups: {
    backgroundStarElems: '.background-star'
  }
};

const DURATIONS = {
  defaultPhaseLoop: 9
};

const DOM_REFS = {};
const MEASUREMENTS = {};

const masterTL = new TimelineMax({
  repeat: -1,
  paused: true
});


function cacheDOMRefs() {
  keys(SELECTOR_MAP.singles).forEach(elemName => {
    DOM_REFS[elemName] = document.querySelector(SELECTOR_MAP.singles[elemName]);
  });
  keys(SELECTOR_MAP.groups).forEach(elemName => {
    DOM_REFS[elemName] = document.querySelectorAll(SELECTOR_MAP.groups[elemName]);
  });
}

function cacheMeasurements () {
  const { earthShadowCircleMaskElem: maskElem } = DOM_REFS;

  const horizontalMaskDist = maskElem.getAttribute('r') * 2;
  const maskStartX = -1 * (horizontalMaskDist / 2);

  MEASUREMENTS.horizontalMaskDist = horizontalMaskDist;
  MEASUREMENTS.maskStartX = maskStartX;
  MEASUREMENTS.maskEndX = maskStartX + horizontalMaskDist;
}

// prepareSlideMask() {
//   const TL = new TimelineMax();
//   const { earthShadowCircleMaskElem: maskElem } = DOM_REFS;
//
//   TimelineMax.set(makeElem, {attr: { cx: startX }, immediateRender: false });
// }

function updateMaskPosition(tl) {
  debugger;
  const horizontalPercentage = tl.progress();
  const { earthShadowCircleMaskElem: maskElem } = DOM_REFS;
  const { maskStartX: startX, maskEndX: endX, horizontalMaskDist: maskWidth } = MEASUREMENTS;

  const currentCX = startX + (maskWidth * horizontalPercentage);

  TweenMax.set(
    maskElem,
    {
      attr: { cx: currentCX },
      immediateRender: false
    }
  );
}

function initMaskSlideTL() {
  const TL = new TimelineMax({
    onUpdate: updateMaskPosition,
    onUpdateParams: ['{self}']
  });
  const { phaseSliderInputElem: phaseSlider } = DOM_REFS;

  TL.to(
    phaseSlider,
    DURATIONS.defaultPhaseLoop,
    { value: '100' }
  );

  return TL;
}


function setupMasterTL() {
  masterTL.add(initMaskSlideTL());
}


function setPhaseSliderOutputValue(value) {
  DOM_REFS.phaseSliderOutputElem.value = value;
}


function renderInitialScene () {
  const slidePercentage = parseFloat(DOM_REFS.phaseSliderInputElem.value);

  setPhaseSliderOutputValue(slidePercentage);
}

function onPhaseSliderInput(event) {
  debugger;
  const slidePercentage = parseFloat(event.target.value);

  setPhaseSliderOutputValue(slidePercentage);
}

function addListeners() {
  DOM_REFS.phaseSliderInputElem.addEventListener('input', onPhaseSliderInput, false);
}


function initAnimation () {
  //masterTL.play(0);
}


function run() {
  cacheDOMRefs();
  cacheMeasurements();
  setupMasterTL();
  renderInitialScene();
  addListeners();
  initAnimation();
}


export default {
  run
};
