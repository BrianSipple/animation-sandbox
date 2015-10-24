import 'TweenMax';
import 'MorphSVGPlugin';

const flameProto = {

    /* DOM node that serves as our morph source */
    startStateSelector: undefined,

    /* DOM node that serves as our morph target */
    endStateSelector: undefined,

    /* masterTL for the flame */
    TL: undefined,

    EASINGS: {
        //flameFlicker: Power4.easeOut
        flameFlicker: Power0.easeNone
    },

    masterTLOpts: {
        repeat: -1,
        yoyo: true
    },

    init: function (startStateSelector, endStateSelector) {
        this.startStateSelector = startStateSelector;
        this.endStateSelector = endStateSelector;

        this.TL = new TimelineMax(this.masterTLOpts);
    },

    /*
     * Exposed to the caller to kick off the animation.
     *
     * @param totalDuration: total duration for morphing
     * the flame to the end state and back to the start state.
     *
     * NOTE: the tween itself will divide this by 2 and allow yoyo'ing supply the
     * revserse animation for the other half of the duration.
     */
    startAnimationTimeline: function (totalDuration) {

        debugger;
        console.log('Start selector: ' + this.startStateSelector);
        console.log('End selector: ' + this.endStateSelector);

        let fireMorphTL = new TimelineMax();

        fireMorphTL.to(
            this.startStateSelector,
            totalDuration / 2,
            {
                morphSVG: this.endStateSelector,
                ease: this.EASINGS.flameFlicker
            }
        );

        this.TL.add(fireMorphTL);
    }

};

function FlameFactory (startStateSelector, endStateSelector) {
    let flame = Object.create(flameProto);
    flame.init(startStateSelector, endStateSelector);
    return flame;
}

function Flame (startStateSelector, endStateSelector) {
    return FlameFactory(startStateElem, endStateElem);
}

export default FlameFactory;
