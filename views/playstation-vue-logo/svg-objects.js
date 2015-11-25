/**
 * This file wires up SVG icon objects with the DOM selectors that
 * we want to provide them with, and organizes everything into a
 * "metadata" object. Our main application file can then just import the object.
 */

//import AntennaeWiggleIcon from './models/antennae-wiggle-icon';
import ControllerToTvMorphObject from './models/controller-to-tv-morph';


const SvgObjects = {
    // antennaeIcon: {
    //     id: '#antennaeIcon',
    //     obj: AntennaeWiggleIcon(document.querySelector('#antennaeIcon'))
    // },

    controllerToTvMorphIcon: {
        id: '#controller-to-tv-morph-logo',
        obj: ControllerToTvMorphObject(document.querySelector('#controller-to-tv-morph-logo'))
    }
};

export default SvgObjects;
