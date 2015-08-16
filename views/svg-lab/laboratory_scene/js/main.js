var app = (function (exports) {

    
    var 
        SELECTORS = {            
            mainSVG: '#lab-svg',            
            Brian: '#Brian',
            BrianSmile: '#Smile',
            titleElem: '.lab__title',
            stageSVG: '#Stage',
            stageMask: '#StageClipMask',
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
            elementScaling: 0.3,
            fadeInOrOut: 0.5,
            slideElemsInOrOut: 0.8,
            brianSmile: 0.33
        },
        
        EASINGS = {
            default: Power4.easeInOut,
            elementScaling: Power4.easeInOut,
            slideInOrOut: Power4.easeInOut,            
            fadeInOrOut: Power3.easeOut
        },
        
        COLORS = {
            machine: {
                background: '#c6d7df',
                raisedGroves: '#7c99a2'
            }
        },
        
        LABELS = {
            sceneIntro: 'scene-intro'
        },
        
        
        mainSVG = document.querySelector(SELECTORS.mainSVG),
        BrianSVG = mainSVG.querySelector(SELECTORS.Brian),
        BrianSmileSVG = mainSVG.querySelector(SELECTORS.BrianSmile),
        mainTitleElem = document.querySelector(SELECTORS.titleElem),
        coinSVG = mainSVG.querySelector(SELECTORS.coinSVG),
        stageSVG = mainSVG.querySelector(SELECTORS.stageSVG),
        stageMask = mainSVG.querySelector(SELECTORS.stageMask),
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
        
        
        introTL,
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
        clearTL.set(liquidSVGs, { stroke: '#FFFFFF' });        
        
        removeLiquidsFromFlasks(clearTL); 

        // Move Brian to the right
        clearTL.set(BrianSVG, { x: '1400%', autoAlpha: 1, scale: 2.5, transformOrigin: '50% 50%' });
        
        // Give the stage some transparency and set the clipping mask over it
        clearTL.set(stageSVG, {autoAlpha: 0.5});
        clearTL.set(stageMask, {x: 932});
                        
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
    
    
    function animateInBrian () {        
        return TweenMax.to(
            BrianSVG,
            DURATIONS.slideElemsInOrOut,
            { x: '1000%', ease: EASINGS.slideInOrOut }
        );        
    }
    function slideInTitle () {
        return TweenMax.to(
            mainTitleElem,
            DURATIONS.fadeInOrOut,
            {autoAlpha: 1, ease: EASINGS.fadeInOrOut}
        );
    }
    function makeBrianSmile () {
        return TweenMax.fromTo(
            BrianSmileSVG,
            DURATIONS.brianSmile,
            { scale: 0.4, transformOrigin: '50% 50%' },
            { scale: 1, ease: EASINGS.default }
        );
    }
    
    
    
    
    function introduceScene () {
        
        introTL = new TimelineMax();  
        
        var brianAnim = animateInBrian();
        
        introTL.add(brianAnim);
        introTL.add(slideInTitle(), '-=' + brianAnim.duration() / 2);
        introTL.add(makeBrianSmile(), '+0.8');
                
        return introTL;        
    }
    
    function init () {        
        masterTL = new TimelineMax();        
        masterTL.add(clearStage());
        masterTL.add(introduceScene(), LABELS.sceneIntro);
    }
    
    return {
        init: init
    };
    
} (window));



window.addEventListener('DOMContentLoaded', app.init, false);