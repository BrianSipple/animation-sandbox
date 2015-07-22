(function (exports) {

    var
        api = {},
        svgNS = 'http://www.w3.org/2000/svg',
        xLinkNS = 'http://www.w3.org/1999/xlink';


    /**
     * Helper that creates a proper SVG element, whose
     * immediate child is a <use> element linked to the
     * specified path
     */
    api.createUsingSVG = function createUsingSVG (usePath) {
        var svg = document.createElementNS(svgNS, 'svg'),
            use = document.createElementNS(svgNS, 'use');

        svg.setAttribute('xmlns:link', xLinkNS);
        use.setAttributeNS(xLinkNS, 'href', usePath);

        svg.appendChild(use);
        return svg;
    };

    api.createCircleSVG = function createCircleSVG(opts) {

        var
            cx = opts.cx || 20,
            cy = opts.cy || 20,
            r = opts.r || 8,

            circleSVG = document.createElementNS(svgNS, 'circle');

        circleSVG.setAttributeNS(null, 'cx', cx);
        circleSVG.setAttributeNS(null, 'cy', cy);
        circleSVG.setAttributeNS(null, 'r', r);

        return circleSVG;
    };



    if (typeof compose !== 'undefined') {
        compose(exports, api);
    }


}( (typeof exports === 'undefined') ? window : exports));
