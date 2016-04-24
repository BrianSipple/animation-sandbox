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
        maxTubeFill: 1.8,
        maxFlaskFill: 0.5,
        paperEjection: 1.15
    },

    EASINGS = {
        default: Power4.easeInOut,
        elementScaling: Power4.easeInOut,
        slideInOrOut: Power4.easeInOut,
        fadeInOrOut: Power3.easeOut,
        colorChange: Power0.easeNone,
        tubeFill: Power0.easeNone,
        roughOscillation: RoughEase.ease.config({
            template: Power0.easeNone,
            strength: 2,
            points: 50,
            taper: 'none',
            randomize: true,
            clamp: false
        }),
        bounceIntoView: Bounce.easeOut
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

    DIMENSIONS = {
        maxLiquidMaskLength: 0,
        maxTubeLength: 0,
        printerPaperHeight: 55
    },

    LABELS = {
        sceneIntro: 'scene__intro',
        sceneIdeaHad: 'scene__idea',
        sceneMachineStarted: 'scene__machine-start',
        sceneTubesFilled: 'scene__tubes-filled',
        sceneCallToAction: 'scene__callToAction',

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
        fillFlask5: 'fill-flask-5',

        allTubesFilled: 'allTubesFilled'

    },

    CLASSES = {
        bulbFlickeringYellow: 'is-flickering--yellow',
        bulbFlickeringGreen: 'is-flickering--green',
        bulbActiveYellow: 'is-active--yellow'
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

    flaskLiquidMaskDefRects = {
        flask1: mainSVG.querySelector('#liquid-clip--liquid-1 rect'),
        flask2: mainSVG.querySelector('#liquid-clip--liquid-2 rect'),
        flask3: mainSVG.querySelector('#liquid-clip--liquid-3 rect'),
        flask4: mainSVG.querySelector('#liquid-clip--liquid-4 rect'),
        primaryFlask: mainSVG.querySelector('#liquid-clip--liquid-5 rect'),
        flask6: mainSVG.querySelector('#liquid-clip--liquid-6 rect'),
        flask7: mainSVG.querySelector('#liquid-clip--liquid-7 rect')
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
            liquidMaskRect,
            liquidMaskLength,
            yPosToSet;

        for (var rectKey in flaskLiquidMaskDefRects) {
            if (flaskLiquidMaskDefRects.hasOwnProperty(rectKey)) {

                liquidMaskRect = flaskLiquidMaskDefRects[rectKey];

                liquidMaskLength = Number(liquidMaskRect.getAttribute('height'));

                // cache the max length
                if (liquidMaskLength > DIMENSIONS.maxLiquidMaskLength) {
                    DIMENSIONS.maxLiquidMaskLength = liquidMaskLength;
                }

                // proceed to setting the inital mask position
                yPosToSet = Number(liquidMaskRect.getAttribute('y')) + liquidMaskLength;
                tl.set(liquidMaskRect, {attr: { y: yPosToSet } });
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
        clearTL.set(printerPaperSVG, {y: '+=' + DIMENSIONS.printerPaperHeight });

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
            'And most of all...',
            'Have some fun!'
        ],

        flasksMasksToFillOnIter = {
            0: flaskLiquidMaskDefRects.flask1,
            1: flaskLiquidMaskDefRects.flask2,
            2: flaskLiquidMaskDefRects.flask3,
            4: flaskLiquidMaskDefRects.flask4,
            7: flaskLiquidMaskDefRects.flask6,
            8: flaskLiquidMaskDefRects.flask7,
            after: flaskLiquidMaskDefRects.primaryFlask
        },

        fillIterationLabel,

        fillFlasksWhenReached = function fillFlasksWhenReached (tl, flaskMaskDef) {
            var yDistToSlideUp = Number(flaskMaskDef.getAttribute('height'));

            tl.to(
                flaskMaskDef,
                DURATIONS.maxFlaskFill * (yDistToSlideUp / DIMENSIONS.maxLiquidMaskLength),
                { attr: { y: '-=' + yDistToSlideUp }, ease: EASINGS.tubeFill }
            );
        },

        createTubeDrawTL = function createTubeDrawTL(tubeSVG, fillLength, fillDuration, flaskMaskDef) {

            var
                tubeDrawTL = new TimelineMax();

                // fillFlasksWhenReached = function fillFlasksWhenReached () {
                //     var yDistToSlideUp = Number(flaskMaskDef.getAttribute('height'));
                //
                //     tubeDrawTL.to(
                //         flaskMaskDef,
                //         DURATIONS.maxFlaskFill * (yDistToSlideUp / DIMENSIONS.maxLiquidMaskLength),
                //         { attr: { y: '-=' + yDistToSlideUp }, ease: EASINGS.tubeFill }
                //     );
                // };


            tubeDrawTL.set(
                tubeSVG,
                {
                    strokeDasharray: fillLength,
                    strokeDashoffset: fillLength,
                    immediateRender: false
                },
                0
            );

            tubeDrawTL.set(
                tubeSVG,
                { stroke: COLORS.tubeLiquid, immediateRender: false },
                0
            );

            tubeDrawTL.to(
                tubeSVG,
                fillDuration,
                {
                    strokeDashoffset: 0,
                    ease: EASINGS.tubeFill
                }
            );

            if (flaskMaskDef) {
                fillFlasksWhenReached(tubeDrawTL, flaskMaskDef);
            }

            return tubeDrawTL;
        };

        // Cache lengths for each SVG -- and while we're at it, compute the max
        orderedLiquidSVGs.forEach(function (liquidSVG) {

            liquidSVG.computedLength = liquidSVG.getTotalLength();

            if (liquidSVG.computedLength > DIMENSIONS.maxTubeLength) {
                DIMENSIONS.maxTubeLength = liquidSVG.computedLength;
            }
        })

        orderedLiquidSVGs.forEach(function (liquidSVG, idx) {

            // each flask has a corresponding clip-mask def
            // that we'll tween to animate the appearance of the flask filling
            var flaskLiquidMaskDef;

            // Select the appropriate iteration for each flask
            if (flasksMasksToFillOnIter[idx]) {
                flaskLiquidMaskDef = flasksMasksToFillOnIter[idx];
            }

            // Use a "size factor" to compute the proper duration for the
            // fill animation
            var
                fillLength = liquidSVG.computedLength,
                sizeFactor = (fillLength / DIMENSIONS.maxTubeLength),
                fillDuration = DURATIONS.maxTubeFill * sizeFactor;

            fillTubesTL.add(
                createTubeDrawTL(
                    liquidSVG,
                    fillLength,
                    fillDuration,
                    flaskLiquidMaskDef
                )
            );

            fillTubesTL.addLabel(fillIterationLabel);

            // flip the text after each tube fill
            changeTitleText(fillTubesTL, {
                yDistUp: 30,
                yDistDown1: 10,
                yDistDown2: 20,
                newText: fillStepLabels[idx],
                labelIn: fillIterationLabel
            });

            // On the penultimate iteration, bump the scale around for a bit
            if (idx === 7) {
                fillTubesTL.set(
                    mainTitleElem,
                    { fontSize: '0.9em', immediateRender: false },
                    fillIterationLabel + '-=0.2'
                );

                fillTubesTL.to(
                    mainTitleElem,
                    2,
                    { fontSize: '1.2em', ease: EASINGS.roughOscillation },
                    fillIterationLabel
                );
            }
        });

        fillTubesTL.addLabel(LABELS.allTubesFilled);
        fillFlasksWhenReached(fillTubesTL, flasksMasksToFillOnIter.after);
        fillTubesTL.set(
            mainBulbSVG,
            {
                className: '+=' +
                    CLASSES.bulbFlickeringYellow +
                    ' ' + CLASSES.bulbActiveYellow,
                immediateRender: false
            }
        );

        // finish this scene by removing the text
        changeTitleText(
            fillTubesTL, {
            yDistUp: 30,
            newText: '',
            labelOut: '+=1.3'
        });

        return fillTubesTL;
    }

    function ejectPrinterPaper () {
        var ejectionTL = new TimelineMax();

        ejectionTL.to(
            printerPaperSVG,
            DURATIONS.paperEjection,
            { y: '-=' + DIMENSIONS.printerPaperHeight },
            EASINGS.bounceIntoView
        )


        return ejectionTL;
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
        masterTL.addLabel(LABELS.sceneCallToAction);
        masterTL.add(ejectPrinterPaper(), LABELS.sceneCallToAction);


        masterTL.play(0);
    }

    return {
        init: init
    };

} (window));



window.addEventListener('DOMContentLoaded', app.init, false);
