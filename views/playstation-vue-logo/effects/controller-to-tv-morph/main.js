import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import BaseSvgObject from '../base/_svg-object';
import CONSTANTS from '../../constants/constants';

const

    { DURATIONS, EASINGS } = CONSTANTS,

    SELECTORS = {
        ps4Controller: '.ps4-controller',
        psLogo: '.ps-logo',
        psLogoP: '.p',
        psLogoS: '.s',
        psLogoSTop: '.s__top',
        psLogoSBottom: '.s__bottom',
        antennas: '.antenna',
        vueTVLogo: '.playstation-vue-logo',
        vueTVLogoOutline: '.playstation-vue-logo__outline'
    },

    LABELS = {
        setup: 'setup',
        setupComplete: 'setupComplete',
        morphingToTV: 'morphingToTV'
    };


function setUpObject (svgObj) {
    let setupTL = new TimelineMax();

    setupTL.set(svgObj.DOM_REFS.antennas, { transformOrigin: 'center bottom', scaleY: 0 });
    setupTL.set(svgObj.DOM_REFS.psLogo, { transformOrigin: '50% 50%', drawSVG: '50% 50%' });

    return setupTL;
}

/**
 * morphs the controller into a tv shape, giving the antennas
 * a subtle wigging effect at the end
 */
function morphControllerIntoVueTVShape(svgObj) {
    //debugger;
    // morph to tv
    let morphTL = new TimelineMax();

    morphTL.to(
        svgObj.DOM_REFS.ps4Controller,
        DURATIONS.morphObject,
        { morphSVG: SELECTORS.vueTVLogoOutline, ease: EASINGS.morphObject }
    );

    // wiggle antennas
    return morphTL;
}

function perkUpAntennas (svgObject) {
    //debugger;
    let
        antennaTL = new TimelineMax(),
        antennas = svgObject.DOM_REFS.antennas;

    antennaTL.set(antennas, { opacity: 1, immediateRender: false });
    antennaTL.to(
        antennas,
        DURATIONS.scaleUp,
        {
            scaleY: 1,
            ease: EASINGS.antennaPerk
        }
    );

    return antennaTL;
}


function drawInLogo (svgObj) {
    // draw logo
    let logoFlashTL = new TimelineMax();

    logoFlashTL.to(
        svgObj.DOM_REFS.psLogo,
        DURATIONS.scaleUp,
        {
            scale: 1,
            opacity: 1,
            ease: Power4.easeOut
        }
    );

    // flash glow filter
    return logoFlashTL;
}


function createMainObjectTL (svgObj) {

    let mainObjectTL = new TimelineMax(
        {
            paused: true,
            onComplete: boundSetStateOnToggle.bind(svgObj),
            onReverseComplete: boundSetStateOnToggle.bind(svgObj)
        }
    );

    mainObjectTL.add(setUpObject(svgObj), 0);
    mainObjectTL.addLabel(LABELS.setupComplete)
    mainObjectTL.add(morphControllerIntoVueTVShape(svgObj), LABELS.morphingToTV);
    mainObjectTL.add(perkUpAntennas(svgObj), `${LABELS.morphingToTV}+=0.3`);
    mainObjectTL.add(drawInLogo(svgObj), `${LABELS.morphingToTV}+=0.6`);

    return mainObjectTL;
}


function boundUpdateAttr (attr, value) {
    this.setAttribute(attr, value.toString());
}


function boundSetStateOnToggle () {
    //debugger;
    this.isAnimating = false;
    this.shouldReverseAnimation = !this.shouldReverseAnimation;
}

const ControllerToTvMorph = ((svgContainerElem, opts) => {

    let svgObj = BaseSvgObject();  // TODO: Change name of "svgObj"

    svgObj.svgContainerElem = svgContainerElem;

    svgObj.DOM_REFS = {
        ps4Controller: svgContainerElem.querySelector(SELECTORS.ps4Controller),
        antennas: svgContainerElem.querySelectorAll(SELECTORS.antennas),
        psLogo: svgContainerElem.querySelector(SELECTORS.psLogo)
    };

    svgObj.mainObjectTL = createMainObjectTL(svgObj);

    svgObj.handleClick = function handleClick () {
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
    }.bind(svgObj);

    return Object.create(svgObj);

});

export default ControllerToTvMorph;
