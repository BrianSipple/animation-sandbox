(function (window) {
    var
        mainViewContainer = document.querySelector('.main-view-container'),
        shapeSet = document.querySelector('.shape-set'),
        centerCircle = document.querySelector('.shape-set__center'),
        alertMsg = document.querySelector('.alert'),

        circleWidth = centerCircle.clientWidth,
        outerCircleElems = [], // dynamically fill onload by adding in our outer circles
        outerCirclesFrag = document.createDocumentFragment(),

        WINDOW_WIDTH = window.innerWidth,
        WINDOW_HEIGHT = window.innerHeight,

        ANIMATION_DURATION_MULTIPLIER = 1,

        tlConfig = {
            repeat: -1
        },
        masterTl = new TimelineMax(tlConfig);

    // Center the set vertically and horizontally
    TweenMax.set(
        shapeSet,
        {
            position: 'absolute',
            top: '50%',
            left: '50%',
            yPercent: -50,
            xPercent: -50
        }
    );


    /**
     * Helper function to sort elements from top to bottom y position
     */
    function topToBottom(elemA, elemB) {
        return elemA.getBoundingClientRect().top > elemB.getBoundingClientRect().top;  // lower values are higher up
    }

    /**
     * Helper function to sort elements from bottom to top y position
     */
    function bottomToTop(elemA, elemB) {
        return elemA.getBoundingClientRect().bottom < elemB.getBoundingClientRect().bottom;  // higher "bottom" are sorted in front
    }

    /**
     * Initialize the set of shapes around the center shape
     * Six shapes in a hexagonal pattern
     */
    function initShapes () {

        var
            circleSVG,
            svgUse,
            outwardDistance = circleWidth + (circleWidth * 0.15);  // add some additional padding proportional to the circle width
        for (var i = 0; i < 6; i++) {

            circleSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            circleSVG.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            circleSVG.classList.add('shape-set__outer');
            circleSVG.classList.add('shape-set__outer--circle');
            circleSVG.style.transform = 'rotate(' + ( (i * (360 / 6)) ) + 'deg) translateY( -' + outwardDistance + 'px)';

            svgUse = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            svgUse.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#circleSVG');
            circleSVG.appendChild(svgUse);


            outerCircleElems.push(circleSVG);  // store references
            outerCirclesFrag.appendChild(circleSVG);  // build the fragment to be injected

        }
        shapeSet.appendChild(outerCirclesFrag);

        // sort references from top to bottom so that this is the order when we animate the list
        outerCircleElems.sort(bottomToTop);
    }


    function setSparkle () {

        masterTl.add([

            TweenMax.fromTo(
                centerCircle,
                ANIMATION_DURATION_MULTIPLIER,
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1 }
            ),

            TweenMax.staggerFromTo(
                outerCircleElems,
                ANIMATION_DURATION_MULTIPLIER,
                { opacity: 0, scale: 0 },
                { opacity: 1, scale: 1 },
                ANIMATION_DURATION_MULTIPLIER / (outerCircleElems.length + 1)  // stagger by equal fraction of the total duration
            )
        ]);

    }

    function moveSparkle (ev) {

        var
            xPercent = (ev.clientX / WINDOW_WIDTH) * 100,
            yPercent = (ev.clientY / WINDOW_HEIGHT) * 100;

        TweenMax.set(shapeSet, {opacity: 0})

        TweenMax.set(
            shapeSet,
            {
                top: yPercent + '%',
                left: xPercent + '%'
            }
        );

        masterTl.restart();
        TweenMax.set(shapeSet, {opacity: 1});
    }

    mainViewContainer.addEventListener('click', function (ev) {

        alertMsg.style.opacity = 0;  // obviously, the user got the message ;-)
        alertMsg.style.zIndex = -1;  // hardware acceration > DOM manipulation

        moveSparkle(ev);
    }, false);

    window.addEventListener('load', function () {
        initShapes();
        setSparkle();
    }, false);

    window.addEventListener('resize', function () {
        WINDOW_WIDTH = window.innerWidth;
        WINDOW_HEIGHT = window.innerHeight;
    });


}(window));
