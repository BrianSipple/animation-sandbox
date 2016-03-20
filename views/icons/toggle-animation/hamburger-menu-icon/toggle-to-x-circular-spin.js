'use strict';

import TweenMax from "TweenMax";
import DrawSVGPlugin from 'DrawSVGPlugin';

const DURATIONS = {

};

const CLASS_NAMES = {
  icon: 'icon',
  iconPaths: {
    menuTopXTopLeft: 'icon-path icon-path--menu-top-x-tl-br',
    menuMiddle: 'icon-path icon-path--menu-middle',
    menuBottomXBottomLeft: 'icon-path icon-path--menu-bottom-x-bl-tr'
  },
  controlPoints: {
    hamburger: {
      topLeft: 'hamburger-cp hamburger-cp--top-left',
      topRight: 'hamburger-cp hamburger-cp--top-right',
      bottomLeft: 'hamburger-cp hamburger-cp--bottom-left',
      bottomRight: 'hamburger-cp hamburger-cp--bottom-right'
    },
    x: {
      topLeft: 'x-cp x-cp--top-left',
      topRight: 'x-cp x-cp--top-right',
      bottomLeft: 'x-cp x-cp--bottom-left',
      bottomRight: 'x-cp x-cp--bottom-right'
    }
  }
};

const DOM_REFS = {};

const Icon = (function Icon() {

  let isShowingMenu = true;
  let isAnimating = false;

  let masterTL;


  function wireUpDOMRefs () {
    const iconElem = document.querySelector(`.${CLASS_NAMES.icon}`);

    DOM_REFS.icon = iconElem;
    DOM_REFS.iconPaths = {
      menuTopXTopLeft: iconElem.getElementsByClassName(CLASS_NAMES.iconPaths.menuTopXTopLeft)[0],   // menu top / the part of the "x" that starts (left-to-right) at the top-left
      menuMiddle: iconElem.getElementsByClassName(CLASS_NAMES.iconPaths.menuMiddle)[0],
      menuBottomXBottomLeft: iconElem.getElementsByClassName(CLASS_NAMES.iconPaths.menuBottomXBottomLeft)[0], // menu top / the part of the "x" that starts (left-to-right) at the bottom-left
    };
    DOM_REFS.controlPoints = {
      hamburger: {
        topLeft: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.topLeft)[0],
        topRight: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.topRight)[0],
        bottomLeft: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.bottomLeft)[0],
        bottomRight: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.bottomRight)[0],
      },
      x: {
        topLeft: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.x.topLeft)[0],
        topRight: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.x.topRight)[0],
        bottomLeft: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.x.bottomLeft)[0],
        bottomRight: iconElem.getElementsByClassName(CLASS_NAMES.controlPoints.x.bottomRight)[0],
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

  function toggleIcon () {

    if (!isAnimating) {
      isAnimating = true;

      if (isShowingMenu) {
        // Animate to the "x" playing the TL from its beginning
        toggleTL.play(0);

      } else {
        // Reverse back to the hamburger state.
        // NOTE: 0 tell `reverse` to set the playhead at the end of the TL --
        // and and then wind back from there.
        toggleTL.reverse(0);
      }
    }
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
    debugger;
    const topLeftHamburgerControlPoint = DOM_REFS.controlPoints.hamburger.topLeft;
    const topRightHamburgerControlPoint = DOM_REFS.controlPoints.hamburger.topRight;
    const bottomLeftHamburgerControlPoint = DOM_REFS.controlPoints.hamburger.bottomLeft;
    const bottomRightHamburgerControlPoint = DOM_REFS.controlPoints.hamburger.bottomRight;

    const topLeftHamburgerX = Number(topLeftHamburgerControlPoint.getAttribute('cx'));
    const topRightHamburgerX = Number(topRightHamburgerControlPoint.getAttribute('cx'));
    const bottomLeftHamburgerX = Number(bottomLeftHamburgerControlPoint.getAttribute('cx'));
    const bottomRightHamburgerX = Number(bottomRightHamburgerControlPoint.getAttribute('cx'));

    const topHamburgerDrawPct = (
      Math.abs(topRightHamburgerX - topLeftHamburgerX) /
      DOM_REFS.iconPaths.menuTopXTopLeft.getTotalLength()
    ) * 100;
    const bottomHamburgerDrawPct = (
      Math.abs(bottomRightHamburgerX - bottomLeftHamburgerX) /
      DOM_REFS.iconPaths.menuBottomXBottomLeft.getTotalLength()
    ) * 100;

    TweenMax.set(
      DOM_REFS.iconPaths.menuTopXTopLeft,
      {
        DrawSVG: {}
      }
    );

    TweenMax.set(
      DOM_REFS.iconPaths.menuBottomXBottomLeft,
      {
        DrawSVG: {}
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
