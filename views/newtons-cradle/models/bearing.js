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

  // /*
  //  *  1 == clockwise
  //  *  -1 == counter-clockwise
  //  */
  swingDirection: 0,
  swingState: null,
  isInMotion: false,


  /* Position index along the cradle (anywhere from 0 to 4) */
  position: null,

  /* Master timeline for this particular bearing */
  masterTL: null,

  /* Cahced DOM node (or SVG) for this particular bearing */
  elem: null,

  /* Transform origin coords of the bearing */
  controlPointCoords: null,

  createRotationSettingTween: function (newRotation) {

    return TweenMax.set(
      this,
      { currentRotation: newRotation, immediateRender: false }
    );
  },

  getInterpolationFactor: function (isSwingingOutward) {
    return isSwingingOutward ?
      EasingUtils.easeOutCubic(
        this.swingState.elapsedTime,
        this.swingState.durationThroughout
      )
      :
      EasingUtils.easeInCubic(
        this.swingState.elapsedTime,
        this.swingState.durationThroughout
      );
  },

  getNewRotation: function (startingRotation, amountOfRotation, isSwingingOutward) {

    const interpolationFactor = this.getInterpolationFactor(isSwingingOutward);

    return (
      startingRotation +
      ( (amountOfRotation * this.swingDirection) * interpolationFactor )
    );

  },


  rotateBearingOnSwingUpdate: function (destinationAngle) {

    console.log(`Bearing ${this.position}, swingDirection of ${this.swingDirection}: Rotating to ${this.currentRotation}`);
    TweenMax.to(
      this.elem,
      1 / 20,
      { rotation: this.currentRotation, ease: Power0.easeNone }
    );
  },


  isSwingExtentReached (currentRotation, destinationAngle) {
    return (
      (this.swingDirection === -1 && currentRotation <= destinationAngle) ||
      (this.swingDirection === 1 && currentRotation >= destinationAngle)
    );
  },

  swing: function (opts = {}) {

    debugger;
    this.isInMotion = true;

    const startingRotation = this.currentRotation;
    const rotationKE = typeof opts.kineticEnergy !== 'undefined' ? opts.kineticEnergy : 0;
    const returnAngle = typeof opts.returnAngle !== 'undefined' ? opts.returnAngle : 0;
    const FRAME_RATE = opts.frameRate || 1 / 20;

    let outwardAngle = (this.swingDirection * rotationKE) + startingRotation;

    if (this.swingDirection === -1 && outwardAngle < this.minRotation) {
      outwardAngle = this.minRotation;

    } else if (this.swingDirection === 1 && outwardAngle > this.maxRotation) {
      outwardAngle = this.maxRotation;
    }

    const outwardRotationAmount = Math.abs(outwardAngle - this.currentRotation);
    const fallBackRotationAmount = Math.abs(returnAngle - outwardAngle);
    const totalRotationThroughout = outwardRotationAmount + fallBackRotationAmount;

    const swingTL = new TimelineMax({
      onUpdate: this.rotateBearingOnSwingUpdate.bind(this, outwardAngle),
      onComplete: this.onSwingComplete.bind(this, fallBackRotationAmount, opts.collisionCallback)
    });

    // TODO: compute total energy based upon rotation and use that to compute time to fall back to normal position

    console.log(`Rotation Kinetic Energy: ${rotationKE}`);
    console.log(`Outward Angle: ${outwardAngle}`);
    console.log(`Outward Rotation Amount: ${outwardRotationAmount}`);
    console.log(`Fallback Rotation Amount: ${fallBackRotationAmount}`);
    console.log(`Total Rotation Throughout: ${totalRotationThroughout}`);

    // Initialize this object's swing state
    this.swingState = {
      isSwingingOutward: true,
      isSwingComplete: false,
      elapsedTime: 0,
      durationThroughout: 2
    };


    let
      isSwingingOutward = true,
      isSwingComplete = false,
      newRotation;

    while (!isSwingComplete) {

      if (isSwingingOutward) {

        newRotation = this.getNewRotation(startingRotation, outwardRotationAmount, isSwingingOutward);
        swingTL.add(this.createRotationSettingTween(newRotation), '+=.01');

        if (this.isSwingExtentReached(newRotation, outwardAngle)) {
          console.log(`Direction swap!`);
          this.swingDirection = this.swingDirection === -1 ? 1 : -1;
          this.swingState.elapsedTime = 0;  // interpolate the
          isSwingingOutward = false;
        }

      } else {
        newRotation = this.getNewRotation(outwardAngle, fallBackRotationAmount, isSwingingOutward);
        swingTL.add(this.createRotationSettingTween(newRotation), '+=.01');

        if (this.isSwingExtentReached(newRotation, returnAngle)) {
          debugger;
          isSwingComplete = true;
        }
      }

      this.swingState.elapsedTime += FRAME_RATE;
    }

    debugger;
    this.masterTL.add(swingTL);

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
