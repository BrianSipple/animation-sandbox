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

  isInMotion: false,

  /* Position index along the cradle (anywhere from 0 to 4) */
  position: null,

  /* Master timeline for this particular bearing */
  masterTL: null,

  /* Cahced DOM node (or SVG) for this particular bearing */
  elem: null,

  /* Transform origin coords of the bearing */
  controlPointCoords: null,

  createSwingTLAfterDrag: function (startingRotation, destinationRotation) {
    //TODO
  }

};


function BearingFactory (opts = {}) {
  return Object.assign({}, Bearing, opts);
}

export default BearingFactory;
