var SeaCreatures = (function (exports) {
    
    'use strict';
    
    var 
        SELECTORS = {
            
        },
        

        
        LABELS = {            
            phaseGlowfishIn: 'phase__glowfishSwimingIn',
            phaseAnglerFlicker: 'phase__angler-flicker',
            phaseGlowFishInspecting: 'phase__glowfish-inspecting',
            phaseAnglerIlluminated: 'phase__angler-illuminated',
            phaseGlowfishSwimmingAway: 'phase__swimming-away',
            phaseAnglerBeginningPursuit: 'phase__beginning-pursuit'
        },
        
        DURATIONS = {
            base: {
                scaleElement: 0.3,
                bumpElement: 0.5,
                fadeInOrOut: 0.5,
                changeColor: 0.5,
                flashOut: 0.25,
                lightFlip: 0.1,
                slideElementInOrOut: 0.8
            },
            
            scene: {                          
                swimGlowfishIn: 2.83,
                bulbFlickering: 2.4,
                glowFishInvestigating: 1.4,
                anglerFishIlluminating: 0.9,
                glowFishScared: 1.0,
                glowFishSwimOut: 0.64,
                anglerPursuit: 0.87                
            }
            
        },
        
        EASINGS = {
            default: Power4.easeInOut,
            scaleElement: Power4.easeInOut,
            slideInOrOut: Power4.easeInOut,            
            fadeInOrOut: Power3.easeOut,
            changeColor: Power0.easeNone
        },
        
    
        mainSceneContainer = document.querySelector(SELECTORS.mainSceneContainer),
        
        
        sceneSetupTL,
        glowFishInTL,
        masterTL;
    
    
    function startScene () {
               
        masterTL = new TimelineMax(); 
        masterTL.add(setUpScene());
        masterTL.add(swimGlowFishIn(), LABELS.phaseGlowfishIn);
        masterTL.add(flickerAnglerFishEsca(), LABELS.phaseAnglerFlicker);
        masterTL.add(swimGlowFishCloserToInspect(), LABELS.phaseGlowFishInspecting);
        masterTL.add(illuminateAnglerFish(), LABELS.phaseAnglerIlluminated);
        masterTL.add(freakOutGlowfish(), LABELS.phaseAnglerIlluminated + '+=0.71');
        masterTL.add(swimAwayGlowFish(), LABELS.phaseGlowfishSwimmingAway);
        masterTL.add(beginPursuit(), '+=0.5', LABELS.phaseAnglerBeginningPursuit);  
    }
    
    function init () {
        
        createFloatingParticles();
        startScene();          
    }
    
    return {
        init: init 
    };
    
}(window));


window.addEventListener('DOMContentLoaded', SeaCreatures.init, false);