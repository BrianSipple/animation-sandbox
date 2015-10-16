import 'TweenMax';
import { Bubble } from './Bubble';
import { replacePathMoveTo } from 'utils/svg-utils';

const BubblingCauldron = (function BubblingCauldron () {

    let
        SELECTORS = new Map(
            [
                [ 'cauldron', '.cauldron' ],
                [ 'cauldronStick', '.cauldron__stick' ],
                [ 'cauldronBubble', '.cauldron__bubble' ],
                [ 'cauldronLiquid', '.cauldron__liquid'],
                [ 'cauldronStickControlPoint', '.cauldon__stick-control-point'],
                [ 'cauldronStickMeasurePoint', '.cauldon__stick-measure-point']
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
                [ 'stirRevolution', 2 ]
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

        // DOM_REFS
        cauldronElem = document.querySelector(SELECTORS.get('cauldron')),
        cauldronStickElem = cauldronElem.querySelector(SELECTORS.get('cauldronStick')),
        cauldronBubbleElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronBubble')),
        cauldronLiquidElem = cauldronElem.querySelector(SELECTORS.get('cauldronLiquid')),

        stickControlPointElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronStickControlPoint')),
        stickMeasurePointElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronStickMeasurePoint')),

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
        debugger;
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
            width: Math.abs(
                Number(stickMeasurePointElems[0].getAttribute('cx')) -
                Number(stickMeasurePointElems[1].getAttribute('cx'))
            ),
            height: cauldronStickElem.getBBox().height,
        });

        ////////////////
        // Compute important percentages with our initial measurments
        ////////////////
        DIMENSIONS.get('cauldronStick').widthPercentage =
         (
             DIMENSIONS.get('cauldronStick').width /
             DIMENSIONS.get('cauldron').width
         ) * 100;

         DIMENSIONS.get('cauldronLiquid').heightPercentage =
          (
              DIMENSIONS.get('cauldronLiquid').height /
              DIMENSIONS.get('cauldron').height
          ) * 100;

         DIMENSIONS.get('cauldronLiquid').widthPercentage =
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
                transformOrigin: 'center bottom',
                x: DIMENSIONS.get('cauldronStick').widthPercentage,
                immediateRender: false
            }
        );

        return setupTL;
    }

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

            console.log(
                `Setting animation timeline for bubble Object\n
                 BubbleUp duration: ${bubbleUpDuration}\n
                 Bubble Interval: ${bubbleInterval}`
            );
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
            debugger;
            let
                circularMotionTL = new TimelineMax(),

                stickPath = [
                    // x and y transform percentages
                    {
                        x: -50,
                        y: DIMENSIONS.get('cauldronLiquid').heightPercentage / 2   // / 2 because we start from mid height
                    },
                    {
                        x: -1 * (100 - DIMENSIONS.get('cauldronLiquid').widthPercentage),
                        y: 0
                    },
                    {
                        x: -50,
                        y: -1 * DIMENSIONS.get('cauldronLiquid').heightPercentage / 2
                    },
                    {
                        x: 0 + DIMENSIONS.get('cauldronLiquid').widthPercentage,
                        y: 0
                    }
                ];

            console.log('Bezier tweening stick with x and y transform values of ');
            console.table(stickPath);


            circularMotionTL.to(
                cauldronStickElem,
                DURATIONS.get('stirRevolution'),
                {
                    bezier: {
                        type: 'smooth',
                        values: stickPath,
                        curviness: 1,  // "normal" curviness
                        //autoRotate: true
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


    function init () {

        console.log('Bubble!');

        wireUpStickControlPoints();
        wireUpDimensions();

        masterTL = new TimelineMax();

        masterTL.add(setUpBubbles());

        masterTL.add(LABELS.get('cauldronAnimationStart'));
        masterTL.add(getAllBubbly(), LABELS.get('cauldronAnimationStart'));
        masterTL.add(stirThePot(), LABELS.get('cauldronAnimationStart'));

    }

    init();

}());

export default BubblingCauldron;
