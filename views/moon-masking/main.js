import TweenMax from 'TweenMax';

const { assign, keys } = Object;

const SELECTOR_MAP = {
  singles: {
    phaseSliderInputElem: '.js-moon-phase-slider-input',
    // phaseSliderOutputElem: '.js-moon-phase-slider-output',
    phaseSliderOutputElem: '.js-moon-phase-slider-output',
    earthShadowCircleMaskElem: '#earth-shadow-circle',
    moon: '#moon'
  },
  groups: {
    backgroundStarElems: '.background-star'
  }
};

const DURATIONS = {
  defaultPhaseLoop: 9
};

const COLORS = {
  sliderCovered: 'hsla(180, 100%, 76%, 1.00)',
  sliderUncovered: 'hsla(19, 100%, 54%, 1.00)'
};

const DOM_REFS = {};
const MEASUREMENTS = {};

const masterTL = new TimelineMax({
  repeat: -1,
  paused: true
});

function makeSliderGradient(coveragePercentage) {
  return 'linear-gradient(' +
    '90deg, ' +
    COLORS.sliderCovered + ' 0%, ' +
    COLORS.sliderCovered + ' ' + coveragePercentage + '%, ' +
    COLORS.sliderUncovered + ' ' + coveragePercentage + '%' +
  ')';
}

function cacheDOMRefs() {
  keys(SELECTOR_MAP.singles).forEach(elemName => {
    DOM_REFS[elemName] = document.querySelector(SELECTOR_MAP.singles[elemName]);
  });
  keys(SELECTOR_MAP.groups).forEach(elemName => {
    DOM_REFS[elemName] = document.querySelectorAll(SELECTOR_MAP.groups[elemName]);
  });

  DOM_REFS.styleSheet = document.styleSheets[0];
}

function cacheMeasurements () {
  const { earthShadowCircleMaskElem: maskElem } = DOM_REFS;
  debugger;
  const horizontalMaskWidth = maskElem.getAttribute('r') * 2;
  const maskStartCX = horizontalMaskWidth * 1.5;  // start just off the right edge and sweep left

  MEASUREMENTS.maskStartCX = maskStartCX;
  MEASUREMENTS.maskEndCX = maskStartCX - (horizontalMaskWidth * 2);
}

// prepareSlideMask() {
//   const TL = new TimelineMax();
//   const { earthShadowCircleMaskElem: maskElem } = DOM_REFS;
//
//   TimelineMax.set(makeElem, {attr: { cx: startCX }, immediateRender: false });
// }

function updateMaskPosition(completionPercentage) {
  const { earthShadowCircleMaskElem: maskElem } = DOM_REFS;
  const { maskStartCX: startCX, maskEndCX: endCX } = MEASUREMENTS;
  const { abs } = Math;

  const traveralDistance = abs(startCX - endCX);
  debugger;
  const currentCX = startCX - (traveralDistance * (completionPercentage / 100));

  TweenMax.set(
    maskElem,
    {
      attr: { cx: currentCX },
      immediateRender: false
    }
  );
}

function onSlideTLUpdate(tl) {
  const horizontalPercentage = tl.progress() * 100;

  updateMaskPosition(horizontalPercentage);
  setSliderOutputValue(horizontalPercentage);
  setSliderGradient(horizontalPercentage);
}

function setSliderOutputValue(value) {
  DOM_REFS.phaseSliderOutputElem.value = value;
}

function setSliderGradient(slidePercentage) {
  const selector = SELECTOR_MAP.singles.phaseSliderInputElem;
  const { styleSheet } = DOM_REFS;

  styleSheet.insertRule(`${selector} { background-image: ${makeSliderGradient(slidePercentage)}; }`, styleSheet.rules.length);
}

function renderInitialScene () {
  const slidePercentage = parseFloat(DOM_REFS.phaseSliderInputElem.value);

  setSliderOutputValue(slidePercentage);
  setSliderGradient(slidePercentage);
}

function initMaskSlideTL() {
  const TL = new TimelineMax({
    onUpdate: onSlideTLUpdate,
    onUpdateParams: ['{self}']
  });
  const { phaseSliderInputElem: phaseSlider } = DOM_REFS;

  TL.to(
    phaseSlider,
    DURATIONS.defaultPhaseLoop,
    { value: '100', ease: Linear.easeNone }
  );

  return TL;
}


function setupMasterTL() {
  masterTL.add(initMaskSlideTL());
}

function onPhaseSliderInput(event) {
  debugger;
  const slidePercentage = parseFloat(event.target.value);

  setSliderOutputValue(slidePercentage);
}

function addListeners() {
  DOM_REFS.phaseSliderInputElem.addEventListener('input', onPhaseSliderInput, false);
}


function initAnimation () {
  masterTL.play(0);
  // masterTL.seek(masterTL.duration() / 2);
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
