import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import BaseSvgObject from './base/_svg-object';

const
    DURATIONS = {
        scaleUp: 0.85,
        morphController: 0.25
    },

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

    //debugger;
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
        DURATIONS.morphController,
        { morphSVG: SELECTORS.vueTVLogoOutline }
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
            //ease: Back.easeOut.config(2.9)
            ease: Elastic.easeOut.config(1.1, 0.4)
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
    mainIconTL.add(perkUpAntennas(svgObj), `${LABELS.morphingToTV}+=0.3`);
    mainIconTL.add(drawInLogo(svgObj), `${LABELS.morphingToTV}+=0.6`);

    return mainIconTL;
}


function boundUpdateAttr (attr, value) {
    this.setAttribute(attr, value.toString());
}


function boundSetStateOnToggle () {
    //debugger;
    this.isAnimating = false;
    this.shouldReverseAnimation = !this.shouldReverseAnimation;
}

const ControllerToTvMorphAndDrawObject = ((svgContainerElem, opts) => {

    let svgObj = BaseSvgObject();  // TODO: Change name of "svgObj"

    svgObj.svgContainerElem = svgContainerElem;

    svgObj.DOM_REFS = {
        ps4Controller: svgContainerElem.querySelector(SELECTORS.ps4Controller),
        antennas: svgContainerElem.querySelectorAll(SELECTORS.antennas),
        psLogo: svgContainerElem.querySelector(SELECTORS.psLogo)
    };

    svgObj.mainIconTL = createMainObjectTL(svgObj);

    svgObj.handleClick = function handleClick () {
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

export default ControllerToTvMorphAndDrawObject;
