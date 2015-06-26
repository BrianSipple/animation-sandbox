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
    thrusters = rocket.querySelector('.thrusters'),

//////////////// Constants ////////////////

    LABEL__PLATFORM_EXHAUST = 'platform-exhaust',
    LABEL__RATTLE_THRUSTERS = 'rattle-thrusters',
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

    fireExhaust = function fireExhaust(cloud, duration, xDest, yDest) {

        console.log("xDest: " + xDest);
        console.log('yDest: ' + yDest);

        var cloudOpacity = MathUtils.boundedRandom(.50, 1),
            cloudScale = MathUtils.boundedRandom(.5, 1.2),

            emissionTween =
                TweenMax.to(
                    cloud,
                    duration,
                    {
                        bezier: {
                            type: 'thru',
                            values: [
                                {x: '0px', y: '0px'},
                                {x: (xDest * 0.09) + 'px', y: (yDest * 0.25) + 'px'},
                                {x: (xDest * 0.50) + 'px', y: (yDest * 0.95) + 'px'},
                                {x: xDest + 'px', y: yDest + 'px'}
                            ],
                            curviness: 1,
                            autoRotate: true,
                            ease: Power4.easeIn
                        },
                        opacity: cloudOpacity,
                        scale: cloudScale,
                        ease: Power0.easeNone
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


    rattleThrusters = function rattleThrusters() {

        var tl = new TimelineMax({
                repeat: 40
            }),

            rattleRight = TweenMax.to(
                thrusters,
                BASE_ANIMATION_MULTIPLIER * 0.01,
                {
                    x: '2%',
                    //yoyo: true,
                    ease: Linear.easeInCubic
                }
            ),

            rattleLeft = TweenMax.to(
                thrusters,
                BASE_ANIMATION_MULTIPLIER * 0.01,
                {
                    x: '-2%',
                    ease: Linear.easeInCubic
                }
            ),


            reposition = TweenMax.to(
                thrusters,
                BASE_ANIMATION_MULTIPLIER * 0.01,
                {
                    x: '0',
                    ease: Linear.easInCubic
                }
            );


        tl.add(rattleRight);
        tl.add(rattleLeft);
        tl.add(reposition);
        return tl;

    },


    /**
     * Fire exhaust out from the platform before the rocket takes off.
     */
    initPlatformExhaust = function initPlatformExhaust(duration) {

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

            exhaustTL.add(fireExhaust(leftCloud, duration, -xDest, yDest), '-=' + nextExhaustOffset, 'start');
            exhaustTL.add(fireExhaust(rightCloud, duration, xDest, yDest), '-=' + nextExhaustOffset, 'start');
        }

        exhaustTL.add( fadeClouds([leftClouds.reverse(), rightClouds.reverse()], duration) );

        exhaustTL.addLabel('exhaustTL__finish');
        return exhaustTL;

    },

    initClimbExhaust = function initClimbExhaust(duration) {

        var exhaustTL = new TimelineMax(),
            exhaustClouds = makeClouds(NUM_EXHAUST_CLOUDS, climbExhaustContainer),
            leftClouds = exhaustClouds.slice(0, NUM_EXHAUST_CLOUDS / 2),
            rightClouds = exhaustClouds.slice(NUM_EXHAUST_CLOUDS / 2);

        var leftCloud,
            rightCloud,
            xDest = WINDOW_WIDTH / 4,
            yDest,
            nextExhaustOffset = duration - 0.07,
            numAnims = NUM_EXHAUST_CLOUDS / 2,
            yMultiplier = WINDOW_HEIGHT / numAnims;
        for (var i = 0; i < numAnims; i++) {

            leftCloud = leftClouds[i];
            rightCloud = rightClouds[i];

            yDest = i * (yMultiplier); // gradually increment the yDest

            exhaustTL.add(fireExhaust(leftCloud, duration, -xDest, yDest), '-=' + nextExhaustOffset);
            exhaustTL.add(fireExhaust(rightCloud, duration, xDest, yDest), '-=' + nextExhaustOffset);
        }
        exhaustTL.add( fadeClouds([leftClouds.reverse(), rightClouds.reverse()], duration) );

        return exhaustTL;
    },

    fadeClouds = function fadeClouds (cloudSets, duration) {

        var tweens = [];

        for (var i = 0, l = cloudSets.length; i < l; i++) {
            tweens.push(
                TweenMax.staggerTo(
                    cloudSets[i],
                    duration,
                    { opacity: 0 },
                    duration * 0.008
                )
            );
        }
        return tweens;
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

    var
        thrusterTl = rattleThrusters(),
        platformExhaustTl = initPlatformExhaust(DURATION__PLATFORM_EXHAUST),
        climbExhaustTl = initClimbExhaust(DURATION__ROCKET_LAUNCH),
        rocketLaunchTl = initLaunch();

    masterTL.add(thrusterTl, LABEL__RATTLE_THRUSTERS);
    masterTL.add(platformExhaustTl, LABEL__PLATFORM_EXHAUST);
    masterTL.add(climbExhaustTl, LABEL__PLATFORM_EXHAUST);  // From what I can tell, using the same label stacks them right after the clouds that appear while on the platform
    masterTL.add(rocketLaunchTl, LABEL__PLATFORM_EXHAUST + '+= 3');
};
















