import 'TweenMax';

export default {

    FILTER_EFFECTS: {
        TV_FINISHES: {
            NONE: 'none',
            SPECULAR_LIGHTING: 'specularLighting',
            LOGO_GLOW: 'logoGlow'
        }
    },

    ANTENNA_WIGGLES: {
        STRETCH: 'stetch'
    },

    DURATIONS: {
        morphObject: 0.32,
        scaleUp: 0.85,

        // this should be at least the monitor
        // frame rate that we're targeting (i.e. 60 fps ==> 0.0167ms)
        logoFlicker: 0.035

    },

    EASINGS: {
        toggleIcon: Power2.easeOut,   // ~= linear-in-slow-out
        morphObject: Power1.easeOut,
        logoFlicker: Power2.easeInOut,
        antennaPerk: Elastic.easeOut.config(1.2, 0.35)  // `config` takes <amplitude> and <peroid> of a sine wave
    }
};
