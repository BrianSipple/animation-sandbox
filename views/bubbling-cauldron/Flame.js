import 'TweenMax';
import 'MorphSVGPlugin';
import { createSVG } from 'utils/svg-utils';
import {
    boundedRandom,
    nearestEven,
    nearestOdd
 } from 'utils/math-utils';


const
    flameProto = {

        /* DOM node that serves as our morph source */
        elem: undefined,

        /* masterTL for the flame */
        TL: undefined,

        masterTLOpts: {
            repeat: -1
        },

        init: function (elem) {
            this.elem = elem;
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
        startAnimationTimeline: function (totalDuration, delay = 0) {

            debugger;

            let flickerOpts = _configureFlameFlickeringOpts(totalDuration, this.elem);

            // delay this animation by applying the delay time to the main TL
            this.TL.delay(delay);
            this.TL.add(flickerFlame(this.elem, flickerOpts));
        }
    },

    DATA_ATTRIBUTES = {
        startingAngle: 'data-starting-angle'
    },

    EASINGS = {
        //flameFlicker: Power4.easeOut
        flameFlicker: Power0.easeNone
    },

    CLASSES = {
        sinWaveStartHalf: 'js-sine-wave-start-half',
        sinWaveEndHalf: 'js-sine-wave-end-half',
    }

function _configureFlameFlickeringOpts (duration, svgElem) {

    let
        //elemBox = svgElem.getBBox(),
        elemRect = svgElem.getBoundingClientRect(),
        totalElemPathLength = svgElem.getTotalLength(),
        isSineWaveStartHalf = svgElem.getAttribute('class').search(CLASSES.sinWaveStartHalf),

        bezierPointsList = MorphSVGPlugin.pathDataToRawBezier(svgElem.getAttribute('d'))[0],

        startPathIdx = isSineWaveStartHalf ?
            0 :
            nearestEven(bezierPointsList.length * 0.9),

        endPathIdx = isSineWaveStartHalf ?
            nearestOdd(bezierPointsList.length * 0.1) :
            nearestOdd(bezierPointsList.length - 1),

        // analagous to the hypotenuese
        diagonalLength = _getDiagonalLength(
            elemRect.left, elemRect.top, elemRect.right, elemRect.bottom
        ),

        // taperStart = Math.floor(totalElemPathLength * 0.025),
        // taperEnd = Math.floor(totalElemPathLength * 0.7),
        taperStart = isSineWaveStartHalf ?
            Math.ceil(totalElemPathLength * 0.05) :
            Math.ceil(totalElemPathLength * 0.9),

        taperEnd = isSineWaveStartHalf ?
            Math.ceil(totalElemPathLength * 0.1) :
            Math.ceil(totalElemPathLength * .95),

        // initial angle of the sinusoidal function at its origin
        //angle = Math.floor(boundedRandom(-180, 180)),
        angle = parseInt(svgElem.getAttribute(DATA_ATTRIBUTES.startingAngle)) || 0,

        //amplitude = Math.floor(boundedRandom(10, diagonalLength / 12)),
        amplitude = Math.floor(boundedRandom( diagonalLength / 10, diagonalLength / 7)),

        // phase = isSineWaveStartHalf ?
        //     -angle * 0.3 :
        //     angle * 0.3,
        phase = isSineWaveStartHalf ?
            -amplitude * 0.3 :
            amplitude * 0.3,


        isLoose = true,

        repeat = -1,
        //start = 2,
        //end = 6,
        debug = false;


    debugger;
    return {
        taperStart,
        taperEnd,
        length: totalElemPathLength,
        angle,
        amplitude,
        phase,
        duration,
        ease: EASINGS.flameFlicker,
        repeat,
        isLoose,
        startPathIdx,
        endPathIdx: 6,
        bezierPointsList
    };

    // return {
    //     taperStart: 2,
    //     taperEnd: 80,
    //     isLoose: true,
    //     length: 120,
    //     angle: -50,
    //     amplitude: 10,
    //     phase: 110,
    //     duration: duration,
    //     repeat: -1,  // TL `repeat` param
    //     start: 6,
    //     end: 15,
    //     debug: false
    // };

}

function _getDiagonalLength (x, y, x2, y2) {
    let
        xLength = x2 - x,
        yLength = y2 - y;
    return Math.sqrt(xLength * xLength + yLength * yLength);
}

function _placeDot(x, y, opts) {

    let
        controlPoint = createSVG(
            'circle',
            { cx: x, cy: y, r: opts.size || 6, fill: opts.color || 'red' }
        ),
        container = opts.container || document.querySelector('svg');

    if (container) {
        container.appendChild(controlPoint);
    }
    return controlPoint;
}


function _getTotalLength (bezierPointsList, start, end) {

    let
        x = bezierPointsList[start],
        y = bezierPointsList[start+1],
        length = 0;

    for ( let i = start; i < end; i+=2 ) {
        length+= _getDiagonalLength(x, y, x=bezierPointsList[i], bezierPointsList[i+1]);
    }
    return length;
}

function FlameFactory (elem) {
    let flame = Object.create(flameProto);
    flame.init(elem);
    return flame;
}

function Flame (elem) {
    return FlameFactory(elem);
}


/**
 * Utilizes the morphSVGPlugin and the magic of trigonometry
 * to flicker a flame SVG.
 *
 * We do this by creating a timeline with an onUpdate funciton that
 * manipulates the points of a path in a sine-wave motion
 */
function flickerFlame(elem, opts) {

    const
        DEG_TO_RAD = Math.PI / 180,
        RAD_TO_DEG = 180 / Math.PI;

    let
        bezierPointsList = opts.bezierPointsList || MorphSVGPlugin.pathDataToRawBezier(elem.getAttribute('d'))[0] || [],
        start = (opts.startPathIdx || 0) * 2,
        end = (opts.endPathIdx === 0) ? 0 : (opts.endPathIdx * 2) || (bezierPointsList.length - 1),
        length = opts.length || 100,
        amplitude = opts.amplitude || 50,
        proxy = { angle: 0 },
        debug = !!opts.debug,
        phase = (opts.phase || 0) * DEG_TO_RAD,
        taperStart = opts.taperStart || 0,
        taperEnd = opts.taperEnd || 0,
        startX = bezierPointsList[start],
        startY = bezierPointsList[start + 1],
        changes = [],
        bezierLength = 0,

        // if true, points will influence the current positions, but won't forcing them strictly onto the flickering path
        isLoose = !!opts.isLoose,
        flickerTL = new TimelineMax({ repeat: opts.repeat }),

        bezierTotalLength,
        angle,
        i,
        x,
        y,
        dx,
        dy,
        sin,
        cos,
        sin2,
        cos2,
        m,
        pathStart,
        taper,
        negCos,
        negSin,
        rotatedStartX;

    if (end >= bezierPointsList.length - 1) {
        end = bezierPointsList.length - 2;
    }

    if (start >= bezierPointsList.length) {
        start = bezierPointsList.length - 1;
    }

    bezierTotalLength = _getTotalLength(bezierPointsList, start, end);

    dx = bezierPointsList[end] - startX;
    dy = bezierPointsList[end + 1] - startY;

    // resolve the angle....
    if (opts.angle || opts.angle === 0) {  // careful: truthiness won't cover 0 :=)
        angle = opts.angle * DEG_TO_RAD;

    } else {
        angle = Math.atan2(dy, dx) - Math.PI / 2;
    }

    // after we have the angle...
    cos = Math.cos(angle);
    sin = Math.sin(angle);
    cos2 = Math.cos(angle + Math.PI / 2);
    sin2 = Math.sin(angle + Math.PI / 2);
    negCos = Math.cos(-angle);
    negSin = Math.sin(-angle);
    rotatedStartX = (startX * negCos) + (startY * negSin);

    // If debug is true, drop a red dot at the beginning,
    // yellow at the end, blue dots as control
    // points, and purple as anchors
    if (debug) {
        _placeDot(
            bezierPointsList[start],
            bezierPointsList[start+1],
            { container: elem.parentNode, color: 'red' }
        );
        _placeDot(
            bezierPointsList[end],
            bezierPointsList[end+1],
            { container: elem.parentNode, color: 'yellow' }
        );
        console.log(`flickerFlame() angle: ${angle * RAD_TO_DEG} degrees. RED dot is start, YELLOW is end.`);
    }

    x = startX;
    y = startY;

    for (i = start; i < end; i+=2) {

    //
        bezierLength += _getDiagonalLength(x, y, x=bezierPointsList[i], y=bezierPointsList[i+1]);
        dx = x * negCos + y * negSin; //rotated in the opposite direction
        dy = x * negSin + y * negCos;

        debugger;
        taper = (taperStart && bezierLength < taperStart) ?
            bezierLength / taperStart :
            (
                taperEnd &&
                bezierLength > (bezierTotalLength - taperEnd) &&
                bezierLength < bezierTotalLength
            ) ?
                ( (bezierTotalLength - bezierLength) / taperEnd ) :
                1;

        console.log('New taper: ' + taper);

        m = Math.sin( (dx / length) * Math.PI * 2 + phase ) * amplitude;

        changes.push({
            i: i - (start ? 2 : 0),
            p: dx,
            a: ( (dx / length) * Math.PI * 2 + phase ),
            taper: taper,

            x: isLoose ?
                x - m * sin * taper :
                startX + (dx - rotatedStartX) * cos2 * taper,

            y: isLoose ?
                y - m * cos * taper :
                startY + (dx - rotatedStartX) * sin2 * taper,

            isSmooth: (i % 6 === 0 && i > start && i < end) ?
                Math.abs(
                    Math.atan2(y - bezierPointsList[i - 1], x - bezierPointsList[i - 2]) -
                    Math.atan2(bezierPointsList[i+3] - y, bezierPointsList[i+2] - x)
                ) < 0.01 :
                false,
        });

        if (debug) {
            changes[changes.length-1].dot =
                _placeDot(
                    x,
                    y,
                    { container: elem.parentNode, size: 3, color: (i % 6) ? 'blue' : 'purple' }
                );
        }
    }

    // When we're not animating the first point,
    // optimize things by taking out the first x/y and treating
    // them independently so we can merely bezier.join(",") on each update.
    if (start) {
        pathStart = `M${bezierPointsList.shift()},${bezierPointsList.shift()} C`;
    }

    flickerTL.to(
        proxy,
        opts.duration || 3,
        {
            angle: Math.PI * 2,
            ease: opts.ease || Power0.easeNone,
            onUpdate: function updatePath () {
                let
                    l = changes.length,
                    angle = proxy.angle,
                    newPathString,
                    node, i, m, x, y, x2, y2, x1, y1, cp, dx, dy, d, a, cpCos, cpSin;

                for (i = 0; i < l; i++) {
                    node = changes[i];
                    if (node.isSmooth || i === l - 1 || !changes[i+1].isSmooth) {

                        console.log(
                            `Changing x and y bezier points at indicies ${i} and ${i+1}\n
                            Old x value: ${bezierPointsList[node.i]} \t
                            Old y value: ${bezierPointsList[node.i+1]}`
                        );

                        m = Math.sin(node.a + angle) * amplitude * node.taper;
                        bezierPointsList[node.i] = x = node.x + m * sin;
                        bezierPointsList[node.i + 1] = y = node.y + m * cos;

                        console.log(
                            `New x value: ${x}\t New y value: ${y}`
                        );

                        if (node.isSmooth) {
                            //make sure smooth anchors stay smooth!
                            cp = changes[i - 1];
                            m = Math.sin(cp.a + angle) * amplitude * cp.taper;
                            x1 = cp.x + m * sin;
                            y1 = cp.y + m * cos;

                            cp = changes[i + 1];
                            m = Math.sin(cp.a + angle) * amplitude * cp.taper;
        					x2 = cp.x + m * sin;
        					y2 = cp.y + m * cos;

        					a = Math.atan2(y2 - y1, x2 - x1);
        					cpCos = Math.cos(a);
        					cpSin = Math.sin(a);

        					dx = x2 - x;
        					dy = y2 - y;
        					d = Math.sqrt(dx * dx + dy * dy);
        					bezierPointsList[cp.i] = x + cpCos * d;
        					bezierPointsList[cp.i + 1] = y + cpSin * d;

        					cp = changes[i - 1];
        					dx = x1 - x;
        					dy = y1 - y;
        					d = Math.sqrt(dx * dx + dy * dy);
        					bezierPointsList[cp.i] = x - cpCos * d;
        					bezierPointsList[cp.i + 1] = y - cpSin * d;
        					i++;
                        }
                    }
                }

                if (debug) {
                    for (i = 0; i < l; i++) {
                        node = changes[i];
                        node.dot.setAttribute("cx", bezierPointsList[node.i]);
                        node.dot.setAttribute("cy", bezierPointsList[node.i + 1]);
                    }
                }

                if (start) {
                    newPathString = pathStart + bezierPointsList.join(',');
                    //console.log(`New path string: ${newPathString}`);
                } else {
                    newPathString = `M${bezierPointsList[0]},${bezierPointsList[1]} C${bezierPointsList.slice(2).join(',')}`;
                    //console.log(`New path string: ${newPathString}`);
                }
                elem.setAttribute('d', newPathString);
            }
        }
    );
    return flickerTL;

}

export default Flame;
