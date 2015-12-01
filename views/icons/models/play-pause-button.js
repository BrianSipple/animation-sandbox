import 'TweenMax';
import 'DrawSVGPlugin';
import 'EndArrayPlugin';
import PlayButton from './base/_play-button';

const
    DURATIONS = {
        toggleIcon: 0.5
    },

    SELECTORS = {

        pauseBarRight: {
            origin: '.shape-element__pause-right',
            destinationGuide: '.guide-element__pause-right'
        },
        pauseBarLeft: {
            origin: '.shape-element__pause-left',
            destinationGuide: '.guide-element__pause-left'
        }
    },

    EASINGS = {
        toggleIcon: Power2.easeOut   // ~= linear-in-slow-out
    },


    boundUpdateAttr = function boundUpdateAttr (attr, value) {
        this.setAttribute(attr, value.toString());
    },

    /**
     * Helper that parses the "d" (for a path) or "points" (for a polygon) attribute
     * from an SVG and returns a numeric array
     */
    parsePathPointsAttr = function parsePathPointsAttr (attrString) {

        // Split the string into path commands and points
        let
            pathExpression = /[achlmrqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig,

            path = attrString.match(pathExpression).map((n) => {
                return isNaN(+n) ? n : +n;
            });

        // The first element needs to be a number, so remove if it's not
        // Calling the string method will return the path with the removed element
        path.prefix = isNaN(path[0]) ? path.shift() : '';
        path.string = function () {
            return path.prefix + path.join(' ');
        };

        return path;
    },

    boundSetStateOnToggle = function boundSetStateOnToggle () {
        debugger;
        this.boundDeclareAnimationComplete.bind(this)();
        this.isShowingPlay = !this.isShowingPlay;
    };

let PlayPauseIcon = ((svgElem, opts) => {

    let
        icon = PlayButton(),

        wireUpPolygonPoints = function wireUpPolygonPoints () {
            icon.POLYGON_POINTS = {
                pauseBarRight: {
                    start: parsePathPointsAttr(icon.DOM_REFS.pauseBarRight.getAttribute('points')),
                    end: parsePathPointsAttr(icon.DOM_REFS.pauseBarRightGuide.getAttribute('points')),
                    correspondingDOMElem: icon.DOM_REFS.pauseBarRight
                },
                pauseBarLeft: {
                    start: parsePathPointsAttr(icon.DOM_REFS.pauseBarLeft.getAttribute('points')),
                    end: parsePathPointsAttr(icon.DOM_REFS.pauseBarLeftGuide.getAttribute('points')),
                    correspondingDOMElem: icon.DOM_REFS.pauseBarLeft
                }
            }
        },

        /**
         * Creates a timeline that animates the play symbol the pause symbol,
         * which is then ready to be reversed when we want to go in the opposite direction
         */
        createPlayPauseTL = function createPlayPauseTL () {
            let TL = new TimelineMax({
                    paused: true,
                    onComplete: boundSetStateOnToggle.bind(icon),
                    onReverseComplete: boundSetStateOnToggle.bind(icon)
                });

            // Animate polygons to their destinations by interpolating the
            // "points" attribute for each
            for (let pointSet of [
                icon.POLYGON_POINTS.pauseBarLeft,
                icon.POLYGON_POINTS.pauseBarRight
            ]) {
                debugger;
                TL.to(
                    pointSet.start,
                    DURATIONS.toggleIcon,
                    {
                        endArray: pointSet.end,
                        ease: EASINGS.toggleIcon,

                        // update the DOM with the value that's being interpolated
                        onUpdate: boundUpdateAttr.bind(
                            pointSet.correspondingDOMElem,
                            'points',
                            pointSet.start
                        )
                    },
                    0
                );
            }
            return TL;
        };


    icon.svgElem = svgElem;

    icon.DOM_REFS = {
        pauseBarLeft: icon.svgElem.querySelector(SELECTORS.pauseBarLeft.origin),
        pauseBarLeftGuide: icon.svgElem.querySelector(SELECTORS.pauseBarLeft.destinationGuide),
        pauseBarRight: icon.svgElem.querySelector(SELECTORS.pauseBarRight.origin),
        pauseBarRightGuide: icon.svgElem.querySelector(SELECTORS.pauseBarRight.destinationGuide)
    };

    wireUpPolygonPoints();
    icon.mainObjectTL = createPlayPauseTL();

    icon.handleClick = function handleClick () {
        debugger;
        if (!this.isAnimating) {

            this.isAnimating = true;

            if (this.isShowingPlay) {
                // animate to the pause symbol
                this.mainObjectTL.play(0);

            } else {
                // Reverse back to the play symbol.
                // NOTE: 0 sets the playhead at the end of the animation,
                // and we reverse from there
                this.mainObjectTL.reverse(0);
            }

            this.isPlaying = !this.isPlaying;
        }
    }.bind(icon);

    return Object.create(icon);

});

export default PlayPauseIcon;
