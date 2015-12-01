const svgObjectProto = {

    /**
     * The id of the object's main (i.e. containing) SVG node
     */
    id: undefined,

    /**
     * A reference to the object's containing SVG DOM element
     */
    svgContainerElem: undefined,

    /**
     * The main (i.e. parent) timeline of the object
     */
    mainObjectTL: undefined,

    /**
     * The master TL that we'll plug our object's TL into
     */
    masterTL: null,

    isAnimating: false,
    shouldReverseAnimation: false,

    LABEL: undefined,

    DOM_REFS: undefined,
    SELECTORS: undefined,

    CustomError: function CustomError(msg) {
        let err = {
            name: 'Icon Error',
            msg: msg
        };
        return Object.create(err);
    },

    handleClick: function (ev) {
        throw new Error('Must be implemented by a linked object');
    },


    /**
     * Called by the main app function when we're ready to
     * sync our created object with our core app logic
     */
    init: function (params) {

        params = params || {};

        if (!params.id) {
            throw new Error(this.CustomError(`a DOM id is required`));
        }

        this.id = params.id;

        // add a click listener on the svg element and bind
        // the callback to our object instance
        this.svgContainerElem.addEventListener('click', this.handleClick.bind(this));

        // Support any additional custom click listeners/handlers
        if ( params.customClickHandlers && Array.isArray(params.customClickHandlers) ) {

            for (let handlerObj of params.customClickHandlers) {

                let handlerName = handlerObj.name;

                if (!handlerName) {
                    throw new Error(`custom click handler object must have a name property to be set`);
                }

                if (this[handlerName]) {
                    throw new Error(`click handler name collides with existing property`);
                }

                this[handlerName] = handlerObj.fn;
                this.svgContainerElem.addEventListener('click', this[handlerName], false);
            }
        }
    }
};

function SVGObjectFactory() {
  return Object.create(svgObjectProto);
}

function SVGObject () {
    return SVGObjectFactory();
};

export default SVGObject;
