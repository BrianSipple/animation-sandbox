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
  initAnimation();
}


export default {
  run
};
