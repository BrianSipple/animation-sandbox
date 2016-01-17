'use strict';

import TweenMax from "TweenMax";
import Draggable from "Draggable";
import EasingUtils from 'utils/easing-utils';
import Bearing from './models/bearing';

const FRAME_RATE = 1/30;

const SELECTORS = {
  bearingGroups: '.bearing',
  bearingGroup0: '.bearing--0',
  bearingGroup1: '.bearing--1',
  bearingGroup2: '.bearing--2',
  bearingGroup3: '.bearing--3',
  bearingGroup4: '.bearing--4',
  bearingBall0: '.bearing--0 .ball',
  bearingBall1: '.bearing--1 .ball',
  bearingBall2: '.bearing--2 .ball',
  bearingBall3: '.bearing--3 .ball',
  bearingBall4: '.bearing--4 .ball',
  group0ControlPoint: '.bearing--0 .control-point',
  group1ControlPoint: '.bearing--1 .control-point',
  group2ControlPoint: '.bearing--2 .control-point',
  group3ControlPoint: '.bearing--3 .control-point',
  group4ControlPoint: '.bearing--4 .control-point'
};


const DURATIONS = {

};

const DATA_ATTRIBUTES = {
    bearingIndex: 'data-bearing-idx'
};



const EASINGS = {

};


const LABELS = {
  leftMotion: 'leftMotion',
  rightMotion: 'rightMotion'
};

const BALL_POSITIONS = ['one', 'two', 'three', 'four', 'five'];
const MAX_ANGULAR_ROTATION = 85;


const BEARING_OBJECTS = [];


function _getBearingObjectFromElem (elem) {
  return BEARING_OBJECTS[elem.getAttribute(DATA_ATTRIBUTES.bearingIndex)];
}

