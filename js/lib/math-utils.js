(function (exports) {

    var MathUtils = {

        boundedRandom: function boundedRandom (min, max) {

            if (max === undefined) {
                max = min;
                min = 0;
            }
            return (Math.random() * (max - min)) + min;
        }
    };

    exports.MathUtils = MathUtils;

}( (typeof exports === 'undefined') ? window : exports));
