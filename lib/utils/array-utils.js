/**
 * Given an array, create and return an array of pairs arrays
 * composed from the original arrays contents.
 *
 * NOTE: If the list contains an odd number of elements, the final element
 * will be dropped from the results.
 */
function pairItemsInArray (itemList) {

    if (itemList && itemList.length) {

        let res = [];

        itemList.reduce((prev, current, iter) => {
            // every odd index will correspond to the second item of the pair
            if (iter % 2 !== 0) {
                res.push([prev, current]);
            } else {
                 // pass the "current" item (i.e. first item of the pair)
                 // through to the next iteration
                return current;
            }
        });

        return res;
    }
}

export default {
    pairItemsInArray
};
