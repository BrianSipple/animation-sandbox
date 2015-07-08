(function (window) {

    var leafContainer = document.querySelector('.svg-container'),
        leafSVG = leafContainer.querySelector('#leafSVG'),

        TOTAL_FALL_DURATION = 10,
        numFallPhases = 8,
        leafStartParams = {left: '60%', top: '5%', rotationZ: -60 };





    debugger;
    TweenMax.set(
        leafContainer,
        {
            position: 'absolute',
            left: leafStartParams.left,
            top: leafStartParams.top,
            rotationZ: leafStartParams.rotationZ,
            opacity: 1,
            transformOrigin: '50% 50%'
        }
    );


    /**
     * Animate the falling leaf. Some notes...
     *
     * According to the Tennis Racket Theorem (https://en.wikipedia.org/wiki/Tennis_racket_theorem)
     * the Y-axis of our leaf should be the source of unstable
     * wobbling (half-rotation), as it is the second principle axis among the stable first (X) and thrid (Z)
     */
    function fall() {

        var fallTl = new TimelineMax();

        // Setup the paths of each "phase" (a path of motion before a complete directional
        // shift occurs due to the lift....
        var fallPath = {
            // We'll use "thru" tweening for our paths. The bezier plugin treats the initial starting point
            // as the first anchor of the path.
            phase1: [
                {left: '57%', top: '8%', rotationY: 0, rotationX: 5, rotationZ: 0},
                {left: '53%', top: '5%', rotationY: 0, rotationX: 10, rotationZ: 30}
            ],
            phase2: [
                {left: '50%', top: '7%', rotationY: 0, rotationX: 20, rotationZ: -60},
                {left: '46%', top: '9%', rotationY: 0, rotationX: 25, rotationZ: -10},
                {left: '36%', top: '13%', rotationY: 0, rotationX: 50, rotationZ: 5},
                {left: '30%', top: '10%', rotationY: 0, rotationX: 80, rotationZ: 80}
            ],
            phase3: [
                {left: '36%', top: '21%', rotationY: 0, rotationX: 0, rotationZ: 81},
                {left: '46%', top: '31%', rotationY: 0, rotationX: -10, rotationZ: -9},
                {left: '59%', top: '28%', rotationY: 0, rotationX: -60, rotationZ: -57},
                {left: '57.5%', top: '25%', rotationY: 0, rotationX: -80, rotationZ: -75}
            ],
            phase4: [
                {left: '59%', top: '37%', rotationY: 0, rotationX: -70, rotationZ: -85},
                {left: '40%', top: '44%', rotationY: 0, rotationX: -35, rotationZ: 0},
                {left: '24%', top: '37%', rotationY: 0, rotationX: 0, rotationZ: 10},
                {left: '20%', top: '33%', rotationY: 0, rotationX: -10, rotationZ: 80}
            ],
            phase5: [
                {left: '25%', top: '43%', rotationY: 0, rotationX: -15, rotationZ: 75},
                {left: '30%', top: '46%', rotationY: 0, rotationX: -20, rotationZ: 25},
                {left: '51.5%', top: '49%', rotationY: 0, rotationX: -30, rotationZ: -5},
                {left: '56%', top: '47.5%', rotationY: 0, rotationX: -50, rotationZ: -75}
            ],
            phase6: [
                {left: '51%', top: '57.5%', rotationY: 0, rotationX: -20, rotationZ: -45},
                {left: '50%', top: '64%', rotationY: 0, rotationX: 0, rotationZ: -45},
                {left: '42.5%', top: '66%', rotationY: 0, rotationX: -50, rotationZ: 0},
                {left: '34%', top: '62%', rotationY: 0, rotationX: -30, rotationZ: 80}
            ],
            phase7: [
                {left: '33.5%', top: '62.5%', rotationY: 0, rotationX: -25, rotationZ: 0},
                {left: '33%', top: '64%', rotationY: 0, rotationX: -20, rotationZ: 0},
                {left: '32.5%', top: '64%', rotationY: 0, rotationX: -10, rotationZ: -25},
                {left: '31.5%', top: '66%', rotationY: 0, rotationX: 0, rotationZ: 8},
                {left: '31.5%', top: '70%', rotationY: 0, rotationX: 0, rotationZ: 0}
            ]
        };

        for (var phase in fallPath) {
            debugger;
            if (fallPath.hasOwnProperty(phase)) {
                fallTl.add(
                    TweenMax.to(
                        leafContainer,
                        TOTAL_FALL_DURATION / numFallPhases,
                        {
                            bezier: {values: fallPath[phase]},
                            ease: Power1.easeInOut
                        }
                    )
                );
            }
        }
        //
        //fallTl.add(
        //    TweenMax.to(
        //        leafContainer,
        //        TOTAL_FALL_DURATION / numFallPhases,
        //        {
        //            bezier: {values: fallPath.phase1},
        //            ease: Power3.easeOut
        //        }
        //    )
        //);
        //
        //fallTl.add(
        //    TweenMax.to(
        //        leafContainer,
        //        TOTAL_FALL_DURATION / numFallPhases,
        //        {
        //            bezier: {values: fallPath.phase2 },
        //            ease: Power3.easeOut
        //        }
        //    )
        //);
        //fallTl.add(
        //    TweenMax.to(
        //        leafContainer,
        //        TOTAL_FALL_DURATION / numFallPhases,
        //        {
        //            bezier: { values: fallPath.phase3 },
        //            ease: Power3.easeOut
        //        }
        //    )
        //);
        //fallTl.add(
        //    TweenMax.to(
        //        leafContainer,
        //        TOTAL_FALL_DURATION / numFallPhases,
        //        {
        //            bezier: { values: fallPath.phase4 },
        //            ease: Power3.easeOut
        //        }
        //    )
        //);


    }

    function init() {
        fall();
    }

    window.addEventListener('load', function () {
        init();
    }, false);


}(window));
