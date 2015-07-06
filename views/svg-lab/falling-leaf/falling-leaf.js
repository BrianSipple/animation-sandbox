(function (window) {

    var leafContainer = document.querySelector('.svg-container'),
        leafSVG = leafContainer.querySelector('#leafSVG'),

        ANIMATION_DURATION_MULTIPLIER = 1,
        masterTl = new TimelineMax();

    debugger;
    TweenMax.set(
        leafContainer,
        {
            position: 'absolute',
            right: 0,
            top: '10%'
        }
    );


    function fall() {

        // Setup the paths of each "flutter" (a path of motion before a directional
        // change occurs due to the lift....
        var fallPath = {
                flutter1: [
                    {x: '100%', y: '+=0'},
                    {x: '75%', y: '10%'},
                    {x: '75%', y: '-10%'}
                ]
            },

            tween = TweenMax.to(
                leafContainer,
                ANIMATION_DURATION_MULTIPLIER,
                {
                    bezier: {
                        values: fallPath.flutter1
                    },
                    ease: Power3.easeOut
                }
            );

        debugger;

        masterTl.add(tween);

    }

    function init() {
        fall();
    }

    window.addEventListener('load', function () {
        init();
    }, false);


}(window));
