import 'TweenMax';
import 'DrawSVGPlugin';
import Icon from './base/_icon';

const
  SELECTORS = {
    motionTrailSVGs: '.wand__motion-trail',
    motionTrail1SVG: '.wand__motion-trail-1',
    motionTrail2SVG: '.wand__motion-trail-2',
    motionTrail3SVG: '.wand__motion-trail-3',
    wandBodySVG: '.wand__body',
  },

  EASINGS = {
    linear: Power0.easeNone,
    default: Power4.easeOut,
    flickWandDown: Power2.easeIn,
    flickWandBack: Power4.easeOut
  },

  DURATIONS = {
    flickWandDown: 0.25,
    flickWandBack: 0.7
  };


let WandIcon = (svgElem) => {

    let wandIcon = Icon();
    wandIcon.svgElem = svgElem;

    wandIcon.DOM_REFS = {
        wandBodySVG: wandIcon.svgElem.querySelector(SELECTORS.wandBodySVG),
        wandMotionTrailSVGs: wandIcon.svgElem.querySelectorAll(SELECTORS.motionTrailSVGs)
    };

    wandIcon.flickWand = function flickWand () {
      let TL = new TimelineMax();

      // Set the transOrigin (center of gravity) to be near the
      // bottom part of the handle
      //debugger;
      TL.set(this.DOM_REFS.wandBodySVG, { transformOrigin: '5% 95% 0' }); // TODO: Get a more exact measuremnt for center of gravity

      // down...
      TL.to(
        this.DOM_REFS.wandBodySVG,
        DURATIONS.flickWandDown,
        {rotation: '+=45', ease: EASINGS.flickWandDown }
      );

      // ...and back
      TL.to(
        this.DOM_REFS.wandBodySVG,
        DURATIONS.flickWandBack,
        {rotation: '-=45', ease: EASINGS.flickWandBack }
      );
      return TL;
    };

    wandIcon.showMotionTrail = function showMotionTrail () {

      let TL = new TimelineMax();

      TL.set(this.DOM_REFS.wandMotionTrailSVGs, { opacity: 1, drawSVG: false, });

      // down....
      TL.to(
        this.DOM_REFS.wandMotionTrailSVGs,
        DURATIONS.flickWandDown,
        { drawSVG: '0% 95%', ease: EASINGS.flickWandDown }
      );

      // ...and back
      TL.to(
        this.DOM_REFS.wandMotionTrailSVGs,
        DURATIONS.flickWandBack,
        { drawSVG: false, ease: EASINGS.flickWandBack }
      );

      return TL;
    };

    wandIcon.handleClick = function handleClick (ev) {
      debugger;
      if (!this.isAnimating) {

        this.isAnimating = true;

        // Either create the timeline, or replay it
        if (this.mainObjectTL) {
          this.mainObjectTL.play(0);

        } else {
          this.mainObjectTL = new TimelineMax({
            // yoyo: true,
            // repeat: 1,
            onComplete: function () {
                this.isAnimating = false;
            }.bind(this)
          });

          let
            flickWandTL = this.flickWand(),
            motionTrailTL = this.showMotionTrail();

          this.mainObjectTL.add(flickWandTL, 0);
          this.mainObjectTL.add(motionTrailTL, 0);

          //this.masterTL.add(this.mainObjectTL, this.LABEL);
        }
      }
    };

    return Object.create(wandIcon);  // TODO: Determine if Object.create is needed here
};


  export default WandIcon;
