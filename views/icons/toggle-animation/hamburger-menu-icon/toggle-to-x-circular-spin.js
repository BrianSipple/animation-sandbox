'use strict';

import TweenMax from "TweenMax";
import DrawSVGPlugin from 'DrawSVGPlugin';

const DURATIONS = {

};

const SELECTORS = {
  icon: '.icon',
};

const DOM_REFS = {};

const Icon = (function Icon() {

  let isShowingMenu = true;
  let isAnimating = false;

  let masterTL;

  function toggleIcon () {

    if (!isAnimating) {
      isAnimating = true;

      if (isShowingMenu) {
        // Animate to the "x" playing the TL from its beginning
        masterTL.play(0);

      } else {
        // Reverse back to the hamburger state.
        // NOTE: 0 tell `reverse` to set the playhead at the end of the TL --
        // and and then wind back from there.
        masterTL.reverse(0);
      }
    }
  }


  function registerListeners () {
    DOM_REFS.icon.addEventListener('click', toggleIcon, false);
  }

  function onToggleToXComplete () {
    isAnimating = false;
    isShowingMenu = false;
  }

  function onToggleToHamburgerComplete () {
    isAnimating = false;
    isShowingMenu = true;
  }

  function makeToggleTL() {
    const toggleTL = new TimelineMax();


  }

  function initMasterTL() {

    masterTL = new TimelineMax({
      pause: true,
      onComplete: onToggleToXComplete,
      onReverseComplete: onToggleToHamburgerComplete
    });

    masterTL.add(makeToggleTL());
  }


  function prepareStartState() {
    const topLeftHamburgerControlPoint = DOM_REFS.controlPoints.hamburger.top.left;
    const topRightHamburgerControlPoint = DOM_REFS.controlPoints.hamburger.top.right;

    const topLeftHamburgerX = topLeftHamburgerControlPoint.getAttribute('cx');
    const topRightHamburgerX = topRightHamburgerControlPoint.getAttribute('cx');

    const topHamburgerDrawPct = (
      Math.abs(topRightHamburgerX - topLeftHamburgerX) /
      DOM_REFS.hamburger.top.getPathLength()
    );

    const topHamburgerCoords = DOM_REFS.controlPoints.hamburger.top.left.getAttribute('cx')
    TweenMax.set(
      DOM_REFS.hamburgerTop,
      {
        DrawSVG: { }
      }
    );
  }


  function run () {
    wireUpDOMRefs();
    prepareStartState();
    registerListeners();
    initMasterTL();
  }

  return {
    run,
  };

}());


export default Icon;
