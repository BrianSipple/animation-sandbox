'use strict';

import TweenMax from "TweenMax";
import DrawSVGPlugin from 'DrawSVGPlugin';

const DURATIONS = {

};

const CLASS_NAMES = {
  iconContainer: 'js-icon-container--toggle-to-x-circular-spin',
  icon: 'icon',
  iconPaths: {
    topLeftHamBottomRightX: 'icon-path icon-path--menu-top-x-tl-br',
    menuMiddle: 'icon-path icon-path--menu-middle',
    bottomRightHamTopRightX: 'icon-path icon-path--menu-bottom-x-bl-tr'
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
    const iconContainer = document.querySelector(`.${CLASS_NAMES.iconContainer}`);

    DOM_REFS.iconContainer = iconContainer;
    DOM_REFS.icon = iconContainer.getElementsByClassName(CLASS_NAMES.icon)[0];
    DOM_REFS.iconPaths = {
      topLeftHamBottomRightX: iconContainer.getElementsByClassName(CLASS_NAMES.iconPaths.topLeftHamBottomRightX)[0],   // menu top / the part of the "x" that starts (left-to-right) at the top-left
      menuMiddle: iconContainer.getElementsByClassName(CLASS_NAMES.iconPaths.menuMiddle)[0],
      bottomRightHamTopRightX: iconContainer.getElementsByClassName(CLASS_NAMES.iconPaths.bottomRightHamTopRightX)[0], // menu top / the part of the "x" that starts (left-to-right) at the bottom-left
    };
    DOM_REFS.controlPoints = {
      hamburger: {
        topLeft: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.topLeft)[0],
        topRight: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.topRight)[0],
        bottomLeft: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.bottomLeft)[0],
        bottomRight: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.hamburger.bottomRight)[0],
      },
      x: {
        topLeft: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.x.topLeft)[0],
        topRight: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.x.topRight)[0],
        bottomLeft: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.x.bottomLeft)[0],
        bottomRight: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.x.bottomRight)[0],
      }
    };
  }

  function registerListeners () {
    DOM_REFS.iconContainer.addEventListener('click', toggleIcon, false);
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
        masterTL.play(0);

      } else {
        // Reverse back to the hamburger state.
        // NOTE: 0 tell `reverse` to set the playhead at the end of the TL --
        // and and then wind back from there.
        masterTL.reverse(0);
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
  }


  function prepareStartState() {
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
      DOM_REFS.iconPaths.topLeftHamBottomRightX.getTotalLength()
    ) * 100;
    const bottomHamburgerDrawPct = (
      Math.abs(bottomRightHamburgerX - bottomLeftHamburgerX) /
      DOM_REFS.iconPaths.bottomRightHamTopRightX.getTotalLength()
    ) * 100;

    debugger;
    // TweenMax.set(
    //   DOM_REFS.iconPaths.topLeftHamBottomRightX,
    //   {
    //     drawSVG: false,
    //   }
    // );
    //
    // TweenMax.set(
    //   DOM_REFS.iconPaths.bottomRightHamTopRightX,
    //   {
    //     drawSVG: '50%',
    //   }
    // );
    TweenMax.set(
      DOM_REFS.iconPaths.topLeftHamBottomRightX,
      {
        drawSVG: `${100 - topHamburgerDrawPct}% 100%`,
      }
    );

    TweenMax.set(
      DOM_REFS.iconPaths.bottomRightHamTopRightX,
      {
        drawSVG: `100% ${100 - bottomHamburgerDrawPct}%`,
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
