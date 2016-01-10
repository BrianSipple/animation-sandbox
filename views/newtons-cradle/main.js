'use strict';

import TweenMax from "TweenMax";
import Draggable from "Draggable";

const SELECTORS = {
  leftBearingGroup: '.bearing--1',
  rightBearingGroup: '.bearing--5',
  leftBall: '.bearing--1 .ball',
  leftBallControlPoint: '.bearing--1 .control-point',
  rightBall: '.bearing--5 .ball',
  rightBallControlPoint: '.bearing--5 .control-point'
};


const DURATIONS = {

};



const EASINGS = {

};


const LABELS = {
  leftBall: 'leftBallMotion',
  rightBall: 'leftBallMotion'
};

const BALL_POSITIONS = ['one', 'two', 'three', 'four', 'five'];


const MAX_ANGULAR_ROTATION = 85;


const NewtonsCradle = (function newtonsCradle () {
  let
    DOM_REFS,
    COORDINATES,
    masterTL;


  function cacheDOMState () {
      DOM_REFS = {
        leftBearingGroup: document.querySelector(SELECTORS.leftBearingGroup),
        leftBall: document.querySelector(SELECTORS.leftBall),
        leftBallControlPoint: document.querySelector(SELECTORS.leftBallControlPoint),

        rightBearingGroup: document.querySelector(SELECTORS.rightBearingGroup),
        rightBallControlPoint: document.querySelector(SELECTORS.rightBallControlPoint),
        rightBall: document.querySelector(SELECTORS.rightBall),
      };

      COORDINATES = {
        leftBallControlPoint: `${DOM_REFS.leftBallControlPoint.getAttribute('cx')} ${DOM_REFS.leftBallControlPoint.getAttribute('cy')}`,
        rightBallControlPoint: `${DOM_REFS.rightBallControlPoint.getAttribute('cx')} ${DOM_REFS.rightBallControlPoint.getAttribute('cy')}`
      };
  }

  /**
   * Prepare element for the animation
   */
  function setInitialElementState () {

    TweenMax.set(DOM_REFS.leftBearingGroup, { svgOrigin: COORDINATES.leftBallControlPoint, rotation: 0 });
    TweenMax.set(DOM_REFS.rightBearingGroup, { svgOrigin: COORDINATES.rightBallControlPoint, rotation: 0 });

  }

  //
  // function configureBallMotion (ballType) {
  //
  //   let ballTL = new TimelineMax({ yoyo: true, repeat: -1 });
  //
  //   if (ballType === 'left') {
  //     ballTL.to(
  //       DOM_REFS.leftBall
  //     )
  //   }
  // }


  // function wireUpAnimation () {
  //
  //   masterTL = new TimelineMax({ paused: true });
  //   masterTL.add(configureBallMotion('left'), LABELS.leftBall);
  //   masterTL.add(configureBallMotion('right'), LABELS.rightBall);
  //   //masterTL.add();
  // }

  function startSwing (ballPositionToSwing, startingRotation) {
    const swingTL = new TimelineMax({ repeat: -1 });

    // compute swinging

    // each time the ball returns to its initial hanging position, check whether the
    // other ball is currently extended outward. If it is, the second to last ball
    // on that side should swing, as nothing beyond it is absorbing the force

    // call swingTL.clear() when we're done
  }

  function updateBallTLOnDrag () {
    console.log('updateBallTLOnDrag!');
  }

  function swingBallsAfterDrag (ballPosition) {
    startSwing(ballPosition, this.rotation);
  }




  function addListeners () {
    Draggable.create(DOM_REFS.leftBearingGroup, {
      type: 'rotation',
      throwProps: true,
      bounds: {
        minRotation: 0,
        maxRotation: MAX_ANGULAR_ROTATION
      },
      onDrag: updateBallTLOnDrag,
      onDragEnd: swingBallsAfterDrag,
      onDragEndParams: [ BALL_POSITIONS[0] ]
    });

    Draggable.create(DOM_REFS.rightBearingGroup, {
      type: 'rotation',
      throwProps: true,
      bounds: {
        minRotation: -MAX_ANGULAR_ROTATION,
        maxRotation: 0,
      },
      onDrag: updateBallTLOnDrag,
      onDragEnd: swingBallsAfterDrag,
      onDragEndParams: [ BALL_POSITIONS[4] ]
    });
  }




  function run () {
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
