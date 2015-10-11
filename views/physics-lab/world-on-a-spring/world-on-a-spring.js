var demo = (function (exports) {

    'use strict';

    var
        SELECTORS = {
            scene: '.scene__svg-container',
            globeSVGContainer: '.globe-container',
            baseSVG: '#base',
            springSVG: '#spring',
            globeSVG: '#globe',
            titleTextSVG: '#title',
            stiffnessSlider: '#stiffness',
            frequencySlider: '#frequency',
            dampingSlider: '#damping',
            massSlider: '#mass',
            stiffnessOutput: '#output__stiffness',
            frequencyOutput: '#output__frequency',
            dampingOutput: '#output__damping',
            massOutput: '#output__mass',
        },

        /* Wire up SVG References */
        sceneSVGContainer = document.querySelector(SELECTORS.scene),
        sceneRect = sceneSVGContainer.getBoundingClientRect(),
        globeSVGContainer = document.querySelector(SELECTORS.globeSVGContainer),
        globeSVGContainerRect = globeSVGContainer.getBoundingClientRect(),
        sceneWidth = sceneRect.width,
        sceneHeight = sceneRect.height,
        baseSVG = sceneSVGContainer.querySelector(SELECTORS.baseSVG),
        baseSVGBox = baseSVG.getBBox(),
        springSVG = sceneSVGContainer.querySelector(SELECTORS.springSVG),
        springSVGRect = springSVG.getBoundingClientRect(),
        globeSVG = sceneSVGContainer.querySelector(SELECTORS.globeSVG),
        globeSVGBox = globeSVG.getBBox(),
        titleSVGContainer = sceneSVGContainer.querySelector(SELECTORS.titleTextContainer),
        titleTextSVG = sceneSVGContainer.querySelector(SELECTORS.titleTextSVG),


        /* Wire up Input References */
        stiffnessInput = document.querySelector(SELECTORS.stiffnessSlider),
        frequencyInput = document.querySelector(SELECTORS.frequencySlider),
        dampingInput = document.querySelector(SELECTORS.dampingSlider),
        massInput = document.querySelector(SELECTORS.massSlider),

        /* Wire up <output> References */
        stiffnessOutputElem = document.querySelector(SELECTORS.stiffnessOutput),
        frequencyOutputElem = document.querySelector(SELECTORS.frequencyOutput),
        dampingOutputElem = document.querySelector(SELECTORS.dampingOutput),
        massOutputElem = document.querySelector(SELECTORS.massOutput),

        /* Globe with position and velocity */
        Globe = {
            el: globeSVG,
            elBox: globeSVGBox,
            elContainerRect: globeSVG.getBoundingClientRect(),
            leftX: Number(globeSVGBox.x),  // left-most point
            xPercent: 0,
            y: Number(globeSVGBox.y),  // top-most point
            width: Number(globeSVGBox.width),
            height: Number(globeSVGBox.height),
            velocity: 0,
            mass: 0.5,


            /**
             * On mouseDown, directly sets the position in the scene
             */
            setPosition: function setPosition(leftX) {
                debugger;
                this.leftX = leftX;
                this.xPercent = ( (this.leftX - (this.width)) / globeSVGContainerRect.width ) * 100;
            },

            move: function move () {
                this.el.setAttribute('x', this.xPercent + '%');
                console.log('Moving Globe to left X percent of :' + this.leftX);
            },

            handleMouseDown: function handleMouseDown (ev) {
                this.setPosition(ev.offsetX - Base.width);
                this.move();
            },

            handleMouseMove: function handleMouseMove (ev) {
                this.setPosition(ev.offsetX - Base.width);
                this.move();
            }
        },

        Base = {
            el: baseSVG,
            elBox: baseSVGBox,
            width: baseSVGBox.width,
            x: baseSVGBox.x,
            prevX: baseSVGBox.x,
            velocity: 0,
            t: 0,
            frequency: 0
        },

        // Central Mouse Handler
        Mouse = {
            isDown: false,
            x: 0,
            y: 0,
            setPositionInScene: function setPositionInScene (coords, sceneRect) {
                this.x = Number(coords.x) || this.x;
                this.y = Number(coords.y) || this.y;
            },

            CODES: {
                mouseUp: 1,
                mouseDown: 1,
                mouseMove: 1
            },

            handleMouseDown: function handleMouseDown (ev, sceneRect) {
                this.isDown = true;
                this.setPositionInScene({x: ev.pageX, y: ev.pageY}, sceneRect);
            },

            handleMouseUp: function handleMouseUp (ev, sceneRect) {
                this.isDown = false;
            },

            handleMouseMove: function (ev, sceneRect) {
                this.setPositionInScene({x: ev.pageX, y: ev.pageY}, sceneRect);
            }
        },

        Spring = {
            el: springSVG,
            elBox: springSVGRect,
            containerWidth: springSVGRect.width,
            extensionFactor: 0,
            y: springSVGRect.y,
            equilibriumLength: springSVGRect.width / 2,
            originalLength: springSVG.getBBox().width,
            height: springSVGRect.height,
            force: null,

            /* Spring stiffness (in kg / s^2) */
            k: -20,

            /* Damping constant */
            b: -0.5,
            damperForce: undefined,

            /* Acceleration */
            acc: undefined,


            /**
             * Draw the spring in it's proper state of expansion
             */
            tune: function tune () {
                this.el.setAttribute('transform', 'scale(' + this.extensionFactor + ', 1.0)');
            },

            setExtension: function setExtension (xOffset) {
                this.extensionFactor = (xOffset - Base.width + Globe.width) / this.containerWidth;
                console.log('originalLength: ' + this.originalLength);
                console.log('xOffset: '+ xOffset);
                console.log('Setting Spring Extension Factor: ' + this.extensionFactor);
            },

            handleMouseDown: function handleMouseDown (ev) {
                this.setExtension(ev.offsetX);
                this.tune();
            },

            handleMouseMove: function handleMouseMove (ev) {
                this.setExtension(ev.offsetX);
                this.tune();
            }
        },

        previousTime = Date.now(),
        currentTime,
        elapsedTime;


    /**
     * Integrate values for the current state of our objects, and then call their
     * animation functions
     */
    function runLoop () {

        requestAnimationFrame(runLoop);

        currentTime = Date.now();
        elapsedTime = currentTime - previousTime;
        previousTime = currentTime;


        /* Calculate movement for the base */
        Base.t += (1 / 60);
        Base.prevX = Base.x;
        Base.x = 30 + 70 * Math.sin(2 * Math.PI * Base.frequency * Base.t);
        Base.velocity = (Base.x - Base.prevX) / (1 / 60);


        /* Calculate movement for the globe */
        if (!Mouse.isDown) {

            Spring.force = Spring.k * ( (Globe.leftX - Base.x) - Spring.equilibriumLength);
            Spring.damperForce = Spring.b * ( (Globe.velocity - Base.velocity) );

            Spring.acc = (Spring.force + Spring.damperForce) / Globe.mass;

            Globe.velocity += Spring.acc * (1/60);
            Globe.leftX += (Globe.velocity * (1/60) );
            Globe.setPosition(Globe.leftX);
            Spring.setExtension(Globe.leftX + (Globe.width / 2) );
        }
        Globe.move();
        Spring.tune();


        if (Mouse.isDown) {

        }

    }


    function addSVGEventListeners () {
        sceneSVGContainer.addEventListener('mousemove', function (ev) {
            if (ev.which === Mouse.CODES.mouseMove && Mouse.isDown) {

                console.log('Mouse Move');

                Mouse.handleMouseMove(ev, sceneRect);
                Spring.handleMouseMove(ev);
                Globe.handleMouseMove(ev);
            }
        });

        sceneSVGContainer.addEventListener('mousedown', function (ev) {
           if (ev.which === Mouse.CODES.mouseDown) {
               console.log('Mouse Down');


               Mouse.handleMouseDown(ev, sceneRect);
               Spring.handleMouseDown(ev);
               Globe.handleMouseDown(ev);
           }
        });

        sceneSVGContainer.addEventListener('mouseup', function (ev) {
           if (ev.which === Mouse.CODES.mouseUp) {

               console.log('Mouse Up');

               Mouse.handleMouseUp(ev, sceneRect);
           }
        });
    }

    function addInputEventListeners () {

        stiffnessInput.addEventListener('change', function () {
            Spring.k = -1 * parseFloat(this.value);
            stiffnessOutputElem.textContent = this.value;
        }, false);

        dampingInput.addEventListener('change', function () {
            Spring.b = -1 * parseFloat(this.value);
            dampingOutputElem.textContent = this.value;
        }, false);

        frequencyInput.addEventListener('change', function () {
            Base.frequency = parseFloat(this.value);
            frequencyOutputElem.textContent = this.value;
        }, false);

        massInput.addEventListener('change', function () {
            Globe.mass = parseFloat(this.value);
            massOutputElem.textContent = this.value;
        }, false);

    }


    function addEventListeners() {
        addSVGEventListeners();
        addInputEventListeners();
    }


    function initUI () {

        stiffnessInput.value = Math.abs(Spring.k);
        stiffnessOutputElem.textContent = Math.abs(Spring.k);

        dampingInput.value = Math.abs(Spring.b);
        dampingOutputElem.textContent = Math.abs(Spring.b);

        frequencyInput.value = Math.abs(Base.frequency);
        frequencyOutputElem.textContent = Math.abs(Base.frequency);

        massInput.value = Math.abs(Globe.mass);
        massOutputElem.textContent = Math.abs(Globe.mass);
    }


    function init () {
        addEventListeners();
        initUI();
        runLoop();
    }

    return {
        init: init
    };

}(window));

window.addEventListener('DOMContentLoaded', demo.init, false);
