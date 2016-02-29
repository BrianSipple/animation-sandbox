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
  isComplete: false,

  // /*
  //  *  1 == clockwise
  //  *  -1 == counter-clockwise
  //  */
  direction: null
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

  /* Position index along the cradle (anywhere from 0 to 4) */
  position: null,

  /* Master timeline for this particular bearing */
  masterTL: null,

  /* Cahced DOM node (or SVG) for this particular bearing */
  elem: null,


  onInit () {
    this.spring = Object.create(Object(Spring));
    this.swingState = Object.create(Object(Swing));

    this.frequency = (Math.PI * 0.5) * Math.sqrt(this.spring.k / this.mass);
    this.momentOfInertia = this.mass * Math.pow(this.bearingLength, 0.33);
    //this.momentOfInertia = this.mass * this.bearingLength;
  },

  _updateTheta: function (deltaT) {

    const {
      omega,
      alpha,
      position,
      swingState: { direction: swingDirection },
      theta: currentTheta
    } = this;

    const rotationIncrement = (
      Math.abs(omega) * (deltaT) +
      (0.5 * Math.abs(alpha) * deltaT * deltaT)
    );

    this.theta = currentTheta + (swingDirection * rotationIncrement);
    console.log(`Bearing ${position}: Computing new rotation of ${this.theta}`);
  },


  _updateMotionForces (deltaT, accelerationWeight = 1) {

    /* Calculate net force (T) from current position (theta). */
    const T = (
      this.mass *
      GRAVITATIONAL_ACCELERATION *
      ( Math.cos(degToRad(this.theta)) * this.bearingLength )
    );

    /* Current angular acceleration (positive when falling inward and negative when swinging outward) */
    const newAlpha = (T / this.momentOfInertia) * accelerationWeight;

    /* Calculate current velocity from last frame's velocity and
    average of last frame's acceleration with this frame's acceleration. */
    this.omega += ( 0.5 * (this.alpha + newAlpha) ) * deltaT;
    this.alpha = newAlpha;

    console.log(`Omega: ${this.omega}`);

  },

  _updateTheUniverse(deltaT, accelerationWeight = 1) {

    this._updateMotionForces(deltaT, accelerationWeight);
    this._updateTheta(deltaT);
  },

  _createRotationTween: function (deltaT) {
    console.log(`end of \`createRotationTween\` with newTheta of ${this.theta} ---> this.alpha: ${this.alpha},  this.omega: ${this.omega}`);
    return TweenMax.to(
      this.elem,
      deltaT,
      { rotation: this.theta, ease: Linear.easeNone, immediateRender: false }
    );
  },

  _isSwingExtentReached (destinationAngle, newTheta) {
    const { direction: swingDirection } = this.swingState;
    return (
      (swingDirection === swingDirections.COUNTER_CLOCKWISE && newTheta <= destinationAngle) ||
      (swingDirection === swingDirections.CLOCKWISE && newTheta >= destinationAngle)
    );
  },

  _swingOutward: function (destinationAngle, deltaT) {

    this._updateTheUniverse(deltaT, -1);

    if (this._isSwingExtentReached(destinationAngle, this.theta)) {
      console.log(`Direction swap!`);

      this.swingState.direction = this.swingState.direction === swingDirections.COUNTER_CLOCKWISE ?
        swingDirections.CLOCKWISE : swingDirections.COUNTER_CLOCKWISE;
      this.swingState.type = swingTypes.INWARD;
      this.alpha = 0;
      this.omega = 0;
    }
  },


  _fallInward: function (destinationAngle, deltaT) {

    this._updateTheUniverse(deltaT, 1);

    if (this._isSwingExtentReached(destinationAngle, this.theta)) {
      this.swingState.isComplete = true;
    }
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

    const outwardAngle = opts.outwardAngle ? opts.outwardAngle : 0;
    const returnAngle = opts.returnAngle ? opts.returnAngle : 0;
    this.frameRate = opts.frameRate || DEFAULT_FRAME_RATE;

    this.omega = opts.kineticEnergyTransferred || 0;
    this.alpha = opts.accelerationTransferred || 0;


    // // TODO: Determine if these two bounds can be deleted -- we should never need them
    // if (this.swingState.direction === swingDirections.COUNTER_CLOCKWISE && outwardAngle < this.minRotation) {
    //   outwardAngle = this.minRotation;
    //
    // } else if (this.swingState.direction === swingDirections.CLOCKWISE && outwardAngle > this.maxRotation) {
    //   outwardAngle = this.maxRotation;
    // }

    const fallBackRotationAmount = Math.abs(returnAngle - outwardAngle);

    console.log(`Target Angle: ${outwardAngle}`);
    console.log(`Fallback Rotation Amount: ${fallBackRotationAmount}`);

    const { collisionCallback, willInstigateCollision, numBearingsInMotion } = opts;

    // const swingTL = new TimelineMax({
    //   onComplete: this.onSwingComplete,
    //   onCompleteParams: [fallBackRotationAmount, collisionCallback, willInstigateCollision, numBearingsInMotion],
    //   onCompleteScope: this
    // });

    this.masterTL = new TimelineMax({
      onComplete: this.onSwingComplete,
      onCompleteParams: [fallBackRotationAmount, collisionCallback, willInstigateCollision, numBearingsInMotion],
      onCompleteScope: this
    });

    this.swingState.isComplete = false;
    this.swingState.type = swingTypes.OUTWARD;

    let previousTime = new Date().getTime();
    let currentTime, deltaT;

    while (!this.swingState.isComplete) {

      currentTime = new Date().getTime();
      deltaT = (currentTime - previousTime) / 1000;

      deltaT = Math.max(DEFAULT_FRAME_RATE, Math.min(deltaT, MAX_DELTA_T));

      console.log(`DeltaT: ${deltaT}`);

      if (this.swingState.type === swingTypes.OUTWARD) {
        this._swingOutward(outwardAngle, deltaT);
      } else {
        this._fallInward(returnAngle, deltaT);
      }

      //swingTL.add(this._createRotationTween(deltaT));
      this.masterTL.add(this._createRotationTween(deltaT));

      previousTime = currentTime;
    }

    //this.masterTL.add(swingTL);
    this.masterTL.play();
    //swingTL.play();
  },


  /**
   * After a swing, update the `isInMotion` state.
   * Furthermore, if this is a bearing that will produce a collision at the
   * end of its swing, call back to the collision handler.
   */
  onSwingComplete: function (fallBackRotationAmount, collisionCallback, willInstigateCollision, numBearingsInMotion) {

    //this.masterTL.clear();
    const destinationAngle = fallBackRotationAmount * this.swingState.direction;
    const kineticEnergyTransferred = this.omega * this.damping;
    const accelerationTransferred = this.alpha;

    this.omega = 0;
    this.alpha = 0;
    this.theta = 0;

    if (collisionCallback && willInstigateCollision) {
      console.log(`*** onSwingComplete ***
        Issuing collisionCallback from bearing ${this.position} & \
        transferring kinetic energy of ${this.omega}. \
        Destination angle of collision receptor: ${destinationAngle}`);
      collisionCallback(this, {
        destinationAngle,
        kineticEnergyTransferred,
        accelerationTransferred,
        numBearingsInMotion
      });
    }
  }

};


function BearingFactory (opts = {}) {
  const bearing = Object.create(Object.assign({}, Bearing, opts));
  bearing.onInit();
  return bearing;
}

export default BearingFactory;
