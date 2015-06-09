'use strict';

var BASE_ANIMATION_MULTIPLIER = 1,

//////////////// DOM elem references ////////////////
    mainContainer = document.querySelector('.main-container'),
    rocketWrapper = document.querySelector('.rocket-wrapper'),
    rocketContainer = document.querySelector('.rocket-body-container'),
    climbExhaustWrapper = document.querySelector('.exhaust-wrapper.climb'),
    platformExhaustWrapper = document.querySelector('.exhaust-wrapper.platform'),
    climbExhaustContainer = document.querySelector('.exhaust-container.climb'),
    platformExhaustContainer = document.querySelector('.exhaust-container.platform'),
    cloudSVGOuter = document.querySelector('.cloud-svg.outer'),
    rocket = document.querySelector('.rocket-container .rocket'),

//////////////// Constants ////////////////
    NUM_EXHAUST_CLOUDS = 100,

    DURATION__ROCKET_LAUNCH = BASE_ANIMATION_MULTIPLIER * 4,
    DURATION__EXHAUST = DURATION__ROCKET_LAUNCH * 2,
    DURATION__EXHAUST_BEFORE_LAUNCH = DURATION__EXHAUST / 2,
    DURATION__PLATFORM_EXHAUST = BASE_ANIMATION_MULTIPLIER * 2,

    WINDOW_WIDTH = window.innerWidth,
    WINDOW_HEIGHT = window.innerHeight,


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

        var liftRocket = TweenMax.to(
                rocketWrapper,
                duration,
                {
                    y: -1 * WINDOW_HEIGHT + 'px',
                    ease: Power3.easeIn
                }
            ),

            scaleUpExhaustContainer = TweenMax.to(
                climbExhaustContainer,
                duration,
                {
                    scaleY: 1,
                    ease: Power3.easeIn
                }
            );

        return [liftRocket, scaleUpExhaustContainer];
    },

    fireExhaust = function fireExhaustLeft(cloud, duration, xDest, yDest) {

        console.log("xDest: " + xDest);
        console.log('yDest: ' + yDest);

        var cloudOpacity = MathUtils.boundedRandom(.50, 1),
            cloudScale = MathUtils.boundedRandom(.5, 1.2);

        var emissionTween = TweenMax.to(
            cloud,
            duration,
            {
                bezier: {
                    type: 'thru',
                    values: [
                        {x: '0px', y: '0px'},
                        {x: (xDest * 0.28) + 'px', y: (yDest * 0.05) + 'px'},
                        {x: (xDest * 0.87 + 'px'), y: (yDest * 0.57) + 'px'},
                        {x: xDest + 'px', y: yDest + 'px'}
                    ],
                    curviness: 1,
                    autoRotate: true
                },
                opacity: cloudOpacity,
                scale: cloudScale
                //transform: 'translate3d(' + xTrans + 'px, ' + yTrans + 'px, ' + '0)'
            }
        );

        //var toFixed = TweenMax.to(cloud, 0, { position: 'absolute' });

        return emissionTween;
    },


    /**
     * Make some SVG clouds and append them to a provided container DOM element
     * @param n
     * @param container
     * @returns {Array}
     */
    makeClouds = function makeClouds(n, container) {

        var cloud,
            cloudSize = 200,
            use,
            cloudsFrag = document.createDocumentFragment(),
            res = [];
        for (var i = 0; i < n; i++) {

            //cloudSize = MathUtils.boundedRandom(20, 90);
            //cloudWidth = 200;
            //cloudHeight = 100;
            cloud = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            cloud.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            cloud.setAttribute('width', cloudSize + 'px');
            cloud.setAttribute('height', cloudSize + 'px');
            cloud.classList.add('cloud-svg');

            use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#cloudSVG');
            cloud.appendChild(use);

            res.push(cloud);
            cloudsFrag.appendChild(cloud);
        }

        container.appendChild(cloudsFrag);
        return res;
    },


    /**
     * Fire exhaust out from the platform before the rocket takes off.
     */
    initPlatformExhaust = function initPlatformExhaust (duration) {

        var exhaustTL = new TimelineMax(),
            exhaustClouds = makeClouds(NUM_EXHAUST_CLOUDS, platformExhaustContainer),

            leftClouds = exhaustClouds.slice(0, NUM_EXHAUST_CLOUDS / 2),
            rightClouds = exhaustClouds.slice(NUM_EXHAUST_CLOUDS / 2);

        var leftCloud,
            rightCloud,
            xDest,
            yDest,

            nextExhaustOffset = duration - 0.07,
            numAnims = NUM_EXHAUST_CLOUDS / 2;
        for (var i = 0; i < numAnims; i++) {

            leftCloud = leftClouds[i];
            rightCloud = rightClouds[i];

            xDest = WINDOW_WIDTH / 2;
            yDest = 0; // let's try 0 for now -- straight out

            exhaustTL.add(fireExhaust(leftCloud, duration, -xDest, yDest), '-=' + nextExhaustOffset);
            exhaustTL.add(fireExhaust(rightCloud, duration, xDest, yDest), '-=' + nextExhaustOffset);
        }

        exhaustTL.addLabel('exhaustTL__finish');
        return exhaustTL;

    },

    initClimbExhaust = function initClimbExhaust() {

        var exhaustTL = new TimelineMax(),
            exhaustClouds = makeClouds(NUM_EXHAUST_CLOUDS, climbExhaustContainer),
            leftClouds = exhaustClouds.slice(0, NUM_EXHAUST_CLOUDS / 2),
            rightClouds = exhaustClouds.slice(NUM_EXHAUST_CLOUDS / 2);

        var leftCloud,
            rightCloud,
            xDest,
            yDest,
            exhaustAnimationDuration = DURATION__ROCKET_LAUNCH,
            nextExhaustOffset = exhaustAnimationDuration - 0.07,
            numAnims = NUM_EXHAUST_CLOUDS / 2;
        for (var i = 0; i < numAnims; i++) {

            leftCloud = leftClouds[i];
            rightCloud = rightClouds[i];

            xDest = WINDOW_WIDTH / 4;
            yDest = i * (WINDOW_HEIGHT / numAnims); // gradually increment the yDest

            exhaustTL.add(fireExhaust(leftCloud, exhaustAnimationDuration, -xDest, yDest), '-=' + nextExhaustOffset);
            exhaustTL.add(fireExhaust(rightCloud, exhaustAnimationDuration, xDest, yDest), '-=' + nextExhaustOffset);
        }
        return exhaustTL;
    },


    initLaunch = function initLaunch() {
        debugger;

        var launchTL = new TimelineMax();

        launchTL.add(liftoffRocket(DURATION__ROCKET_LAUNCH));

        return launchTL;

    };


//////// Create tweens and queue them up on the timeline.


var masterTL = new TimelineMax({
    delay: BASE_ANIMATION_MULTIPLIER * 2
});


window.onload = function () {

    //masterTL.add(initPlatformExhaust(DURATION__PLATFORM_EXHAUST), 'platform-exhaust');
    //masterTL.add(initClimbExhaust(), 'exhaust', '-=' + DURATION__PLATFORM_EXHAUST);
    //masterTL.add(initLaunch());
    var platformExhaustTL = initPlatformExhaust(DURATION__PLATFORM_EXHAUST),
        platformExhaustEndTime = AnimUtils.findLabelTime(platformExhaustTL, 'exhaustTL__finish');


    masterTL.add(platformExhaustTL);
    masterTL.add(initClimbExhaust(), platformExhaustEndTime);
    masterTL.add(initLaunch());
};
















