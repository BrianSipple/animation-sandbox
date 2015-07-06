(function (window) {

    var leafContainer = document.querySelector('.svg-container'),
        leafSVG = leafContainer.querySelector('#leafSVG'),

        ANIMATION_DURATION_MULTIPLIER = 1;

    //debugger;
    TweenMax.set(
        leafContainer,
        {
            position: 'absolute',
            right: 0,
            top: '10%',
            transformOrigin: '50% 50%'
        }
    );


    function fall() {

        var fallTl = new TimelineMax();

        // Setup the paths of each "flutter" (a path of motion before a directional
        // change occurs due to the lift....
        var fallPath = {
            flutter1: [
                {left: '-=0', top: '-=0', rotationY: 0, rotationX: 0, rotationZ: 0},
                {left: '-=25%', top: '-=10%', rotationY: 0, rotationX: '-=20%', rotationZ: '-=20%'},
                {left: '-=25%', top: '+=20%', rotationY: 0, rotationX: '+=40%', rotationZ: '+=40%'}
            ],
            flutter2: []
        };

        fallTl.add(
            TweenMax.to(
                leafContainer,
                ANIMATION_DURATION_MULTIPLIER * 3,
                {
                    bezier: {
                        values: fallPath.flutter1
                    },
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
