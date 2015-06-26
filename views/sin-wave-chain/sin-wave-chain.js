(function (window) {

    var
        chain = document.querySelector('.chain'),
        circlesFrag = document.createDocumentFragment(),
        circles = [],   // filled onload,
        WINDOW_WIDTH = window.innerWidth,
        WINDOW_HEIGHT = window.innerHeight,

        circleWidth = 40,
        NUM_CIRCLES = 30,

        ANIMATION_DURATION_MULTIPLIER = 1,

        tlConfig = {
            repeat: 0
        },
        masterTl = new TimelineMax(tlConfig);


    function initCircles () {

        var
            circleSVG,
            useSVG;
        for (var i = 0; i < NUM_CIRCLES; i++) {

            circleSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            circleSVG.setAttribute('xmlns:link', 'http://www.w3.org/1999/xlink');
            circleSVG.setAttribute('x', (i * circleWidth) + 'px');
            circleSVG.classList.add('circle');
            //circleSVG.style.transform = 'translateX(' + (i * circleWidth) + 'px)';
            //circleSVG.style.transformOrigin = '50% 50%';

            useSVG = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            useSVG.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#circleSVG' );

            circleSVG.appendChild(useSVG);
            circlesFrag.appendChild(circleSVG);  // build the frag
            circles.push(circleSVG);             // cache references
        }

        chain.appendChild(circlesFrag);
    }

    function projectWave() {

    }



    window.addEventListener('load', function () {
        initCircles();
        circles[0].addEventListener('click', projectWave, false);
    });

    window.addEventListener('resize', function () {
        WINDOW_WIDTH = window.innerWidth;
        WINDOW_HEIGHT = window.innerHeight;
    }, false);



}(window));
