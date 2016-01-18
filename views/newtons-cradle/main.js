'use strict';

import TweenMax from "TweenMax";
import Draggable from "Draggable";
import EasingUtils from 'utils/easing-utils';
import Bearing from './models/bearing';

const FRAME_RATE = 1/60;

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

/* Direction constants to test the ouput of a Draggalbe event's `getDirection()` method */
const DIRECTIONS = {
  CLOCKWISE: 'clockwise',
  COUNTER_CLOCKWISE: 'counter-clockwise'
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
    objectsInDrag,
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
          maxRotation: MAX_ANGULAR_ROTATION,
          minRotation: -MAX_ANGULAR_ROTATION,
          masterTL: new TimelineMax(),
          elem: bearingElem,
          controlPointCoords: bearingControlPointCoords
        })
      );

      //console.log(`Created Bearing Object. isInMotion: ${BEARING_OBJECTS[idx].isInMotion}`);
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
   * Callback for when a bearing returns from its outward, extended state and
   * collides with its neighbor.
   */
  function onCollision (collidingBearingObj, rotationEnergyTransfered) {

    // TODO: Check and handle edge case here?

    let
      energyRecipients,
      bearingToSwing;

    const directionOfForce = collidingBearingObj.swingDirection;

    if (directionOfForce > 0) {
      // collision came from the right -- energyRecipient is
      // the leftmost bearing that's not already in motion
      bearingToSwing = BEARING_OBJECTS
        .slice(0, collidingBearingObj.position - 1)
        .filter(bearingObj => !bearingObj.isInMotion)[0];

    } else {
      // collision came from the left -- energyRecipient is
      // the rightmost bearing that's not already in motion
      bearingToSwing = BEARING_OBJECTS
        .slice(collidingBearingObj.position + 1)
        .filter(bearingObj => !bearingObj.isInMotion).pop();
    }


    if (bearingToSwing === collidingBearingObj) {
      // EDGE CASE (literally!):  an end bearing has hit the end of its extension
      console.log('edge case!');
    }

    bearingToSwing.isInMotion = true;
    bearingToSwing.swingDirection = directionOfForce;

    // energyRecipient.createSwingTLAfterDrag(
    //   rotationAmountBeforeCollision,
    //   onCollision
    // );
    bearingToSwing.swing({
      kineticEnergy: rotationEnergyTransfered,
      returnAngle: 0,
      collisionCallback: onCollision
    });
  }



  function createSwingTLsAfterDrag (currentRotationOfDragged, positionOfDragged) {
    console.log('Start Swing');

    BEARING_OBJECTS
      .filter(obj => !!obj.isInMotion)
      .forEach((obj, idx) => {
        // obj.createSwingTLAfterDrag(
        //   Math.abs(currentRotationOfDragged),
        //   obj.position == positionOfDragged ? onCollision : null
        // );
        obj.swing({
          kineticEnergy: 0,
          returnAngle: 0,
          collisionCallback: obj.position == positionOfDragged ? onCollision : null
        });

      });
  }

  function updateBallTLOnDrag () {
    //console.log('updateBallTLOnDrag!');
    //console.log(`updateOnDrag(). Rotation: ${this.rotation}`);

    let debugString = `Dragging `;

    objectsInDrag.forEach((bearingObj) => {
      debugString += `------${bearingObj.position}-----`;
      bearingObj.currentRotation = this.rotation;
      bearingObj.masterTL.to(bearingObj.elem, .01, { rotation: this.rotation });
    });

    console.log(debugString);

  }

  function swingBallsAfterDrag () {
    // TODO: Set appropriate bearings to isInMotion: true
    createSwingTLsAfterDrag(
      this.rotation,
      this.target.getAttribute(DATA_ATTRIBUTES.bearingIndex)
    );
  }

  function onDragStart () {
    const bearingIdx = Number(this.target.getAttribute(DATA_ATTRIBUTES.bearingIndex));

    // test direction by
    objectsInDrag = this.getDirection() === DIRECTIONS.CLOCKWISE ?
        BEARING_OBJECTS.slice(0, bearingIdx) :
        BEARING_OBJECTS.slice(bearingIdx);

    // Set the initial swing direction
    const swingDirection = this.getDirection() === DIRECTIONS.CLOCKWISE ? 1 : -1;

    for (const obj of objectsInDrag) {
      obj.isInMotion = true;
      obj.swingDirection = swingDirection;
    }
  }


  function addDragListeners () {

    Draggable.create(DOM_REFS.sortedBearingGroupElems, {
      type: 'rotation',
      throwProps: true,
      bounds: {
        minRotation: -MAX_ANGULAR_ROTATION,
        maxRotation: MAX_ANGULAR_ROTATION
      },
      onDragStart: onDragStart,
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
