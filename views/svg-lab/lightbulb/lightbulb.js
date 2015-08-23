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
                bulb: '#bulb',
                lightbulbGlow: '#bulbGlowLayer',
                energyWireUnlit: '#energyWireUnlit',
                energyWireLit: '#energyWireLit'            
            },

            EASINGS = {
                default: Power4.easeInOut  
            },

            LABELS = {
                phaseWireIsCharging: 'phase__wire-is-charging',
                phaseFullChargeReached: 'phase__full-charge-reached',
                phaseBulbOnAndFlickering: 'phase__bulb-on-and-flickering',
                phaseWireIsCharging: 'phase__wire-is-charging',
            },

            DURATIONS = {
                wireCharging: 1.2
            },

            COLORS = {
                wireCharging: '#E68A3A'
            },
            
            // DOM Refs,
            mainSVGContainer,
            mainLightbulbSVG,
            lightbulbGlowLayer,
            bulbSVG,
            energyWireUnlitSVG,
            energyWireLitSVG,
            

            masterTL,

            
            setScene = () => {
                              
                let sceneSetTL = new TimelineMax();
                
                // cache DOM refs
                mainSVGContainer = document.querySelector(SELECTORS.mainSVGContainer),
                mainLightbulbSVG = mainSVGContainer.querySelector(SELECTORS.mainLightbulb),
                lightbulbGlowLayer = mainSVGContainer.querySelector(SELECTORS.lightbulbGlow),
                bulbSVG = mainLightbulbSVG.querySelector(SELECTORS.bulb),
                energyWireUnlitSVG = mainLightbulbSVG.querySelector(SELECTORS.energyWireUnlit),
                energyWireLitSVG = mainLightbulbSVG.querySelector(SELECTORS.energyWireLit);  
                
                sceneSetTL.set(lightbulbGlowLayer, { autoAlpha: 0 });
                sceneSetTL.set(energyWireUnlitSVG, { drawSVG: false });
                sceneSetTL.set(
                    bulbSVG, 
                    { 
                        scale: 0, 
                        transformOrigin: '50% 50%', 
                        autoAlpha: 0, 
                        fill: COLORS.wireCharging 
                    }
                );
                
                return sceneSetTL;
            },
            
            
            /**
             * Helper to set the amount of ligthing in the bulb
             */
            setBulbLighting = (tl, intensity, hexColor, duration, label) => {
                
                //TODO: Set a default param for label in the function header
                
                let tween = TweenMax.to(
                    bulbSVG,
                    duration,
                    {autoAlpha: intensity, fill: hexColor, ease: Power0.easeNone }  // TODO: Create a good easing function
                );
                
                label = label || '+=0';
                tl.add(tween, label);
            },
            
            
            increaseBulbLighting = (tl, intensity, hexColor, duration, label) => {              
                setBulbLighting(tl, intensity, hexColor, duration, label);
                tl.to(bulbBorderSVG, duration, {autoAlpha: intensity}, label);                
            },
            

            attentuateLighting = (tl, intensity, hexColor, duration, label) => {
                setBulbLighting(tl, intensity, hexColor, duration, label);
                tl.to(bulbBorderSVG, duration, {autoAlpha: intensity}, label);
            }
            
            
            /**
             * Gradually bring the initial energy wire up to its charged state
             */
            chargeWire = () => {

                let wireChargeTL = new TimelineMax ();

                wireChargeTL.to(
                    energyWireUnlitSVG,
                    DURATIONS.wireCharging,
                    { stroke: COLORS.wireCharging, ease: Power0.easeNone }
                );

                return wireChargeTL;
            },

            
            /**
             * While the wire is progressing to a full charge, 
             * the bulb will faintly light up to reflect its color
             * 
             * (The glow, however, still remains invisible)
             */
            glimmerBulb = () => {

                let bulbGlimmerTL = new TimelineMax ();

                bulbGlimmerTL.to(
                    bulbSVG,
                    DURATIONS.wireCharging,
                    { scale: 0, autoAlpha: 1}
                );
                
                return bulbGlimmerTL;
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
                    flickerToFullTL = new TimelineMax(),                
                    
                    illuminateBulb = () => {                
                        
                        
                    };
                
                
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
                masterTL.add(glimmerBulb(), LABELS.phaseWireIsCharging);
                //masterTL.add(flickerToFullCharge(), LABELS.phaseFullChargeReached);
                //masterTL.add(illuminateBulb(), LABELS.phaseFullChargeReached + '+=0.18');
                //masterTL.add(flickerBulbAtRandom(), LABELS.phaseBulbOnAndFlickering);
                

            };

        masterTL = new TimelineMax();
        letThereBeLight();
    };
        
        
    return init;
};


export default lightbulb;