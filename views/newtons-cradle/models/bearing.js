'use strict';

import TweenMax from 'TweenMax';
import EasingUtils from 'utils/easing-utils';

const Bearing = {

  ballMass: 1,
  ballRadius: 1,

  /* Potential energy */
  pE: 0,

  /* Kinetic Energy */
  kE: 0,

  /* the maximum amount of rotation that this bearing can be rotated */
  maxRotation: 0,

  /* The Bearing's current rotation along its transform origin's z-axis */
  currentRotation: 0,

  /*
   *  1 == clockwise
   *  -1 == counter-clockwise
   */
  swingDirection: 0,

  isInMotion: false,

  /* Position index along the cradle (anywhere from 0 to 4) */
  position: null,

  /* Master timeline for this particular bearing */
  masterTL: null,

  /* Cahced DOM node (or SVG) for this particular bearing */
  elem: null,

  /* Transform origin coords of the bearing */
  controlPointCoords: null,

  // TODO: Change name to just "createSwingTL?"
  createSwingTLAfterDrag: function (swingOpts = {}, collisionCallback) {
    //debugger;
    //console.log(`createSwingTLAfterDrag(): Bearing ${this.position}`);
    this.isInMotion = true;

    //const startingRotation = typeof swingOpts.startingRotation === 'undefined' ? 0 : swingOpts.startingRotation;
    const startingRotation = this.currentRotation;
    const targetRotation = typeof swingOpts.targetRotation === 'undefined' ? 0 : swingOpts.targetRotation;
    const FRAME_RATE = typeof swingOpts.frameRate === 'undefined' ? 1/60 : swingOpts.frameRate;
    const totalChange = startingRotation - targetRotation;

    const tl = new TimelineMax({
      onComplete: this.onSwingComplete.bind(this, totalChange, collisionCallback)
    });

    // TODO: compute total energy based upon rotation and use that to compute time to fall back to normal position

    console.log(`Total Change: ${totalChange}`);

    const swingState = {
      elapsedTime: 0,
      durationThroughout: 2
    };

    const rotationWeight = Math.abs(totalChange);

    while ( swingState.elapsedTime < swingState.durationThroughout ) {

      this.currentRotation = this.swingDirection * (
        startingRotation +
        ( rotationWeight * EasingUtils.easeOutCubic(swingState.elapsedTime, swingState.durationThroughout) )
      );

      // flip direction when max rotation is reached
      if (Math.abs(this.currentRotation) >= this.maxRotation) {
        this.swingDirection *= -1;
      }

      console.log(`Bearing ${this.position}: tl being created for currentRotation of ${this.currentRotation}`);
      tl.to(
        this.elem,
        FRAME_RATE,
        { rotation: this.currentRotation, ease: Linear.easeNone }
      );

      swingState.elapsedTime += FRAME_RATE;
    }

    this.masterTL.add(tl);
  },


  /**
   * After a swing, update the `isInMotion` state.
   * Furthermore, if this is a bearing that will produce a collision at the
   * end of its swing, call back to the collision handler.
   */
  onSwingComplete: function (rotationAmountBeforeCollision, collisionCallback) {
    console.log(`*** COMPLETING SWING FOR ${this.position}`);
    this.isInMotion = false;

    if (collisionCallback) {
      collisionCallback(this, rotationAmountBeforeCollision);
    }
  }

};


function BearingFactory (opts = {}) {
  //debugger;
  let bearing = Object.create(Bearing);
  return Object.assign({}, Bearing, opts);
}

export default BearingFactory;
