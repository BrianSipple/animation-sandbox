var app = (function (exports) {

    
    var 
        SELECTORS = {           
            mainSceneContainer: '.lab',
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
            elementRepositioning: 0.45,
            fadeInOrOut: 0.5,
            slideElemsInOrOut: 0.8,
            brianSmile: 0.33,
            brianZoomOut: 1,
            stageReveal: 1,
            colorChange: 0.5
        },
        
        EASINGS = {
            default: Power4.easeInOut,
            elementScaling: Power4.easeInOut,
            slideInOrOut: Power4.easeInOut,            
            fadeInOrOut: Power3.easeOut,
            colorChange: Power0.easeNone
        },
        
        COLORS = {
            background: '#7dcfdd',
            machine: {
                background: '#c6d7df',
                raisedGroves: '#7c99a2'
            }
        },
        
        LABELS = {
            sceneIntro: 'scene-intro',
            brianHasAppeared: 'brian-has-appeared',
            titleShiftingUp: 'title-shifing-up',
            titleTextHasChanged: 'title-text-has-changed'
        },
        
        mainSceneContainer = document.querySelector(SELECTORS.mainSceneContainer),
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
    function animateBrianToOriginalPosition () {
        return TweenMax.to(
            BrianSVG,
            DURATIONS.brianZoomOut,
            {x: '0%', scale: 1, ease: EASINGS.default}
        );
    }
    
    function fadeOutTitleText () {
        return TweenMax.to(mainTitleElem, DURATIONS.fadeInOrOut, { autoAlpha: 0 });
    }
    
    function shiftBackgroundColorToPrimary () {
        return TweenMax.to(
            mainSceneContainer, 
            DURATIONS.colorChange, 
            { backgroundColor: COLORS.background, ease: EASINGS.colorChange }
        );
    }
    
    function unfurlMainStageMask () {
        return TweenMax.to(
            stageMask,
            DURATIONS.stageReveal,
            {x: '0%', ease: EASINGS.default}
        );
    }    
                
    function introduceScene () {
        
        introTL = new TimelineMax();  
        
        var brianAnim = animateInBrian();
        
        introTL.add(brianAnim);
        introTL.add(slideInTitle(), '-=' + brianAnim.duration() / 2);
        introTL.add(makeBrianSmile(), '+0.8');
        introTL.add(LABELS.brianHasAppeared);
        
        
        introTL.add(animateBrianToOriginalPosition(), LABELS.brianHasAppeared + '+=1');        
        introTL.add(fadeOutTitleText(), LABELS.brianHasAppeared + '+=1')
        introTL.add(unfurlMainStageMask(), LABELS.brianHasAppeared + '+=1');
        introTL.add(shiftBackgroundColorToPrimary(), LABELS.brianHasAppeared + '+=1');
        
        
        introTL.set(mainTitleElem, {y: '-=100px', text: 'Welcome to my Animation Laboratory'});
        introTL.addLabel(LABELS.titleTextHasChanged);
                 
        
        introTL.to(
            mainTitleElem, 
            DURATIONS.fadeInOrOut, 
            { autoAlpha: 1, y: '+=20px', ease: EASINGS.fadeInOrOut }, 
            LABELS.titleTextHasChanged
        );
        
        introTL.to(
            mainTitleElem, 
            DURATIONS.fadeInOrOut, 
            { autoAlpha: 0, y: '+=10px', ease: EASINGS.fadeInOrOut },
            '+=2.5'
        );
        
        introTL.set(mainTitleElem, {y: '-=30px', text: 'Let\'s have some fun!' });
        introTL.to(mainTitleElem, DURATIONS.fadeInOrOut, { autoAlpha: 1, y: '+=20', ease: EASINGS.fadeInOrOut });
        introTL.to(mainTitleElem, DURATIONS.fadeInOrOut, { autoAlpha: 0, y: '+=10', ease: EASINGS.fadeInOrOut }, '+=2.5');
        
        introTL.to(stageSVG, DURATIONS.fadeInOrOut, {autoAlpha: 1, ease: Power0.none }, '-=' + DURATIONS.fadeInOrOut);
        
        
                
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