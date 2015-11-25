import TweenMax from 'TweenMax';
import DrawSVGPlugin from 'DrawSVGPlugin';
import MorphSVGPlugin from 'MorphSVGPlugin';
import Icon from './base/_icon';

const
    DURATIONS = {
        scaleUp: 0.5
    },

    SELECTORS = {

        ps4Controller: '.playstation-controller',
        psLogo: '.ps-logo',
        psLogoP: '.p',
        psLogoS: '.s',
        psLogoSTop: '.s__top',
        psLogoSBottom: '.s__bottom',
        vueTVLogo: '.playstation-vue-logo',
        vueTVLogoOutline: '.playstation-vue-logo__outline'
    },

    EASINGS = {
        toggleIcon: Power2.easeOut   // ~= linear-in-slow-out
    },


    boundUpdateAttr = function boundUpdateAttr (attr, value) {
        this.setAttribute(attr, value.toString());
    },


    boundSetStateOnToggle = function boundSetStateOnToggle () {
        debugger;
        this.boundDeclareAnimationComplete.bind(this)();
        this.isShowingPlay = !this.isShowingPlay;
    };

const ControllerToTvMorphIcon = ((svgContainerElem, opts) => {

    let icon = Icon();

    function createMorphTL () {

        let TL = new TimelineMax(
            {
                paused: true,
                onComplete: boundSetStateOnToggle.bind(icon),
                onReverseComplete: boundSetStateOnToggle.bind(icon)
            }
        );

        return TL;
    };


    icon.svgContainerElem = svgContainerElem;

    icon.DOM_REFS = {
        ps4Controller: icon.svgContainerElem.querySelector(SELECTORS.ps4Controller),
        vueTVLogo: icon.svgContainerElem.querySelector(SELECTORS.vueTVLogo),
        psLogo: icon.svgContainerElem.querySelector(SELECTORS.psLogo)
    };

    icon.mainIconTL = createMorphTL();

    icon.handleClick = function handleClick () {
        debugger;
        if (!this.isAnimating) {

            this.isAnimating = true;

            if (!this.shouldReverseAnimation) {
                // animate to the pause symbol
                this.mainIconTL.play(0);

            } else {
                // Reverse back to the play symbol.
                // NOTE: 0 sets the playhead at the end of the animation,
                // and we reverse from there
                this.mainIconTL.reverse(0);
            }

            this.shouldReverseAnimation = !this.shouldReverseAnimation;
        }
    }.bind(icon);

    return Object.create(icon);

});

export default ControllerToTvMorphIcon;
