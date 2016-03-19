'use strict';

import TweenMax from 'TweenMax';


// let's get on with it, shall we... until everyone is on #TeamRadians
function degToRad(degrees) {
  return (degrees / 180) * Math.PI;
}

function radToDeg(radians) {
  return (radians * 180) / Math.PI;
}

const GRAVITATIONAL_ACCELERATION = 9.81;  /* m/s^2 */
const MAX_DELTA_T = 0.050;

const Spring = {

  /* Gravitational Spring constant (aka "stiffness") in kg / s^2 */
  //k: -200,
  k: null,

  /*  "viscous damping coefficient", measured in kg / s) */
  damping: -0.5
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


const BearingProto = {

  massKG: null,

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

  bearingLengthMeters: 0,

  /* Position index along the cradle (anywhere from 0 to 4) */
  position: null,

  /* Master timeline for this particular bearing's swing */
  swingTL: null,
  masterTL: null,

  /* Cahced DOM node (or SVG) for this particular bearing */
  elem: null,


  onInit () {

    const { pow, sqrt, PI } = Math;

    this.spring = Object.create(Object(Spring));
    this.swingState = Object.create(Object(Swing));
    this.spring.k = -1 * this.massKG / (this.bearingLengthMeters);
    this.frequency = (PI * 0.5) * sqrt(this.spring.k / this.massKG);

    this.momentOfInertia = this.massKG * pow(this.bearingLengthMeters, 2);
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
    const { cos } = Math;

    /* Calculate net rotational force (T, or "torque") from the current position (theta). */
    const T = (
      this.massKG *
      ( GRAVITATIONAL_ACCELERATION * (this.bearingLengthMeters / (deltaT * deltaT)) ) *
      //(this.bearingLengthMeters) *
      cos(degToRad(this.theta))
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

    const fallBackRotationAmount = Math.abs(returnAngle - outwardAngle);

    console.log(`Target Angle: ${outwardAngle}`);
    console.log(`Fallback Rotation Amount: ${fallBackRotationAmount}`);

    const { collisionCallback, willInstigateCollision, numBearingsInMotion, swingSeriesCompleteCallback } = opts;

    this.swingTL = new TimelineMax({
      onComplete: this.onSwingComplete,
      onCompleteParams: [fallBackRotationAmount, collisionCallback, willInstigateCollision, numBearingsInMotion, swingSeriesCompleteCallback],
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

      this.swingTL.add(this._createRotationTween(deltaT));
      previousTime = currentTime;
    }

    //this.swingTL.play();
  },

  _getEnergyDampingDecrement () {
    const { spring: { damping, k: stiffness }, bearingLengthMeters, theta, massKG, omega } = this;
    //const { cos } = Math;
    const { cos, pow } = Math;

    const springForce = stiffness * cos(degToRad(theta)) - bearingLengthMeters;
    //const springForce = stiffness * pow( cos(degToRad(theta)), 3/2);
    const damperForce = damping * omega;

    console.log(`Energy Damping Decrement: ${(springForce + damperForce) / massKG}`);
    return (springForce + damperForce) / massKG;

  },

  /**
   * After a swing, update the `isInMotion` state.
   * Furthermore, if this is a bearing that will produce a collision at the
   * end of its swing, call back to the collision handler.
   */
  onSwingComplete: function (fallBackRotationAmount, collisionCallback, willInstigateCollision, numBearingsInMotion, swingSeriesCompleteCallback) {

    const accelerationTransferred = this.alpha;
    const kineticEnergyOnCollision = this.omega;
    const energyDampingDecrement = this._getEnergyDampingDecrement();
    const destinationAngle = ( fallBackRotationAmount + (energyDampingDecrement) ) * this.swingState.direction;

    if (destinationAngle > 0 && this.swingState.direction == -1) {
      swingSeriesCompleteCallback();
      return;
    }

    if (destinationAngle < 0 && this.swingState.direction == 1) {
      swingSeriesCompleteCallback();
      return;
    }

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
        kineticEnergyOnCollision,
        energyDampingDecrement,
        accelerationTransferred,
        numBearingsInMotion
      });
    }
  }
};


function BearingFactory (opts = {}) {
  const bearing = Object.create(Object.assign({}, BearingProto, opts));
  bearing.onInit();
  return bearing;
}

export default BearingFactory;
