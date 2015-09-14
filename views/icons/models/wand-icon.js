import 'TweenMax';
import 'DrawSVGPlugin';
import Icon from './icon';

const
  SELECTORS = {
    motionTrailSVGS: '.wand__motion-trail',
    motionTrail1SVG: '.wand__motion-trail-1',
    motionTrail2SVG: '.wand__motion-trail-2',
    motionTrail3SVG: '.wand__motion-trail-3',
    wandBodySVG: '#WandBody',
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
  },

  DOM_REFS = {
    wandBodySVG: document.querySelector(SELECTORS.wandBodySVG),
    wandMotionTrailSVGs: document.querySelectorAll(SELECTORS.motionTrailSVGS)
  };

let WandIcon = () => {

    let wandIcon = Icon();

    wandIcon.flickWand = function flickWand () {
      let TL = new TimelineMax();

      // Set the transOrigin (center of gravity) to be near the
      // bottom part of the handle
      debugger;
      TL.set(DOM_REFS.wandBodySVG, { transformOrigin: '5% 95% 0' }); // TODO: Get a more exact measuremnt for center of gravity

      // down...
      TL.to(
        DOM_REFS.wandBodySVG,
        DURATIONS.flickWandDown,
        {rotation: '+=45', ease: EASINGS.flickWandDown }
      );

      // ...and back
      TL.to(
        DOM_REFS.wandBodySVG,
        DURATIONS.flickWandBack,
        {rotation: '-=45', ease: EASINGS.flickWandBack }
      );
      return TL;
    };

    wandIcon.showMotionTrail = function showMotionTrail () {

      let TL = new TimelineMax();

      TL.set(DOM_REFS.wandMotionTrailSVGs, { opacity: 1, drawSVG: false, });

      // down....
      TL.to(
        DOM_REFS.wandMotionTrailSVGs,
        DURATIONS.flickWandDown,
        { drawSVG: '0% 95%', ease: EASINGS.flickWandDown }
      );

      // ...and back
      TL.to(
        DOM_REFS.wandMotionTrailSVGs,
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
        if (this.mainIconTL) {
          this.mainIconTL.play(0);

        } else {
          this.mainIconTL = new TimelineMax({
            // yoyo: true,
            // repeat: 1,
            onComplete: function onIconAnimationTLComplete () {
              this.isAnimating = false;
            }.bind(this)
          });

          let
            flickWandTL = this.flickWand(),
            motionTrailTL = this.showMotionTrail();

          this.mainIconTL.add(flickWandTL, 0);
          this.mainIconTL.add(motionTrailTL, 0);

          //this.masterTL.add(this.mainIconTL, this.LABEL);
        }
      }
    };

    return Object.create(wandIcon);  // TODO: Determine if Object.create is needed here
};


  export default WandIcon;
