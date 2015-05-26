(function (exports) {

    var docRoot = document.documentElement,
        dummyElement = document.createElement('div');


    /**
     * Performs feature detection for a property, then
     * adds it to the roo documentElement a la Modernizr
     */
    var testStylePropSupport = function testStylePropSupport (property) {

        if (property in docRoot.style) {
            docRoot.classList.add(property.toLowerCase());
            return true;
        } else {
            docRoot.classList.add('no-' + property.toLowerCase());
            return false;
        }
    };

    /**
     * Perform feature detection for style property values by setting
     * attaching the property to a dummy element, setting it to the value under test,
     * then checking so see whether the browser retained the value.
     */
    var testStyleValueSupport = function testStyleProperty (id, prop, value) {

        dummyElement.style[prop] = value;

        if (dummyElement.style[prop]) {
            docRoot.classList.add(id);
            return true;
        }

        docRoot.classList.add('no-' + id);
        return false;
    };



    var api = {
        testStylePropSupport: testStylePropSupport,
        testStyleValueSupport: testStyleValueSupport
    };

    BS.compose(exports, api);

}(typeof exports === 'undefined' ? window : exports));



