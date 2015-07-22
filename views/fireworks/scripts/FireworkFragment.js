var FireworkFragment = (function (window) {

    var FireworkFragmentFactory = {

        self: this,
        TL: null,
        currentId: 1,

        init: function init (el, detDuration) {
            this.id = self.currentId++;
            this.el = el;
            this.detonationDuration =
                (typeof detDuration !== 'undefined' && typeof detDuration === 'number' && !Number.isNaN(detDuration)) ?
                    detDuration :
                    0;
        }
    },

    FireworkFragment = function () {
        return Object.create(FireworkFragmentFactory);
    };

    return FireworkFragment;

}(window));

