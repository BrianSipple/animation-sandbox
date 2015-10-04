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
                glowGrow: Power2.easeIn,
                flickerInstance: Power4.easeOut,
                wireTurbulence: Power2.easeInOut,
                linear: Power0.easeNone,
                initialWireCharging: Power4.easeOut
            },

            LABELS = {
                phaseBulbWarmingUp: 'phase__bulbWarmingUp',
                phaseBulbFlickeringToFullCharge: 'phase__BulbFlickeringToFullCharge',
                phaseBulbFlickeringAtRandom: 'phase__BulbFlickeringAtRandom',
                phaseBulbOnAfterFlikcer: 'phase__BulbOnAfterFlicker',

                bulbFlickeringStart: 'bulbFlickeringStart',

                wireChargeStart: 'wireChargeIsStarting',
                turbulenceStart: 'turbulenceIsStarting'
            },

            DURATIONS = {
                initialWireCharging: 3.2,

                // this should be at least the monitor
                // frame rate that we're targeting (i.e. 60 fps ==> 0.0167ms)
                bulbFlicker: .035,

                // How much longer turbulence should last than an initial flicker burst
                wireTurbulenceMultiplier: 5
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
                flickerDelay = 0
            ) {
                //console.log('Making flicker burst');

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
                delay = 0,
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

            makeWiresCharge = function makeWiresCharge (duration, percentage, delay = 0) {

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

            /**
             * Animate in some glow of a given color
             */
            growSomeGlow = function growSomeGlow (color, duration) {

                let glowTL = new TimelineMax ();

                glowTL.set(
                    [
                        bulbInnerLightSVG,
                        bulbInnerGlowLayerSVG
                    ],
                    { visibility: 'visible', opacity: 1, scale: 1, fill: color, immediateRender: false },
                    0
                );

                glowTL.addLabel('startGlow', '.01');

                glowTL.to(
                    energyWireUnchargedSVGs,
                    duration,
                    { stroke: color, ease: EASINGS.glowGrow },
                    'startGlow'
                );

                glowTL.fromTo(
                    [
                        bulbInnerLightSVG,
                        bulbInnerGlowLayerSVG
                    ],
                    duration,
                    { opacity: 0 },
                    { opacity: 1, ease: EASINGS.glowGrow },
                    'startGlow'
                );

                // expand the glow filter in sync with the glow being intensified
                glowTL.fromTo(
                    bulbGlowFilterBlurNode,
                    duration,
                    { attr: { stdDeviation: '0' } },
                    {
                        attr: {
                            stdDeviation: (MAX_GLOW_FILTER_SD).toString()
                        },
                        ease: EASINGS.glowGrow
                    },
                    'startGlow'
                );

                return glowTL;
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

                // Blur out, and set initial scaling and transform origin for the inner layers
                sceneSetTL.set(
                    [
                        bulbInnerLightSVG,
                        bulbInnerGlowLayerSVG
                    ],
                    {
                        scale: 0,
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
             * The wire now has enough charge to begin having its
             * "fully-charged" color flicker.
             *
             * Eventually it reaches the full charge and the bulb illuminates
             * to its full strength in tandem
             */
            flickerToFullCharge = function flickerToFullCharge () {

                let
                    maxWireTurbulence = DIMENSIONS.wireFilterTurbulence.endFrequency,

                    masterFlickerTL = new TimelineMax({
                        onComplete: function () {
                            TweenMax.set(bulbInnerLightSVG, { opacity: 1, visibility: 'visible', immediateRender: false});
                        }
                    }),

                    flickerSequence = [
                        { numFlickers: 11, intensityPct: 20, color: COLORS.bulb.chargingYellow, delay: 0.2 },
                        { numFlickers: 10, intensityPct: 40, color: COLORS.bulb.chargingYellow, delay: 0.67, nextFlickerStartLabel: 'flicker2' },
                        { numFlickers: 16, intensityPct: 60, color: COLORS.bulb.litYellow, delay: 0.45, nextFlickerStartLabel: 'flicker3' },
                        { numFlickers: 9, intensityPct: 70, color: COLORS.bulb.litYellow, delay: 0.10, nextFlickerStartLabel: 'flicker4' },
                        { numFlickers: 4, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 0.9, nextFlickerStartLabel: 'flicker5' },
                        { numFlickers: 9, intensityPct: 99, color: COLORS.bulb.chargingYellow, delay: 0.15, nextFlickerStartLabel: 'flicker6' },
                        { numFlickers: 6, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 0.31, nextFlickerStartLabel: 'flicker7' },
                        { numFlickers: 9, intensityPct: 90, color: COLORS.bulb.chargingYellow, delay: 0.1, nextFlickerStartLabel: 'flicker8' },
                        { numFlickers: 5, intensityPct: 95, color: COLORS.bulb.chargingYellow, delay: 0.05, nextFlickerStartLabel: 'flicker9' },
                        { numFlickers: 5, intensityPct: 97, color: COLORS.bulb.chargingYellow, delay: 0.05, nextFlickerStartLabel: 'flicker10' },
                        { numFlickers: 13, intensityPct: 100, color: COLORS.bulb.litYellow, delay: 0.05, nextFlickerStartLabel: 'flicker11', finalFlicker: true }
                    ];

                // Provide master TLs with labels so that we can reference
                // the starting point within the loop
                masterFlickerTL.set(
                    bulbInnerGlowLayerSVG,
                    { autoAlpha: 0, immediateRender: false  },
                    0
                );

                let
                    flickerBurstDuration,
                    turbulenceDuration,
                    totalSequenceDuration,
                    nextSequenceStartPosition = 0,
                    flickerBurstTL,
                    wireChargeTL,
                    wireTurbulenceTL,
                    currentSeqIter = 0;

                for (let seq of flickerSequence) {

                    flickerBurstDuration = seq.numFlickers * DURATIONS.bulbFlicker;

                    // treat turbulence as a more prolonged effect of
                    // of each flicker burst
                    turbulenceDuration =
                        flickerBurstDuration * DURATIONS.wireTurbulenceMultiplier;

                    totalSequenceDuration = flickerBurstDuration + seq.delay;

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

                    if (currentSeqIter === 0) {
                        nextSequenceStartPosition = 0;
                    } else {
                        nextSequenceStartPosition = `flicker${currentSeqIter-1}Done`;
                    }

                    masterFlickerTL.add(flickerBurstTL, nextSequenceStartPosition);
                    masterFlickerTL.add(wireChargeTL, nextSequenceStartPosition);

                    //debugger;
                    // add the label at a time computed by the flicker and wire TL sequences
                    masterFlickerTL.addLabel(
                        `flicker${currentSeqIter}Done`,
                        masterFlickerTL.recent().endTime() + seq.delay
                    );

                    // At the end, we'll want to add the glow-grow TL
                    // right when the final flicker completes
                    if (seq.finalFlicker) {
                        masterFlickerTL.add(
                            growSomeGlow(COLORS.bulb.litYellow, 0.10),
                            masterFlickerTL.recent().endTime() + seq.delay + .01
                        );
                    }

                    console.log(`added label at ${masterFlickerTL.recent().endTime()}`);

                    // Except for the first burst, back-set each turbulenceTL sequence
                    // so that it plays in sync with the flickering
                    masterFlickerTL.add(wireTurbulenceTL, nextSequenceStartPosition);

                    currentSeqIter++;
                }

                return masterFlickerTL;
            },


            flickerBulbAtRandom = function flickerBulbAtRandom (startingBulbColor) {

                let
                    addRandomFlickeringToMasterTL = function addRandomFlickeringToMasterTL () {

                        let
                            newDelay = 5 + (Math.random() * 3),
                            numFlickers = 2 + (Math.floor(Math.random() * 2)),
                            flickerBurstDuration = numFlickers * DURATIONS.bulbFlicker,
                            turbulenceDuration =
                                flickerBurstDuration * DURATIONS.wireTurbulenceMultiplier,

                            randomFlickerTL = new TimelineMax({
                                delay: newDelay,
                                onComplete: function () {
                                    masterRandomFlickerTL.restart();
                                }
                            });

                        console.log('random flicker burst');
                        console.log(`num flickers: ${numFlickers}`);
                        console.log(`New delay: ${newDelay}`);
                        console.log(randomFlickerTL);

                        randomFlickerTL.set(bulbInnerGlowLayerSVG, { css: {visibility: 'visible'}, immediateRender: false });
                        randomFlickerTL.set(bulbInnerGlowLayerSVG, { css: {visibility: 'hidden'}, immediateRender: false });

                        randomFlickerTL.add(makeFlickerBurst(
                            numFlickers,
                            startingBulbColor
                        ));

                        randomFlickerTL.addLabel('randomFlickerEnd');

                        // randomFlickerTL.to(
                        //     [
                        //         bulbInnerGlowLayerSVG,
                        //         bulbInnerLightSVG
                        //     ],
                        //     0,
                        //     { immediateRender: false, opacity: 1, visibility: 'visible'},
                        //     'randomFlickerEnd'
                        // );

                        randomFlickerTL.add(growSomeGlow(startingBulbColor, .10), '+0.3');
                        masterRandomFlickerTL.add(randomFlickerTL);
                    },

                    masterRandomFlickerTL = new TimelineMax({
                        repeat: -1,
                        onRepeat: function () {
                            //masterRandomFlickerTL.clear();
                            addRandomFlickeringToMasterTL();
                        }
                    });

                addRandomFlickeringToMasterTL();

                return masterRandomFlickerTL;
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

                masterTL.add(
                    growSomeGlow(
                        COLORS.bulb.chargingOrange,
                        DURATIONS.initialWireCharging
                    ),
                    LABELS.phaseBulbWarmingUp
                );

                masterTL.addLabel(
                    LABELS.phaseBulbFlickeringToFullCharge,
                    `${masterTL.recent().endTime() + 0.3}`
                );

                masterTL.add(flickerToFullCharge(), LABELS.phaseBulbFlickeringToFullCharge);

                // masterTL.addLabel(
                //     LABELS.phaseBulbOnAfterFlikcer,
                //     masterTL.recent().endTime()
                // );
                // masterTL.add(
                //     growSomeGlow(COLORS.bulb.litYellow, 0.10),
                //     LABELS.phaseBulbOnAfterFlikcer
                // );

                //masterTL.add(growSomeGlow(0.10, COLORS.bulb.litYellow));
                masterTL.addLabel(
                    LABELS.phaseBulbFlickeringAtRandom,
                    `${masterTL.recent().endTime() + 2.0}`
                );
                masterTL.add(
                    flickerBulbAtRandom(COLORS.bulb.litYellow),
                    LABELS.phaseBulbFlickeringAtRandom
                );

                masterTL.play();
                //masterTL.seek(LABELS.phaseBulbFlickeringAtRandom + '-=1');

            };

        masterTL = new TimelineMax({paused: true});
        letThereBeLight();
    };

    return init;
};


export default lightbulb;
