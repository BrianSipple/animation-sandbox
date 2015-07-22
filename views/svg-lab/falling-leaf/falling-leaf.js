(function (window) {

    var sceneSVGContainer = document.querySelector('.svg-container--scene'),
        leafSVGContainer = document.querySelector('.svg-container--leaf'),
        leafSVG = leafSVGContainer.querySelector('#leaf'),

        TOTAL_FALL_DURATION = 10,
        numFallPhases = 8,

        xExtent = -100,   // x extent during the fall
        yExtent = 180,    // y extent during the fall (like... you know.. the ground)

        fallTl = new TimelineMax();



    TweenMax.set(
        sceneSVGContainer,
        {
            top: '50%',
            left: '50%',
            xPercent: -50,
            yPercent: -50
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

        // Setup the paths of each "phase" (a path of motion before a complete directional
        // shift occurs due to the lift....
        var fallPath = {
            // We'll use "thru" tweening for our paths. The bezier plugin treats the initial starting point
            // as the first anchor of the path.
            phase1: [
                {x: (xExtent * .0625) + 'px', y: (yExtent * .03) + 'px', rotationY: 0, rotationX: 5, rotationZ: 0},
                {x: (xExtent * .125) + 'px', y: 0 + 'px', rotationY: 0, rotationX: 10, rotationZ: 30}
            ],
            phase2: [
                {x: (xExtent * .25) + 'px', y: (yExtent * .07) + 'px', rotationY: 0, rotationX: 20, rotationZ: -60},
                {x: (xExtent * .375) + 'px', y: (yExtent * .145) + 'px', rotationY: 0, rotationX: 25, rotationZ: -10},
                {x: (xExtent * .70) + 'px', y: (yExtent * .175) + 'px', rotationY: 0, rotationX: 50, rotationZ: 5},
                {x: (xExtent * .775) + 'px', y: (yExtent * .05) + 'px', rotationY: 0, rotationX: 80, rotationZ: 80}
            ],
            phase3: [
                {x: (xExtent * .585) + 'px', y: (yExtent * .22) + 'px', rotationY: 0, rotationX: 0, rotationZ: 81},
                {x: (xExtent * .31) + 'px', y: (yExtent * .36) + 'px', rotationY: 0, rotationX: -10, rotationZ: -9},
                {x: (xExtent * .125) + 'px', y: (yExtent * .38) + 'px', rotationY: 0, rotationX: -60, rotationZ: -57},
                {x: (xExtent * .0625) + 'px', y:  (yExtent * .27) + 'px', rotationY: 0, rotationX: -80, rotationZ: -75}
            ],
            phase4: [
                {x: (xExtent * .045) + 'px', y: (yExtent * .45) + 'px', rotationY: 0, rotationX: -70, rotationZ: -85},
                {x: (xExtent * .445) + 'px', y: (yExtent * .62) + 'px', rotationY: 0, rotationX: -35, rotationZ: 0},
                {x: (xExtent * .925) + 'px', y: (yExtent * .50) + 'px', rotationY: 0, rotationX: 0, rotationZ: 10},
                {x: (xExtent * .98) + 'px', y: (yExtent * .42) + 'px', rotationY: 0, rotationX: -10, rotationZ: 80}
            ],
            phase5: [
                {x: (xExtent * .9325) + 'px', y: (yExtent * .60) + 'px', rotationY: 0, rotationX: -15, rotationZ: 75},
                {x: (xExtent * .62) + 'px', y: (yExtent * .68) + 'px', rotationY: 0, rotationX: -20, rotationZ: 25},
                {x: (xExtent * .21) + 'px', y: (yExtent * .6875) + 'px', rotationY: 0, rotationX: -30, rotationZ: -5},
                {x: 0 + 'px', y: (yExtent * .67) + 'px', rotationY: 0, rotationX: -50, rotationZ: -75}
            ],
            phase6: [
                {x: (xExtent * .10) + 'px', y: (yExtent * .855) + 'px', rotationY: 0, rotationX: -20, rotationZ: -45},
                {x: (xExtent * .25) + 'px', y: (yExtent * .92) + 'px', rotationY: 0, rotationX: 0, rotationZ: -45},
                {x: (xExtent * .44) + 'px', y: (yExtent * .95) + 'px', rotationY: 0, rotationX: -50, rotationZ: 0},
                {x: (xExtent * .66) + 'px', y: (yExtent * .89) + 'px', rotationY: 0, rotationX: -30, rotationZ: 80}
            ],
            phase7: [
                {x: (xExtent * .70) + 'px', y: (yExtent * .89) + 'px', rotationY: 0, rotationX: -25, rotationZ: 0},
                {x: (xExtent * .68) + 'px', y: (yExtent * .91) + 'px', rotationY: 0, rotationX: -20, rotationZ: 0},
                {x: (xExtent * .67) + 'px', y: (yExtent * .94) + 'px', rotationY: 0, rotationX: -10, rotationZ: -25},
                {x: (xExtent * .69) + 'px', y: (yExtent * .9575) + 'px', rotationY: 0, rotationX: 0, rotationZ: 8},
                {x: (xExtent * .70) + 'px', y: yExtent + 'px', rotationY: 0, rotationX: 0, rotationZ: 0}
            ]
        };

        for (var phase in fallPath) {
            if (fallPath.hasOwnProperty(phase)) {
                fallTl.add(
                    TweenMax.to(
                        leafSVG,
                        TOTAL_FALL_DURATION / numFallPhases,
                        {
                            bezier: {
                                type: 'thru',
                                values: fallPath[phase]
                            },
                            onUpdate: function () {
                              debugger;
                            },
                            ease: Linear.easeNone,  // QUESTION: could this be the best, since the path interpolation itself creates an organic speed
                            data: 'Tween for ' + phase.toString()
                        }
                    )
                );
                //fallTl.addPause();
            }
        }

    }

    function init() {
        TweenMax.set([sceneSVGContainer, leafSVGContainer], { opacity: 1 });
        fall();
    }

    window.addEventListener('load', function () {
        init();
    }, false);


}(window));
