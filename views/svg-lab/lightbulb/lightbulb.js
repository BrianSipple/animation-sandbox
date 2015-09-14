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
                phaseWireIsCharging: 'phase__wire-is-charging',
                phaseFlickeringToFullLight: 'phase__flickering-to-full-light',
                phaseBulbOnAndFlickering: 'phase__bulb-on-and-flickering',

                wireChargeStart: 'wire-charge-is-starting',

                chargeFlicker1: 'charge-flicker-1',
                chargeFlicker2: 'charge-flicker-2',
                chargeFlicker3: 'charge-flicker-3',
                chargeFlicker4: 'charge-flicker-4',
                chargeFlicker5: 'charge-flicker-5',
                chargeFlicker6: 'charge-flicker-6',
                chargeFlicker6: 'charge-flicker-7',

                chargeFlicker1Complete: 'charge-flicker-1-complete',
                chargeFlicker2Complete: 'charge-flicker-2-complete',
                chargeFlicker3Complete: 'charge-flicker-3-complete',
                chargeFlicker4Complete: 'charge-flicker-4-complete',
                chargeFlicker5Complete: 'charge-flicker-5-complete',
                chargeFlicker6Complete: 'charge-flicker-6-complete'
            },

            DURATIONS = {
                initialWireCharging: 3.2,
                chargeFlicker1: .012,
                chargeFlicker2: .007,
                chargeFlicker3: .017,
                chargeFlicker4: .003,
                chargeFlicker5: .009,
                chargeFlicker6: .012,
                chargeFlicker7: .007
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

            // makeWireFilterToggleTween = function makeWireFilterToggleTween(isActive) {
            //   debugger;
            //   let
            //     tween,
            //     filterValue;
            //
            //   if (isActive) {
            //     filterValue = 'url(#filter__thicken-and-twist)';
            //   } else {
            //     filterValue = '';
            //   }
            //
            //   tween = TweenMax.set(
            //     [].concat(
            //       energyWireUnchargedSVGs,
            //       energyWireChargedLeftSVG,
            //       energyWireChargedRightSVG
            //     ),
            //     {
            //       attr: {
            //         filter: filterValue
            //       },
            //       immediateRender: false
            //     }
            //   );
            //
            //   return tween;
            // },

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

                //debugger;
                let
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
                    flickerToFullTL = new TimelineMax(/*{onUpdate: debug}*/),

                    /**
                     * Makes a timelime that coordinates a flickering of the bulb
                     */
                    makeFlickerBurst = function makeFlickerBurst (numFlickers, percentage, duration, color, label = getUniqueLabel()) {
                        debugger;

                        let
                            drawSVGValue = percentage + '%',

                            wireTurbulenceFreq = (
                              Number(DIMENSIONS.wireFilterTurbulence.endFrequency) *
                              (percentage / 100)
                            ),

                            flickerBurstTL = new TimelineMax({
                                repeat: numFlickers,
                                delay: 0.2,
                                reapeatDelay: 0
                            });

                        // scale down the inner charging layer and scale up the lit layer (in
                        // advance of animating the lit layer's opacity)

                        flickerBurstTL.set(bulbInnerLightSVG, { autoAlpha: 0, scale: 0, fill: color, immediateRender: false });
                        flickerBurstTL.add(resetWireTurbulence());

                        flickerBurstTL.addLabel(label);

                        // begin turbulancing(?) the wire
                        flickerBurstTL.to(
                          energyWireFilterTurbulence,
                          duration,
                          {
                            attr: {
                              baseFrequency: '' + wireTurbulenceFreq
                            }
                          },
                          label
                        )

                        // light up the bulb
                        flickerBurstTL.to(
                          bulbInnerLightSVG,
                          duration,
                          { autoAlpha: 0, scale: 1, fill: color },
                          label
                        );

                        // draw left charge wire
                        flickerBurstTL.to(
                            energyWireChargedLeftSVG,
                            duration,
                            { drawSVG: percentage + '%', ease: EASINGS.default },
                            label
                        );

                        // draw right charge wire
                        flickerBurstTL.to(
                            energyWireChargedRightSVG,
                            duration,
                            { drawSVG: '100% ' + (100 - percentage) + '%', ease: EASINGS.default },
                            label
                        );

                        setBulbLighting(
                            flickerBurstTL,
                            bulbInnerLightSVG,
                            percentage / 100,
                            color,
                            duration,
                            label
                        );

                        return flickerBurstTL;
                    };

                flickerToFullTL.add(makeFlickerBurst(20, 20, DURATIONS.chargeFlicker1, COLORS.bulb.chargingYellow, LABELS.chargeFlicker1));
                flickerToFullTL.add(makeFlickerBurst(100, 40, DURATIONS.chargeFlicker2, COLORS.bulb.chargingYellow, LABELS.chargeFlicker2));
                flickerToFullTL.add(makeFlickerBurst(200, 60, DURATIONS.chargeFlicker3, COLORS.bulb.chargingYellow, LABELS.chargeFlicker3));
                flickerToFullTL.add(makeFlickerBurst(40, 70, DURATIONS.chargeFlicker4, COLORS.bulb.chargingYellow, LABELS.chargeFlicker4));
                flickerToFullTL.add(makeFlickerBurst(90, 80, DURATIONS.chargeFlicker5, COLORS.bulb.chargingYellow, LABELS.chargeFlicker5));
                flickerToFullTL.add(makeFlickerBurst(100, 99, DURATIONS.chargeFlicker6, COLORS.bulb.chargingYellow, LABELS.chargeFlicker6));

                // fin
                flickerToFullTL.add(makeFlickerBurst(30, 100, DURATIONS.chargeFlicker7, COLORS.bulb.litYellow, LABELS.chargeFlicker7));

                return flickerToFullTL;
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
