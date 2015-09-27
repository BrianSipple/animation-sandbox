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
                phaseWireIsCharging: 'phase__wireIsCharging',
                phaseFlickeringToFullLight: 'phase__flickeringToFullLight',
                phaseBulbOnAndFlickering: 'phase__bulbOnAndFlickering',

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


                    createWireTurbulence = function createWireTurbulence(
                        turbulenceFrequency,
                        turbulenceDuration,
                        delay
                    ) {
                        console.log(`Tweenming frequency to ${turbulenceFrequency}`);
                        console.log(`Tweening with duration of ${turbulenceDuration}`);
                        // let turbulenceTL = new TimelineMax({
                        //     delay: delay,
                        //     repeatDelay: 0,
                        //     repeat: 1,
                        //     yoyo: true
                        // });
                        let
                            turbulenceTL = new TimelineMax(),

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

                    /**
                     * Makes a timelime that coordinates a flickering of the bulb
                     */
                    makeFlickerBurst = function makeFlickerBurst (
                        numFlickers,
                        percentage,
                        color,
                        flickerDelay = 0.2
                    ) {

                        let
                            flickerBurstTL = new TimelineMax({
                                delay: flickerDelay
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

                            // makeGlowTL = function makeGlowTL (color) {
                            //
                            //     let glowTL = new TimelineMax();
                            //
                            //     glowTL.addLabel('lightsOn');
                            //
                            //     glowTL.to(
                            //         bulbInnerGlowLayerSVG,
                            //         DURATIONS.bulbFlicker,
                            //         { autoAlpha: 1, fill: color, ease: EASINGS.flickerInstance },
                            //         'lightsOn'
                            //     );
                            //
                            //     glowTL.to(
                            //         bulbGlowFilterBlurNode,
                            //         DURATIONS.bulbFlicker,
                            //         {
                            //             attr: {
                            //                 stdDeviation: (MAX_GLOW_FILTER_SD).toString()
                            //             },
                            //             ease: EASINGS.flickerInstance
                            //         },
                            //         'lightsOn'
                            //     );
                            //
                            //     glowTL.addLabel('lightsOff');
                            //
                            //     glowTL.to(
                            //         bulbInnerGlowLayerSVG,
                            //         DURATIONS.bulbFlicker,
                            //         { autoAlpha: 0, ease: EASINGS.flickerInstance },
                            //         'lightsOff'
                            //     );
                            //
                            //     glowTL.to(
                            //         bulbGlowFilterBlurNode,
                            //         DURATIONS.bulbFlicker,
                            //         {
                            //             attr: {
                            //                 stdDeviation: '0'
                            //             },
                            //             ease: EASINGS.flickerInstance
                            //         },
                            //         'lightsOff'
                            //     );
                            //
                            //     return glowTL;
                            // };

                        flickerBurstTL.set([
                                bulbInnerLightSVG,
                            ],
                            { autoAlpha: 0, fill: color, immediateRender: false },
                            0
                         );

                        //  flickerBurstTL.set([
                        //          bulbInnerGlowLayerSVG
                        //      ],
                        //      { autoAlpha: 1, fill: color, immediateRender: false },
                        //      0
                        //   );
                        //
                        // flickerBurstTL.set(
                        //     bulbGlowFilterBlurNode,
                        //     { attr: { stdDeviation: (MAX_GLOW_FILTER_SD).toString() }, immediateRender: false },
                        //     0
                        // );


                        // make a timeline for each flicker and add it to the "burst" TL
                        for (let i = 0; i < numFlickers; i++) {
                            flickerBurstTL.add(
                                [
                                    makeFlickerTL(color)
                                    //makeGlowTL(color)
                                ]
                            );
                        }

                        return flickerBurstTL;
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
                    };

                let
                    flickerSequence = [
                        { numFlickers: 11, intensityPct: 20, color: COLORS.bulb.chargingYellow, delay: 0.2 },
                        { numFlickers: 10, intensityPct: 40, color: COLORS.bulb.chargingYellow, delay: 0.67 },
                        { numFlickers: 16, intensityPct: 60, color: COLORS.bulb.litYellow, delay: 0.55 },
                        { numFlickers: 9, intensityPct: 70, color: COLORS.bulb.litYellow, delay: 0.1 },
                        { numFlickers: 20, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 0.9 },
                        { numFlickers: 10, intensityPct: 99, color: COLORS.bulb.chargingYellow, delay: 0.45 },
                        { numFlickers: 9, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 0.31 },
                        { numFlickers: 9, intensityPct: 90, color: COLORS.bulb.chargingYellow, delay: 0.1 },
                        { numFlickers: 13, intensityPct: 95, color: COLORS.bulb.chargingYellow, delay: 0.05 },
                        { numFlickers: 17, intensityPct: 100, color: COLORS.bulb.litYellow, delay: 0.05, turbulenceDurationMultiplier: 2},
                    ];


                // Provide master TLs with labels so that we can reference
                // the starting point within the loop
                masterTurbulenceTL.addLabel(LABELS.turbulenceStart);
                masterTurbulenceTL.set(
                    bulbInnerGlowLayerSVG, { autoAlpha: 0, immediateRender: false  }
                );

                let
                    totalSeqDuration,
                    turbulenceDuration,
                    flickerBurstTL,
                    wireChargeTL,
                    wireTurbulenceTL,
                    currentSeqIdx = 0,
                    turbulenceStartPosition;

                for (let seq of flickerSequence) {

                    totalSeqDuration = seq.numFlickers * DURATIONS.bulbFlicker;

                    // if (seq.turbulenceDurationMultiplier) {
                    //     turbulenceDuration = seq.turbulenceDurationMultiplier * (totalSeqDuration * 3);
                    //
                    // } else {
                    //     turbulenceDuration = totalSeqDuration * 3;
                    // }

                    turbulenceDuration = totalSeqDuration * 10;

                    flickerBurstTL = makeFlickerBurst(
                        seq.numFlickers,
                        seq.intensityPct,
                        seq.color,
                        seq.delay
                    );

                    wireChargeTL = makeWiresCharge(
                        totalSeqDuration,
                        seq.intensityPct,
                        seq.delay
                    );

                    wireTurbulenceTL = createWireTurbulence(
                        maxWireTurbulence * (seq.intensityPct / 100),
                        turbulenceDuration,
                        seq.delay
                    );

                    masterFlickerTL.add(flickerBurstTL);
                    masterWireChargeTL.add(wireChargeTL);

                    debugger;
                    // Position each turbulence burst so that, even though the
                    // physics of its motoin is independent of the physics for the light flickering,
                    // its still synchronized with WHEN the flicker is instigated
                    turbulenceStartPosition =
                        LABELS.turbulenceStart + '+=' + (currentSeqIdx * totalSeqDuration);

                    console.log(`TurbulenceDuration: ${turbulenceDuration}`);
                    console.log(`Turbulence Start Position: ${turbulenceStartPosition}`);
                    console.log(`Total Seq Duration: ${totalSeqDuration}`);

                    //masterTurbulenceTL.add(wireTurbulenceTL, (currentSeqIdx * totalSeqDuration));
                    masterTurbulenceTL.add(wireTurbulenceTL, turbulenceStartPosition);

                    currentSeqIdx++;
                }

                return [masterFlickerTL, masterWireChargeTL, masterTurbulenceTL];
            },


            flickerBulbAtRandom = function flickerBulbAtRandom () {
                let flickerTL = new TimelineMax({ repeat: -1 });
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
                masterTL.add(warmUpBulb());
                masterTL.addLabel(LABELS.phaseWireIsCharging);
                masterTL.add(flickerToFullCharge());
                masterTL.addLabel(LABELS.phaseFlickeringToFullLight);
                //masterTL.add(flickerBulbAtRandom(), LABELS.phaseBulbOnAndFlickering);
                masterTL.play();
            };

        masterTL = new TimelineMax({paused: true});
        //wireUpControls();
        letThereBeLight();
    };

    return init;
};


export default lightbulb;
