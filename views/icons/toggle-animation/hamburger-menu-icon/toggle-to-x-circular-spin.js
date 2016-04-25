'use strict';

import TweenMax from "TweenMax";
import DrawSVGPlugin from 'DrawSVGPlugin';

const DURATIONS = {

};

const CLASS_NAMES = {
  iconContainer: 'js-icon-root-svg--toggle-to-x-circular-spin',
  icon: 'icon',
  iconPaths: {
    menuTopLeftToXBottomRight: 'icon-path icon-path--menu-tl-to-x-br',
    menuMiddle: 'icon-path icon-path--menu-middle',
    menuBottomRightToXTopRight: 'icon-path icon-path--menu-br-to-x-tr'
  },
  controlPoints: {
    menu: {
      topLeft: 'menu-control-point menu-control-point--tl',
      topRight: 'menu-control-point menu-control-point--tr',
      bottomLeft: 'menu-control-point menu-control-point--bl',
      bottomRight: 'menu-control-point menu-control-point--br'
    },
    x: {
      topLeft: 'x-control-point x-control-point--tl',
      topRight: 'x-control-point x-control-point--tr',
      bottomLeft: 'x-control-point x-control-point--bl',
      bottomRight: 'x-control-point x-control-point--br'
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
      menuTopLeftToXBottomRight: iconContainer.getElementsByClassName(CLASS_NAMES.iconPaths.menuTopLeftToXBottomRight)[0],   // menu top / the part of the "x" that starts (left-to-right) at the top-left
      menuMiddle: iconContainer.getElementsByClassName(CLASS_NAMES.iconPaths.menuMiddle)[0],
      menuBottomRightToXTopRight: iconContainer.getElementsByClassName(CLASS_NAMES.iconPaths.menuBottomRightToXTopRight)[0], // menu top / the part of the "x" that starts (left-to-right) at the bottom-left
    };
    DOM_REFS.controlPoints = {
      menu: {
        topLeft: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.menu.topLeft)[0],
        topRight: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.menu.topRight)[0],
        bottomLeft: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.menu.bottomLeft)[0],
        bottomRight: iconContainer.getElementsByClassName(CLASS_NAMES.controlPoints.menu.bottomRight)[0],
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
        // Reverse back to the menu state.
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
    const topLeftHamburgerControlPoint = DOM_REFS.controlPoints.menu.topLeft;
    const topRightHamburgerControlPoint = DOM_REFS.controlPoints.menu.topRight;
    const bottomLeftHamburgerControlPoint = DOM_REFS.controlPoints.menu.bottomLeft;
    const bottomRightHamburgerControlPoint = DOM_REFS.controlPoints.menu.bottomRight;

    const topLeftHamburgerX = Number(topLeftHamburgerControlPoint.getAttribute('cx'));
    const topRightHamburgerX = Number(topRightHamburgerControlPoint.getAttribute('cx'));
    const bottomLeftHamburgerX = Number(bottomLeftHamburgerControlPoint.getAttribute('cx'));
    const bottomRightHamburgerX = Number(bottomRightHamburgerControlPoint.getAttribute('cx'));

    const topHamburgerDrawPct = (
      Math.abs(topRightHamburgerX - topLeftHamburgerX) /
      DOM_REFS.iconPaths.menuTopLeftToXBottomRight.getTotalLength()
    ) * 100;
    const bottomHamburgerDrawPct = (
      Math.abs(bottomRightHamburgerX - bottomLeftHamburgerX) /
      DOM_REFS.iconPaths.menuBottomRightToXTopRight.getTotalLength()
    ) * 100;

    debugger;
    // TweenMax.set(
    //   DOM_REFS.iconPaths.menuTopLeftToXBottomRight,
    //   {
    //     drawSVG: false,
    //   }
    // );
    //
    // TweenMax.set(
    //   DOM_REFS.iconPaths.menuBottomRightToXTopRight,
    //   {
    //     drawSVG: '50%',
    //   }
    // );
    TweenMax.set(
      DOM_REFS.iconPaths.menuTopLeftToXBottomRight,
      {
        drawSVG: `${100 - topHamburgerDrawPct}% 100%`,
      }
    );

    TweenMax.set(
      DOM_REFS.iconPaths.menuBottomRightToXTopRight,
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
