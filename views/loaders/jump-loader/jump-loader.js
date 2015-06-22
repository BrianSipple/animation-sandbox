window.onload = function () {

    var loaderContainer = document.querySelector('.loader-container'),
        loaderSVG = document.querySelector('#loader'),
        circleL = document.querySelector('#circleL'),
        circleR = document.querySelector('#circleR'),
        jumpArc = document.querySelector('#jump'),

        BASE_DURATION_MULTIPLIER = 1.0;


    var jumpArcReflection = jumpArc.cloneNode();

    jumpArcReflection.setAttribute('class', 'reflection');  // setAttribute needs to be used for classing SVG in JS
    loaderSVG.appendChild(jumpArcReflection);


    setFilter('url("#strokeGlow")', jumpArc);
    setFilter('url("#strokeGlow")', jumpArcReflection);


    var masterTL = new TimelineMax( {repeat: -1} );


    function jump() {

        var jumpTL = new TimelineMax();

        jumpTL
            .set(
                [jumpArc, jumpArcReflection],
                {
                    drawSVG: '0% 0%'
                }
            )
            .to(
                loaderContainer,
                0,
                {
                    opacity: 1
                }
            )
            .set(
                [circleL, circleR],
                {
                    attr: {
                        rx: 0,
                        ry: 0
                    }
                }
            )
            .to(
                [jumpArc, jumpArcReflection],
                BASE_DURATION_MULTIPLIER * 0.4,
                {
                    drawSVG: '0% 30%',
                    ease: Linear.easeNone
                }
            )

            // scale up the ripple ovals (with x scaling a bit more since, you know, it's a horizontal oval :-) )
            .to(
                circleL,
                BASE_DURATION_MULTIPLIER * 2,
                {
                    attr: {
                        rx: '+=30',
                        ry: '+=10'
                    },
                    opacity: 0,     // ripple, then fade out
                    ease: Power1.easeOut
                },
                '-=0.1'
            )

            .to(
                [jumpArc, jumpArcReflection],
                BASE_DURATION_MULTIPLIER * 1.0,
                {
                    drawSVG: '50% 80%',
                    ease: Linear.easeNone
                },
                '-=1.9'
            )

            .to(
                [jumpArc, jumpArcReflection],
                BASE_DURATION_MULTIPLIER * 0.7,
                {
                    drawSVG: '100% 100%',
                    ease: Linear.easeNone
                },
                '-=0.9'
            )


            // finish by animating the right circle ripple
            .to(
                circleR,
                BASE_DURATION_MULTIPLIER * 2,
                {
                    attr: {
                        rx: '+=30',
                        ry: '+=10'
                    },
                    opacity: 0,  // ripple, then fade out
                    ease: Power1.easeOut
                },
                '-=0.5'
            );

        jumpTL.timeScale(3);

        return jumpTL;


    }


    masterTL.add(jump());


};






