
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

export default { replacePathMoveTo };
