var demo = (function (exports) {

    'use strict';
    
    var         
        SELECTORS = {
            sceneContainer: '.scene',
            ball: '.ball',
            slingshot: '.slingshot'
        },
        
        sceneContainerElem = document.querySelector(SELECTORS.sceneContainer),        
        sceneContainerRect = sceneContainerElem.getBoundingClientRect(),
        
        SVGHeightToPageRatio = sceneContainerRect.height / sceneContainerElem.viewBox.animVal.height,
        SVGWidthToPageRatio = sceneContainerRect.width / sceneContainerElem.viewBox.animVal.width,
    
        ballSVG = sceneContainerElem.querySelector(SELECTORS.ball),
        slingshotSVG = sceneContainerElem.querySelector(SELECTORS.slingshot),
                
        
        // Central Mouse Handler
        Mouse = {
            isDown: false,
            x: 0,
            y: 0,            
            setPositionInScene: function setPositionInScene (ev, sceneContainerRect) {  
                this.x = ev.pageX - sceneContainerRect.left;
                this.y = ev.pageY - sceneContainerRect.top; 
            },            
            CODES: {
                mouseUp: 1,
                mouseDown: 1,
                mouseMove: 1 
            }
        },
        
        // Slingshot
        Slingshot = {
            el: slingshotSVG,
            
            /**
             * Initialize an unstreched line by setting both X's and both Y's to the same point
             */
            setStartPoint: function setStartPoint (ev) {
                this.el.setAttribute('x1', ev.pageX - sceneContainerRect.left);
                this.el.setAttribute('x2', ev.pageX - sceneContainerRect.left);
                this.el.setAttribute('y1', ev.pageY - sceneContainerRect.top);
                this.el.setAttribute('y2', ev.pageY - sceneContainerRect.top);
            },
            
            
            /**
             * mouse move handler to extend the line
             */
            extendLineOnPull: function extendLineOnPull (mouseX, mouseY) {
                this.el.setAttribute('x2', mouseX);
                this.el.setAttribute('y2', mouseY);
            },
            
            disappear: function disappear () {
                this.el.setAttribute('x1', 0);
                this.el.setAttribute('x2', 0);
                this.el.setAttribute('y1', 0);
                this.el.setAttribute('y2', 0);
            }
        },
        
        ATTRIBUTES = {
            ballId: 'data-id'
        },
            
            
        ballObj = Ball({
            svg: ballSVG,
            sceneRect: sceneContainerRect,
            sceneContainerElem: sceneContainerElem,
            velocity: {x: 10, y: 0},
            mass: 0.1,  // kg
            radius: 15,         
            restitution: -0.7,
            mouse: Mouse // TODO: Needed?
        }),
                        
        frameRate = 1 / 60,  // seconds
        frameDelay = frameRate * 1000,
        loopTimout = null,        
                                                
        
        Cd = 0.47,   // Coefficient of drag (Dimensionless for the shape of a ball)
        rho = 1.22,  // Density of the fluid (in this case, air) kg / m^3
        A = Math.PI * ballObj.radius * ballObj.radius / (10000),   // m^2  (Frontal area (or frontal projection) of the object) 
        ag = 9.1,      // m / s^2
            
        Fx,   // Force in X-direction
        Fy,
        
        ax,  // Accelearation in x-direction
        ay,
        
        metersPerPixel = 100, // 1cm == 1px          
        
        // Compute time diff in ms over each call of RAF
        previousTime = new Date().getTime(),  // start the clock
        elapsedTimeMs,
        currentTime;
        
        
    
    function init () {
               
        sceneContainerElem.addEventListener('mouseup', function (ev) {
            
            if (ev.which === Mouse.CODES.mouseUp) {
                debugger;
                Mouse.isDown = false;
                ballObj.handleMouseUp(ev); 
                Slingshot.disappear();
            }
        }, false);
        
        
        sceneContainerElem.addEventListener('mousemove', function (ev) { 
            if (ev.which === Mouse.CODES.mouseMove && Mouse.isDown) {                
                
                Mouse.setPositionInScene(ev, sceneContainerRect);
                Slingshot.extendLineOnPull(Mouse.x, Mouse.y);
            }
        }, false);
            
            
        sceneContainerElem.addEventListener('mousedown', function (ev) {
            
            //debugger;
            
            if (ev.which === Mouse.CODES.mouseDown) {
                
                Mouse.isDown = true;
                Mouse.setPositionInScene(ev, sceneContainerRect);
                
                Slingshot.setStartPoint(ev);
                ballObj.handleMouseDown(ev);
            }            
        }, false);
            
        runLoop();
    }
    

    
    function runLoop () {
        //debugger;
                
        requestAnimationFrame(runLoop);
        
        if (!currentTime) {
            currentTime = new Date().getTime();
        }
        elapsedTimeMs = currentTime - previousTime;
        
        if (!Mouse.isDown) {
            // Compute motion
                        
            // Drag force: Fd = -1/2 * Cd * A * rho * v * v
            Fx = -0.5 * Cd * A * rho * 
                ballObj.velocity.x * ballObj.velocity.x *
                ballObj.velocity.x / Math.abs(ballObj.velocity.x);
            
            Fy = -0.5 * Cd * A * rho * 
                ballObj.velocity.y * ballObj.velocity.y * 
                ballObj.velocity.y / Math.abs(ballObj.velocity.y);
            
            Fx = (isNaN(Fx) ? 0 : Fx);
            Fy = (isNaN(Fy) ? 0 : Fy);
            
            // Calculate acceleration (F / m)
            ax = Fx / ballObj.mass;
            ay = ag + (Fy / ballObj.mass); 
            
            // Integrate to get velocity (velocity is the time-derivative of acceleration)
            //ballObj.velocity.x += (ax * frameRate);
            ballObj.velocity.x += (ax * (elapsedTimeMs/metersPerPixel) );
            ballObj.velocity.y += (ay * (elapsedTimeMs / metersPerPixel) );
            
            // Integrate to get position (position is the velocity derivative) 
            //ballObj.position.x += (ballObj.velocity.x * frameRate * metersPerPixel);
            ballObj.position.x += (ballObj.velocity.x * (elapsedTimeMs / metersPerPixel) * metersPerPixel);
            ballObj.position.y += (ballObj.velocity.y * (elapsedTimeMs / metersPerPixel) * metersPerPixel);    
            
            ballObj.move();
        }
        
        // Handle collisions
        ballObj.handleWallCollisions();
        
        // Draw the slingshot
        if (Mouse.isDown) {
            Slingshot.extendLineOnPull(Mouse.x, Mouse.y);
        }                    
    }
            
    return {
        init: init
    };
    
} (window));


window.addEventListener('DOMContentLoaded', demo.init, false);
