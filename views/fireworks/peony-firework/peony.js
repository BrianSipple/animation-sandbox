var CircleFragmentFactory = function () {

    var CircleFragment = FireworkFragment();

    /**
     * For each fragment, configure its proper transform origin and rotation,
     * then configure its detonation TL
     */
    CircleFragment.setDetonationPath = function setDetonationPath(params) {

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
                0.1,
                {
                  opacity: 1,
                  onComplete: function () {
                    TweenMax.to(
                      this.el,
                      this.detonationDuration,
                      {
                          attr: {
                              cy: yDist,
                              r: r
                          },
                          ease: ease,
                      }
                    );
                    TweenMax.to(
                      this.el,
                      this.detonationDuration / 4.3,
                      {
                        opacity: 0,
                        ease: Power3.easeOut,
                        delay: this.detonationDuration * 0.35
                      }
                    );
                  }.bind(this)
                }
            );

        this.TL = new TimelineMax();
        this.TL.add(tween);
    };

    return CircleFragment;
};

var firework = (function (window, undefined) {
    'use strict';

    var fireworkContainer = document.querySelector('.firework-container'),
        fireworkSVG = fireworkContainer.querySelector('#firework-svg'),
        fireworkComponents = {},  // cache mapping of element references
        numLayers = 10,
        layerDensity = 40,
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
            flight: 1.49,
            detonation: 5.1
        },

        masterTLConfig = {
            repeat: 0,
            paused: true
        },

        masterTL = new TimelineMax(masterTLConfig),
        detonationTL = new TimelineMax();

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
        createDetonationAnimations();

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
        function createDetonationAnimations () {

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
                    cYIncrementPercentage = ( (i + 1) / numLayers ) * blastRadius;
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

    function shoot(flightDuration) {
      //debugger;

      var
        numWavelengths = 6,
        totalXDistPercentage = 50,
        amplitudePercentage = 3,
        frequency = flightDuration / numWavelengths,
        wavelength = totalXDistPercentage / numWavelengths,   // to be formatted as percentage
        fwBody = fireworkComponents[COMPONENT_IDS.fwBody],

        flightMasterTL = new TimelineMax({ paused: true }),
        flightSetupTL = new TimelineMax(),
        flightPathTL = new TimelineMax();

      // Set up the firework body and animate it into visibility
      flightSetupTL.add(
        TweenMax.to(fwBody, 0.1, {
            opacity: 1,
            transformOrigin: '50% 50%',
            attr: {
              cx: '0%',
              cy: '-=' + (amplitudePercentage / 2) + '%'
            }
          }
        )
      );

      // Add and upward tween, and then a downward tween, to the flightPathTL (which will then repeat until the FW gets to its detonation point)
      var upTween,
          downTween;
      for (var i = 0; i < numWavelengths; i++) {
        upTween = TweenMax.to(
          fwBody,
          frequency / 2,
          {
            attr: {
              cx: '+=' + (wavelength / 2) + '%',
              cy: '+=' + amplitudePercentage + '%'
            }
          }
        ),

        downTween = TweenMax.to(
          fwBody,
          frequency / 2,
          {
            attr: {
              cx: '+=' + wavelength / 2 + '%',
              cy: '-=' + amplitudePercentage + '%'
            }
          }
        );

        flightPathTL.add(upTween);
        flightPathTL.add(downTween);
      }

      // BOOM!
      flightPathTL.to(fwBody, 0.1, {opacity: 0});

      flightMasterTL.add(flightSetupTL);
      flightMasterTL.add(flightPathTL);

      return flightMasterTL;

    }


    function init() {
        masterTL.add(shoot(DURATIONS.flight).play());
        //debugger;
        masterTL.add(detonationTL);
        masterTL.play();
    }

    createFirework();

    // expose init
    return {
        init: init
    };

}(window));

window.addEventListener('DOMContentLoaded', firework.init, false);
