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


        if (!exports.getAbsoluteUrl) {
            exports.getAbsoluteUrl = (function getAbsoluteUrl (url) {

                var a;

                return function (url) {
                    if (!a) {
                        a = document.createElement('a');
                    }
                    a.href = url;
                    return a.href;
                };
            })();
        }

        if (!exports.getProjectPrefix) {

            /**
             * Helper for getting the project's deployment route prefix
             */
            exports.getProjectPrefix = function getProjectPrefix () {
                var firstSingleSlashIdx = getAbsoluteUrl().search(/[^\/\/]\/[^\/\/]/) + 1;
                return getAbsoluteUrl().substr(firstSingleSlashIdx).split('/')[1];
            }
        }

    }((typeof exports === 'undefined') ? window : exports));

}(/*BS*/));
