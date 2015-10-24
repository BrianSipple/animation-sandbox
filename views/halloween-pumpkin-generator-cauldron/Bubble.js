import 'TweenMax';

const
    bubbleProto = {

        /* masterTL for the bubble */
        TL: undefined,

        /* DOM Reference to animate */
        elem: undefined,

        masterTLOpts: {
            repeat: -1,
            yoyo: true,
            //paused: true
        },

        EASINGS: {
            bubbleUp: Power3.easeInOut
        },

        init: function (elem) {
            this.elem = elem;
            this.TL = new TimelineMax(this.masterTLOpts);
        },

        setAnimationTimeline: function (duration, interval) {

            //this.TL.repeatDelay(interval);

            //let bubbleTL = new TimelineMax({ repeat: 0, yoyo: true, delay: interval });
            let bubbleTL = new TimelineMax({ yoyo: true, delay: interval });

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

export function Bubble (elem) {
    return bubbleFactory(elem);
};
