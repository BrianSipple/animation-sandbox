(function (window) {

    var
        chainOuter = document.querySelector('.chain__outer'),
        chainInner = document.querySelector('.chain__inner'),
        circlesFrag = document.createDocumentFragment(),
        circles = [],   // filled onload,
        WINDOW_WIDTH = window.innerWidth,
        WINDOW_HEIGHT = window.innerHeight,

        circleWidth = 40,
        NUM_CIRCLES = 30,

        ANIMATION_DURATION_MULTIPLIER = 1,

        staggerOpts = {
            opacity: 0,
            y: -800,
            ease: Elastic.easeInOut
        },


        tlConfig = {
            repeat: -1,
            yoyo: true
        },
        masterTl = new TimelineMax(tlConfig);

    //TweenMax.set(
    //    chainOuter,
    //    {
    //        position: 'absolute',
    //        top: '50%',
    //        left: '50%',
    //        yPercent: -50,
    //        xPercent: -50
    //    }
    //);


    function initCircles () {

        var useSVG,
            containerWidth = NUM_CIRCLES * ( circleWidth + (circleWidth * .1) ),  // Num circles * (circle width + padding)
            startingX = -(containerWidth/2);
        for (var i = 0; i < NUM_CIRCLES; i++) {

            useSVG = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            useSVG.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#circleSVG' );
            useSVG.setAttribute('x', ( startingX + (i * circleWidth) ) + 'px');
            useSVG.classList.add('circle');

            circlesFrag.appendChild(useSVG);  // build the frag
            circles.push(useSVG);             // cache references
        }

        chainInner.appendChild(circlesFrag);
    }

    function rain() {
        masterTl.add(
            TweenMax.staggerFrom(circles, ANIMATION_DURATION_MULTIPLIER, staggerOpts, 0.04)
        );
    }



    window.addEventListener('load', function () {
        initCircles();
        rain();
    });

    window.addEventListener('resize', function () {
        WINDOW_WIDTH = window.innerWidth;
        WINDOW_HEIGHT = window.innerHeight;
    }, false);



}(window));
