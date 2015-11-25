import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import BaseSvgObject from './base/_svg-object';

const
    DURATIONS = {
        scaleUp: 0.5,
        morphController: 0.5
    },

    SELECTORS = {
        ps4Controller: '.ps4-controller',
        psLogo: '.ps-logo',
        psLogoP: '.p',
        psLogoS: '.s',
        psLogoSTop: '.s__top',
        psLogoSBottom: '.s__bottom',
        antennaes: '.antennae',
        vueTVLogo: '.playstation-vue-logo',
        vueTVLogoOutline: '.playstation-vue-logo__outline'
    },

    EASINGS = {
        toggleIcon: Power2.easeOut   // ~= linear-in-slow-out
    },

    LABELS = {
        setup: 'setup',
        setupComplete: 'setupComplete',
        morphingToTV: 'morphingToTV'
    };


function setUpObject (svgObj) {
    let setupTL = new TimelineMax();

    debugger;
    setupTL.set(svgObj.DOM_REFS.antennaes, { transformOrigin: 'center bottom', scaleY: 0 });
    setupTL.set(svgObj.DOM_REFS.psLogo, { transformOrigin: '50% 50%', scale: 0 });

    return setupTL;
}

/**
 * morphs the controller into a tv shape, giving the antennaes
 * a subtle wigging effect at the end
 */
function morphControllerIntoVueTVShape(svgObj) {
    debugger;
    // morph to tv
    let morphTL = new TimelineMax();

    morphTL.to(
        svgObj.DOM_REFS.ps4Controller,
        DURATIONS.morphController,
        { morphSVG: SELECTORS.vueTVLogoOutline }
    );

    // wiggle antennaes
    return morphTL;
}

function perkUpAntennaes (svgObj) {
    let antennaeTL = new TimelineMax();

    antennaeTL.to(
        svgObj.DOM_REFS.antennaes,
        DURATIONS.scaleUp,
        {
            scaleY: 1,
            opacity: 1,
            ease: Back.easeOut.config(1.9)
        }
    );

    return antennaeTL;
}


function flashInLogo (svgObj) {
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

    let mainIconTL = new TimelineMax(
        {
            paused: true,
            onComplete: boundSetStateOnToggle.bind(svgObj),
            onReverseComplete: boundSetStateOnToggle.bind(svgObj)
        }
    );

    mainIconTL.add(setUpObject(svgObj), 0);
    mainIconTL.addLabel(LABELS.setupComplete)
    mainIconTL.add(morphControllerIntoVueTVShape(svgObj), LABELS.morphingToTV);
    mainIconTL.add(perkUpAntennaes(svgObj), `${LABELS.morphingToTV}+=0.3`);
    mainIconTL.add(flashInLogo(svgObj), `${LABELS.morphingToTV}+=0.6`);

    return mainIconTL;
}


function boundUpdateAttr (attr, value) {
    this.setAttribute(attr, value.toString());
}


function boundSetStateOnToggle () {
    debugger;
    this.isAnimating = false;
    this.shouldReverseAnimation = !this.shouldReverseAnimation;
}

const ControllerToTvMorphObject = ((svgContainerElem, opts) => {

    let svgObj = BaseSvgObject();  // TODO: Change name of "svgObj"

    svgObj.svgContainerElem = svgContainerElem;

    svgObj.DOM_REFS = {
        ps4Controller: svgContainerElem.querySelector(SELECTORS.ps4Controller),
        antennaes: svgContainerElem.querySelectorAll(SELECTORS.antennaes),
        //vueTVLogo: svgContainerElem.querySelector(SELECTORS.vueTVLogo),
        //vueTVLogoOutline: svgContainerElem.querySelector(SELECTORS.vueTVLogoOutline),
        psLogo: svgContainerElem.querySelector(SELECTORS.psLogo)
    };

    svgObj.mainIconTL = createMainObjectTL(svgObj);

    svgObj.handleClick = function handleClick () {
        debugger;
        if (!this.isAnimating) {

            this.isAnimating = true;

            if (!this.shouldReverseAnimation) {
                // animate to correct restart points
                this.mainIconTL.play(0);

            } else {
                // Reverse back to the play symbol.
                // NOTE: 0 sets the playhead at the end of the animation,
                // and we reverse from there
                this.mainIconTL.reverse(0);
            }

            //this.shouldReverseAnimation = !this.shouldReverseAnimation;
        }
    }.bind(svgObj);

    return Object.create(svgObj);

});

export default ControllerToTvMorphObject;
