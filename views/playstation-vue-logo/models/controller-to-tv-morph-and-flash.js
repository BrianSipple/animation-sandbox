import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import BaseSvgObject from './base/_svg-object';
import SVGUtils from 'utils/svg-utils';

const
    { setFilterOnElem } = SVGUtils,

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

        // pointLightFilter: {
        //     base: '#filter__point-light-glow',
        //     specularLighting: '#filter__point-light-glow feSpecularLighting',
        //     specularLightingPointLight: '#filter__point-light-glow feSpecularLighting fePointLight',
        // },
        // gaussianGlowFilter: '#filter__gaussian-glow'
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
        preserveFiltering: false,
        filterIds: { pointLightFilter: undefined, gaussianGlowFilter: undefined }
    };


function setUpObject (svgObject) {
    let setupTL = new TimelineMax();

    setupTL.set(svgObject.DOM_REFS.antennas, { transformOrigin: 'center bottom', scaleY: 0 });

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
function flashInLogo (svgObj, preserveFiltering) {

    let masterFlashInTL = new TimelineMax({
        onComplete: lightLogoForGood
    });

    function lightLogoForGood () {

        debugger;
        // start from the endtime of the last tween on the timeline
        masterFlashInTL.addLabel(
            LABELS.lastLogoFlickering,
            masterFlashInTL.recent().endTime()
        );

        masterFlashInTL.to(
            svgObj.DOM_REFS.psLogo,
            DURATIONS.logoFlicker,
            { opacity: 1 },
            LABELS.lastLogoFlickering
        );

        // If desired, leave some finishing touches with our lighting filters, as well
        if (preserveFiltering) {

            masterFlashInTL.to(
                svgObj.DOM_REFS.filterSpecularLighting,
                DURATIONS.logoFlicker,
                { attr: { specularExponent: maxSpecularExponent * 0.05 } },
                LABELS.lastLogoFlickering
            );

            masterFlashInTL.to(
                svgObj.DOM_REFS.filterSpecularLightingPointLight,
                DURATIONS.logoFlicker,
                { attr: { z: maxPointLightDistance } },
                LABELS.lastLogoFlickering
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
            svgObj.DOM_REFS.psLogo,
            DURATIONS.logoFlicker,
            { opacity: 0 },
            { opacity: flickerOpts.logoOpacity, ease: EASINGS.logoFlicker },
            0
        );

        // tweak the point light on the controller path (which is now a tv shape)
        flickerTL.to(
            svgObj.DOM_REFS.filterSpecularLighting,
            DURATIONS.logoFlicker,
            {
                attr: {
                    specularExponent: flickerOpts.specularExponent
                }
            },
            0
        )

        flickerTL.fromTo(
            svgObj.DOM_REFS.filterSpecularLightingPointLight,
            DURATIONS.logoFlicker,
            { attr: { z: 0 } },
            { attr: { z: flickerOpts.pointLightDistance } },   // larger distance == closer to the viewer, and thus a large spread on the target
            0
        );

        return flickerTL;
    }

    // draw logo
    let
    // create some flash hashes!
        maxDelay = 0.4,
        maxSpecularExponent = 450,
        maxPointLightDistance = 95,
        maxLogoOpacity = 1,
        numFlashes = 20,

        flashHashes = [
            { delay: 0, specularExponent: maxSpecularExponent, pointLightDistance: maxPointLightDistance * 0.5, logoOpacity: maxLogoOpacity * 0.05 },
            { delay: maxDelay, specularExponent: maxSpecularExponent * 0.80, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.10 },
            { delay: maxDelay * 0.95, specularExponent: maxSpecularExponent * 0.75, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.10 },
            { delay: maxDelay * 0.92, specularExponent: maxSpecularExponent * 0.55, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.10 },
            { delay: maxDelay * 0.7, specularExponent: maxSpecularExponent * 0.55, pointLightDistance: maxPointLightDistance * 0.600, logoOpacity: maxLogoOpacity * 0.15 },
            { delay: maxDelay * 0.70, specularExponent: maxSpecularExponent * 0.50, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.20 },
            { delay: maxDelay * 0.60, specularExponent: maxSpecularExponent * 0.50, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.30 },
            { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.45, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.40 },
            { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.40, pointLightDistance: maxPointLightDistance * 0.700, logoOpacity: maxLogoOpacity * 0.45 },
            { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.40, pointLightDistance: maxPointLightDistance * 0.725, logoOpacity: maxLogoOpacity * 0.50 },
            { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.40, pointLightDistance: maxPointLightDistance * 0.750, logoOpacity: maxLogoOpacity * 0.55 },
            { delay: maxDelay * 0.50, specularExponent: maxSpecularExponent * 0.25, pointLightDistance: maxPointLightDistance * 0.775, logoOpacity: maxLogoOpacity * 0.60 },
            { delay: maxDelay * 0.30, specularExponent: maxSpecularExponent * 0.25, pointLightDistance: maxPointLightDistance * 0.800, logoOpacity: maxLogoOpacity * 0.65 },
            { delay: maxDelay * 0.30, specularExponent: maxSpecularExponent * 0.20, pointLightDistance: maxPointLightDistance * 0.825, logoOpacity: maxLogoOpacity * 0.70 },
            { delay: maxDelay * 0.20, specularExponent: maxSpecularExponent * 0.15, pointLightDistance: maxPointLightDistance * 0.850, logoOpacity: maxLogoOpacity * 0.75 },
            { delay: maxDelay * 0.20, specularExponent: maxSpecularExponent * 0.12, pointLightDistance: maxPointLightDistance * 0.875, logoOpacity: maxLogoOpacity * 0.80 },
            { delay: maxDelay * 0.20, specularExponent: maxSpecularExponent * 0.10, pointLightDistance: maxPointLightDistance * 0.900, logoOpacity: maxLogoOpacity * 0.85 },
            { delay: maxDelay * 0.15, specularExponent: maxSpecularExponent * 0.07, pointLightDistance: maxPointLightDistance * 0.925, logoOpacity: maxLogoOpacity * 0.90 },
            { delay: maxDelay * 0.10, specularExponent: maxSpecularExponent * 0.03, pointLightDistance: maxPointLightDistance * 0.950, logoOpacity: maxLogoOpacity * 0.95 },
            { delay: maxDelay * 0.10, specularExponent: maxSpecularExponent * 0.02, pointLightDistance: maxPointLightDistance, logoOpacity: maxLogoOpacity * 1.0 }
        ];

    for (optionHash of flashHashes) {
        masterFlashInTL.add(createLogoFlicker(optionHash));
    }

    // flash glow filter
    return masterFlashInTL;
}


function createMainObjectTL (svgObj, preserveFiltering) {

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

    mainIconTL.addLabel(LABELS.antennaPerkUpComplete, mainIconTL.recent().endTime());

    mainIconTL.add(flashInLogo(svgObj, preserveFiltering), `${LABELS.antennaPerkUpComplete}+=0.5`);

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

function wireUpFiltersAndDOMRefs (svgObject, svgContainerElem, filterIds) {

    if (filterIds.pointLightFilter) {
        SELECTORS.pointLightFilter.specularLighting = `${filterIds.pointLightFilter} feSpecularLighting`;
        SELECTORS.pointLightFilter.specularLightingPointLight = `${filterIds.pointLightFilter} feSpecularLighting fePointLight`;
    }

    if (filterIds.gaussianGlowFilter) {
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
    debugger;
    let
        tvBoundingBox = svgContainerElem.getBBox();
        antennaHeight = svgObject.DOM_REFS.antennas[0].getBBox().height;

    svgObject.DOM_REFS.filterSpecularLightingPointLight.setAttribute('x', `${tvBoundingBox.width / 2}`);
    svgObject.DOM_REFS.filterSpecularLightingPointLight.setAttribute('y', `${tvBoundingBox.height / 2 + antennaHeight}`);
}

const ControllerToTvMorphAndFlash = ((svgContainerElem, opts = DEFAULT_OBJECT_OPTIONS) => {

    let svgObject = BaseSvgObject();  // TODO: Change name of "svgObject"

    svgObject.svgContainerElem = svgContainerElem;

    wireUpFiltersAndDOMRefs(svgObject, svgContainerElem, opts.filterIds);
    calibrateFilters(svgObject, svgContainerElem);

    svgObject.mainIconTL = createMainObjectTL(svgObject, opts.preserveFiltering);

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
