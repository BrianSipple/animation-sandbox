'use strict';

import TweenMax from 'TweenMax';
import EasingUtils from 'utils/easing-utils';


// let's get on with it, shall we... until everyone is on #TeamRadians
function degToRad(degrees) {
  return (Math.PI / 180) * degrees;
}
function radToDeg(radians) {
  return radians / (Math.PI / 180);
}

const Spring = {

  /* Spring force ---> -k * deltaX */
  force: 0,

  /* Spring constant (aka "stiffness") in kg / s^2 */
  k: 20,

  /*  "viscous damping coefficient", measured in kg / s) */
  damping: 0.5
};


const swingTypes = {
  OUTWARD: 'outward',
  INWARD: 'inward'
};

const swingDirections = {
  CLOCKWISE: 1,
  COUNTER_CLOCKWISE: -1
};

const Swing = {
  // t: 0,
  // d: 0,
  deltaT: 0,
  type: swingTypes.OUTWARD,
  direction: null,
  isComplete: false
};

const bearingDefaults = {
  mass: 20,
  radius: 1
};

const DEFAULT_FRAME_RATE = 1 / 20;



const Bearing = {

  mass: null,
  radius: null,
  velocity: 0,
  momentum: 0,

  /* Potential energy */
  pE: 0,

  /* Kinetic Energy */
  kE: 0,

  /* Current angle (0 ~= pointing downwards) */
  theta: 0,

  /**
   * Force multiplied by the bearing's (perpendicular) distance from the
   * object’s center of mass (or point of rotation
   */
  torque: 0,

  /* Angular velocity */
  omega: 0,

  /* Angular acceleration */
  alpha: 0,

  /* Point mass m at along a weightless rod at a distance r from the axis of rotation. */
  momentOfInertia: 0,


  /* Spring force ---> -k * deltaX */
  spring: null,
  swingState: null,

  /* Natural frequency as modeled for a spring-mass system: ( 1 / 2 π ) * sqrt( k / m ) */
  frequency: 0,

  bearingLength: 0,

  /* the maximum amount of rotation that this bearing can be rotated */
  maxRotation: 0,
  minRotation: 0,

  /* track the bearing's rotation along its transform origin's z-axis */
  previousRotation: 0,

  // /*
  //  *  1 == clockwise
  //  *  -1 == counter-clockwise
  //  */
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

  onInit () {
    this.spring = Object.create(Object(Spring));
    this.swingState = Object.create(Object(Swing));

    this.frequency = (Math.PI * 0.5) * Math.sqrt(this.spring.k / this.mass);
    this.momentOfInertia = this.mass * this.bearingLength * this.bearingLength;
  },


  _createRotationTween: function () {

    this.theta = this._getNewRotation();

    /* Calculate forces from current position. */
    const T = this.mass * 9.81 * Math.cos(degToRad(this.theta)) * this.bearingLength;

    /* Current angular acceleration */
    const newAlpha = T / this.momentOfInertia;

    /* Calculate current velocity from last frame's velocity and
    average of last frame's acceleration with this frame's acceleration. */
    this.omega = this.omega + 0.5 * (this.alpha + newAlpha) * this.swingState.deltaT;
    this.alpha = newAlpha;

    return TweenMax.to(
      this.elem,
      this.frameRate,
      { rotation: this.theta, ease: Linear.easeNone }
    );
  },



  // _getInterpolationFactor: function () {
  //   return this.swingState.type === swingTypes.OUTWARD ?
  //     // EasingUtils.easeOutCubic(
  //     //   this.swingState.elapsedTime,
  //     //   this.swingState.durationThroughout
  //     // )
  //     interpolateOutwardSwing(this.swingState.t, this.swingState.d)
  //     :
  //     interpolateInwardSwing(this.swingState.t, this.swingState.d);
  //     // EasingUtils.easeInCubic(
  //     //   this.swingStateState.elapsedTime,
  //     //   this.swingStateState.durationThroughout
  //     // );
  // },

  _getNewRotation: function () {
    //debugger;
    //const interpolationFactor = this._getInterpolationFactor();
    // Interpolate by using the sine function to find a factor of the total amount to rotate
    //const interpolationFactor = Math.sin(Math.PI * 2 * this.frequency * this.swingState.t);
    const rotationIncrement = (
      this.omega * (this.swingState.deltaT) +
      (0.5 * this.alpha * this.swingState.deltaT * this.swingState.deltaT)
    );

    const newRotation = this.theta + (this.swingState.direction * rotationIncrement);

    // const newRotation = (
    //   startingRotation +
    //   ( (totalAmountOfRotation * this.swingState.direction) * interpolationFactor )
    // );

    console.log(`Computing new rotation of ${newRotation}`);
    return newRotation;
  },



  _isSwingExtentReached (destinationAngle) {
    //console.log(`Checking if beyond extent of ${destinationAngle}. Current theta: ${this.theta}`);
    return (
      (this.swingState.direction === swingDirections.COUNTER_CLOCKWISE && this.theta <= destinationAngle) ||
      (this.swingState.direction === swingDirections.CLOCKWISE && this.theta >= destinationAngle)
    );
  },

  //_swingOutward: function (startingAngle, destinationAngle, totalRotationAmount) {
  _swingOutward: function (destinationAngle) {

    // const newRotation = this._getNewRotation(startingRotation, outwardRotationAmount);
    // swingTL.add(this._createRotationTween(newRotation), '+=.01');
    //this.previousRotation = this.theta;
    //const newRotation = this._getNewRotation(startingAngle, totalRotationAmount);

    if (this._isSwingExtentReached(destinationAngle)) {
      console.log(`Direction swap!`);

      // this.swingState.direction = this.swingState.direction === swingDirections.COUNTER_CLOCKWISE ?
      //   swingDirections.CLOCKWISE : swingDirections.COUNTER_CLOCKWISE;
      // this.swingStateState.elapsedTime = 0;
      // isSwingingOutward = false;

      this.swingState.direction = this.swingState.direction === swingDirections.COUNTER_CLOCKWISE ?
        swingDirections.CLOCKWISE : swingDirections.COUNTER_CLOCKWISE;
      //this.swingState.t = 0;
      this.swingState.deltaT = 0;
      this.swingState.type = swingTypes.INWARD;
    }
    return this._createRotationTween();
  },

  _fallInward: function (destinationAngle) {
    //this.previousRotation = this.theta;
    //const newRotation = this._getNewRotation(startingAngle, totalRotationAmount);

    if (this._isSwingExtentReached(destinationAngle)) {
      this.swingState.isComplete = true;
    }
    return this._createRotationTween();
  },


  setDirection: function (direction) {
    if (
      direction == swingDirections.COUNTER_CLOCKWISE ||
      direction == swingDirections.CLOCKWISE
    ) {
      this.swingState.direction = direction;
    }
  },

  getDirection: function () {
    return this.swingState.direction;
  },



  swing: function (opts = {}) {

    //debugger;
    this.isInMotion = true;

    const startingRotation = this.theta;
    //const rotationKE = typeof opts.kineticEnergy !== 'undefined' ? opts.kineticEnergy : 0;
    let targetAngle = typeof opts.targetAngle !== 'undefined' ? opts.targetAngle : 0;
    const returnAngle = typeof opts.returnAngle !== 'undefined' ? opts.returnAngle : 0;
    this.frameRate = opts.frameRate || DEFAULT_FRAME_RATE;

    //let outwardAngle = (this.swingState.direction * rotationKE) + startingRotation;

    // bound outwardAngle to either the cradle min or max rotation
    // TODO: Determine if these two bounds can be deleted -- we should never need them
    if (this.swingState.direction === swingDirections.COUNTER_CLOCKWISE && targetAngle < this.minRotation) {
      targetAngle = this.minRotation;

    } else if (this.swingState.direction === swingDirections.CLOCKWISE && targetAngle > this.maxRotation) {
      targetAngle = this.maxRotation;
    }

    //const outwardRotationAmount = Math.abs(outwardAngle - startingRotation);
    const fallBackRotationAmount = Math.abs(returnAngle - targetAngle);
    //const totalRotationThroughout = outwardRotationAmount + fallBackRotationAmount;


    //console.log(`Rotation Kinetic Energy: ${rotationKE}`);
    //console.log(`Rotation Potential Energy: ${rotationPE}`);
    //console.log(`Outward Angle: ${outwardAngle}`);
    console.log(`Target Angle: ${targetAngle}`);
    //console.log(`Outward Rotation Amount: ${outwardRotationAmount}`);
    console.log(`Fallback Rotation Amount: ${fallBackRotationAmount}`);
    //console.log(`Total Rotation Throughout: ${totalRotationThroughout}`);

    const swingTL = new TimelineMax({
      onComplete: this.onSwingComplete.bind(this, fallBackRotationAmount, opts.collisionCallback, opts.willInstigateCollision)
    });

    this.swingState.deltaT = 0;

    while (!this.swingState.isComplete) {

      if (this.swingState.type === swingTypes.OUTWARD) {

        //this.theta = this._getNewRotation();
        //swingTL.add(this._swingOutward(startingRotation, outwardAngle, outwardRotationAmount), '+=.01');
        swingTL.add(this._swingOutward(targetAngle), '+=.01');
      } else {
        swingTL.add(this._fallInward(returnAngle), '+=.01');
      }

      this.swingState.deltaT += this.frameRate;
    }

    this.masterTL.add(swingTL);
  },


  /**
   * After a swing, update the `isInMotion` state.
   * Furthermore, if this is a bearing that will produce a collision at the
   * end of its swing, call back to the collision handler.
   */
  onSwingComplete: function (fallBackRotationAmount, collisionCallback, willInstigateCollision) {
    //debugger;
    this.isInMotion = false;
    const energyTransferred = fallBackRotationAmount * this.swingState.direction;

    if (collisionCallback && willInstigateCollision) {
      console.log(`*** onSwingComplete *** Bearing ${this.position} colliding & transferring energy of ${energyTransferred} degrees`);
      collisionCallback(this, energyTransferred);
    }
  }

};

function interpolateInwardSwing (prevRotation, elaspedTime, totalDuration) {
  //return this.springK
}

function interpolateOutwardSwing (elaspedTime, totalDuration) {

}





function BearingFactory (opts = {}) {
  const bearing = Object.create(Object.assign({}, Bearing, opts));
  bearing.onInit();
  return bearing;
}

export default BearingFactory;
