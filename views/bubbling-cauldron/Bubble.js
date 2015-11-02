import 'TweenMax';

const
    bubbleProto = {

        /* masterTL for the bubble */
        TL: undefined,

        /* DOM Reference to animate */
        elem: undefined,

        masterTLOpts: {
            repeat: -1,
            yoyo: true
            //paused: true
        },

        EASINGS: {
            bubbleUp: Power3.easeInOut
        },

        init: function (elem) {
            this.elem = elem;
            this.TL = new TimelineMax(this.masterTLOpts);
        },

        /*
         * Exposed to the caller to kick off the animation with
         * a given duration and repeat interval.
         */
        setAnimationTimeline: function (duration, repeatInterval) {

            let bubbleTL = new TimelineMax({ delay: repeatInterval });

            bubbleTL.to(
                this.elem,
                duration,
                { scale: 1, ease: this.EASINGS.bubbleUp }
            );

            this.TL.add(bubbleTL);
        }
    },

    bubbleFactory = function (elem) {
        let bubble = Object.create(bubbleProto);
        bubble.init(elem);
        return bubble;
    };

function Bubble (elem) {
    return bubbleFactory(elem);
}

export default Bubble;
