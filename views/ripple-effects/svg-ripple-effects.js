import TweenMax from 'TweenMax';

const
    SELECTORS = {
        tabSelectors: '.tab-selectors',
        tab: '.tab',
        tabLink: '.tab__link',
        rippleBtns: '.js-ripple-btn',
        rippleSVGContainer: '.js-ripple',
        rippleCircleSVG: '.ripple use',
        rippleCircleSVGDef: '#ripple-circle'
    },

    CLASSES = {
        active: 'active'
    },

    DURATIONS = {
        rippleEffect: 0.8
    },

    DOM_REFS = {
        tabSelectorsContainer: document.querySelector(SELECTORS.tabSelectors),
        tabLinkElems: document.querySelectorAll(SELECTORS.tabLink),
        rippleBtns: document.querySelectorAll(SELECTORS.rippleBtns),
        rippleCircleSVGDef: document.querySelector(SELECTORS.rippleCircleSVGDef)
    };

let
    masterTL,
    rippleTL;


function removeTabClasses () {
    for (tabLinkElem of DOM_REFS.tabLinkElems) {
        tabLinkElem.classList.remove(CLASSES.active);
        tabLinkElem.parentNode.classList.remove(CLASSES.active);
    };
}

function setActiveTabElem (activeLinkElem) {
    activeLinkElem.parentNode.classList.add(CLASSES.active);
    activeLinkElem.classList.add(CLASSES.active);
}

function animateRippleOnPointerEvent (ev) {

    let
        rippleTL = new TimelineMax(),

        // offset values from the mouse pointer to
        // the padding edge of the target node
        xFromLeft = ev.offsetX,
        yFromTop = ev.offsetY,

        // width and height of the target element. Final
        // calculations will include the size of the element’s border’s and padding
        elemWidth = ev.target.offsetWidth,
        elemHeight = ev.target.offsetHeight,

        // Absolute distances from the element center. We need
        // this because the ripple must be large enough to cover
        // from the point of contact to the farthest corner
        offsetX = Math.abs((elemWidth / 2) - xFromLeft),
        offsetY = Math.abs((elemHeight / 2) - yFromTop),

        // Total distance of the animation in the farthest direction
        deltaX = (elemWidth / 2) + offsetX,
        deltaY = (elemHeight / 2) + offsetY,

        // hypotenuese
        scaleRatio = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));


        rippleSVGContainer = ev.target.querySelector(SELECTORS.rippleSVGContainer),
        rippleCircleSVG = rippleSVGContainer.querySelector(SELECTORS.rippleCircleSVG);



    rippleTL.fromTo(
        rippleCircleSVG,
        DURATIONS.rippleEffect,
        {
            // attr: {
            //     cx: xFromLeft,
            //     cy: yFromTop
            // },
            x: xFromLeft,
            y: yFromTop,
            scale: 0,
            opacity: 1,
            transformOrigin: '50%, 50%'
        },
        {
            scale: scaleRatio,
            opacity: 0
        }
    );
    return rippleTL;
}

function handleTabClick (ev) {

    let linkElemClicked = ev.target;

    removeTabClasses();
    setActiveTabElem(linkElemClicked);

    masterTL.add(animateRippleOnPointerEvent(ev));
}

function handleRippleBtnClick (ev) {
    masterTL.add(animateRippleOnPointerEvent(ev));
}


function wireUpElementListeners () {
    DOM_REFS.tabSelectorsContainer.addEventListener('click', handleTabClick, false);

    for (let btn of DOM_REFS.rippleBtns) {
        btn.addEventListener('click', handleRippleBtnClick, false);
    }

}

export function init () {

    masterTL = new TimelineMax();
    wireUpElementListeners();

};
