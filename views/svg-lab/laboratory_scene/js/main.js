var app = (function (exports) {

    
    var 
        SELECTORS = {
            mainSVG: '#lab-svg',
            coinSVG: '#Coin',
            mainBulbSVG: '#MainBulb',
            ideaBulbSVG: '#BulbIdea',
            liquidSVGs: '.liquid',
            liquidMasks: '.liquid-mask',
            liquidMaskDefs: '.liquid-mask__def',
            generatorBulbInner: '.generator__bulb-inner',
            genProgressMeterBkg: '#GeneratorMeterBackground',            
            genProgressMeterTrack: '#GeneratorMeterTrack',
            genProgressMeterSlider: '#GeneratorMeterSlider',
            genEnergyMeter: '#GeneratorEnergyMeter',
            genStatusLights: '.generator__status-light',
            printerLights: '.printer__light',
            printerPaper: '#PrinterPaper',
            mainStatusLight: '#MainStatusLight'
        },
        
        DURATIONS = {
            elementScaling: 0.3
        },
        
        EASINGS = {
            elementScaling: Power4.easeInOut
        },
        
        COLORS = {
            machine: {
                background: '#c6d7df',
                raisedGroves: '#7c99a2'
            }
        },
        
        mainSVG = document.querySelector(SELECTORS.mainSVG),
        coinSVG = mainSVG.querySelector(SELECTORS.coinSVG),
        mainBulbSVG = mainSVG.querySelector(SELECTORS.mainBulbSVG),
        ideaBulbSVG = mainSVG.querySelector(SELECTORS.ideaBulbSVG),
        liquidSVGs = mainSVG.querySelectorAll(SELECTORS.liquidSVGs),
        liquidMasks = mainSVG.querySelectorAll(SELECTORS.liquidMasks),
        liquidMaskDefs = mainSVG.querySelectorAll(SELECTORS.liquidMaskDefs),
        //liquid1MaskDef = mainSVG.querySelector(SELECTORS.liquidMaskDefs + '-1'),
        generatorBulbInnerSVGs = mainSVG.querySelectorAll(SELECTORS.generatorBulbInner),
        generatorProgressMeterBkgSVG = mainSVG.querySelector(SELECTORS.genProgressMeterBkg),
        generatorProgressMeterTrackSVG = mainSVG.querySelector(SELECTORS.genProgressMeterTrack),
        generatorProgressMeterSliderSVG = mainSVG.querySelector(SELECTORS.genProgressMeterSlider),
        generatorEnergyMeterSVG = mainSVG.querySelector(SELECTORS.genEnergyMeter),
        generatorStatusLightSVGs = mainSVG.querySelectorAll(SELECTORS.genStatusLights),
        printerLightSVGs = mainSVG.querySelectorAll(SELECTORS.printerLights),
        mainStatusLightSVG = mainSVG.querySelector(SELECTORS.mainStatusLight),
        printerPaperSVG = mainSVG.querySelector(SELECTORS.printerPaper),
        
        
        clearTL,
        masterTL;
    
    
    /**
     * Helper to remove the liquid from each flask by tweening the clipping-path <defs> that each 
     * liquid mask path is using. 
     */
    function removeLiquidsFromFlasks(tl) {
        
        var liquidMaskDef,
            yPosToSet;
        for (var i = 0; i < liquidMaskDefs.length; i++) {
            liquidMaskDef = liquidMaskDefs.item(i);
            yPosToSet = Number(liquidMaskDef.getAttribute('y')) + Number(liquidMaskDef.getAttribute('height'));
            tl.set(liquidMaskDef, {attr: { y: yPosToSet } });
        }
    }
    
    
    
    /**
     * Establish and set "resets" for the elements that we'll be animating
     */
    function clearStage () {
        
        clearTL = new TimelineMax();
        
        // Scale down the coin and move it behind the head (PRO TIP: take measurements with Pixel Winch)
        clearTL.set(
            coinSVG, 
            { 
                scale: 0.5, 
                transformOrigin: '50% 50%',
                x: -80,
                y: 124
            }
        );
        
        clearTL.set(mainBulbSVG, { fill: '#FFFFFF' });
        clearTL.set(ideaBulbSVG, { display: 'none' });  // FIXME: Figure out what this is
        
        clearTL.set(liquidSVGs, { stroke: '#FFFFFF' });        
        removeLiquidsFromFlasks(clearTL); 
                        
        clearTL.set(generatorBulbInnerSVGs, {fill: '#FFFFFF'});        
        clearTL.set(generatorProgressMeterTrackSVG, { stroke: COLORS.machine.raisedGroves });
        
        clearTL.set(
            [
                generatorProgressMeterBkgSVG,
                generatorEnergyMeterSVG,
                generatorStatusLightSVGs,
                printerLightSVGs,
                mainStatusLightSVG
            ],
            { fill: COLORS.machine.background } 
        );
        
        // Set paper to the top of the printer
        clearTL.set(printerPaperSVG, {y: '+=55'});
        
        // Set the generator's progress slider to its starting position
        clearTL.set(generatorProgressMeterSliderSVG, {x: '-=27'});
            
                            
        return clearTL;
    }
    
    
    function init () {
        
        masterTL = new TimelineMax();        
        masterTL.add(clearStage());
    }
    
    return {
        init: init
    };
    
} (window));



window.addEventListener('DOMContentLoaded', app.init, false);