const NewtonsCradle = (function newtonsCradle () {
  let
    DOM_REFS,
    COORDINATES,
    masterTL;


  function cacheDOMState () {
      DOM_REFS = {

        bearingGroups: {
          group0: {
            bearingElem: document.querySelector(SELECTORS.bearingGroup0),
            ballElem: document.querySelector(SELECTORS.bearingBall0),
            controlPointElem: document.querySelector(SELECTORS.group0ControlPoint)
          },
          group1: {
            bearingElem: document.querySelector(SELECTORS.bearingGroup1),
            ballElem: document.querySelector(SELECTORS.bearingBall1),
            controlPointElem: document.querySelector(SELECTORS.group1ControlPoint)
          },
          group2: {
            bearingElem: document.querySelector(SELECTORS.bearingGroup2),
            ballElem: document.querySelector(SELECTORS.bearingBall2),
            controlPointElem: document.querySelector(SELECTORS.group2ControlPoint)
          },
          group3: {
            bearingElem: document.querySelector(SELECTORS.bearingGroup3),
            ballElem: document.querySelector(SELECTORS.bearingBall3),
            controlPointElem: document.querySelector(SELECTORS.group3ControlPoint)
          },
          group4: {
            bearingElem: document.querySelector(SELECTORS.bearingGroup4),
            ballElem: document.querySelector(SELECTORS.bearingBall4),
            controlPointElem: document.querySelector(SELECTORS.group4ControlPoint)
          }
        }

      };

      // sort the array of bearing groups according to their index
      DOM_REFS.sortedBearingGroupElems = [...document.querySelectorAll(SELECTORS.bearingGroups)]
        .sort((a, b) => {
          const idxA = Number(a.getAttribute(DATA_ATTRIBUTES.bearingIndex));
          const idxB = Number(b.getAttribute(DATA_ATTRIBUTES.bearingIndex));
          return idxA - idxB;
        });
  }


  function initializeBearingObjects () {

    let
      bearingGroup,
      bearingElem,
      bearingControlPointCoords,
      bearingBallElem,
      bearingBallRadius;
    Object.keys(DOM_REFS.bearingGroups).forEach((bearingGroupKey, idx) => {

      bearingGroup = DOM_REFS.bearingGroups[bearingGroupKey];

      bearingElem = bearingGroup.bearingElem;
      bearingControlPointCoords = {
        x: bearingGroup.controlPointElem.getAttribute('cx'),
        y: bearingGroup.controlPointElem.getAttribute('cy')
      };
      bearingBallElem = bearingGroup.ballElem;

      bearingBallRadius = Number(bearingBallElem.getAttribute('r'));

      BEARING_OBJECTS.push(
        Bearing({
          ballMass: 1,
          ballRadius: bearingBallRadius,
          position: idx,
          masterTL: new TimelineMax(),
          elem: bearingElem,
          controlPointCoords: bearingControlPointCoords
        })
      );
    });

  }

  /**
   * Prepare bearing elements for the animation
   */
  function syncBearingsWithAnimationScene () {

    for (const bearingObject of BEARING_OBJECTS) {
      TweenMax.set(bearingObject.elem, {
        svgOrigin: `${bearingObject.controlPointCoords.x} ${bearingObject.controlPointCoords.y}`,
        rotation: 0
      });
      masterTL.add(bearingObject.masterTL);
    }
  }

  /**
   * TODO: Something like this... params are still tentative
   */
  function handleCollisionOnSwingEnd (collidingBearingElem, rotationBeforeCollision) {

    let collidingBearing = _getBearingObjectFromElem(collidingBearingElem);

    collidingBearingElem.isInMotion = false;
  }


  function createSwingTLForBearing (bearingElem, startingRotation, destinationRotation) {

    const totalChange = destinationRotation - startingRotation;

    const tl = new TimelineMax({
      onComplete: handleCollisionOnSwingEnd,
      onCompleteParams: [ bearingElem, totalChange ]
    });

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

  function createSwingTLsAfterDrag (currentRotationOfDragged) {
    console.log('Start Swing');

    BEARING_OBJECTS
      .filter(obj => obj.isInMotion)
      .forEach((obj) => {
        //obj.masterTL.add(createSwingTLForBearing(obj.elem, currentRotationOfDragged, 0)); // TODO: Desitination is not always going to be 0!
        obj.createSwingTLAfterDrag(currentRotationOfDragged, 0);
      });




    //masterTL.add(createSwingTLForBearing(bearingGroupToStart, currentRotationOfDragged, 0));

    // compute swinging

    // each time the ball returns to its initial hanging position, check whether the
    // other ball is currently extended outward. If it is, the second to last ball
    // on that side should swing, as nothing beyond it is absorbing the force

    // call swingTL.clear() when we're done?
  }

  function updateBallTLOnDrag () {
    //console.log('updateBallTLOnDrag!');
    //console.log(`updateOnDrag(). Rotation: ${this.rotation}`);
    const bearingIdx = this.target.getAttribute(DATA_ATTRIBUTES.bearingIndex);

    // drag the bearing -- and any bearings in its path (rotation > 0 == a pull to the left)
    const objectsToDrag = this.rotation > 0 ?
        BEARING_OBJECTS.slice(0, bearingIdx) :
        BEARING_OBJECTS.slice(bearingIdx);

    objectsToDrag.forEach((bearingObj) => {
      bearingObj.masterTL.to(bearingObj.elem, .01, { rotation: this.rotation });
      bearingObj.isInMotion = true;
    });

  }

  // /**
  //  * Updates our knowledge of the bearings that have potential
  //  * energy built up.
  //  */
  // function updatePotentialEnergiesOnDragStart () {
  //   const bearingObject = _getBearingObjectFromElem(this.target);
  //   bearingObject.isInMotion = true;
  // }

  function swingBallsAfterDrag (ballPosition) {
    createSwingTLsAfterDrag(this.rotation);
  }




  function addDragListeners () {

    Draggable.create(DOM_REFS.sortedBearingGroupElems, {
      type: 'rotation',
      throwProps: true,
      bounds: {
        minRotation: -MAX_ANGULAR_ROTATION,
        maxRotation: MAX_ANGULAR_ROTATION
      },
      //onDragStart: updatePotentialEnergiesOnDragStart,
      onDrag: updateBallTLOnDrag,
      onDragEnd: swingBallsAfterDrag
    });

  }

  function run () {

    masterTL = new TimelineMax();

    cacheDOMState();
    initializeBearingObjects();
    syncBearingsWithAnimationScene();
    addDragListeners();
  }


  return {
    run
  };

}());

export default NewtonsCradle;
