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

const GRAVITATIONAL_ACCELERATION = 9.81;  /* m/s^2 */
const MAX_DELTA_T = 0.050;

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
  deltaT: 0,
  type: swingTypes.OUTWARD,
  direction: null,
  isComplete: false
};

const DEFAULT_FRAME_RATE = 1 / 60;

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
    this.momentOfInertia = this.mass * Math.pow(this.bearingLength, 0.33);
  },


  _getNewRotation: function (currentTheta, deltaT) {
    const rotationIncrement = (
      Math.abs(this.omega) * (deltaT) +
      (0.5 * Math.abs(this.alpha) * deltaT * deltaT)
    );

    const newRotation = currentTheta + (this.swingState.direction * rotationIncrement);

    console.log(`Bearing ${this.position}: Computing new rotation of ${newRotation}`);
    return newRotation;
  },


  _createRotationTween: function (newTheta, deltaT, accelerationDirectionWeight = 1) {

    /* Calculate net force (T) from current position. */
    const T = (
      this.mass *
      ( GRAVITATIONAL_ACCELERATION * accelerationDirectionWeight ) *
      ( Math.cos(degToRad(newTheta)) * this.bearingLength )
    );

    /* Current angular acceleration */
    const newAlpha = T / this.momentOfInertia;

    /* Calculate current velocity from last frame's velocity and
    average of last frame's acceleration with this frame's acceleration. */
    this.omega += 0.5 * (this.alpha + newAlpha) * deltaT;
    this.alpha = newAlpha;

    console.log(`Omega: ${this.omega}`);

    console.log(`end of \`createRotationTween\` with newTheta of ${newTheta} ---> T: ${T},  newAlpha: ${newAlpha}, this.alpha: ${this.alpha},  this.omega: ${this.omega}`);

    return TweenMax.to(
      this.elem,
      deltaT,
      //0.01,
      { rotation: newTheta, ease: Linear.easeNone, immediateRender: false }
    );
  },


  _isSwingExtentReached (destinationAngle, newTheta) {
    //console.log(`Checking if beyond extent of ${destinationAngle}. Current theta: ${this.theta}`);
    return (
      (this.swingState.direction === swingDirections.COUNTER_CLOCKWISE && newTheta <= destinationAngle) ||
      (this.swingState.direction === swingDirections.CLOCKWISE && newTheta >= destinationAngle)
    );
  },

  _swingOutward: function (destinationAngle, newTheta, deltaT) {

    if (this._isSwingExtentReached(destinationAngle, newTheta)) {
      console.log(`Direction swap!`);

      this.swingState.direction = this.swingState.direction === swingDirections.COUNTER_CLOCKWISE ?
        swingDirections.CLOCKWISE : swingDirections.COUNTER_CLOCKWISE;
      this.swingState.type = swingTypes.INWARD;
    }
    return this._createRotationTween(newTheta, deltaT, -1);
  },


  _fallInward: function (destinationAngle, newTheta, deltaT) {

    if (this._isSwingExtentReached(destinationAngle, newTheta)) {
      this.swingState.isComplete = true;
    }
    return this._createRotationTween(newTheta, deltaT, 1);
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
    this.isInMotion = true;

    const startingRotation = this.theta;
    let targetAngle = typeof opts.targetAngle !== 'undefined' ? opts.targetAngle : 0;
    const returnAngle = typeof opts.returnAngle !== 'undefined' ? opts.returnAngle : 0;
    this.frameRate = opts.frameRate || DEFAULT_FRAME_RATE;

    this.omega = opts.kineticEnergyTransferred || 0;   // TODO: How is this getting out of control?
    this.alpha = opts.accelerationTransferred || 0;


    // TODO: Determine if these two bounds can be deleted -- we should never need them
    if (this.swingState.direction === swingDirections.COUNTER_CLOCKWISE && targetAngle < this.minRotation) {
      targetAngle = this.minRotation;

    } else if (this.swingState.direction === swingDirections.CLOCKWISE && targetAngle > this.maxRotation) {
      targetAngle = this.maxRotation;
    }

    const fallBackRotationAmount = Math.abs(returnAngle - targetAngle);

    console.log(`Target Angle: ${targetAngle}`);
    console.log(`Fallback Rotation Amount: ${fallBackRotationAmount}`);

    const swingTL = new TimelineMax({
      onComplete: this.onSwingComplete.bind(this, fallBackRotationAmount, opts.collisionCallback, opts.willInstigateCollision)
    });

    //this.swingState.deltaT = 0;
    this.swingState.isComplete = false;
    this.swingState.type = swingTypes.OUTWARD;

    let newTheta;
    let previousTime = new Date().getTime();
    let currentTime, deltaT;

    while (!this.swingState.isComplete) {

      currentTime = new Date().getTime();
      deltaT = (currentTime - previousTime) / 1000;

      deltaT = Math.max(DEFAULT_FRAME_RATE, Math.min(deltaT, MAX_DELTA_T));

      console.log(`DeltaT: ${deltaT}`);
      newTheta = this._getNewRotation(this.theta, deltaT);

      if (this.swingState.type === swingTypes.OUTWARD) {
        swingTL.add(this._swingOutward(targetAngle, newTheta, deltaT));

      } else {
        swingTL.add(this._fallInward(returnAngle, newTheta, deltaT));
      }

      this.theta = newTheta;
      previousTime = currentTime;
    }

    //this.masterTL.add(swingTL);
    swingTL.play();
  },


  /**
   * After a swing, update the `isInMotion` state.
   * Furthermore, if this is a bearing that will produce a collision at the
   * end of its swing, call back to the collision handler.
   */
  onSwingComplete: function (fallBackRotationAmount, collisionCallback, willInstigateCollision) {
    this.isInMotion = false;
    const destinationAngle = fallBackRotationAmount * this.swingState.direction;
    const kineticEnergyTransferred = this.omega;
    const accelerationTransferred = this.alpha;

    this.omega = 0;
    this.alpha = 0;
    this.theta = 0;

    if (collisionCallback && willInstigateCollision) {
      console.log(`*** onSwingComplete *** Bearing ${this.position} colliding & \
        transferring kinetic energy of ${this.omega}. \
        Destination angle of collision receptor: ${destinationAngle}`);
      collisionCallback(this, destinationAngle, kineticEnergyTransferred, accelerationTransferred);
    }
  }

};


function BearingFactory (opts = {}) {
  const bearing = Object.create(Object.assign({}, Bearing, opts));
  bearing.onInit();
  return bearing;
}

export default BearingFactory;
