var demo = (function (exports) {    
    
    'use strict';
    
    var
        SELECTORS = {
            scene: '.scene__svg-container',
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
        sceneWidth = sceneRect.width,
        sceneHeight = sceneRect.height,
        baseSVG = sceneSVGContainer.querySelector(SELECTORS.baseSVG),
        baseSVGBox = baseSVG.getBBox(),
        springSVG = sceneSVGContainer.querySelector(SELECTORS.springSVG),
        springSVGBox = springSVG.getBBox(),
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
            x: Number(globeSVGBox.x),  // left-most point
            y: Number(globeSVGBox.y),  // top-most point
            width: Number(globeSVGBox.width),
            height: Number(globeSVGBox.height),
            velocity: 0,
            mass: 0.5,
            

            /**
             * On mouseDown, directly sets the position in the scene
             */
            setPosition: function setPosition(xPos) {
                debugger;
                this.x = ( xPos - (this.width / 2) ) - this.elBox.x;
            },
            
            move: function move () {
                this.el.setAttribute('x', Number(this.x));
                console.log('Moving Globe to left X of :' + this.x);
            },
            
            handleMouseDown: function handleMouseDown (ev) {
                this.setPosition(ev.pageX - this.elContainerRect.left);
                this.move();
            },
            
            handleMouseMove: function handleMouseMove (ev) {
                this.setPosition(ev.pageX - this.elContainerRect.left);
                this.move();
            },
            
            /**
             * Compute the starting parameters for a spring animation on mouse up 
             * The animation itself is then performed on each frame by the RAF loop
             */
            prepareToSpring: function prepareToSpring (ev, sceneContainerRect) {
                
            }
        },
        
        Base = {
            el: baseSVG,
            elBox: baseSVGBox,
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
            elBox: springSVGBox,
            extensionFactor: 0,
            y: springSVGBox.y,
            equilibriumLength: springSVGBox.width / 2,
            maxLength: springSVGBox.width,
            height: springSVGBox.height,  
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
            
            setExtension: function setExtension (xEndpoint) {
                //debugger;
                this.extensionFactor = ( (xEndpoint - this.elBox.x) / this.maxLength);
                console.log('Setting Spring Extension Factor: ' + this.extensionFactor);
                console.log('Factor of xPos: ' + (xEndpoint - this.elBox.x));

            },
            
            handleMouseDown: function handleMouseDown (ev) {
                this.setExtension(ev.pageX);                
                this.tune();
            },
            
            handleMouseMove: function handleMouseMove (ev) {
                debugger;
                this.setExtension(ev.pageX);
                this.tune();
            },

            /**
             * On mouseup, prepare initial animation parameters
             */
            prepareToFire: function prepareToFire (ev, sceneContainerRect) {
                
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
        
        //debugger;

        
        /* Calculate movement for the base */
        //Base.t += frameRate;
        Base.t += (1 / 60);
        Base.prevX = Base.x;
        Base.x = 30 + 70 * Math.sin(2 * Math.PI * Base.frequency * Base.t);
        //Base.velocity = (Base.x - Base.prevX) / (frameRate);
        Base.velocity = (Base.x - Base.prevX) / (1 / 60);
        
        
        /* Calculate movement for the globe */
        if (!Mouse.isDown) {
            
            Spring.force = Spring.k * ( (Globe.x - Base.x) - Spring.equilibriumLength);
            Spring.damperForce = Spring.b * ( (Globe.velocity - Base.velocity) );
            
            Spring.acc = (Spring.force + Spring.damperForce) / Globe.mass;
            
            
            //Globe.velocity += acc * frameRage;
            Globe.velocity += Spring.acc * (1/60);
            
            //Globe.x = Globe.velocity * frameRate;                
            //Globe.x = (Globe.x + (Globe.velocity * (1/60)) ) - (Globe.width / 2); 
            Globe.x += (Globe.velocity * (1/60) );
            Spring.setExtension(Globe.x + (Globe.width / 2) );            
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
               //Spring.onMouseDown(ev, sceneRect);
               Spring.handleMouseDown(ev);
               //Spring.tune( (ev.pageX - Spring.x) / 100);
               Globe.handleMouseDown(ev);
           } 
        });
        
        sceneSVGContainer.addEventListener('mouseup', function (ev) {
           if (ev.which === Mouse.CODES.mouseUp) {
               
               console.log('Mouse Up');

               Mouse.handleMouseUp(ev, sceneRect);
               //Globe.prepareToSpring(ev, sceneRect);
               //Spring.prepareToFire(ev, sceneRect);
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