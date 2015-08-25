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
                bulbInnerCharging: '#bulbInnerCharging',
                bulbInnerLit: '#bulbInnerLit',
                bulbGlowFilter: 'filter#surroundingBlur',
                bulbGlowFilterBlurNode: '.blur-node',
                wireTurbulenceFilter: 'filter#turbulence',
                wireTurbulenceNode: '.turbulence-node',
                energyWireUnlit: '#energyWireUnlit',
                energyWireLit: '#energyWireLit'            
            },

            EASINGS = {
                default: Power4.easeInOut,
                linear: Power0.easeNone
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
                
                chargeFlicker1Complete: 'charge-flicker-1-complete',
                chargeFlicker2Complete: 'charge-flicker-2-complete',
                chargeFlicker3Complete: 'charge-flicker-3-complete',
                chargeFlicker4Complete: 'charge-flicker-4-complete',
                chargeFlicker5Complete: 'charge-flicker-5-complete',
                chargeFlicker6Complete: 'charge-flicker-6-complete'
            },

            DURATIONS = {
                initialWireCharging: 1.2,
                chargeFlicker1: 1.2,
                chargeFlicker2: 0.7,
                chargeFlicker3: 1.7,
                chargeFlicker4: 0.3,
                chargeFlicker5: 0.9,
                chargeFlicker6: 1.2
            },

            COLORS = {
                chargingOrange: '#E68A3A',
                litYellow: '#FFF3AA'
            },
            
            MAX_GLOW_FILTER_SD = 90,
            
            // DOM Refs,
            mainSVGContainer,
            mainLightbulbSVG,
            bulbGlowFilter,
            bulbGlowFilterBlurNode,
            bulbGlassSVG,
            bulbInnerChargingSVG,
            bulbInnerLitSVG,             
            energyWireUnlitSVG,
            energyWireLitSVG,
            

            masterTL,
            
            currentUniqueLabelNum = 1,
            getUniqueLabel = () => {
                return 'unique-label-' + currentUniqueLabelNum++;
            },
            
            /**
             * Helper to set the amount of ligthing in the bulb
             */
            setBulbLighting = (tl, elem, intensityFactor, hexColor, duration, label = getUniqueLabel()) => {
                  
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
                
                
                tl.add(bulbTween, label);
                tl.add(glowTween, label);
            },
            

            
            setScene = () => {
                              
                let sceneSetTL = new TimelineMax();
                
                // cache DOM refs
                mainSVGContainer = document.querySelector(SELECTORS.mainSVGContainer),
                mainLightbulbSVG = mainSVGContainer.querySelector(SELECTORS.mainLightbulb),
                bulbGlowFilter = document.querySelector(SELECTORS.bulbGlowFilter),
                bulbGlowFilterBlurNode = bulbGlowFilter.querySelector(SELECTORS.bulbGlowFilterBlurNode), 
                bulbGlassSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbGlass),
                bulbInnerChargingSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbInnerCharging),
                bulbInnerLitSVG = mainLightbulbSVG.querySelector(SELECTORS.bulbInnerLit),
                energyWireUnlitSVG = mainLightbulbSVG.querySelector(SELECTORS.energyWireUnlit),
                energyWireLitSVG = mainLightbulbSVG.querySelector(SELECTORS.energyWireLit);  
                
                // blur out and undraw the second, lit wire
                sceneSetTL.set(energyWireLitSVG, { drawSVG: false });
                
                // blur out glow layer and inner layers
                sceneSetTL.set(bulbGlowFilterBlurNode, { attr: {stdDeviation: 0} });
                
                // Blur out, and set initial scaling and transform origin for the inner layers
                sceneSetTL.set(
                    [
                        bulbInnerChargingSVG,
                        bulbInnerLitSVG                     
                    ],
                    { 
                        scale: 0, 
                        transformOrigin: '50% 50%', 
                        autoAlpha: 0                        
                    }
                );
                
                // We should be all set -- remove opacity from the main SVG!
                // NOTE: We manually set opacity and visibility here, 
                // because autoAlpha: 1 would set visbility to inherit
                sceneSetTL.set(mainSVGContainer, { opacity: 1, visibility: 'visible' });
                
                return sceneSetTL;
            },
            
            

            
