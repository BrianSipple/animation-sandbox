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
     * Initialize the set of shapes around the center shape
     * Six shapes in a hexagonal pattern
     */
    function initShapes () {

        var
            circle,
            outwardDistance = circleWidth + (circleWidth * 0.15);  // add some additional padding proportional to the circle width
        for (var i = 0; i < 6; i++) {

            circle = document.createElement('div');
            circle.classList.add('shape-set__outer');
            circle.classList.add('shape-set__outer--circle');
            circle.style.transform = 'rotate(' + ( (i * (360 / 6)) ) + 'deg) translateY( -' + outwardDistance + 'px)';

            outerCircleElems.push(circle);  // store references
            outerCirclesFrag.appendChild(circle);  // build the fragment to be injected

        }
        shapeSet.appendChild(outerCirclesFrag);
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
