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

  minRotation: 0,

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
  swing: function (opts = {}) {
    debugger;
    this.isInMotion = true;

    const startingRotation = this.currentRotation;
    const rotationKE = typeof opts.kineticEnergy !== 'undefined' ? opts.kineticEnergy : 0;
    const returnAngle = typeof opts.returnAngle !== 'undefined' ? opts.returnAngle : 0;
    const FRAME_RATE = opts.frameRate || 1 / 60;

    let outwardAngle = (this.swingDirection * rotationKE) + startingRotation;
      //( this.swingDirection * Math.abs(this.currentRotation) );

    if (this.swingDirection === -1 && outwardAngle < this.minRotation) {
      outwardAngle = this.minRotation;

    } else if (this.swingDirection === 1 && outwardAngle > this.maxRotation) {
      outwardAngle = this.maxRotation;
    }

    // const outwardRotation = (projectedOutwardRotation > this.maxRotation)
    //   this.maxRotation - Math.abs(this.currentRotation) :
    //   rotationKE;

    const outwardRotationAmount = Math.abs(outwardAngle - this.currentRotation);
    const fallBackRotationAmount = Math.abs(returnAngle - outwardAngle);
    const totalRotationThroughout = outwardRotationAmount + fallBackRotationAmount;


    const tl = new TimelineMax({
      onComplete: this.onSwingComplete.bind(this, fallBackRotationAmount, opts.collisionCallback)
    });

    // TODO: compute total energy based upon rotation and use that to compute time to fall back to normal position

    console.log(`Rotation Kinetic Energy: ${rotationKE}`);
    console.log(`Outward Angle: ${outwardAngle}`);
    console.log(`Outward Rotation Amount: ${outwardRotationAmount}`);
    console.log(`Fallback Rotation Amount: ${fallBackRotationAmount}`);
    console.log(`Total Rotation Throughout: ${totalRotationThroughout}`);

    const swingState = {
      elapsedTime: 0,
      durationThroughout: 2
    };

    let isSwingingOutward = true;
    while ( swingState.elapsedTime < swingState.durationThroughout ) {

      // maxAngle = Math.min(
      //   this.swingDirection * this.maxRotation,
      //   this.swingDirection * (kineticEnergy + Math.abs(this.currentRotation))
      // );
      //
      // this.currentRotation = this.swingDirection * (
      //   startingRotation +
      //   ( totalChange * EasingUtils.easeOutCubic(swingState.elapsedTime, swingState.durationThroughout) )
      // );

      this.currentRotation = isSwingingOutward ?
        (
          startingRotation +
          ( (outwardRotationAmount * this.swingDirection) * EasingUtils.easeOutCubic(swingState.elapsedTime, swingState.durationThroughout) )
        )
        :
        // NOTE: easeIn when coming back
        (
          outwardAngle +
          ( (fallBackRotationAmount * this.swingDirection) * EasingUtils.easeInCubic(swingState.elapsedTime, swingState.durationThroughout) )
        );


      // flip direction when max rotation is reached
      if (
        isSwingingOutward &&
        (
          (this.swingDirection === -1 && this.currentRotation <= outwardAngle) ||
          (this.swingDirection === 1 && this.currentRotation >= outwardAngle)
        )
      ) {
        // TODO: tl.clear() and break?
        console.log(`Direction swap!`);
        this.swingDirection *= -1;
        isSwingingOutward = false;
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
    //this.swingDirection *= -1;

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
