import 'modernizr';
import 'normalize.css';
import 'DrawSVGPlugin';
import 'TweenMax';


let lightbulb = function lightbulb () {

    let init = function init () {

        let
            SELECTORS = {
                mainSVGContainer: '.svg-container',
                mainLightbulb: '#lightbulb',
                bulbGlass: '#bulbGlass',
                bulbInnerLight: '#bulbInnerLight',
                bulbInnerGlowLayer: '#bulbInnerGlowLayer',
                bulbGlowFilter: 'filter#surroundingBlur',
                bulbGlowFilterBlurNode: '.blur-node',
                wireTurbulenceFilter: 'filter#turbulence',
                wireTurbulenceNode: '.turbulence-node',
                energyWireUncharged: '.energy-wire-path--uncharged',
                energyWireChargedLeft: '#EnergyWire--charged-left',
                energyWireChargedRight: '#EnergyWire--charged-right',
                wireFilterTurbulence: '#filter__perlin-electric-wobble feTurbulence'
            },

            EASINGS = {
                default: Power4.easeInOut,
                warmUpBulb: Power2.easeIn,
                flickerInstance: Power4.easeOut,
                wireTurbulence: Power2.easeInOut,
                linear: Power0.easeNone,
                initialWireCharging: Power4.easeOut
            },

            LABELS = {
                phaseBulbWarmingUp: 'phase__bulbWarmingUp',
                phaseBulbFlickeringToFullCharge: 'phase__BulbFlickeringToFullCharge',
                phaseBulbFlickeringAtRandom: 'phase__BulbFlickeringAtRandom',

                bulbFlickeringStart: 'bulbFlickeringStart',

                wireChargeStart: 'wireChargeIsStarting',
                turbulenceStart: 'turbulenceIsStarting'
            },

            DURATIONS = {
                initialWireCharging: 3.2,

                // this should be at least the monitor
                // frame rate that we're targeting (i.e. 60 fps ==> 0.0167ms)
                bulbFlicker: .035
            },

            WAVE_FUNCTIONS = {
                SIN: 'sin',
                TRIANGLE: 'triangle',
                SQUARE: 'square',
                SAWTOOTH: 'sawtooth',
                INVERTED_SAWTOOTH: 'invertedSawtooth',
                NOISE: 'randomNoise'
            },

            COLORS = {
              wire: {
                chargingOrange: '#E68A3A',
                chargingYellow: '#FEF734'
              },

              bulb: {
                chargingOrange: '#E68A3A',
                litYellow: '#FEF734',
                chargingYellow: '#FFF3AA'
              }
            },

            DIMENSIONS = {
              wireFilterTurbulence: {
                startFrequency: '0',
                endFrequency: '0.03017'
              }
            },

            MAX_GLOW_FILTER_SD = 90,

            // DOM Refs,
            mainSVGContainer,
            mainLightbulbSVG,
            bulbGlowFilter,
            bulbGlowFilterBlurNode,
            bulbGlassSVG,
            bulbInnerLightSVG,
            bulbInnerGlowLayerSVG,
            energyWireUnchargedSVGs,
            energyWireChargedLeftSVG,
            energyWireChargedRightSVG,
            energyWireLitSVG,
            energyWireFilterTurbulence,


            debug = function debug () {
              debugger;
            },

            debugTLOpts = {
              onStart: debug,
              onComplete: debug
            },

            masterTL,

            // TODO: Not sure if needed
            currentUniqueLabelNum = 1,
            getUniqueLabel = () => {
                return 'unique-label-' + currentUniqueLabelNum++;
            },


            /**
             * Makes a timelime that coordinates a flickering of the bulb
             */
            makeFlickerBurst = function makeFlickerBurst (
                numFlickers,
                color,
                flickerDelay = 0.2
            ) {
                console.log('Making flicker burst');

                let
                    flickerBurstTL = new TimelineMax({
                        delay: flickerDelay,
                        onComplete: function () {console.log('burst');}
                    }),

                    makeFlickerTL = function makeFlickerTL(color) {

                        let flickerTL = new TimelineMax();

                        flickerTL.addLabel('lightsOn');

                        flickerTL.to(
                            bulbInnerLightSVG,
                            DURATIONS.bulbFlicker,
                            { autoAlpha: 1, ease: EASINGS.flickerInstance },
                            'lightsOn'
                        );

                        flickerTL.addLabel('lightsOff');

                        flickerTL.to(
                            bulbInnerLightSVG,
                            DURATIONS.bulbFlicker,
                            { autoAlpha: 0, ease: EASINGS.flickerInstance },
                            'lightsOff'
                        );


                        return flickerTL;
                    };

                flickerBurstTL.set([
                        bulbInnerLightSVG,
                    ],
                    { autoAlpha: 0, fill: color, immediateRender: false },
                    0
                 );

                // make a timeline for each flicker and add it to the "burst" TL
                for (let i = 0; i < numFlickers; i++) {
                    flickerBurstTL.add(makeFlickerTL(color));
                }

                return flickerBurstTL;
            },

            createWireTurbulence = function createWireTurbulence(
                turbulenceFrequency,
                turbulenceDuration,
                delay,
                label
            ) {

                let
                    turbulenceTL = new TimelineMax({
                        delay: delay
                    }),

                    zapFactor = 0.125,
                    zapDuration = turbulenceDuration * zapFactor,
                    attenuationDuration = turbulenceDuration * (1 - zapFactor);

                // zap the wire with turbulence
                turbulenceTL.to(
                    energyWireFilterTurbulence,
                    zapDuration,
                    {
                      attr: {
                        baseFrequency: '' + turbulenceFrequency
                      },
                      ease: EASINGS.wireTurbulence
                    }
                );

                // now head back to normal, albiet much more smoothly
                turbulenceTL.to(
                    energyWireFilterTurbulence,
                    attenuationDuration,
                    { attr: { baseFrequency: '0' } }
                );

                return turbulenceTL;
            },

            makeWiresCharge = function makeWiresCharge (duration, percentage, delay) {

                let wireChargeTL = new TimelineMax({
                    delay: delay
                });

                wireChargeTL.to(
                    energyWireChargedLeftSVG,
                    duration,
                    { drawSVG: percentage + '%', ease: EASINGS.default },
                    0
                );

                wireChargeTL.to(
                    energyWireChargedRightSVG,
                    duration,
                    { drawSVG: '100% ' + (100 - percentage) + '%', ease: EASINGS.default },
                    0
                );

                return wireChargeTL;
            },


            /*------------------- PHASE FUNCTIONS -------------------*/

            setScene = function setScene () {

                let
                    sceneSetTL = new TimelineMax(),

                    /**
                     * Set the starting frequency value for
                     * the wire's turbulence filter
                     */
                    resetWireTurbulence = function resetWireTurbulence () {
                      let tween = TweenMax.set(
                        energyWireFilterTurbulence,
                        {
                          attr: {
                            baseFrequency: DIMENSIONS.wireFilterTurbulence.startFrequency
                          }
                        }
                      );

                      return tween;
                  };

                // cache DOM refs
                mainSVGContainer = document.querySelector(SELECTORS.mainSVGContainer);
                mainLightbulbSVG = mainSVGContainer.querySelector(SELECTORS.mainLightbulb);
                bulbGlowFilter = document.querySelector(SELECTORS.bulbGlowFilter);
                bulbGlowFilterBlurNode = bulbGlowFilter.querySelector(SELECTORS.bulbGlowFilterBlurNode);
                bulbGlassSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbGlass);
                bulbInnerLightSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbInnerLight);
                bulbInnerGlowLayerSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbInnerGlowLayer);
                energyWireUnchargedSVGs = mainLightbulbSVG.querySelectorAll(SELECTORS.energyWireUncharged);
                energyWireChargedLeftSVG = mainLightbulbSVG.querySelector(SELECTORS.energyWireChargedLeft);
                energyWireChargedRightSVG = mainLightbulbSVG.querySelector(SELECTORS.energyWireChargedRight);
                energyWireFilterTurbulence = document.querySelector(SELECTORS.wireFilterTurbulence);

                // blur out and undraw the second, lit wire
                sceneSetTL.set(
                  [
                    energyWireChargedLeftSVG,
                    energyWireChargedRightSVG
                  ],
                  { drawSVG: false }
                );

                // blur out glow layer and inner layers
                sceneSetTL.set(bulbGlowFilterBlurNode, { attr: {stdDeviation: 0} });

                // Blur out, and set initial scaling and transform origin for the inner layers
                sceneSetTL.set(
                    [
                        bulbInnerLightSVG,
                        bulbInnerGlowLayerSVG
                    ],
                    {
                        scale: 0,
                        //fill: COLORS.wire.chargingOrange,
                        transformOrigin: '50% 50%',
                        autoAlpha: 0
                    }
                );

                sceneSetTL.add(resetWireTurbulence());

                // We should be all set -- remove opacity from the main SVG!
                // NOTE: We manually set opacity and visibility here,
                // because autoAlpha: 1 would set visbility to inherit
                sceneSetTL.set(mainSVGContainer, { opacity: 1, visibility: 'visible' });

                return sceneSetTL;
            },


            /**
             * Gradually bring the initial energy wire up to its charged state
             */
            warmUpBulb = function warmUpBulb () {

                let warmUpTL = new TimelineMax ();

                warmUpTL.set(
                    [
                        bulbInnerLightSVG,
                        bulbInnerGlowLayerSVG
                    ],
                    { autoAlpha: 0, scale: 1, fill: COLORS.bulb.chargingOrange, immediateRender: false },
                    0
                );

                warmUpTL.to(
                    energyWireUnchargedSVGs,
                    DURATIONS.initialWireCharging,
                    { stroke: COLORS.wire.chargingOrange, ease: EASINGS.initialWireCharging },
                    0
                );

                warmUpTL.to(
                    [
                        bulbInnerLightSVG,
                        bulbInnerGlowLayerSVG
                    ],
                    DURATIONS.initialWireCharging,
                    { autoAlpha: 1, ease: EASINGS.linear },
                    0
                );

                // expand the glow filter in sync with the glow being intensified
                warmUpTL.to(
                    bulbGlowFilterBlurNode,
                    DURATIONS.initialWireCharging,
                    {
                        attr: {
                            stdDeviation: (MAX_GLOW_FILTER_SD).toString()
                        },
                        ease: EASINGS.linear
                    },
                    0
                );

                return warmUpTL;
            },

            /**
             * The wire now has enough charge to begin having its
             * "fully-charged" color flicker.
             *
             * Eventually it reaches the full charge and the bulb illuminates
             * to its full strength in tandem
             */
            flickerToFullCharge = function flickerToFullCharge () {

                let
                    maxWireTurbulence = DIMENSIONS.wireFilterTurbulence.endFrequency,

                    masterFlickerTL = new TimelineMax(),
                    masterTurbulenceTL = new TimelineMax(),
                    masterWireChargeTL = new TimelineMax(),

                    flickerSequence = [
                        { numFlickers: 11, intensityPct: 20, color: COLORS.bulb.chargingYellow, delay: 0.2 },
                        { numFlickers: 10, intensityPct: 40, color: COLORS.bulb.chargingYellow, delay: 0.27, nextFlickerStartLabel: 'flicker2' },
                        { numFlickers: 16, intensityPct: 60, color: COLORS.bulb.litYellow, delay: 0.55, nextFlickerStartLabel: 'flicker3' },
                        { numFlickers: 9, intensityPct: 70, color: COLORS.bulb.litYellow, delay: 0.1, nextFlickerStartLabel: 'flicker4' },
                        { numFlickers: 4, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 0.9, nextFlickerStartLabel: 'flicker5' },
                        { numFlickers: 9, intensityPct: 99, color: COLORS.bulb.chargingYellow, delay: 0.45, nextFlickerStartLabel: 'flicker6' },
                        { numFlickers: 6, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 0.31, nextFlickerStartLabel: 'flicker7' },
                        { numFlickers: 9, intensityPct: 90, color: COLORS.bulb.chargingYellow, delay: 0.1, nextFlickerStartLabel: 'flicker8' },
                        { numFlickers: 5, intensityPct: 95, color: COLORS.bulb.chargingYellow, delay: 0.05, nextFlickerStartLabel: 'flicker9' },
                        { numFlickers: 13, intensityPct: 100, color: COLORS.bulb.litYellow, delay: 0.05, nextFlickerStartLabel: 'flicker10' }
                    ];


                // Provide master TLs with labels so that we can reference
                // the starting point within the loop
                //masterTurbulenceTL.addLabel(LABELS.turbulenceStart);
                masterFlickerTL.set(
                    bulbInnerGlowLayerSVG, { autoAlpha: 0, immediateRender: false  }
                );

                let
                    flickerBurstDuration,
                    turbulenceDuration,
                    flickerBurstTL,
                    wireChargeTL,
                    wireTurbulenceTL,
                    flickerBurstPosition,
                    wireChargePosition,
                    turbulencePosition,
                    currentSeqIter = 0;

                for (let seq of flickerSequence) {

                    flickerBurstDuration = seq.numFlickers * DURATIONS.bulbFlicker;

                    // treat turbulence as a more prolonged effect of
                    // of each flicker burst
                    turbulenceDuration = flickerBurstDuration * 15;

                    flickerBurstTL = makeFlickerBurst(
                        seq.numFlickers,
                        seq.color,
                        seq.delay
                    );

                    wireChargeTL = makeWiresCharge(
                        flickerBurstDuration,
                        seq.intensityPct,
                        seq.delay
                    );

                    wireTurbulenceTL = createWireTurbulence(
                        maxWireTurbulence * (seq.intensityPct / 100),
                        turbulenceDuration,
                        seq.delay
                    );


                    //masterFlickerTL.add([flickerBurstTL, wireChargeTL, wireTurbulenceTL], seq.label );


                    flickerBurstPosition = `+${currentSeqIter * flickerBurstDuration}`
                    wireChargePosition = `+${currentSeqIter * flickerBurstDuration}`
                    turbulencePosition = `+${currentSeqIter * flickerBurstDuration}`

                    console.log(`Adding flicker burst at ${flickerBurstPosition}`);
                    console.log(`Adding wire charge at ${wireChargePosition}`);
                    console.log(`Adding turbulence at ${turbulencePosition}`);

                    masterFlickerTL.add(flickerBurstTL, flickerBurstPosition);
                    masterFlickerTL.add(wireChargeTL, wireChargePosition);
                    masterFlickerTL.add(wireTurbulenceTL, turbulencePosition);
                    //masterFlickerTL.add(wireTurbulenceTL, seq.label);
                    // masterFlickerTL.add(flickerBurstTL);
                    // masterWireChargeTL.add(wireChargeTL);
                    // masterTurbulenceTL.add(wireTurbulenceTL, '+=' + flickerBurstDuration);
                    currentSeqIter++;

                }

                return masterFlickerTL;
                //return [masterFlickerTL, masterWireChargeTL, masterTurbulenceTL];
            },


            flickerBulbAtRandom = function flickerBulbAtRandom () {

                let
                    makeRandomFlicker = function makeRandomFlicker (tl) {

                        let
                            delay = 5 + (Math.random() * 3),
                            numFlickers = 4 + (Math.floor(Math.random() * 20)),
                            flickerBurstDuration = numFlickers * DURATIONS.bulbFlicker,
                            turbulenceDuration = flickerBurstDuration * 5;

                        console.log('random flicker burst');
                        console.log(`delay: ${delay}`);
                        console.log(`num flickers: ${numFlickers}`);
                        console.log(tl);

                        tl.add(makeFlickerBurst(
                            numFlickers,
                            COLORS.bulb.litYellow,
                            delay
                        ), 0);

                        tl.add(makeWiresCharge(
                            flickerBurstDuration,
                            100,
                            delay
                        ), 0);

                        tl.add(createWireTurbulence(
                            DIMENSIONS.wireFilterTurbulence.endFrequency,
                            turbulenceDuration,
                            delay
                        ), 0);
                    },

                    randomFlickerTL = new TimelineMax({
                        repeat: -1,
                        onRepeat: makeRandomFlicker,
                        onRepeatParams: ['{self}']
                    });

                makeRandomFlicker(randomFlickerTL);

                return randomFlickerTL;

            },

            // wireUpControls = function wireUpControls () {
            //     playPauseButton.addEventListener('click', togglePlayState);
            //     resetButton.addEventListener('click', resetMasterTL);
            // },

            /**
             * Main entry point for building and running our timelines
             */
            letThereBeLight = function letThereBeLight() {

                masterTL.add(setScene());
                masterTL.addLabel(LABELS.phaseBulbWarmingUp);
                masterTL.add(warmUpBulb(), LABELS.phaseBulbWarmingUp);

                masterTL.addLabel(LABELS.phaseBulbFlickeringToFullCharge);
                masterTL.add(flickerToFullCharge(), LABELS.phaseBulbFlickeringToFullCharge);

                masterTL.addLabel(LABELS.phaseBulbFlickeringAtRandom);
                masterTL.add(flickerBulbAtRandom(), LABELS.phaseBulbFlickeringAtRandom);

                //masterTL.play(LABELS.phaseBulbFlickeringAtRandom + '-=1');
                masterTL.play();
                //masterTL.seek(LABELS.phaseBulbFlickeringAtRandom + '-=1');

            };

        masterTL = new TimelineMax({paused: true});
        letThereBeLight();
    };

    return init;
};


export default lightbulb;
