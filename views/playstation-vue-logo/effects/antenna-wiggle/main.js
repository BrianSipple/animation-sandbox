import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import BaseSvgObject from '../base/_svg-object';
import CONSTANTS from '../../constants/constants';

const

    { EASINGS } = CONSTANTS,

    DURATIONS = Object.assign(CONSTANTS, {
        antennaWiggle: 1
    }),

    SELECTORS = {
        psLogo: '.ps-logo',
        psLogoP: '.p',
        psLogoS: '.s',
        psLogoSTop: '.s__top',
        psLogoSBottom: '.s__bottom',
        antennas: '.antenna',
        antennaLeft: '.antenna--left',
        antennaRight: '.antenna--right',
        vueTVLogo: '.playstation-vue-logo',
        vueTVLogoOutline: '.playstation-vue-logo__outline'
    },

    LABELS = {
        setup: 'setup',
        setupComplete: 'setupComplete',
    },

    DEFAULT_OBJECT_OPTIONS = {
        wiggleEffect: CONSTANTS.ANTENNA_WIGGLES.STRETCH
    };


function setUpObject (svgObject) {
    let setupTL = new TimelineMax();

    setupTL.set(svgObject.DOM_REFS.antennas, { transformOrigin: 'center bottom' });

    return setupTL;
}





function wiggleAntennasWithStretch (svgObject) {
    //debugger;
    let
        antennaTL = new TimelineMax(),
        antennas = svgObject.DOM_REFS.antennas;

    function wiggleAntenna (svgElem) {
        let wiggleTL = new TimelineMax({ repeat: 1, yoyo: true });

        wiggleTL.to(
            svgElem,
            DURATIONS.antennaWiggle,
            { scaleY: 1.5, ease: Elastic.easeOut.config(1.4, 0.3) }
        );

        return wiggleTL;
    }

    antennaTL.add(wiggleAntenna(svgObject.DOM_REFS.antennaLeft), 0);
    antennaTL.add(wiggleAntenna(svgObject.DOM_REFS.antennaRight), 0);

    return antennaTL;
}




function createMainObjectTL (svgObject, wiggleEffect) {

    let mainObjectTL = new TimelineMax(
        {
            paused: true,
            onComplete: boundSetStateOnToggle.bind(svgObject),
            onReverseComplete: boundSetStateOnToggle.bind(svgObject)
        }
    );

    mainObjectTL.add(setUpObject(svgObject), 0);
    mainObjectTL.addLabel(LABELS.setupComplete);

    let wiggleTLFunction = {
        [CONSTANTS.ANTENNA_WIGGLES.STRETCH]: wiggleAntennasWithStretch
    }[wiggleEffect];

    mainObjectTL.add(wiggleTLFunction(svgObject), `${LABELS.morphingToTV}+=0.6`);

    return mainObjectTL;
}


function boundUpdateAttr (attr, value) {
    this.setAttribute(attr, value.toString());
}


function boundSetStateOnToggle () {
    this.isAnimating = false;
    this.shouldReverseAnimation = !this.shouldReverseAnimation;
}

const AntennaWiggle = ((svgContainerElem, opts = DEFAULT_OBJECT_OPTIONS) => {

    let svgObject = BaseSvgObject();  // TODO: Change name of "svgObject"

    svgObject.svgContainerElem = svgContainerElem;

    svgObject.DOM_REFS = {
        antennas: svgContainerElem.querySelectorAll(SELECTORS.antennas),
        antennaLeft: svgContainerElem.querySelector(SELECTORS.antennaLeft),
        antennaRight: svgContainerElem.querySelector(SELECTORS.antennaRight)
    };

    svgObject.mainObjectTL = createMainObjectTL(svgObject, opts.wiggleEffect);

    svgObject.handleClick = function handleClick () {
        if (!this.isAnimating) {

            this.isAnimating = true;

            if (!this.shouldReverseAnimation) {
                // animate to correct restart points
                this.mainObjectTL.play(0);

            } else {
                // Reverse back to the play symbol.
                // NOTE: 0 sets the playhead at the end of the animation,
                // and we reverse from there
                this.mainObjectTL.reverse(0);
            }

            //this.shouldReverseAnimation = !this.shouldReverseAnimation;
        }
    }.bind(svgObject);

    return Object.create(svgObject);

});

export default AntennaWiggle;
