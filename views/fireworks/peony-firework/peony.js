var firework = (function (window, undefined) {
    'use strict';

    var fireworkContainer = document.querySelector('.firework-container'),
        fireworkSVG = fireworkContainer.querySelector('#firework-svg'),
        fireworkComponents = {},  // cache mapping of element references
        numLayers = 10,
        layerDensity = 20,
        blastRadius = 40,   // Percent of scene container SVG

        startingCircleCX = '50%',
        startingCircleCY = '50%',
        startingCircleR = 8,

        CLASSES = {
            fwBody: 'firework__body',
            fwFragment: 'firework__fragment'
        },

        COMPONENT_IDS = {
            fwBody: 'fwBody'
        },

        DURATIONS = {
            detonation: 10.1
        },

        masterTLConfig = {
            repeat: 0,
            paused: true
        },

        masterTL = new TimelineMax(masterTLConfig),
        detonationTL = new TimelineMax(),


        CircleFragmentFactory = function () {

            var CircleFragment = FireworkFragment();

            /**
             * For each fragment, configure its proper transform origin and rotation,
             * then configure its detonation TL
             */
            CircleFragment.setDetonationPath = function setDetonationPath(params, isPauseSet) {

                var
                    rotationZ = params.rotationZ || 0,
                    yDist = params.yDist || '100%',
                    r = params.r || startingCircleR,
                    ease = params.ease || Power4.easeOut;

                //debugger;
                TweenMax.set(this.el, {transformOrigin: '50% 50%', rotationZ: rotationZ});

                var tween =
                    TweenMax.to(
                        this.el,
                        this.detonationDuration,
                        {
                            attr: {
                                cy: yDist,
                                r: r
                            },
                            opacity: 1,
                            ease: ease
                        }
                    );


                this.TL = new TimelineMax();
                this.TL.add(tween);

                //if (isPauseSet) {
                //    masterTL.pause();
                //}

            };

            return CircleFragment;
        };

    function CircleFragment() {
        return Object.create(CircleFragmentFactory());
    }


    /**
     * Creates all the pieces of the firework.
     *
     * We'll create the elements themselves for insertion into the DOM,
     * and we'll also create object representations of each element to control it animation
     */
    function createFirework() {

        createComponents();
        createAnimations();

        function createComponents () {
            var fireWorkPiecesFrag = document.createDocumentFragment();

            // Create the element that will serve as our initial represention of the firework
            var centerCircleSVG = createCircleSVG({cx: startingCircleCX, cy: startingCircleCY, r: startingCircleR});
            centerCircleSVG.setAttribute('class', CLASSES.fwBody);
            fireworkComponents[COMPONENT_IDS.fwBody] = centerCircleSVG;   // store for later
            fireWorkPiecesFrag.appendChild(centerCircleSVG);

            var centerCircle = CircleFragment();
            centerCircle.init(centerCircleSVG);

            ///////////// Initialize SVG elements for each firework fragment ////////////////
            var circleSVG,
                i,
                j,
                id = 0;
            for (i = 0; i < numLayers; i++) {
                for (j = 0; j < layerDensity; j++) {
                    // DOM Element
                    circleSVG = createCircleSVG({cx: startingCircleCX, cy: startingCircleCY, r: startingCircleR});
                    circleSVG.setAttribute('class', CLASSES.fwFragment);
                    circleSVG.setAttribute('data-name', id.toString());

                    fireworkComponents[id++] = circleSVG;
                    fireWorkPiecesFrag.appendChild(circleSVG);
                }
            }
            fireworkSVG.appendChild(fireWorkPiecesFrag);  // Note: Right now, I'm before creating animations, as this was the only way I found for the svg container\'s dimensions to be accurately calculated
        }

        /**
         * Retreived the cached references to each of our SVG
         * elements and create / apply animations for them
         */
        function createAnimations () {

            var circleSVG,
                circleObj,
                zRotation,  // number between 0 and 360 inclusive
                cYIncrementPercentage,
                finalCYPercentage,
                detonationParams,
                i,
                j,
                id = 0;
            for (i = 0; i < numLayers; i++) {
                for (j = 0; j < layerDensity; j++) {

                    // Object Representation
                    circleSVG = fireworkComponents[id++];
                    circleObj = CircleFragment();
                    circleObj.init(circleSVG, DURATIONS.detonation);

                    //zRotation = ( ( (j / layerDensity) * 360 ) / 360 ) * 100 | 0;
                    zRotation = ( (j / layerDensity) * 360 ) | 0;
                    cYIncrementPercentage = ( (j + 1) / numLayers ) * blastRadius;
                    finalCYPercentage = cYIncrementPercentage + parseInt(startingCircleCY);


                    detonationParams = {
                        rotationZ: zRotation,
                        yDist: finalCYPercentage + '%',  // NOTE: Add the negation, because yDistances are upwards when negative
                        r: startingCircleR
                    };

                    circleObj.setDetonationPath(detonationParams);
                    detonationTL.add(circleObj.TL, 0);
                }
            }

        }


    }

    function shoot() {
        debugger;
        var tween = TweenMax.fromTo(
            fireworkComponents[COMPONENT_IDS.fwBody],
            2.0,
            { opacity: 1, attr: {cx: '0%'} },
            { attr: {cx: '50%'} }
        );

        return tween;

    }

    function goBoom() {

    }

    function init() {
        masterTL.add(shoot());
        debugger;
        masterTL.add(detonationTL);
        masterTL.play();
        //masterTL.add(goBoom());
    }


    createFirework();

    // expose init
    return {
        init: init
    };

}(window));

window.addEventListener('load', firework.init, false);
