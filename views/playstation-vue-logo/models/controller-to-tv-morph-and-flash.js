import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import BaseSvgObject from './base/_svg-object';
import SVGUtils from 'utils/svg-utils';
import MathUtils from 'utils/math-utils';
import CONSTANTS from '../constants/constants';

const
    { setFilterPathOnElem, removeFilterFromElem } = SVGUtils,
    { lerp } = MathUtils,

    FINISH_TYPES = CONSTANTS.FILTER_EFFECTS.TV_FINISHES,

    DURATIONS = {
        scaleUp: 0.85,
        morphController: 0.25,

        // this should be at least the monitor
        // frame rate that we're targeting (i.e. 60 fps ==> 0.0167ms)
        logoFlicker: 0.035
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
        vueTVLogoOutline: '.playstation-vue-logo__outline',
        pointLightFilter: {},
        gaussianGlowFilter: {}
    },

    EASINGS = {
        logoFlicker: Power2.easeInOut   // ~= linear-in-slow-out
    },

    LABELS = {
        setup: 'setup',
        setupComplete: 'setupComplete',
        morphingToTV: 'morphingToTV',
        antennaPerkUpComplete: 'antennaPerkUpComplete',
        lastLogoFlickering: 'lastLogoFlickering'
    },

    DEFAULT_OBJECT_OPTIONS = {
        finishType: FINISH_TYPES.NONE,
        filterIds: { pointLightFilter: undefined, gaussianGlowFilter: undefined }
    };


function setUpObject (svgObject) {

    let setupTL = new TimelineMax();

    setupTL.set(
        svgObject.DOM_REFS.antennas,
        { transformOrigin: 'center bottom', scaleY: 0, opacity: 1, immediateRender: false },
        0
    );

    setupTL.addCallback(function setInitialFilters () {
        setFilterPathOnElem(svgObject.DOM_REFS.ps4Controller, SELECTORS.pointLightFilter.base);
    }, 0);

    return setupTL;
}

/**
 * morphs the controller into a tv shape, giving the antennas
 * a subtle wigging effect at the end
 */
function morphControllerIntoVueTVShape(svgObject) {
    // morph to tv
    let morphTL = new TimelineMax();

    morphTL.to(
        svgObject.DOM_REFS.ps4Controller,
        DURATIONS.morphController,
        { morphSVG: SELECTORS.vueTVLogoOutline }
    );

    // wiggle antennas
    return morphTL;
}

