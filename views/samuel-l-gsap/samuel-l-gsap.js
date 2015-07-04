(function (window) {

    var
        mainContentContainer = document.querySelector('.content'),
        slidingTextContainer = mainContentContainer.querySelector('.text-container'),
        slidingTextElem = slidingTextContainer.querySelector('.text'),
        animationToggleButton = mainContentContainer.querySelector('.button--timeline-toggle'),
        buttonPauseText = animationToggleButton.querySelector('.button-text--pause'),
        buttonResumeText = animationToggleButton.querySelector('.button-text--resume'),

        slipsums = [],// Samuel L.-Ipsums... parsed out of our JSON on-load
        numSlipsums,
        NETWORK_TIMEOUT_THRESHOLD = 7500, // max amount of time for network requests before throwing an error
        slipsumsPath = '../../assets/data/slipsums.json',

        isTextAnimating = false,

        ANIMATION_DURATION_MULTIPLIER = 1,
        DURATIONS = {
            slideText: ANIMATION_DURATION_MULTIPLIER * 50
        },

        slideTextTlOpts = {
            repeat: 0,
            onComplete: generateMoreText,
            onCompleteParams: ['{self}']
        },

        masterTL = new TimelineMax();


    TweenMax.set(
        mainContentContainer,
        {
            position: 'absolute',
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50
        }
    );



    function boundedRandom(min, max) {
        if (!max) {
            max = min;
            min = 0;
        }
        return Math.floor(min + ( Math.random() * (max - min) ));
    }


    /**
     * Choose a random slipSum and fill up our sliding text element
     */
    function generateMoreText(tl) {

        TweenMax.set(slidingTextElem, {x: '0%'});
        var
            idx = boundedRandom(numSlipsums),
            slipSum = slipsums[idx];

        slidingTextElem.textContent = slipSum;
        tl.add(triggerSlide(DURATIONS.slideText));
        //tl.addPause('-=' + DURATIONS.slideText/2);

        function triggerSlide(duration) {
            var tween = TweenMax.to(slidingTextElem, duration, {x: '-100%', ease: Linear.easeNone});
            return tween;
        }
    }


    function resumeSlide() {
        buttonPauseText.classList.add('visible');
        buttonResumeText.classList.remove('visible');
        masterTL.resume();

    }

    function pauseSlide() {
        buttonResumeText.classList.add('visible');
        buttonPauseText.classList.remove('visible');
        masterTL.pause();
    }


    function parseJSON(path) {
        return new Promise(function (resolve, reject) {

            var networkTimeout = setTimeout(function () {
                throw new Error('The request has been timed out with great vengeance.');
            }, NETWORK_TIMEOUT_THRESHOLD);

            var req = new XMLHttpRequest();
            req.open('GET', path);

            req.onload = function () {
                // onload is called even on a 404, so check the status
                if (req.status === 200) {
                    clearTimeout(networkTimeout);
                    resolve(req.response);
                }
                else {
                    reject(Error(req.statusText));
                }
            };

            // everybody strap in!
            req.send();
        });
    }

    function getSlipsums() {

        return parseJSON(slipsumsPath)
            .then(function (resp) {

                var texts = JSON.parse(resp);
                //debugger;

                numSlipsums = texts.slipsums.length;
                for (var i = 0; i < numSlipsums; i++) {
                    slipsums.push(texts.slipsums[i].text);
                }
            })
            .catch(function (err) {
                console.log('What\'s this bitch-ass JSON error for? -- fix it, motherfucker: ' + err);
            });
    }


    function initSlideTextTL () {
        var tl = new TimelineMax(slideTextTlOpts);
        generateMoreText(tl);
        return tl;
    }


    function init() {

        animationToggleButton.disabled = true;  // lock until we load

        getSlipsums().then(function () {
            masterTL.add(initSlideTextTL());
            animationToggleButton.disabled = false;
        });

        animationToggleButton.addEventListener('mouseup', function () {

            isTextAnimating ? resumeSlide() : pauseSlide();
            isTextAnimating = !isTextAnimating;

        }, false);
    }

    window.addEventListener('load', function () {
        init();

    }, false);

}(window));
