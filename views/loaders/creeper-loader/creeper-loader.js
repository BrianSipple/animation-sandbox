(function () {
    var
        pathAreaSVG = document.querySelector('#areaContainer'),
        pathLineSVG = document.querySelector('#l0'),
        pathPoint0 = document.querySelector('#p0'),
        pathPoint1 = document.querySelector('#p1'),

        // Refercnces to cx and cy of path points that we'll update in each frame
        pathPoint0cX,
        pathPoint0cY,
        pathPoint1cX,
        pathPoint1cY,

        controlPointPathSegment = document.querySelector('.control-point_mid'),
        containerControlPoint = document.querySelector('.control-point_container'),
        controlPointP0 = document.querySelector('.control-point_p0'),
        controlPointP1 = document.querySelector('.control-point_p1'),

        pathLineWidth = Math.abs( Number(pathPoint0.getAttribute('cx')) - Number(pathPoint1.getAttribute('cx'))),

        ANIMATION_DURATION_MULTIPLIER = 0.5,

        masterTl = new TimelineMax({
            repeatDelay: 0,
            repeat: -1,
            yoyo: true
        });

    function init () {
        TweenMax.set(
            pathAreaSVG,
            {
                position: 'absolute',
                top: '50%',
                left: 0,
                xPercent: 0,
                yPercent: -50,
                opacity: 1
            }
        );

        TweenMax.set([pathPoint0, pathPoint1], {position: 'absolute'});
        TweenMax.set(controlPointPathSegment, {position: 'absolute', x: 300, y: 300});
        TweenMax.set(controlPointP0, {position: 'absolute', x: 10, y: 100});
        TweenMax.set(controlPointP1, {position: 'absolute', x: 100, y: 100});
    }



    function computePathPointCenters () {
        pathPoint0cX = controlPointP0._gsTransform.x;
        pathPoint0cY = controlPointP0._gsTransform.y;
        pathPoint1cX = controlPointP1._gsTransform.x;
        pathPoint1cY = controlPointP1._gsTransform.y;
    }

    function updatePoint0 () {
        TweenMax.set(
            pathPoint0,
            {
                attr: {
                    cx: controlPointP0._gsTransform.x,
                    cy: controlPointP0._gsTransform.y
                }
            }
        );
        computePathPointCenters();
    }

    function updatePoint1 () {
        TweenMax.set(
            pathPoint1,
            {
                attr: {
                    cx: controlPointP1._gsTransform.x,
                    cy: controlPointP1._gsTransform.y
                }
            }
        );
        computePathPointCenters();
    }

    /**
     * Called every frame to update the walking line of the loader
     */
    function updateLine() {

        var
            bezierDiffX = Math.abs(controlPointP0._gsTransform.x - controlPointP1._gsTransform.x) / 2,
            bezierOffsetX = Math.min(controlPointP0._gsTransform.x, controlPointP1._gsTransform.x) + bezierDiffX,
            bezierOffsetY = Math.min(controlPointP0._gsTransform.y, controlPointP1._gsTransform.y) - (pathLineWidth);

        TweenMax.to(
            controlPointPathSegment,
            ANIMATION_DURATION_MULTIPLIER * 0.08,
            {
                x: bezierOffsetX,
                y: bezierOffsetY,
                ease: Power1.easeIn
            }
        );

        var
            newControlPointX = controlPointPathSegment._gsTransform.x,
            newControlPointY = controlPointPathSegment._gsTransform.y;

        TweenMax.set(
            pathLineSVG,
            {
                attr: {
                    d: 'M' + pathPoint0cX + ',' + pathPoint0cY +
                       ' Q' + newControlPointX + ',' + newControlPointY +
                       ' ' + pathPoint1cX + ',' + pathPoint1cY
                }
            }
        );
    }

    function calibratePoints () {
        TweenMax.set(
            pathPoint0,
            {
                attr: {
                    cx: controlPointP0._gsTransform.x,
                    cy: controlPointP0._gsTransform.y
                }
            }
        );
        TweenMax.set(
            pathPoint1,
            {
                attr: {
                    cx: controlPointP1._gsTransform.x,
                    cy: controlPointP1._gsTransform.y
                }
            }
        );
        updatePoint0();
        updatePoint1();
        updateLine();
    }

    function startMotion () {

        masterTl.add(
            TweenMax.to(
                controlPointP0,
                ANIMATION_DURATION_MULTIPLIER * 1,
                {
                    x: 200,
                    onUpdate: updatePoint0,
                    ease: Power4.easeInOut
                }
            )
        );

        masterTl.add(
            TweenMax.to(
                controlPointP1,
                ANIMATION_DURATION_MULTIPLIER * 1,
                {
                    x: 200 + pathLineWidth,
                    onUpdate: updatePoint1,
                    ease: Power4.easeInOut
                }
            )
        );

        masterTl.add(
            TweenMax.to(
                controlPointP0,
                ANIMATION_DURATION_MULTIPLIER * 1,
                {
                    x: 200 + (pathLineWidth * 2),
                    onUpdate: updatePoint0,
                    ease: Power4.easeInOut
                }
            )
        );

        masterTl.add(
            TweenMax.to(
                controlPointP1,
                ANIMATION_DURATION_MULTIPLIER * 1,
                {
                    x: 200 + (pathLineWidth * 3),
                    onUpdate: updatePoint1,
                    ease: Power4.easeInOut
                }
            )
        );
    }

    window.addEventListener('load', function () {
        init();
        startMotion();
        calibratePoints();

        // Hook updateLine() into TweenMax's RAF loop
        TweenMax.ticker.addEventListener('tick', updateLine);

    }, false);

})();
