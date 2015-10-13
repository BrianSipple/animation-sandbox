import 'TweenMax';
import { Bubble } from './Bubble';

const BubblingCauldron = (function BubblingCauldron () {

    const
        SELECTORS = new Map(
            [
                [ 'cauldron', '.cauldron' ],
                [ 'cauldronStick', '.cauldron__stick' ],
                [ 'cauldronBubble', '.cauldron__bubble' ]
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
        );


    let
        // DOM_REFS
        cauldronElem = document.querySelector(SELECTORS.get('cauldron')),
        cauldronStickElem = cauldronElem.querySelector(SELECTORS.get('cauldronStick')),
        cauldronBubbleElems = cauldronElem.querySelectorAll(SELECTORS.get('cauldronBubble')),

        masterTL;



    function setUpBubbles () {

        let setupTL = new TimelineMax({ /*paused: true*/ });

        setupTL.set(
            cauldronBubbleElems,
            { transformOrigin: 'center bottom', scale: 0, immediateRender: false }
        );

        setupTL.set(
            cauldronStickElem,
            { transformOrigin: 'center bottom', xPercent: -50, immediateRender: false }
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
        let stirTL = new TimelineMax({ repeat: -1, yoyo: true });

        stirTL.to(
            cauldronStickElem,
            DURATIONS.get('stirRevolution') * (3 / 3),
            {
                rotationY: '-=45',
                //rotationZ: '-10',
                ease: EASINGS.get('linear'),
            }
        );

        // stirTL.to(
        //     cauldronStickElem,
        //     DURATIONS.get('stirRevolution') * (3 / 3),
        //     {
        //         rotationY: '+=90',
        //         //rotationZ: '10',
        //         ease: EASINGS.get('potStir'),
        //     }
        // );

        //IDEA: bezier path with x and y coords? (or xPercent and yPercent values?)

        return stirTL;
    }


    function init () {

        console.log('Bubble!');

        masterTL = new TimelineMax();

        masterTL.add(setUpBubbles());

        masterTL.add(LABELS.get('cauldronAnimationStart'));
        masterTL.add(getAllBubbly(), LABELS.get('cauldronAnimationStart'));
        masterTL.add(stirThePot(), LABELS.get('cauldronAnimationStart'));

        // un-pause our nested timelines
        //masterTL.getChildren()

    }

    init();

}());

export default BubblingCauldron;
