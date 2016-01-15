'use strict';

import TweenMax from "TweenMax";
import Draggable from "Draggable";
import EasingUtils from 'utils/easing-utils';

const SELECTORS = {
  bearingGroups: '.bearing',
  bearingGroup1: '.bearing--1',
  bearingGroup2: '.bearing--2',
  bearingGroup3: '.bearing--3',
  bearingGroup4: '.bearing--4',
  bearingGroup5: '.bearing--5',
  group1ControlPoint: '.bearing--1 .control-point',
  group2ControlPoint: '.bearing--2 .control-point',
  group3ControlPoint: '.bearing--3 .control-point',
  group4ControlPoint: '.bearing--4 .control-point',
  group5ControlPoint: '.bearing--5 .control-point'
};


const DURATIONS = {

};

const DATA_ATTRIBUTES = {
    bearingGroups: [
        'bearing-1',
        'bearing-2',
        'bearing-middle',
        'bearing-4',
        'bearing-5',
    ]
};



const EASINGS = {

};


const LABELS = {
  leftMotion: 'leftMotion',
  rightMotion: 'rightMotion'
};

const BALL_POSITIONS = ['one', 'two', 'three', 'four', 'five'];
const MAX_ANGULAR_ROTATION = 85;
const FRAME_RATE = 1/30;

let currentDragDirection;



const NewtonsCradle = (function newtonsCradle () {
  let
    DOM_REFS,
    COORDINATES,
    masterTL;


  function cacheDOMState () {
      DOM_REFS = {

        bearingGroups: document.querySelectorAll(SELECTORS.bearingGroups),

        bearingGroup1: document.querySelector(SELECTORS.bearingGroup1),
        group1ControlPoint: document.querySelector(SELECTORS.group1ControlPoint),

        bearingGroup2: document.querySelector(SELECTORS.bearingGroup2),
        group2ControlPoint: document.querySelector(SELECTORS.group2ControlPoint),

        bearingGroup3: document.querySelector(SELECTORS.bearingGroup3),
        group3ControlPoint: document.querySelector(SELECTORS.group3ControlPoint),

        bearingGroup4: document.querySelector(SELECTORS.bearingGroup4),
        group4ControlPoint: document.querySelector(SELECTORS.group4ControlPoint),

        bearingGroup5: document.querySelector(SELECTORS.bearingGroup5),
        group5ControlPoint: document.querySelector(SELECTORS.group5ControlPoint)
      };

      COORDINATES = {
        group1ControlPoint: `${DOM_REFS.group1ControlPoint.getAttribute('cx')} ${DOM_REFS.group1ControlPoint.getAttribute('cy')}`,
        group2ControlPoint: `${DOM_REFS.group2ControlPoint.getAttribute('cx')} ${DOM_REFS.group2ControlPoint.getAttribute('cy')}`,
        group3ControlPoint: `${DOM_REFS.group3ControlPoint.getAttribute('cx')} ${DOM_REFS.group3ControlPoint.getAttribute('cy')}`,
        group4ControlPoint: `${DOM_REFS.group4ControlPoint.getAttribute('cx')} ${DOM_REFS.group4ControlPoint.getAttribute('cy')}`,
        group5ControlPoint: `${DOM_REFS.group5ControlPoint.getAttribute('cx')} ${DOM_REFS.group5ControlPoint.getAttribute('cy')}`
      };
  }

  /**
   * Prepare element for the animation
   */
  function setInitialElementState () {

    TweenMax.set(DOM_REFS.bearingGroup1, { svgOrigin: COORDINATES.group1ControlPoint, rotation: 0 });
    TweenMax.set(DOM_REFS.bearingGroup2, { svgOrigin: COORDINATES.group2ControlPoint, rotation: 0 });
    TweenMax.set(DOM_REFS.bearingGroup3, { svgOrigin: COORDINATES.group3ControlPoint, rotation: 0 });
    TweenMax.set(DOM_REFS.bearingGroup4, { svgOrigin: COORDINATES.group4ControlPoint, rotation: 0 });
    TweenMax.set(DOM_REFS.bearingGroup5, { svgOrigin: COORDINATES.group5ControlPoint, rotation: 0 });

  }


  function createSwingTLForBearing (bearingElem, startingRotation, destinationRotation) {
    debugger;

    const tl = new TimelineMax();
    const totalChange = destinationRotation - startingRotation;

    // TODO: compute total energy based upon rotation and use that to compute time to fall back to normal position

    console.log(`Total Change: ${totalChange}`);

    let swingState = {
      elapsedTime: 0,
      durationThroughout: 2
    };

    let nextRotationVal;

    while ( swingState.elapsedTime < swingState.durationThroughout ) {

      nextRotationVal = (
        startingRotation +
        ( totalChange * EasingUtils.easeOutCubic(swingState.elapsedTime, swingState.durationThroughout) )
      );

      console.log(`nextRotationVal Rotation: ${nextRotationVal}`);

      tl.to(
        bearingElem,
        FRAME_RATE,
        { rotation: nextRotationVal, ease: Linear.easeNone }
      );

      swingState.elapsedTime += FRAME_RATE;
    }

    return tl;
  }

  function createSwingTLsAfterDrag (bearingGroupToStart, currentRotationOfDragged) {
    console.log('Start Swing');

    masterTL.add(createSwingTLForBearing(bearingGroupToStart, currentRotationOfDragged, 0));



    // compute swinging

    // each time the ball returns to its initial hanging position, check whether the
    // other ball is currently extended outward. If it is, the second to last ball
    // on that side should swing, as nothing beyond it is absorbing the force

    // call swingTL.clear() when we're done
  }

  function updateBallTLOnDrag () {
    debugger;
    console.log('updateBallTLOnDrag!');
    const bearingIdx = DATA_ATTRIBUTES.bearingGroups.indexOf(this.target.getAttribute('data-bearing-idx'));

    // drag the bearing -- and any bearings in its path
    let elemsToDrag = this.rotation > 0 ?
        [...DOM_REFS.bearingGroups].slice(bearingIdx) :
        [...DOM_REFS.bearingGroups].slice(0, bearingIdx);

    TweenMax.to(elemsToDrag, .01, { rotation: this.rotation });

  }

  function swingBallsAfterDrag (ballPosition) {

      debugger;
    //
    // const bearingGroupToStart = ballPosition === BALL_POSITIONS[0] ?
    //   DOM_REFS.bearingGroup1 :
    //   DOM_REFS.bearingGroup5;

    createSwingTLsAfterDrag(this.target, this.rotation);
  }




  function addListeners () {

    Draggable.create(DOM_REFS.bearingGroups, {
      type: 'rotation',
      throwProps: true,
      bounds: {
        minRotation: -MAX_ANGULAR_ROTATION,
        maxRotation: MAX_ANGULAR_ROTATION
      },
      onDrag: updateBallTLOnDrag,
      onDragEnd: swingBallsAfterDrag
    });

  }

  function run () {

    masterTL = new TimelineMax();

    cacheDOMState();
    setInitialElementState();
    //wireUpAnimation();
    addListeners();
  }


  return {
    run
  };

}());

export default NewtonsCradle;
