import 'TweenMax';
import Bubble from './Bubble';
import Flame from './Flame';
import { replacePathMoveTo } from 'utils/svg-utils';
import { pairItemsInArray } from 'utils/array-utils';

const BubblingCauldron = (function BubblingCauldron () {

    let
        SELECTORS = new Map(
            [
                [ 'cauldron', '.cauldron' ],
                [ 'cauldronStick', '.cauldron__stick' ],
                [ 'cauldronBubble', '.cauldron__bubble' ],
                [ 'cauldronLiquid', '.cauldron__liquid'],
                [ 'cauldronStickControlPoint', '.cauldon__stick-control-point'],
                [ 'cauldronStickMeasurePoint', '.cauldon__stick-measure-point'],
                [ 'flames', '.flame'],
                [ 'uniqueFlames', [
                    '.flame-group--left',
                    '.flame-group--left-diagonal',
                    '.flame-group--right',
                    '.flame-group--right-diagonal',
                    '.flame-group--front'
                ]],
                [ 'startStateFlames', '.flame--start-state'],
                [ 'endStateFlames', '.flame--end-state'],
                [ 'flameSets', new Map(
                        // [
                        //     [
                        //         '.flames--start-state.flames--layer-1 .flame--left',
                        //         '.flames--end-state.flames--layer-1 .flame--left'
                        //     ],
                        //     [
                        //         '.flames--start-state.flames--layer-1 .flame--left-diagonal',
                        //         '.flames--end-state.flames--layer-1 .flame--left-diagonal'
                        //     ],
                        //     [
                        //         '.flames--start-state.flames--layer-1 .flame--front',
                        //         '.flames--end-state.flames--layer-1 .flame--front',
                        //     ],
                        //     [
                        //         '.flames--start-state.flames--layer-1 .flame--right',
                        //         '.flames--end-state.flames--layer-1 .flame--right',
                        //     ],
                        //     [
                        //         '.flames--start-state.flames--layer-1 .flame--right-diagonal',
                        //         '.flames--end-state.flames--layer-1 .flame--right-diagonal',
                        //     ]
                        // ]
                    )
                ]
            ]

        ),

        LABELS = new Map(
            [
                [ 'cauldronAnimationStart', 'cauldronAnimationStart' ]
            ]
        ),

        DURATIONS = new Map(
            [
                [ 'bubbleUpMinimum', 0.1 ],
                [ 'bubbleUpVariance', 0.3 ],
                [ 'bubbleUpDelayMinimum', 0.4 ],
                [ 'bubbleUpDelayVariance', 3.0 ],
                [ 'stirRevolution', 4 ],
                [ 'flameFlickerMin', 1.25 ],
                [ 'flameFlickerMax', 2.4812 ]
                //[ 'stirRevolution', 20 ]
            ]
        ),

        EASINGS = new Map(
            [
                [ 'bubbleUp', Power3.easeInOut ],
                [ 'potStir', Power4.easeIn ],
                [ 'linear', Power0.easeNone ]
            ]
        ),

        // cache these to avoid layout-trash
        // inducing DOM reads during DOM write functions
        DIMENSIONS = new Map(
            [
                [ 'cauldron', {}],
                [ 'cauldronLiquid', {}],
                [ 'cauldronStick', {}]
            ]
        ),

        // holder for each [startElem, endElem] pair of flame SVGs
        FLAME_SETS = new Set(),

        // Used to dynamically generate selector mappings for the flame paths of each "layer"
        NUM_FLAME_LAYERS = 2,


        // DOM_REFS
        cauldronElem = document.querySelector(SELECTORS.get('cauldron')),
        cauldronStickElem = cauldronElem.querySelector(SELECTORS.get('cauldronStick')),
        cauldronBubbleElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronBubble')),
        cauldronLiquidElem = cauldronElem.querySelector(SELECTORS.get('cauldronLiquid')),

        stickControlPointElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronStickControlPoint')),
        stickMeasurePointElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronStickMeasurePoint')),

        // TODO: Not sure if we need all flames together
        flameElems = cauldronElem.querySelectorAll(SELECTORS.get('flames')),

        startStateFlameElems = cauldronElem.querySelectorAll(SELECTORS.get('startStateFlames')),
        endStateFlameElems = cauldronElem.querySelectorAll(SELECTORS.get('endStateFlames')),

        stickControlPointCoords = [],
        stickTransformPercentages = {},
        masterTL;


    function wireUpStickControlPoints () {
        for (let pointElem of stickControlPointElems) {
            stickControlPointCoords.push({
                x: pointElem.getAttribute('cx'),
                y: pointElem.getAttribute('cy'),
            });
        }
    }

    /**
     * Batch (and cache) DOM dimension calculations to help
     * avoid layout-trash inducing DOM reads during DOM write functions
     */
    function wireUpDimensions () {
        //debugger;
        DIMENSIONS.set('cauldron', {
            width: cauldronElem.getBBox().width,
            height: cauldronElem.getBBox().height
        });
        DIMENSIONS.set('cauldronLiquid', {
            width: cauldronLiquidElem.getBBox().width,
            height: cauldronLiquidElem.getBBox().height
        });
        DIMENSIONS.set('cauldronStick', {
            // width is uneven here (this is an artisal, real-wood stick),
            // so we'll use "measure points" at the sticks intersection with the liquid
            width: cauldronStickElem.getBBox().width,
            bottomBaseWidth: Math.abs(
                Number(stickMeasurePointElems[0].getAttribute('cx')) -
                Number(stickMeasurePointElems[1].getAttribute('cx'))
            ),
            height: cauldronStickElem.getBBox().height,
        });

        ////////////////
        // Compute important percentages with our initial measurments
        ////////////////
        DIMENSIONS.get('cauldronStick').bottomBaseWidthAsPercentageOfCauldronWidth =
         (
             DIMENSIONS.get('cauldronStick').bottomBaseWidth /
             DIMENSIONS.get('cauldron').width
         ) * 100;

         DIMENSIONS.get('cauldronStick').widthAsPercentageOfCauldronWidth =
          (
              DIMENSIONS.get('cauldronStick').width /
              DIMENSIONS.get('cauldron').width
          ) * 100;

         DIMENSIONS.get('cauldronLiquid').heightAsPercentageOfCauldronHeight =
          (
              DIMENSIONS.get('cauldronLiquid').height /
              DIMENSIONS.get('cauldron').height
          ) * 100;

         DIMENSIONS.get('cauldronLiquid').widthAsPercentageOfCauldronWidth =
          (
              DIMENSIONS.get('cauldronLiquid').width /
              DIMENSIONS.get('cauldron').width
          ) * 100;
    }

    function setUpBubbles () {

        let setupTL = new TimelineMax({ /*paused: true*/ });

        setupTL.set(
            cauldronBubbleElems,
            { transformOrigin: 'center bottom', scale: 0, immediateRender: false }
        );

        setupTL.set(
            cauldronStickElem,
            {
                transformOrigin: 'left bottom',
                // y: -10,
                // rotationZ: 20,
                x: (DIMENSIONS.get('cauldronStick').widthAsPercentageOfCauldronWidth / 2) +
                    DIMENSIONS.get('cauldronStick').bottomBaseWidthAsPercentageOfCauldronWidth,

                immediateRender: false
            }
        );

        return setupTL;
    }


    function sortElemsByFlameModifier (el1, el2, ascending = true) {
        //debugger;
        //console.log(el1.getAttribute('class').match(/--[^\s]*/)[0]);
        //console.log(el2.getAttribute('class').match(/--[^\s]*/)[0]);
        let flameModifierRegExp = /--(?:(?!layer))[^\s]*/;
        return el1.getAttribute('class').match(flameModifierRegExp)[0] >
            el2.getAttribute('class').match(flameModifierRegExp)[0];
    }


    /**
     * Create a mapping of selector pairs ("pair" being a
     * start state selector and and end state selector) for each unique
     * flame of each unique layer.
     */
    // function makeFlameSetSelectorsMapping () {
    //
    //     let
    //         currentLayer = 1,
    //         flameSelectorPair;
    //
    //     while (currentLayer <= NUM_FLAME_LAYERS) {
    //         for (let uniqueFlameSelector of SELECTORS.get('uniqueFlames')) {
    //             flameSelectorPair = [
    //                 `.flames--start-state.flames--layer-${currentLayer} ${uniqueFlameSelector}`,
    //                 `.flames--end-state ${uniqueFlameSelector}`
    //             ];
    //             SELECTORS.get('flameSets').set(flameSelectorPair[0], flameSelectorPair[1]);
    //         }
    //         currentLayer++;
    //     }
    // }

    /**
     * Pair the DOM reference for each staring flame with its
     * with a refrence to its (visually) hidden morph target
     */
   //  function wireUpFlameSets () {
   //      debugger;
   //      makeFlameSetSelectorsMapping();
   //      let
   //          sortedFlameElems =
   //              [...flameElems].sort(sortElemsByFlameModifier),
   //
   //          flameElemPairs = pairItemsInArray(sortedFlameElems);
   //
   //      for (let pair of flameElemPairs) {
   //          FLAME_SETS.add(pair);
   //      }
   // }


    function getAllBubbly () {

        let bubblingTL = new TimelineMax ();

        for (let bubbleElem of cauldronBubbleElems) {

            // set up bubbleObj with random duration and repeat intervals
            let
                bubbleUpDuration =
                    DURATIONS.get('bubbleUpMinimum') +
                    (Math.random() * DURATIONS.get('bubbleUpVariance')),

                bubbleInterval =
                    DURATIONS.get('bubbleUpDelayMinimum') +
                    (Math.random() * DURATIONS.get('bubbleUpDelayVariance')),

                bubbleObj = Bubble(bubbleElem);

            // console.log(
            //     `Setting animation timeline for bubble Object\n
            //      BubbleUp duration: ${bubbleUpDuration}\n
            //      Bubble Interval: ${bubbleInterval}`
            // );
            bubbleObj.setAnimationTimeline(bubbleUpDuration, bubbleInterval);
            bubblingTL.add(bubbleObj.TL, 0);
        }
        return bubblingTL;
    }


    function stirThePot () {

        let masterStirTL = new TimelineMax({ repeat: -1 });

        function rotateStick () {

            let rotateTL = new TimelineMax({ yoyo });

            rotateTL.to(
                cauldronStickElem,
                DURATIONS.get('stirRevolution') * (3 / 3),
                {
                    rotationZ: '-=45',
                    rotationY: '-=180',
                    //rotationZ: '-10',
                    ease: EASINGS.get('linear'),
                }
            );

            rotateTL.to(
                cauldronStickElem,
                DURATIONS.get('stirRevolution') * (3 / 3),
                {
                    rotationZ: '+=45',
                    rotationY: '-=180',
                    //rotationZ: '-10',
                    ease: EASINGS.get('linear'),
                }
            );

            // rotateTL.to(
            //     cauldronStickElem,
            //     DURATIONS.get('stirRevolution') * (3 / 3),
            //     {
            //         rotationY: '+=90',
            //         //rotationZ: '10',
            //         ease: EASINGS.get('potStir'),
            //     }
            // );
            return rotateTL;
        }

        function circulateStick () {
            let
                circularMotionTL = new TimelineMax(),
                stickPath = [
                    // x and y transform percentages
                    {
                        x: -1 * (50 - (DIMENSIONS.get('cauldronStick').widthAsPercentageOfCauldronWidth / 2)),
                        y: DIMENSIONS.get('cauldronLiquid').heightAsPercentageOfCauldronHeight / 2,   // / 2 because we start from mid height
                    },
                    {
                        x: -1 * (
                                (50 + ( DIMENSIONS.get('cauldronLiquid').widthAsPercentageOfCauldronWidth / 2 ) ) -
                                DIMENSIONS.get('cauldronStick').bottomBaseWidthAsPercentageOfCauldronWidth
                            ),
                        y: DIMENSIONS.get('cauldronLiquid').heightAsPercentageOfCauldronHeight / 3
                    },
                    {
                        x: -50,
                        y: -1 * DIMENSIONS.get('cauldronLiquid').heightAsPercentageOfCauldronHeight / 2.5
                    },
                    {
                        x: (
                                DIMENSIONS.get('cauldronStick').widthAsPercentageOfCauldronWidth / 2
                            ) +
                            DIMENSIONS.get('cauldronStick').bottomBaseWidthAsPercentageOfCauldronWidth,
                        y: -DIMENSIONS.get('cauldronLiquid').heightAsPercentageOfCauldronHeight / 3
                    }
                ],

                // calibrate the 3-dimensional rotation of the stick along\
                // its motion path
                // TODO: Um... how is GSAP expecting this to be defined?
                rotationParams = [
                    [ 'y', 'z', 'rotation', -310, false ],
                    [ 'y', 'z', 'rotation', -180, false ]
                ];
            //
            // console.log('Bezier tweening stick with x and y transform values of ');
            // console.table(stickPath);

            circularMotionTL.to(
                cauldronStickElem,
                DURATIONS.get('stirRevolution'),
                {
                    bezier: {
                        type: 'smooth',
                        values: stickPath,
                        curviness: 1,  // "normal" curviness
                        autoRotate: rotationParams
                    },
                    ease: EASINGS.get('linear')
                }
            )

            return circularMotionTL;
        }

        //masterStirTL.add(rotateStick(), 0);  TODO: Enable line
        masterStirTL.add(circulateStick(), 0);

        return masterStirTL;
    }

    /**
     * Animate flames under the cauldron
     */
    function fireUpThePot () {

        let
            masterFlamesTL = new TimelineMax(),
            flame,
            flameFlickerDuration;

        // for (let [ startStateFlame, endStateFlame ] of FLAME_SETS.values()) {
        for (let flameElem of flameElems) {

            flame = Flame(flameElem);

            flameFlickerDuration =
                DURATIONS.get('flameFlickerMin') +
                (
                    Math.random() *
                    ( DURATIONS.get('flameFlickerMax') - DURATIONS.get('flameFlickerMin') )
                );

            //flame.startAnimationTimeline(flameFlickerDuration);
            flame.startAnimationTimeline(flameFlickerDuration);
            masterFlamesTL.add(flame.TL, 0);
        }

        return masterFlamesTL;

    }


    function init () {

        console.log('Bubble!');

        wireUpStickControlPoints();
        wireUpDimensions();
        //wireUpFlameSets();


        masterTL = new TimelineMax();

        masterTL.add(setUpBubbles());
        masterTL.add(LABELS.get('cauldronAnimationStart'));
        masterTL.add(getAllBubbly(), LABELS.get('cauldronAnimationStart'));
        masterTL.add(stirThePot(), LABELS.get('cauldronAnimationStart'));
        masterTL.add(fireUpThePot(), LABELS.get('cauldronAnimationStart'));

    }

    init();

}());

export default BubblingCauldron;
