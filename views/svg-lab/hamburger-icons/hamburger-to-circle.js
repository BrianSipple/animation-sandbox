var hamburger = (function (window) {

    var
        SELECTORS = {
            hamburgerContainer: '.ic-hamburger'
        },

        CLASSES = {
            hamburgerClosed: 'ic-hamburger--menu-closed',
            hamburgerOpen: 'ic-hamburger--menu-open'
        },

        hamburgerContainer = document.querySelector(SELECTORS.hamburgerContainer),
        isMenuClosed = true;

    function toggleMenu () {
        debugger;
        // Ideally... some other cool stuff to toggle a sidebar here

        // Toggle and animate the menu svg icon
        if (isMenuClosed) {
            hamburgerContainer.classList.remove(CLASSES.hamburgerClosed);
            hamburgerContainer.classList.add(CLASSES.hamburgerOpen);

        } else {
            hamburgerContainer.classList.remove(CLASSES.hamburgerOpen);
            hamburgerContainer.classList.add(CLASSES.hamburgerClosed);
        }
        isMenuClosed = !isMenuClosed;


    }


    function init () {
        hamburgerContainer.addEventListener('click', toggleMenu, false);
    }


    return {
        init: init
    };

}(window));

window.addEventListener('DOMContentLoaded', function () {
    hamburger.init();
}, false);

