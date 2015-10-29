import { camelCaseToPascalCase } from './string-utils';

const
    SVGNameSpace = 'http://www.w3.org/2000/svg',
    XMLNameSpace = 'http://www.w3.org/1999/xhtml',
    xLinkNameSpace = 'http://www.w3.org/1999/xlink';

/**
 * Captures the first x and y coordinates in the "Move To"
 * component of a "d" attribute's path command string, and
 * returns a valid "d" string with the aforementioned coords replaced
 * with the provided newX and newY args
 */
function replacePathMoveTo (elem = {}, newX, newY) {

    if (elem && typeof elem.getAttribute === 'function') {
        let originalPathString = elem.getAttribute('d');

        return originalPathString.replace(
            /[Mm][0-9\.]+[0-9\.]/,
            `M${newX},{newY}`
        );
    }
}

function createSVG (type, attributesObj) {

    let svgElem = document.createElementNS(SVGNameSpace, type);

    for (let attr of Object.keys(attributesObj)) {
        svgElem.setAttributeNS(null, camelCaseToPascalCase(attr), attributesObj[attr]);
    }
    return svgElem;
}



export {
    replacePathMoveTo,
    createSVG
};
