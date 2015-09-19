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
                bulbGlowFilter: 'filter#surroundingBlur',
                bulbGlowFilterBlurNode: '.blur-node',
                wireTurbulenceFilter: 'filter#turbulence',
                wireTurbulenceNode: '.turbulence-node',
                energyWireUncharged: '.energy-wire-path--uncharged',
                energyWireChargedLeft: '#EnergyWire--charged-left',
                energyWireChargedRight: '#EnergyWire--charged-right',
                wireFilterTurbulence: '#filter__thicken-and-twist feTurbulence'
            },

            EASINGS = {
                default: Power4.easeInOut,
                linear: Power0.easeNone,
                initialWireCharging: Power4.easeOut
            },

            LABELS = {
                phaseWireIsCharging: 'phase__wireIsCharging',
                phaseFlickeringToFullLight: 'phase__flickeringToFullLight',
                phaseBulbOnAndFlickering: 'phase__bulbOnAndFlickering',

                bulbFlickeringStart: 'bulbFlickeringStart',

                wireChargeStart: 'wireChargeIsStarting'
            },

            DURATIONS = {
                initialWireCharging: 3.2,
                bulbFlicker: .0025
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

            currentUniqueLabelNum = 1,
            getUniqueLabel = () => {
                return 'unique-label-' + currentUniqueLabelNum++;
            },

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
            },

            /**
             * Helper to set the amount of ligthing in the bulb
             */
            setBulbLighting = function setBulbLighting (tl, elem, intensityFactor, hexColor, duration, label = getUniqueLabel()) {

                let
                    // tween the bulb opacity and fill color
                    bulbTween = TweenMax.to(
                        elem,
                        duration,
                        {
                            autoAlpha: intensityFactor,
                            ease: EASINGS.default, // TODO: Create a good easing function
                            attr: {
                                fill: hexColor
                            }
                        }
                    ),

                    // tween the STD of the glow filter
                    glowTween = TweenMax.to(
                        bulbGlowFilterBlurNode,
                        duration,
                        {
                            attr: {
                                stdDeviation: (MAX_GLOW_FILTER_SD * intensityFactor )
                            },
                            ease: EASINGS.default
                        }
                    );

                tl.add([glowTween, bulbTween], label);
            },

            setScene = function setScene () {

                let sceneSetTL = new TimelineMax();

                // cache DOM refs
                mainSVGContainer = document.querySelector(SELECTORS.mainSVGContainer);
                mainLightbulbSVG = mainSVGContainer.querySelector(SELECTORS.mainLightbulb);
                bulbGlowFilter = document.querySelector(SELECTORS.bulbGlowFilter);
                bulbGlowFilterBlurNode = bulbGlowFilter.querySelector(SELECTORS.bulbGlowFilterBlurNode);
                bulbGlassSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbGlass);
                bulbInnerLightSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbInnerLight);
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
                    bulbInnerLightSVG,
                    {
                        scale: 0,
                        fill: COLORS.wire.chargingOrange,
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
            chargeWire = function chargeWire () {

                let wireChargeTL = new TimelineMax ();

                wireChargeTL.to(
                    energyWireUnchargedSVGs,
                    DURATIONS.initialWireCharging,
                    { stroke: COLORS.wire.chargingOrange, ease: EASINGS.initialWireCharging },
                    LABELS.wireChargeStart
                );

                wireChargeTL.set(
                    bulbInnerLightSVG,
                    { scale: 1 },
                    LABELS.wireChargeStart
                );

                setBulbLighting(
                    wireChargeTL,
                    bulbInnerLightSVG,
                    1,
                    COLORS.bulb.chargingOrange,
                    DURATIONS.initialWireCharging,
                    LABELS.wireChargeStart
                );

                return wireChargeTL;
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
                    tweenWireBackToNormal = function tweenWireBackToNormal (tl) {
                        tl.to(
                            energyWireFilterTurbulence,
                            2.7,
                            { attr: { baseFrequency: '0' }}
                        );
                    },

                    masterFlickerTL = new TimelineMax({
                        //onComplete: tweenWireBackToNormal,
                        //onCompleteParams: ['{self}']
                    }),
                    masterTurbulenceTL = new TimelineMax(),
                    masterWireChargeTL = new TimelineMax(),

                    createWireTurbulence = function createWireTurbulence(
                        turbulenceFrequency,
                        turbulenceDuration,
                        delay
                    ) {
                        console.log(turbulenceFrequency);
                        console.log(turbulenceDuration);
                        let turbulenceTL = new TimelineMax({
                            delay: delay,
                            repeatDelay: 0,
                            repeat: 1,
                            yoyo: true
                        });

                        turbulenceTL.to(
                            energyWireFilterTurbulence,
                            turbulenceDuration / 2,
                            {
                              onStart: function () {debugger;},
                              attr: {
                                baseFrequency: '' + turbulenceFrequency
                              },
                              ease: EASINGS.default,
                              onComplete: function () {debugger;}
                            }
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

                        let flickerBurstTL = new TimelineMax({
                                repeat: numFlickers,
                                delay: flickerDelay,
                                repeatDelay: 0
                        });

                        flickerBurstTL.set(bulbInnerLightSVG, { autoAlpha: 0, scale: 0, fill: color, immediateRender: false });

                        // light up the bulb
                        flickerBurstTL.to(
                          bulbInnerLightSVG,
                          DURATIONS.bulbFlicker,
                          { autoAlpha: 0, scale: 1, fill: color },
                          0
                        );


                        // handle fill and opacity changes as the bulb expands
                        setBulbLighting(
                            flickerBurstTL,
                            bulbInnerLightSVG,
                            percentage / 100,
                            color,
                            DURATIONS.bulbFlicker,
                            0
                        );

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
                        { numFlickers: 301, intensityPct: 20, color: COLORS.bulb.chargingYellow, delay: 0.2, label: 'flicker-1'},
                        { numFlickers: 333, intensityPct: 40, color: COLORS.bulb.chargingYellow, delay: 0.9, label: 'flicker-2'},
                        { numFlickers: 356, intensityPct: 60, color: COLORS.bulb.litYellow, delay: 0.1, label: 'flicker-3'},
                        { numFlickers: 332, intensityPct: 70, color: COLORS.bulb.litYellow, delay: 0.12, label: 'flicker-4'},
                        { numFlickers: 390, intensityPct: 80, color: COLORS.bulb.chargingYellow, delay: 1.1, label: 'flicker-5'},
                        { numFlickers: 300, intensityPct: 99, color: COLORS.bulb.chargingYellow, delay: 0.45, label: 'flicker-6'},
                        { numFlickers: 334, intensityPct: 100, color: COLORS.bulb.chargingYellow, delay: 0.31, label: 'flicker-7'},
                        { numFlickers: 334, intensityPct: 100, color: COLORS.bulb.chargingYellow, delay: 0.1, label: 'flicker-8'},
                        { numFlickers: 334, intensityPct: 100, color: COLORS.bulb.chargingYellow, delay: 0.05, label: 'flicker-9'},
                        { numFlickers: 334, intensityPct: 100, color: COLORS.bulb.litYellow, delay: 0.05, label: 'flicker-10'}
                    ],

                    totalSeqDuration,
                    flickerBurstTL,
                    wireChargeTL,
                    wireTurbulenceTL;

                // let
                //     flickerIter = 0,
                //     positionFromStartLabel;

                for (let seq of flickerSequence) {

                    totalSeqDuration = seq.numFlickers * DURATIONS.bulbFlicker;

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
                        totalSeqDuration,
                        seq.delay
                    );

                    masterFlickerTL.add(flickerBurstTL);
                    masterWireChargeTL.add(wireChargeTL);
                    masterTurbulenceTL.add(wireTurbulenceTL);

                    //flickerIter++;
                }

                return [masterFlickerTL, masterWireChargeTL, masterTurbulenceTL];
            },


            flickerBulbAtRandom = function flickerBulbAtRandom () {
                let flickerTL = new TimelineMax({ repeat: -1 });
            },

            /**
             * Main entry point for building and running our timelines
             */
            letThereBeLight = function letThereBeLight() {

                masterTL.add(setScene());
                masterTL.add(chargeWire());
                masterTL.addLabel(LABELS.phaseWireIsCharging);
                masterTL.add(flickerToFullCharge());
                masterTL.addLabel(LABELS.phaseFlickeringToFullLight);
                //masterTL.add(flickerBulbAtRandom(), LABELS.phaseBulbOnAndFlickering);
                masterTL.play();

            };

        masterTL = new TimelineMax({paused: true});
        letThereBeLight();
    };

    return init;
};


export default lightbulb;
