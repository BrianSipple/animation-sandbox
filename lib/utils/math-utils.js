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

export  {
    boundedRandom,
    nearestEven,
    nearestOdd
};
