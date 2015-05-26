'use strict';

var BASE_ANIMATION_MULTIPLIER = 1,
    mainContainer = document.querySelector('.main-container'),
    rocketContainer = document.querySelector('.rocket-body-container'),
    exhaustContainer = document.querySelector('.rocket-exhaust-container'),
    cloudSVGOuter = document.querySelector('.cloud-svg.outer'),
    rocket = document.querySelector('.rocket-container .rocket'),
    NUM_EXHAUST_CLOUDS = 100,

    DURATION__ROCKET_LAUNCH = BASE_ANIMATION_MULTIPLIER * 4,
    DURATION__EXHAUST = DURATION__ROCKET_LAUNCH * 2,
    DURATION__EXHAUST_BEFORE_LAUNCH = DURATION__EXHAUST / 2,



    rotateZ = function rotateZ(elem, deg, duration) {
        return TweenMax.to(
            elem,
            duration,
            {
                transform: 'rotateZ(' + deg + 'deg)'
            }
        );
    },


    liftoffRocket = function liftoffRocket(duration) {

        return TweenMax.to(
            [rocketContainer, exhaustContainer],
            duration,
            {
                y: '-200%',
                ease: Power3.easeIn
            }
        );
    },


    fireExhaustLeft = function fireExhaustLeft(cloud, duration) {

        var xDest = -400,
            yDest = -200,
        //var xTrans = MathUtils.boundedRandom(10, 400),
        //    yTrans = -MathUtils.boundedRandom(-25, 20),
            cloudOpacity = MathUtils.boundedRandom(.50, 1),
            cloudScale = MathUtils.boundedRandom(.5, 1.2);

        var emissionTween = TweenMax.to(
            cloud,
            duration,
            {
                bezier: {
                    type: 'thru',
                    values: [
                        {x: 0, y: 0},
                        {x: (xDest * 0.28), y: (yDest * 0.05)},
                        {x: (xDest * 0.87), y: (yDest * 0.57)},
                        {x: xDest, y: yDest}
                    ],
                    curviness: 1,
                    autoRotate: true
                },
                opacity: cloudOpacity,
                scale: cloudScale
                //transform: 'translate3d(' + xTrans + 'px, ' + yTrans + 'px, ' + '0)'
            }
        );

        var toFixed = TweenMax.to(cloud, 0, { position: 'fixed' });

        return [emissionTween, toFixed];
    },


    fireExhaustRight = function fireExhaustRight(cloud, duration) {

        //var yDest = -MathUtils.boundedRandom(0, 200),
        //    xDest = 400 * (-1 * (yDest / 200)),  // x is proportional to the ratio of the height
        var xDest = 400,
            yDest = -200,
            cloudOpacity = MathUtils.boundedRandom(.50, 1),
            cloudScale = MathUtils.boundedRandom(.5, 1.2);

        var emissionTween = TweenMax.to(
            cloud,
            duration,
            {
                bezier: {
                    type: 'thru',
                    values: [
                        {x: 0, y: 0},
                        {x: (xDest * 0.28), y: (yDest * 0.05)},
                        {x: (xDest * 0.87), y: (yDest * 0.57)},
                        {x: xDest, y: yDest}
                    ],
                    curviness: 1,
                    autoRotate: true
                },
                opacity: cloudOpacity,
                scale: cloudScale
                //transform: 'translate3d(' + xTrans + 'px, ' + yTrans + 'px, ' + '0)'
            }
        );

        // QUESTION: perform this first?
        var toFixed = TweenMax.to(cloud, 0, { position: 'fixed' });

        return [emissionTween, toFixed];
    },

    makeClouds = function makeClouds(n) {

        var cloud,
            cloudSize,
            cloudWidth = 200,
            cloudHeight = 100,
            use,
            cloudsFrag = document.createDocumentFragment(),
            res = [];
        for (var i = 0; i < n; i++) {

            //cloudSize = MathUtils.boundedRandom(20, 90);
            //cloudWidth = 200;
            //cloudHeight = 100;
            cloud = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            cloud.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            cloud.setAttribute('width', cloudWidth + 'px');
            cloud.setAttribute('height', cloudWidth + 'px');
            cloud.classList.add('cloud-svg');

            use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#cloudSVG');
            cloud.appendChild(use);

            res.push(cloud);
            cloudsFrag.appendChild(cloud);
        }

        exhaustContainer.appendChild(cloudsFrag);
        return res;
    },


    initExhaust = function initExhaust () {

        var exhaustTL = new TimelineMax(),
            exhaustClouds = makeClouds(NUM_EXHAUST_CLOUDS),
            leftClouds = exhaustClouds.slice(0, NUM_EXHAUST_CLOUDS / 2),
            rightClouds = exhaustClouds.slice(NUM_EXHAUST_CLOUDS / 2);

        var leftCloud,
            rightCloud,
            exhaustAnimationDuration = BASE_ANIMATION_MULTIPLIER * 2,
            nextExhaustOffset = exhaustAnimationDuration - 0.07;
        for (var i = 0; i < NUM_EXHAUST_CLOUDS / 2; i++) {

            leftCloud = leftClouds[i];
            rightCloud = rightClouds[i];

            exhaustTL.add(fireExhaustLeft(leftCloud, exhaustAnimationDuration), '-=' + nextExhaustOffset);
            exhaustTL.add(fireExhaustRight(rightCloud, exhaustAnimationDuration), '-=' + nextExhaustOffset);
        }
        return exhaustTL;
    },


    initLaunch = function initLaunch () {

        var launchTL = new TimelineMax();
        launchTL.add(liftoffRocket(DURATION__ROCKET_LAUNCH));

        return launchTL;

    };


//////// Create tweens and queue them up on the timeline.



var masterTL = new TimelineMax({
    delay: BASE_ANIMATION_MULTIPLIER * 2
});


window.onload = function () {
    masterTL.add(initExhaust(), 'exhaust');
    masterTL.add(initLaunch(), '-=' + DURATION__EXHAUST_BEFORE_LAUNCH*2);
};
















