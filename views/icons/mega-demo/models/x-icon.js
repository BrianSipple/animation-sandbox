import 'TweenMax';
import 'DrawSVGPlugin';
import Icon from './base/_icon';

const
    DURATIONS = {
        closeIcon: 0.5
    },

    EASINGS = {
        closeIcon: Power1.easeOut
    };

let ShrkinkingToCloseXIcon = function (svgElem, opts = {}) {

    let icon = Icon();
    icon.svgElem = svgElem;

    icon.DOM_REFS = {
        paths: icon.svgElem.querySelectorAll('path')
    };

    if (opts.refreshTime) {
        icon.refreshTime = opts.refreshTime;
    }

    icon.handleClick = function handleClick (ev) {

        if (!this.isAnimating) {
            this.isAnimating = true;

            // Either create the timeline, or replay it
            if (this.mainObjectTL) {
                this.mainObjectTL.play(0);
            } else {

                this.mainObjectTL = new TimelineMax({
                    onComplete: icon.boundDeclareAnimationComplete.bind(icon)
                });

                this.mainObjectTL.to(
                    icon.DOM_REFS.paths,
                    DURATIONS.closeIcon,
                    { drawSVG: '50% 50%', ease: EASINGS.closeIcon }
                );

                if (icon.refreshTime) {
                    this.mainObjectTL.to(
                        icon.DOM_REFS.paths,
                        DURATIONS.closeIcon,
                        { drawSVG: '100%', ease: EASINGS.closeIcon, delay: icon.refreshTime }
                    );
                }
            }
        }
    };
    return Object.create(icon);
};

export default ShrkinkingToCloseXIcon;
