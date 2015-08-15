(function (exports) {

    var api = {};


    /**
     * Helper that creates a proper SVG element, whose
     * immediate child is a <use> element linked to the
     * specified path
     */
    api.createUsingSVG = function createUsingSVG (usePath) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

        svg.setAttribute('xmlns:link', 'http://www.w3.org/1999/xlink');
        use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', usePath);

        svg.appendChild(use);
        return svg;
    };

    if (typeof compose !== 'undefined') {
        compose(exports, api);
    }


}( (typeof exports === 'undefined') ? window : exports));
