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
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0}
            ],
            phase5: [
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0}
            ],
            phase6: [
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0}
            ],
            phase7: [
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '', top: '', rotationY: 0, rotationX: 0, rotationZ: 0}
            ]
        };

        fallTl.add(
            TweenMax.to(
                leafContainer,
                TOTAL_FALL_DURATION / numFallPhases,
                {
                    bezier: {values: fallPath.phase1},
                    ease: Power3.easeOut
                }
            )
        );

        fallTl.add(
            TweenMax.to(
                leafContainer,
                TOTAL_FALL_DURATION / numFallPhases,
                {
                    bezier: {values: fallPath.phase2 },
                    ease: Power3.easeOut
                }
            )
        );

        fallTl.add(
            TweenMax.to(
                leafContainer,
                TOTAL_FALL_DURATION / numFallPhases,
                {
                    bezier: { values: fallPath.phase3 },
                    ease: Power3.easeOut
                }
            )
        );


    }

    function init() {
        fall();
    }

    window.addEventListener('load', function () {
        init();
    }, false);


}(window));
