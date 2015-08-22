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
            ideaBulbLight: '#BulbIdeaLight',
            liquidSVGs: '.liquid',
            liquidMasks: '.liquid-mask',
            liquidMaskDefs: '.liquid-mask__def',
            openingTubeSVG: '#OpeningTube',
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
            flashOut: 0.25,
            slideElemsInOrOut: 0.8,
            brianSmile: 0.33,
            brianZoomOut: 1,
            stageReveal: 1,
            colorChange: 0.5,
            bulbFlickering: 2.4,
            coinToss: 6.0,
            machineShakeIteration: 0.06
            
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
            sceneIdea: 'scene-idea',
            brianHasAppeared: 'brian-has-appeared',
            brianIsSmiling: 'brian-is-smiling',            
            titleShiftingUp: 'title-shifing-up',
            titleTextHasChanged: 'title-text-has-changed',
            coinLandedInMachine: 'coin-landed-in-machine'
        },
        
        CLASSES = {
            bulbFlickeringYellow: 'is-flickering--yellow',
            bulbFlickeringGreen: 'is-flickering--green',
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
        ideaBulbLight = mainSVG.querySelector(SELECTORS.ideaBulbLight),
        liquidSVGs = mainSVG.querySelectorAll(SELECTORS.liquidSVGs),
        liquidMasks = mainSVG.querySelectorAll(SELECTORS.liquidMasks),
        liquidMaskDefs = mainSVG.querySelectorAll(SELECTORS.liquidMaskDefs),
        openingTubeSVG = mainSVG.querySelector(SELECTORS.openingTubeSVG),
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
        introTL,
        ideaTL,
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
        
        // Scale down the coin and the idea bulb and move them behind the 
        // head (PRO TIP: take measurements with Pixel Winch)
        clearTL.set(
            coinSVG, 
            ideaBulbSVG,
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
    
    
    /**
     * fade text out, lift it up, change it to the new text, then drop it back down to its 
     * original position
     */
    function changeTitleText(tl, opts) {                
        
        opts = opts || {};
                        
        var 
            yDistUp = opts.yDistUp || 30,
            yDistDown1 = opts.yDistDown1 || 20,
            yDistDown2 = opts.yDistDown2 || 20,
            newText = opts.newText || '',
            labelIn = opts.labelIn,
            labelOut = opts.labelOut;
        
        debugger;
        
        tl.to(mainTitleElem, DURATIONS.fadeInOrOut, {autoAlpha: 0, y: '+=' + yDistDown1, ease: EASINGS.fadeInOrOut}, labelOut);
        tl.set(mainTitleElem, { y: '-=' + yDistUp, text: newText });
        tl.to(mainTitleElem, DURATIONS.fadeInOrOut, {autoAlpha: 1, y: '+=' + yDistDown2, ease: EASINGS.fadeInOrOut}, labelIn);      
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
        introTL.addLabel(LABELS.brianHasAppeared);
        
        changeTitleText(introTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'I\'m Brian',
            labelOut: LABELS.brianHasAppeared + '+=0.8',
            labelIn: LABELS.brianHasAppeared + '+=' + ( 0.8 + Number(DURATIONS.fadeInOrOut) )
        });
        introTL.add(makeBrianSmile(), LABELS.brianHasAppeared + '+=' + ( 0.8 + Number(DURATIONS.fadeInOrOut) ) );
        introTL.add(LABELS.brianIsSmiling);
        
        
        introTL.add(animateBrianToOriginalPosition(), LABELS.brianIsSmiling + '+=1');                
        introTL.add(unfurlMainStageMask(), LABELS.brianIsSmiling + '+=1');
        introTL.add(shiftBackgroundColorToPrimary(), LABELS.brianIsSmiling + '+=1');
        
        changeTitleText(introTL, {
            yDistUp: 100,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'Welcome to my Animation Laboratory', 
            labelOut: LABELS.brianIsSmiling + '+=1', 
            labelIn: LABELS.titleTextHasChanged
        });
        
        
//        introTL.set(mainTitleElem, {y: '-=100px', text: 'Welcome to my Animation Laboratory'});
//        introTL.addLabel(LABELS.titleTextHasChanged);
                 
        
//        introTL.to(
//            mainTitleElem, 
//            DURATIONS.fadeInOrOut, 
//            { autoAlpha: 1, y: '+=20px', ease: EASINGS.fadeInOrOut }, 
//            LABELS.titleTextHasChanged
//        );
//        
//        introTL.to(
//            mainTitleElem, 
//            DURATIONS.fadeInOrOut, 
//            { autoAlpha: 0, y: '+=10px', ease: EASINGS.fadeInOrOut },
//            '+=2.5'
//        );
        
//        introTL.set(mainTitleElem, {y: '-=30px', text: 'Let\'s have some fun!' });
//        introTL.to(mainTitleElem, DURATIONS.fadeInOrOut, { autoAlpha: 1, y: '+=20', ease: EASINGS.fadeInOrOut });
        
        changeTitleText(introTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'Let\'s have some fun!', 
            labelOut: '+=2.5'
        });
        introTL.to(mainTitleElem, DURATIONS.fadeInOrOut, { autoAlpha: 0, y: '+=10', ease: EASINGS.fadeInOrOut }, '+=2.5');
        
        introTL.to(stageSVG, DURATIONS.fadeInOrOut, {autoAlpha: 1, ease: Power0.none }, '-=' + DURATIONS.fadeInOrOut);            
                
        return introTL;        
    }
    
    


    function conjureUpIdea () {
        
        ideaTL = new TimelineMax();
        
        function showIdeaBulb () {
            return TweenMax.to(
                ideaBulbSVG,
                DURATIONS.fadeInOrOut,
                {y: '-=20px', scale: 1, autoAlpha: 1, ease: Bounce.easeOut }
            );
        }
            
        function popBulbBehindHead () {
            ideaTL.to(
                ideaBulbSVG,
                DURATIONS.elementRepositioning,
                { y: '-=20', scale: 1.1, transformOrigin: 'center bottom', ease: EASINGS.default },
                '+=' + Number(DURATIONS.bulbFlickering + 0.3)
            );
            ideaTL.to(
                ideaBulbSVG,
                DURATIONS.flashOut,
                { y: '+=125', scale: 0.8, ease: Back.easeIn }
            );
        }
        
        function tossCoinIntoMachine () {
                        
            var tossPath = [
                { x: -90, y: 120 },
                { x: -45, y: -220 },
                { x: 0, y: 120 }
            ];
            
            ideaTL.set(coinSVG, { autoAlpha: 1, scale: 0.5 }, '+=0.3');
            
            ideaTL.to(
                coinSVG,
                DURATIONS.coinToss,
                {
                    rotation: 720, 
                    bezier: {
                        type: 'thru',
                        curviness: 0.3,
                        values: tossPath                        
                    },                    
                    ease: SlowMo.ease.config(0.9, 0.7, false)
                }
            );            
            ideaTL.set(coinSVG, {autoAlpha: 0});
        }
        
        function shakeMachineOpening () {
            ideaTL.to(
                openingTubeSVG,
                DURATIONS.machineShakeIteration,
                { rotation: 5, y: '+=5px', x: '+=3px', transformOrigin: 'bottom right', repeat: 5, yoyo: true }
            );            
        }
        
        
        ideaTL.add(showIdeaBulb());
        
        // Set class to activate flicker CSS animation
        ideaTL.set(ideaBulbLight, {className: '+=' + CLASSES.bulbFlickeringYellow});
        
        changeTitleText(ideaTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'We\'ll take ideas...'
        });
        
        changeTitleText(ideaTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'And make something awesome!', 
            labelOut: '+=2.0'
        });
        
        ideaTL.set(ideaBulbLight, {className: '-=' + CLASSES.bulbFlickeringYellow});
        ideaTL.set(ideaBulbLight, {className: '+=' + CLASSES.bulbFlickeringGreen});
        
        popBulbBehindHead();
        tossCoinIntoMachine();
        ideaTL.addLabel(LABELS.coinLandedInMachine);
        
        changeTitleText(ideaTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'Just add JavaScript!',
            labelOut: '-=' + (DURATIONS.coinToss * 0.91667),
            labelIn: '-=' + ( (DURATIONS.coinToss * 0.5833))
        });
        
        ideaTL.to(
            mainTitleElem,
            DURATIONS.fadeInOrOut,
            {y: '+=20', autoAlpha: 0, ease: EASINGS.default },
            LABELS.coinLandedInMachine + '-=' + (DURATIONS.coinToss * 0.2)
        );
        
        shakeMachineOpening();
        
        return ideaTL;
    }
    
    
    function init () {        
        masterTL = new TimelineMax();        
        masterTL.add(clearStage());
        masterTL.add(introduceScene(), LABELS.sceneIntro);
        masterTL.add(conjureUpIdea(), LABELS.sceneIdea);
    }
    
    return {
        init: init
    };
    
} (window));



window.addEventListener('DOMContentLoaded', app.init, false);