//            increaseBulbLighting = (tl, intensity, hexColor, duration, label) => {              
//                setBulbLighting(tl, intensity, hexColor, duration, label);
//            },
//            
//
//            attentuateLighting = (tl, intensity, hexColor, duration, label) => {
//                setBulbLighting(tl, intensity, hexColor, duration, label);
//            },
            
            
            /**
             * Gradually bring the initial energy wire up to its charged state
             */
            chargeWire = () => {

                let wireChargeTL = new TimelineMax ();

                wireChargeTL.to(
                    energyWireUnlitSVG,
                    DURATIONS.initialWireCharging,
                    { stroke: COLORS.chargingOrange, ease: Power0.easeNone },
                    LABELS.wireChargeStart
                );
                
                wireChargeTL.set(bulbInnerChargingSVG, {scale: 1}, LABELS.wireChargeStart);
                
                setBulbLighting(
                    wireChargeTL, 
                    bulbInnerChargingSVG, 
                    1, 
                    COLORS.chargingOrange, 
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
            flickerToFullCharge = () => {
                
                let 
                    flickerToFullTL = new TimelineMax({delay: 2}),                
                    
                    /**
                     * Makes a timelime that coordinates a flickering of the bulb
                     */
                    makeFlickerInstance = (percentage, duration, label = getUniqueLabel()) => {                
                        
                        let
                            drawSVGValue = percentage + '% ' + (100-percentage) + '%',
                            flickerInstanceTL = new TimelineMax();
                        
                        
                        // scale down the inner charging layer and scale up the lit layer (in 
                        // advance of animating the lit layer's opacity)
                        
                        // TODO: See if a short "to" wouldn't be better here
                        flickerInstanceTL.set(bulbInnerChargingSVG, { autoAlpha: 0, scale: 0, immediateRender: false }); 
                        flickerInstanceTL.set(bulbInnerLitSVG, { autoAlpha: 0, scale: 1, immediateRender: false });
                        
                        flickerInstanceTL.addLabel(label);
                        
                        flickerInstanceTL.fromTo(
                            energyWireLitSVG, 
                            duration, 
                            { drawSVG: false },
                            { drawSVG: drawSVGValue, ease: EASINGS.default },
                            label
                        );
                                                
                        setBulbLighting(
                            flickerInstanceTL,
                            bulbInnerLitSVG,
                            percentage / 100,
                            COLORS.litYellow,
                            duration,
                            label
                        );
                        
                        return flickerInstanceTL;
                        
                    };
                
                flickerToFullTL.add(makeFlickerInstance(20, DURATIONS.chargeFlicker1, LABELS.chargeFlicker1), LABELS.chargeFlicker1Complete);
                flickerToFullTL.add(makeFlickerInstance(40, DURATIONS.chargeFlicker2, LABELS.chargeFlicker2), '+2');
                flickerToFullTL.add(makeFlickerInstance(60, DURATIONS.chargeFlicker3, LABELS.chargeFlicker3), '+5');
                flickerToFullTL.add(makeFlickerInstance(70, DURATIONS.chargeFlicker4, LABELS.chargeFlicker4), '+7');
                flickerToFullTL.add(makeFlickerInstance(80, DURATIONS.chargeFlicker5, LABELS.chargeFlicker5), '+9');
                flickerToFullTL.add(makeFlickerInstance(99, DURATIONS.chargeFlicker6, LABELS.chargeFlicker6), '+10');                                
                
                return flickerToFullTL;                
            },
                                    
            
            flickerBulbAtRandom = () => {              
                let flickerTL = new TimelineMax({ repeat: -1 });                
            },




            /**
             * Main entry point for building and running our timelines
             */
            letThereBeLight = function letThereBeLight() {
                      
                masterTL.add(setScene());
                masterTL.add(chargeWire(), LABELS.phaseWireIsCharging);
                masterTL.add(flickerToFullCharge(), LABELS.phaseFlickeringToFullLight);
                //masterTL.add(illuminateBulb(), LABELS.phaseFullChargeReached + '+=0.18');
                //masterTL.add(flickerBulbAtRandom(), LABELS.phaseBulbOnAndFlickering);
                masterTL.play();

            };

        masterTL = new TimelineMax({paused: true});
        letThereBeLight();
    };
        
        
    return init;
};


export default lightbulb;