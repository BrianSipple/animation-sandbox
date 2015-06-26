(function () {

    var loaderContainerElem = document.querySelector('.loader-container'),
        loaderCube = document.querySelector('.loader_cube'),
        loaderBase = document.querySelector('.loader_base'),

        ANIMATION_DURATION_MULTIPLIER = 1,
        DURATION_SINGLE_PASS = ANIMATION_DURATION_MULTIPLIER * 3.6,

        masterTl = new TimelineMax({repeat: -1});

    function init () {


        TweenMax.set(
            [loaderBase, loaderContainerElem, loaderCube],
            {
                position: 'absolute',
                opacity: 1,
                top: '50%',
                left: '50%',
                //transform: 'translate(-50%, -50%)'
                yPercent: -50,
                xPercent: -50
            }
        );
        //
        //TweenMax.set(
        //    loaderCube,
        //    {
        //        position: 'absolute',
        //        top: '50%',
        //        left: '50%',
        //        transform: 'translate(-50%, -50%)'
        //        //yPercent: -50,
        //        //xPercent: -50
        //    }
        //);


        masterTl.set(
            loaderCube,
            {transformOrigin: '0% 100%', left: '+=70', top: "-=" + (70 / 2)}
        );

        masterTl.add(
            TweenMax.to(
                loaderCube,
                DURATION_SINGLE_PASS / 3,
                {rotation: '-=90', ease: Power4.easeOut}
            )
        );


        masterTl.set(
            loaderCube,
            {transformOrigin: '0% 100%', left: '-=70', rotation: 0}
        );

        masterTl.add(
            TweenMax.to(
                loaderCube,
                DURATION_SINGLE_PASS / 3,
                {rotation: '-=90', ease: Power4.easeOut}
            )
        );

        masterTl.set(
            loaderCube,
            {transformOrigin: '0% 100%', left: '-=70', rotation: 0}
        );

        masterTl.add(
            TweenMax.to(
                loaderCube,
                DURATION_SINGLE_PASS / 3,
                {rotation: '-=270', ease: Power4.easeInOut}
            )
        );

        masterTl.add(
            TweenMax.to(
                loaderContainerElem,
                DURATION_SINGLE_PASS / 3,
                {rotation: '+=180', ease: Back.easeInOut}
            ),
            '-=' + (DURATION_SINGLE_PASS / 3)
        );

        masterTl.set(
            loaderCube,
            {transformOrigin: '100% 0%', top: '+=70', rotation: 0}
        );

        masterTl.add(
            TweenMax.to(
                loaderCube,
                DURATION_SINGLE_PASS / 3,
                {rotation: '-=90', ease: Power4.easeOut}
            )
        );

        masterTl.set(
            loaderCube,
            {transformOrigin: '100% 0%', left: '+=70', rotation: 0}
        );

        masterTl.add(
            TweenMax.to(
                loaderCube,
                DURATION_SINGLE_PASS / 3,
                {rotation: '-=90', ease: Power4.easeOut}
            )
        );

        masterTl.set(
            loaderCube,
            {transformOrigin: '100% 0%', left: '+=70', rotation: 0}
        );

        masterTl.add(
            TweenMax.to(
                loaderCube,
                DURATION_SINGLE_PASS / 3,
                {rotation: '-=270', ease: Power4.easeInOut}
            )
        );

        masterTl.add(
            TweenMax.to(
                loaderContainerElem,
                DURATION_SINGLE_PASS / 3,
                {rotation: '+=180', ease: Back.easeInOut}
            ),
            '-=' + (DURATION_SINGLE_PASS / 3)
        );
    }

    window.addEventListener('load', function () {
        init();
    }, false);

}());