function perkUpAntennas (svgObject) {
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


// TODO: Consider second option of a "glow layer" that we just tweak the opacity of
// while also flickering opacity on the logo (and then set to opacity 0 at the end)
function flashInLogo (svgObject, finishType) {

    let
        masterFlashInTL = new TimelineMax(),

        flickerSetTL = new TimelineMax({
            onComplete: lightLogoForGood
        }),

        finishingTouchTL = new TimelineMax({
            onStart: switchFiltersIfNeeded
        });

    function switchFiltersIfNeeded () {
        if (finishType === FINISH_TYPES.LOGO_GLOW) {
            finishingTouchTL.addCallback(function switchFilters () {
                removeFilterFromElem(svgObject.DOM_REFS.ps4Controller);
                setFilterPathOnElem(svgObject.DOM_REFS.psLogo, SELECTORS.gaussianGlowFilter.base);
            }, 0);

        }
    }

    function lightLogoForGood () {

        finishingTouchTL.to(
            svgObject.DOM_REFS.psLogo,
            DURATIONS.logoFlicker,
            { opacity: 1},
            .001
        );

        // add final tweaks to the existing lighting filters
        if (finishType === FINISH_TYPES.SPECULAR_LIGHTING) {

            finishingTouchTL.to(
                svgObject.DOM_REFS.filterSpecularLighting,
                DURATIONS.logoFlicker,
                { attr: { specularExponent: maxSpecularExponent * 0.05 } },
                .001
            );

            finishingTouchTL.to(
                svgObject.DOM_REFS.filterSpecularLightingPointLight,
                DURATIONS.logoFlicker,
                { attr: { z: maxPointLightDistance } },
                .001
            );
        }

        // create a smooth glow around the PS logo
        if (finishType === FINISH_TYPES.LOGO_GLOW) {
            finishingTouchTL.to(
                svgObject.DOM_REFS.filterGaussianBlur,
                DURATIONS.logoFlicker,
                { attr: { stdDeviation: 18 } },
                .001
            );
        }
    }

    function createLogoFlicker (flickerOpts) {

        let flickerTL = new TimelineMax({
            yoyo: true,
            delay: flickerOpts.delay,
            repeat: 1
        });

        // tweak opacity of logo
        flickerTL.fromTo(
            svgObject.DOM_REFS.psLogo,
            DURATIONS.logoFlicker,
            { opacity: 0 },
            { opacity: flickerOpts.logoOpacity, ease: EASINGS.logoFlicker },
            0
        );

        // tweak the point light on the controller path (which is now a tv shape)
        flickerTL.to(
            svgObject.DOM_REFS.filterSpecularLighting,
            DURATIONS.logoFlicker,
            {
                attr: {
                    specularExponent: flickerOpts.specularExponent
                }
            },
            0
        )

        flickerTL.fromTo(
            svgObject.DOM_REFS.filterSpecularLightingPointLight,
            DURATIONS.logoFlicker,
            { attr: { z: 0 } },
            { attr: { z: flickerOpts.pointLightDistance } },   // larger distance == closer to the viewer, and thus a large spread on the target
            0
        );

        return flickerTL;
    }

    // // draw logo
    // let
    // // create some flash hashes!
    //     maxDelay = 0.4,
    //     maxSpecularExponent = 450,
    //     maxPointLightDistance = 95,
    //     maxLogoOpacity = 1,
    //     numFlashes = 20,

        // flashHashes = [
        //     { delay: 0, specularExponent: maxSpecularExponent, pointLightDistance: maxPointLightDistance * 0.5, logoOpacity: maxLogoOpacity * 0.05 },
        //     { delay: maxDelay, specularExponent: maxSpecularExponent * 0.80, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.10 },
        //     { delay: maxDelay * 0.95, specularExponent: maxSpecularExponent * 0.75, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.10 },
        //     { delay: maxDelay * 0.92, specularExponent: maxSpecularExponent * 0.55, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.10 },
        //     { delay: maxDelay * 0.7, specularExponent: maxSpecularExponent * 0.55, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.15 },
        //     { delay: maxDelay * 0.70, specularExponent: maxSpecularExponent * 0.50, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.20 },
        //     { delay: maxDelay * 0.60, specularExponent: maxSpecularExponent * 0.50, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.30 },
        //     { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.45, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.40 },
        //     { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.40, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.45 },
        //     { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.40, pointLightDistance: maxPointLightDistance * 0.725, logoOpacity: maxLogoOpacity * 0.50 },
        //     { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.40, pointLightDistance: maxPointLightDistance * 0.750, logoOpacity: maxLogoOpacity * 0.55 },
        //     { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.25, pointLightDistance: maxPointLightDistance * 0.775, logoOpacity: maxLogoOpacity * 0.60 },
        //     { delay: maxDelay * 0.30, specularExponent: maxSpecularExponent * 0.25, pointLightDistance: maxPointLightDistance * 0.800, logoOpacity: maxLogoOpacity * 0.65 },
        //     { delay: maxDelay * 0.30, specularExponent: maxSpecularExponent * 0.20, pointLightDistance: maxPointLightDistance * 0.825, logoOpacity: maxLogoOpacity * 0.70 },
        //     { delay: maxDelay * 0.20, specularExponent: maxSpecularExponent * 0.15, pointLightDistance: maxPointLightDistance * 0.850, logoOpacity: maxLogoOpacity * 0.75 },
        //     { delay: maxDelay * 0.20, specularExponent: maxSpecularExponent * 0.12, pointLightDistance: maxPointLightDistance * 0.875, logoOpacity: maxLogoOpacity * 0.80 },
        //     { delay: maxDelay * 0.20, specularExponent: maxSpecularExponent * 0.10, pointLightDistance: maxPointLightDistance * 0.900, logoOpacity: maxLogoOpacity * 0.85 },
        //     { delay: maxDelay * 0.15, specularExponent: maxSpecularExponent * 0.07, pointLightDistance: maxPointLightDistance * 0.925, logoOpacity: maxLogoOpacity * 0.90 },
        //     { delay: maxDelay * 0.10, specularExponent: maxSpecularExponent * 0.03, pointLightDistance: maxPointLightDistance * 0.950, logoOpacity: maxLogoOpacity * 0.95 },
        //     { delay: maxDelay * 0.10, specularExponent: maxSpecularExponent * 0.02, pointLightDistance: maxPointLightDistance, logoOpacity: maxLogoOpacity * 1.0 }
        // ];


        let
            numFlashes = 20,
            flashHashes = [],

            // set target values
            maxDelay = 0.4,
            maxSpecularExponent = 450,
            maxPointLightDistance = 95,
            maxLogoOpacity = 1,

            // set starting values
            delay = maxDelay,
            specularExponent = maxSpecularExponent,
            pointLightDistance = maxPointLightDistance * 0.5,
            logoOpacity = maxLogoOpacity * 0.05;

        // manually add the starting values...
        flashHashes.push({ delay, specularExponent, pointLightDistance, logoOpacity });

        // ...then, LERP!
        let flashHash;
        for (let i = 1; i < numFlashes; i++) {
            debugger;
            ///// call lerp with params of initial, target, weight //////
            delay = lerp(maxDelay, delay, ( 1 - ( 1 / numFlashes * (numFlashes * 0.75) ) ) );
            specularExponent = lerp(specularExponent, maxSpecularExponent * 0.2, ( 1 - ( 1 / numFlashes * (numFlashes * 0.1) ) ) );
            pointLightDistance = lerp(pointLightDistance, maxPointLightDistance, ( 1 - ( 1 / numFlashes * (numFlashes * 0.2) ) ) );
            logoOpacity = lerp(logoOpacity, maxLogoOpacity, ( 1 - ( 1 / numFlashes * (numFlashes * 0.2) ) ) );

            flashHashes.push({ delay, specularExponent, pointLightDistance, logoOpacity });
        }

    for (optionHash of flashHashes) {
        flickerSetTL.add(createLogoFlicker(optionHash));
    }

    masterFlashInTL.add(flickerSetTL);
    masterFlashInTL.add(finishingTouchTL);

    return masterFlashInTL;
}


function createMainObjectTL (svgObject, finishType) {

    let mainIconTL = new TimelineMax(
        {
            paused: true,
            onComplete: boundSetStateOnToggle.bind(svgObject),
            onReverseComplete: boundSetStateOnToggle.bind(svgObject)
        }
    );

    mainIconTL.add(setUpObject(svgObject), 0);
    mainIconTL.addLabel(LABELS.setupComplete)
    mainIconTL.add(morphControllerIntoVueTVShape(svgObject), LABELS.morphingToTV);
    mainIconTL.add(perkUpAntennas(svgObject), `${LABELS.morphingToTV}+=0.3`);

    mainIconTL.addLabel(LABELS.antennaPerkUpComplete, mainIconTL.recent().endTime());

    mainIconTL.add(flashInLogo(svgObject, finishType), `${LABELS.antennaPerkUpComplete}+=0.5`);

    return mainIconTL;
}


function boundUpdateAttr (attr, value) {
    this.setAttribute(attr, value.toString());
}


function boundSetStateOnToggle () {
    this.isAnimating = false;
    this.shouldReverseAnimation = !this.shouldReverseAnimation;
}

function wireUpFiltersAndDOMRefs (svgObject, svgContainerElem, filterIds) {

    if (filterIds.pointLightFilter) {
        SELECTORS.pointLightFilter.base = `${filterIds.pointLightFilter}`;
        SELECTORS.pointLightFilter.specularLighting = `${filterIds.pointLightFilter} feSpecularLighting`;
        SELECTORS.pointLightFilter.specularLightingPointLight = `${filterIds.pointLightFilter} feSpecularLighting fePointLight`;
    }

    if (filterIds.gaussianGlowFilter) {
        SELECTORS.gaussianGlowFilter.base = `${filterIds.gaussianGlowFilter}`;
        SELECTORS.gaussianGlowFilter.blur = `${filterIds.gaussianGlowFilter} feGaussianBlur`;
    }

    svgObject.DOM_REFS = {
        ps4Controller: svgContainerElem.querySelector(SELECTORS.ps4Controller),
        antennas: svgContainerElem.querySelectorAll(SELECTORS.antennas),
        psLogo: svgContainerElem.querySelector(SELECTORS.psLogo),
        filterSpecularLighting: svgContainerElem.querySelector(SELECTORS.pointLightFilter.specularLighting),
        filterSpecularLightingPointLight: svgContainerElem.querySelector(SELECTORS.pointLightFilter.specularLightingPointLight),
        filterGaussianBlur: svgContainerElem.querySelector(SELECTORS.gaussianGlowFilter.blur)
    };
}

function calibrateFilters (svgObject, svgContainerElem) {
    let
        tvBoundingBox = svgContainerElem.getBBox();
        antennaHeight = svgObject.DOM_REFS.antennas[0].getBBox().height;

    svgObject.DOM_REFS.filterSpecularLightingPointLight.setAttribute('x', `${tvBoundingBox.width / 2}`);
    svgObject.DOM_REFS.filterSpecularLightingPointLight.setAttribute('y', `${ (tvBoundingBox.height / 2) + (antennaHeight / 2) }`);
}

const ControllerToTvMorphAndFlash = ((svgContainerElem, opts = DEFAULT_OBJECT_OPTIONS) => {

    let svgObject = BaseSvgObject();  // TODO: Change name of "svgObject"

    svgObject.svgContainerElem = svgContainerElem;

    wireUpFiltersAndDOMRefs(svgObject, svgContainerElem, opts.filterIds);
    calibrateFilters(svgObject, svgContainerElem);

    svgObject.mainIconTL = createMainObjectTL(svgObject, opts.finishType);

    svgObject.handleClick = function handleClick () {
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
    }.bind(svgObject);

    return Object.create(svgObject);

});

export default ControllerToTvMorphAndFlash;
