import 'TweenMax';

let
  IconFactory = {

    /**
     * The id of the icon's main (i.e. containing) SVG node
     */
    id: undefined,

    /**
     * A reference to the icon's SVG DOM element
     */
    svgElem: undefined,

    /**
     * The main (i.e. parent) timeline of the icon
     */
    mainIconTL: undefined,

    /**
     * The master TL that we'll plug our icon's TL into
     */
    masterTL: null,

    isAnimating: false,

    LABEL: undefined,

    DOM_REFS: undefined,

    IconError: function IconError(msg) {
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
     * Helper to pass as the onComplete option of a timeline
     */
    boundDeclareAnimationComplete: function boundDeclareAnimationComplete () {
        this.isAnimating = false;
    },

    /**
     * Called by the main app function when we're ready to
     * sync our created icon object with our core app logic
     */
    init: function (params) {
      params = params || {};

      if (!params.id) {
        throw new Error(this.IconError(`a DOM id is required`));
      }
      this.id = params.id;

      // add a click listener on the svg element and bind
      // the callback to our object instance
      this.svgElem.addEventListener('click', this.handleClick.bind(this));

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
              this.svgElem.addEventListener('click', this[handlerName], false);
          }
      }
    }
  },

  Icon = function Icon () {
    return Object.create(IconFactory);
  };

export default Icon;
