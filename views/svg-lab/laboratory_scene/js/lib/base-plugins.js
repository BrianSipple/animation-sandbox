// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any helper plugins in here......

// Optional application namespace for bundling all exported modules, which
// would allow us to pass our application object into that wrapper function as a parameter
// called exports...
//var BS = {};

(function (exports) {

    (function (exports) {

        // Object.create polyfill (useful for prototyping objects with shared state)
        if (!Object.create) {
            Object.create = function (obj) {
                if (arguments.length > 1) {
                    throw new Error(
                        'Object.create implementation only accepts the first ' +
                        'parameter.'
                    );
                }

                function F() {
                }

                F.prototype = obj;

                return new F();
            };
        }

        if (!Function.prototype.softBind) {
            Function.prototype.softBind = function (obj) {

                var fn = this,
                    curried = [].slice.call(arguments, 1),
                    bound = function bound () {
                        return fn.apply(
                            (!this ||
                                (typeof window !== 'undefined' &&
                                    this === window) ||
                                (typeof global !== 'undefined' &&
                                    this === global)
                            ) ? obj : this,
                            curried.concat.apply( curried, arguments )
                        );
                    };

                bound.prototype = Object.create( fn.prototype );
                return bound;
            };
        }

    }((typeof exports === 'undefined') ? window : exports));

}(/*BS*/));
