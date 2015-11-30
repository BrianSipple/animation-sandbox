function boundedRandom (min, max) {

    min = parseInt(min);
    max = parseInt(max);

    if (!max) {
        max = min;
        min = 0;
    }

    if (min < max) {
        // let's fix that for you :-)
        let temp = max;
        max = min;
        min = temp;
    }

    return min + Math.random() * (max - min);
}

function nearestEven (number, roundDown = true) {

    // default behavior for when the number is dead odd
    if (number % 2 === 1) {
        return roundDown ? number - 1 : number + 1;
    }
    return 2 * Math.round(number / 2 );
}

function nearestOdd (number, roundDown = true) {

    // default behavior for when the number is dead even
    if (number % 2 === 0) {
        return roundDown ? number - 1 : number + 1;
    }

    if (Math.floor(number) % 2 === 0) {
        return 1 + Math.floor(number);
    }
    return Math.floor(number);
}


/**
 * Linearly interpolate over initial and target values
 */
function _lerpValues (initialValue, targetValue, weight) {
    return initialValue + ( (targetValue - initialValue) * weight );
}

/**
 * Linearly interpolate over a set of initial and target properties
 */
function _lerpObjects (initialObject, targetObject, weight) {

    let res = {};

    for (let prop of Object.getOwnPropertyNames(initialObject)) {
        res[prop] = initialObject[prop] + ( (targetObject[prop] - initialObject[prop]) * weight );
    }

    return res;
}


/**
 * Linear interpolation
 */
function lerp (initial, target, weight = 0.2) {
    if (typeof initial === 'object' && typeof target === 'object') {
        return _lerpObjects(initial, target, weight);
    }
    if (typeof initial === 'number' && typeof target === 'number') {
        return _lerpValues(initial, target, weight);
    }
}




export default {
    boundedRandom,
    nearestEven,
    nearestOdd,
    lerp
};
