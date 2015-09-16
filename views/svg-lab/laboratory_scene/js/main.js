var app = (function (exports) {


    var
    SELECTORS = {
        mainSceneContainer: '.lab',
        mainSVG: '#lab-svg',
        Brian: '#Brian',
        BrianSmile: '#Smile',
        titleElem: '#TitleText text',
        stageSVG: '#Stage',
        stageMask: '#StageClipMask',
        coinSVG: '#Coin',
        mainBulbSVG: '#MainBulb',
        ideaBulbSVG: '#BulbIdea',
        ideaBulbLight: '#BulbIdeaLight',
        liquidSVG: '.liquid',
        liquidSVG__prefix: '#Liquid', // unique number is applied to the end of the id
        liquidMasks: '.liquid-mask',
        liquidMaskDefs: '.liquid-mask__def',
        openingTubeSVG: '#OpeningTube',
        genBulbInner: '.generator__bulb-inner',
        genProgressMeterBkg: '#GeneratorMeterBackground',
        genProgressMeterTrack: '#GeneratorMeterTrack',
        genProgressMeterSlider: '#GeneratorMeterSlider',
        genPointer: '#GeneratorPointer',
        genEnergyMeterBkg: '#GeneratorEnergyMeterBkg',
        genEnergyMeterLine: '#GeneratorEnergyMeterLine',
        genStatusLights: '.generator__status-light',
        printerLights: '.printer__light',
        printerPaper: '#PrinterPaper',
        mainStatusLight: '#MainStatusLight'
    },

    DURATIONS = {
        elementScaling: 0.3,
        bumpElement: 0.6,
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
        lightFlip: 0.1,
        machineShakeIteration: 0.06,
        tubeFill: 1.8

    },

    EASINGS = {
        default: Power4.easeInOut,
        elementScaling: Power4.easeInOut,
        slideInOrOut: Power4.easeInOut,
        fadeInOrOut: Power3.easeOut,
        colorChange: Power0.easeNone,
        tubeFill: Power0.easeNone
    },

    COLORS = {
        background: '#7dcfdd',
        machine: {
            background: '#c6d7df',
            raisedGroves: '#7c99a2'
        },
        generator: {
            indicatorPhases: [
                '#F8876E', // red
                '#F8AD43', // golden yellow
                '#5AB783'  // green
            ],
            energyMeter: {
                background: '#5AB783',
                line: '#448962'
            },
            bulbSet: [
                '#F8876E', // red
                '#F8AD43', // golden yellow
                '#5AB783'  // green
            ]
        },
        tubeLiquid: '#F8876E'
    },

    LABELS = {
        sceneIntro: 'scene__intro',
        sceneIdeaHad: 'scene__idea',
        sceneMachineStarted: 'scene__machine-start',
        sceneTubesFilled: 'scene__tubes-filled',

        brianHasAppeared: 'brian-has-appeared',
        brianIsSmiling: 'brian-is-smiling',
        titleShiftingUp: 'title-shifing-up',
        titleTextHasChanged: 'title-text-has-changed',
        coinTossStarting: 'coin-toss-starting',
        coinLandedInMachine: 'coin-landed-in-machine',
        generatorIsRunning: 'generator-is-running',

        fillFlask1: 'fill-flask-1',
        fillFlask2: 'fill-flask-2',
        fillFlask3: 'fill-flask-3',
        fillFlask4: 'fill-flask-4',
        fillFlask5: 'fill-flask-5'

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
    liquidSVGs = mainSVG.querySelectorAll(SELECTORS.liquidSVG),
    liquidMasks = mainSVG.querySelectorAll(SELECTORS.liquidMasks),
    liquidMaskDefs = mainSVG.querySelectorAll(SELECTORS.liquidMaskDefs),
    openingTubeSVG = mainSVG.querySelector(SELECTORS.openingTubeSVG),
    //liquid1MaskDef = mainSVG.querySelector(SELECTORS.liquidMaskDefs + '-1'),
    genBulbInnerSVGs = mainSVG.querySelectorAll(SELECTORS.genBulbInner),
    genProgressMeterBkgSVG = mainSVG.querySelector(SELECTORS.genProgressMeterBkg),
    genProgressMeterTrackSVG = mainSVG.querySelector(SELECTORS.genProgressMeterTrack),
    genProgressMeterSliderSVG = mainSVG.querySelector(SELECTORS.genProgressMeterSlider),
    genEnergyMeterBkgSVG = mainSVG.querySelector(SELECTORS.genEnergyMeterBkg),
    genEnergyMeterLineSVG = mainSVG.querySelector(SELECTORS.genEnergyMeterLine),
    genPointerSVG = mainSVG.querySelector(SELECTORS.genPointer),
    genStatusLightSVGs = mainSVG.querySelectorAll(SELECTORS.genStatusLights),
    printerLightSVGs = mainSVG.querySelectorAll(SELECTORS.printerLights),
    mainStatusLightSVG = mainSVG.querySelector(SELECTORS.mainStatusLight),
    printerPaperSVG = mainSVG.querySelector(SELECTORS.printerPaper),

    flaskLiquidMaskDefs = {
        flask1: mainSVG.querySelector('#liquid-clip--liquid-1')
    },


    clearTL,
    introTL,
    ideaTL,
    machineStartTL,
    masterTL;

    /**
    * Helper to remove the liquid from each flask by tweening the clipping-path <defs> that each
    * liquid mask path is using.
    */
    function removeLiquidsFromFlasks(tl) {

        var
            liquidMaskDef,
            yPosToSet;

        // for (var i = 0; i < liquidMaskDefs.length; i++) {
        //     liquidMaskDef = liquidMaskDefs.item(i);
        //     yPosToSet = Number(liquidMaskDef.getAttribute('y')) + Number(liquidMaskDef.getAttribute('height'));
        //     tl.set(liquidMaskDef, {attr: { y: yPosToSet } });
        // }

        for (var flask of flaskLiquidMaskDefs) {
            if (flaskLiquidMaskDefs.hasOwnProperty(flask)) {
                liquidMaskDef = flaskLiquidMaskDefs[flask];
                yPosToSet = Number(liquidMaskDef.getAttribute('y')) + Number(liquidMaskDef.getAttribute('height'));
                tl.set(liquidMaskDef, {attr: { y: yPosToSet } });
            }
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

        clearTL.set(genBulbInnerSVGs, {fill: '#FFFFFF'});
        clearTL.set(genProgressMeterTrackSVG, { stroke: COLORS.machine.raisedGroves });

        clearTL.set(
            [
                genProgressMeterBkgSVG,
                genEnergyMeterBkgSVG,
                genStatusLightSVGs,
                printerLightSVGs,
                mainStatusLightSVG
            ],
            { fill: COLORS.machine.background }
        );

        // Set paper to the top of the printer
        clearTL.set(printerPaperSVG, {y: '+=55'});

        // Set the generator's progress slider to its starting position
        clearTL.set(genProgressMeterSliderSVG, {x: '-=27'});

        // Set the generator pointer to left-most point on its axis
        clearTL.set(genPointerSVG, {rotation: -45, transformOrigin: 'bottom center' });

        return clearTL;
    }


    /**
    * fade text out, lift it up, change it to the new text, then drop it back down to its
    * original position
    */
    function changeTitleText(tl, opts) {

        opts = opts || {};

        var
        yDistUp = opts.yDistUp || 40,
        yDistDown1 = opts.yDistDown1 || 20,
        yDistDown2 = opts.yDistDown2 || 20,
        newText = opts.newText || '',
        labelOut = opts.labelOut || null,
        labelIn = opts.labelIn || '+=1';

        tl.to(mainTitleElem, DURATIONS.fadeInOrOut, {autoAlpha: 0, y: '+=' + yDistDown1, ease: EASINGS.fadeInOrOut}, labelOut);
        tl.set(mainTitleElem, { y: '-=' + yDistUp, text: newText, immediateRender: false }, '+=0.2');
        tl.to(mainTitleElem, DURATIONS.fadeInOrOut, {autoAlpha: 1, y: '+=' + yDistDown2, ease: EASINGS.fadeInOrOut}, labelIn);
    }



    function introduceScene () {

        introTL = new TimelineMax();

        var
        animateInBrian = function animateInBrian () {
            return TweenMax.to(
                BrianSVG,
                DURATIONS.slideElemsInOrOut,
                { x: '1000%', ease: EASINGS.slideInOrOut }
            );
        },

        slideInTitle = function slideInTitle () {
            return TweenMax.to(
                mainTitleElem,
                DURATIONS.fadeInOrOut,
                {autoAlpha: 1, ease: EASINGS.fadeInOrOut}
            );
        },

        makeBrianSmile = function makeBrianSmile () {
            return TweenMax.fromTo(
                BrianSmileSVG,
                DURATIONS.brianSmile,
                { scale: 0.4, transformOrigin: '50% 50%' },
                { scale: 1, ease: EASINGS.default }
            );
        },

        animateBrianToOriginalPosition = function animateBrianToOriginalPosition () {
            return TweenMax.to(
                BrianSVG,
                DURATIONS.brianZoomOut,
                {x: '0%', scale: 1, ease: EASINGS.default}
            );
        },

        fadeOutTitleText = function fadeOutTitleText () {
            return TweenMax.to(mainTitleElem, DURATIONS.fadeInOrOut, { autoAlpha: 0 });
        },

        shiftBackgroundColorToPrimary = function shiftBackgroundColorToPrimary () {
            return TweenMax.to(
                mainSceneContainer,
                DURATIONS.colorChange,
                { backgroundColor: COLORS.background, ease: EASINGS.colorChange }
            );
        },

        unfurlMainStageMask = function unfurlMainStageMask () {
            return TweenMax.to(
                stageMask,
                DURATIONS.stageReveal,
                {x: '0%', ease: EASINGS.default}
            );
        },

        brianAnim = animateInBrian();

        introTL.add(brianAnim);
        //introTL.add(slideInTitle(), '-=' + brianAnim.duration() / 2);
        introTL.addLabel(LABELS.brianHasAppeared);

        changeTitleText(introTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'I\'m Brian',
            labelOut: LABELS.brianHasAppeared + '+=0.8',
            labelIn: LABELS.brianHasAppeared + '+=' + ( 0.8 + 0.3 + Number(DURATIONS.fadeInOrOut) )
        });
        introTL.add(makeBrianSmile(), LABELS.brianHasAppeared + '+=' + ( 0.8 + 0.3 + Number(DURATIONS.fadeInOrOut) ) );
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

            ideaTL.set(coinSVG, { autoAlpha: 1, scale: 0.5, immediateRender: false });

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
        ideaTL.addLabel(LABELS.coinTossStarting);
        tossCoinIntoMachine();
        ideaTL.addLabel(LABELS.coinLandedInMachine);

        changeTitleText(ideaTL, {
            yDistUp: 30,
            yDistDown1: 10,
            yDistDown2: 20,
            newText: 'Just add JavaScript!',
            labelOut: LABELS.coinTossStarting,
            labelIn: LABELS.coinTossStarting + '+=' + Number(DURATIONS.coinToss * 0.3833)

        });

        shakeMachineOpening();

        return ideaTL;
    }

    function startMachine () {
        machineStartTL = new TimelineMax();

        function flickMeter () {
            machineStartTL.to(
                genPointerSVG,
                DURATIONS.bumpElement * 3.5,
                {rotation: 20, ease: EASINGS.default}
            );
        }

        function activateGeneratorStatusLights () {

            var currentLabelOffset = 0;
            COLORS.generator.indicatorPhases.forEach(function (color, idx) {

                machineStartTL.staggerTo(
                    genStatusLightSVGs,
                    DURATIONS.lightFlip,
                    {fill: color},
                    LABELS.generatorIsRunning + '+=' + currentLabelOffset
                );

                currentLabelOffset += 0.5;
            });
        }

        function activateGeneratorMeters (label) {
            machineStartTL.to(
                genEnergyMeterBkgSVG,
                DURATIONS.colorChange,
                { fill: COLORS.generator.energyMeter.background },
                LABELS.generatorIsRunning + '+=1.2'
            );
            machineStartTL.to(
                genEnergyMeterLineSVG,
                DURATIONS.colorChange,
                { stroke: COLORS.generator.energyMeter.line },
                LABELS.generatorIsRunning + '+=1.2'
            );
            machineStartTL.to(
                genProgressMeterSliderSVG,
                DURATIONS.bumpElement * 2,
                { x: '-10px', ease: EASINGS.default },
                LABELS.generatorIsRunning + '+=1.4'
            );
        }

        function activateGeneratorBulbs (label) {

            var currentLabelOffset = 2.6;
            [].forEach.call(genBulbInnerSVGs, function (bulbSVG, idx) {

                machineStartTL.to(
                    bulbSVG,
                    DURATIONS.colorChange,
                    { fill: COLORS.generator.bulbSet[idx], ease: EASINGS.colorChange },
                    LABELS.generatorIsRunning + '+=' + currentLabelOffset
                );

                currentLabelOffset += DURATIONS.colorChange;

            });
        }

        machineStartTL.addLabel(LABELS.generatorIsRunning);
        flickMeter();
        activateGeneratorStatusLights();
        activateGeneratorMeters();
        activateGeneratorBulbs();

        return machineStartTL;
    }

    function fillMachineTubes () {

        var
        fillTubesTL = new TimelineMax(),
        currentTubeLength,

        // Get a list of the liquid SVGs ordered by the number attached
        // to their id.
        orderedLiquidSVGs = [].slice.call(liquidSVGs).sort(
            function sortLiquids(el1, el2) {
                return (
                    parseInt( el1.id.slice( el1.id.search( /[0-9]/ ) ) ) -
                    parseInt( el2.id.slice(el2.id.search( /[0-9]/ ) ) )
                );
            }
        ),

        fillStepLabels = [
            'and SVG',
            '...and a tween',
            '...or two',
            'and maybe a few more',
            'Mixin a timeline',
            'Draw up some easing functions',
            'Wire up our DOM nodes',
            'Now we\'re ready for the world'
        ],

        flasksMasksToFillOnIter = {
            0: flaskLiquidMaskDefs.flask1,
            1: flaskLiquidMaskDefs.flask2,
            2: flaskLiquidMaskDefs.flask3,
            3: flaskLiquidMaskDefs.flask4,
            5: flaskLiquidMaskDefs.flask5,
            6: flaskLiquidMaskDefs.flask6,
            7: flaskLiquidMaskDefs.flask7,
            8: flaskLiquidMaskDefs.primaryFlask,
        },

        fillIterationLabel,


        fillFlasksWhenReached = function fillFlasksWhenReached (flaskMaskDef) {
            debugger;
            var yDistToSlideUp = flaskMaskDef.getAttribute('y') + flaskMaskDef.getAttribute('height');

            fillTubesTL.to(
                flaskMaskDef,
                DURATIONS.fillFlask,
                { attr: { y: '-=' yDistToSlideUp }, ease: EASINGS.tubeFill }
            );
        },

        drawTube = function drawTube(tubeSVG, duration, liquidLength, flaskMaskDef) {
            TweenMax.set(
                tubeSVG,
                { strokeDasharray: liquidLength, strokeDashoffset: liquidLength }
            );

            fillTubesTL.set(
                liquidSVGs,
                { stroke: COLORS.tubeLiquid }
            );
            fillTubesTL.to(
                tubeSVG,
                duration,
                {
                    strokeDashoffset: 0,
                    ease: EASINGS.tubeFill,
                    onComplete: function () {
                        if (flaskMaskDef) {
                            fillFlasksWhenReached(flaskMaskDef);
                        }
                    }
                }
            );
        };

        orderedLiquidSVGs.forEach(function (liquidSVG, idx) {

            // each flask has a corresponding clip-mask def
            // that we'll tween to animate the appearance of the flask filling
            var flaskLiquidMaskDef;

            if (flasksMasksToFillOnIter[idx]) {
                flaskLiquidMaskDef = flasksMasksToFillOnIter[idx];
            }

            drawTube(
                liquidSVG,
                DURATIONS.tubeFill,
                liquidSVG.getTotalLength()
                flaskLiquidMaskDef
            );


            fillTubesTL.addLabel(fillIterationLabel);

            changeTitleText(fillTubesTL, {
                yDistUp: 30,
                yDistDown1: 10,
                yDistDown2: 20,
                newText: fillStepLabels[idx],
                labelIn: fillIterationLabel
            });

            //fillTubesTL.addLabel('tube-fill--iter-' + idx);

            //   changeTitleText(fillTubesTL, {
            //       yDistUp: 30,
            //       yDistDown1: 10,
            //       yDistDown2: 20,
            //       newText: fillStepLabels[idx],
            //       labelIn: '+=0.2'
            //   });

        });

        return fillTubesTL;
    }


    function init () {
        masterTL = new TimelineMax();
        masterTL.add(clearStage());
        masterTL.add(introduceScene());
        masterTL.addLabel(LABELS.sceneIntro);
        masterTL.add(conjureUpIdea());
        masterTL.addLabel(LABELS.sceneIdeaHad);
        masterTL.add(startMachine());
        masterTL.addLabel(LABELS.sceneMachineStarted);
        masterTL.add(fillMachineTubes(), LABELS.sceneMachineStarted);
        //masterTL.add(fillFlasksWhenReached(), LABELS.sceneMachineStarted);
        masterTL.addLabel(LABELS.sceneTubesFilled);


        masterTL.seek(LABELS.sceneMachineStarted + '-=1');
    }

    return {
        init: init
    };

} (window));



window.addEventListener('DOMContentLoaded', app.init, false);
