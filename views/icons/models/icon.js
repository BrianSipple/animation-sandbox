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

    init: function (options) {
      options = options || {};

      if (!options.id) {
        throw IconError(`a DOM id is required`);
      }
      this.id = options.id;

      if (!options.svgElem) {
        throw IconError(`a reference to a DOM svg elem is required`);
      }
      this.svgElem = options.svgElem;

      if (!options.masterTL) {
        throw IconError(`a master timeline is needed to add this icon's timeline to`);
      }
      this.masterTL = options.masterTL;

      this.LABEL = options.tlLabel || 'default-icon-label';

      // add a click listener on the svg element and bind
      // the callback to our object instance
      this.svgElem.addEventListener('click', this.handleClick.bind(this));
    }
  },

  Icon = function Icon () {
    return Object.create(IconFactory);
  };

export default Icon;
