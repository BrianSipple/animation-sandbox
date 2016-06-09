const { assign, keys } = Object;

const SELECTOR_MAP = {
  singles: {
    phaseSliderInputElem: '#moon-phase-slider-input',
    phaseSliderOutputElem: '#moon-phase-slider-output',
    earthShadowMaskElem: '#earth-shadow-mask',
    moon: '#moon',
  },
  groups: {
    backgroundStarElems: '.background-star'
  }
};

const DOM_REFS = {};


function cacheDOMRefs() {
  keys(SELECTOR_MAP.singles).forEach(elemName => {
    DOM_REFS[elemName] = document.querySelector(SELECTOR_MAP.singles[elemName]);
  });
  keys(SELECTOR_MAP.groups).forEach(elemName => {
    DOM_REFS[elemName] = document.querySelectorAll(SELECTOR_MAP.groups[elemName]);
  });
}

function onPhaseSliderInput(event) {
  debugger;
  const slidePercentage = parseFloat(event.target.value);
  DOM_REFS.phaseSliderOutputElem.value = slidePercentage;
}

function addListeners() {
  DOM_REFS.phaseSliderInputElem.addEventListener('input', onPhaseSliderInput, false);
}

function animateMask() {

}

function updatePhaseSlider() {

}

function initAnimation () {
  requestAnimationFrame(initAnimation);

  animateMask();
  updatePhaseSlider();
}

function run() {
  cacheDOMRefs();
  addListeners();
  initAnimation();
}


export default {
  run
};
