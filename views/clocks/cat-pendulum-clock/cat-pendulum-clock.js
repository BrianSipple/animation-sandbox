var app = (function (exports) {
    
    'use strict';
    
    var 
        SELECTORS = {
            clockSVG: '#Clock',
            clockBodySVG: '#ClockBody',
            tailSVG: '#Tail',
            leftEyeSVG: '#EyeLeft',
            leftEyelidSVG: '#EyelidLeft',
            rightEyeSVG: '#EyeRight',
            rightEyelidSVG: '#EyelidRight',
            hourHandSVG: '#HourHand',
            minuteHandSVG: '#MinuteHand',
            hourHandBaseSVG: '#HourHandBase',
            minuteHandBaseSVG: '#MinuteHandBase'
        },
            
        clockSVG = document.querySelector(SELECTORS.clockSVG),
        clockBodySVG = clockSVG.querySelector(SELECTORS.clockBodySVG),
        tailSVG = clockSVG.querySelector(SELECTORS.tailSVG),
        leftEyeSVG = clockSVG.querySelector(SELECTORS.leftEyeSVG),
        leftEyelidSVG = clockSVG.querySelector(SELECTORS.leftEyelidSVG),
        rightEyeSVG = clockSVG.querySelector(SELECTORS.rightEyeSVG),
        rightEyelidSVG = clockSVG.querySelector(SELECTORS.rightEyelidSVG),
        hourHandSVG = clockSVG.querySelector(SELECTORS.hourHandSVG),
        hourHandBaseSVG = clockSVG.querySelector(SELECTORS.hourHandBaseSVG),
        minuteHandSVG = clockSVG.querySelector(SELECTORS.minuteHandSVG),
        minuteHandBaseSVG = clockSVG.querySelector(SELECTORS.minuteHandBaseSVG),
        
                    
        
        // Use to prevent ugly timing behavior
        MAX_FRAME_DELTA = 0.050,
        
        
        //////////////////////// Animation variables ////////////////////////
        
        // Timing
        previousTime = new Date(),
        currentTime,
        elapsedTimeMS,
        
        // Pendulum
        newPerpendicularForceOnPendulum,
        newPendulumTorque,
        newPendulumAcceleration,        
        
        
        //////////////////////// Models ////////////////////////
                    
        PendulumObjectProto = {
            el: undefined,
            pos: {
                cx: 0
            },
            mass: 1,    
            length: 0,
            width: 0,
            theta: 0, // 0 ===> Horizontal and pointing to the right. Math.PI / 2 ==> pointing straight down,
            omega: 0,
            alpha: 0,
            J: 0,
            
            initFromSVGs: function initFromSVGs (svgElem, containerSVGElem) {
                debugger;
                
                var 
                    boundingRect = svgElem.getBoundingClientRect(),
                    containerBoundingRect = containerSVGElem.getBoundingClientRect();
        
                this.el = svgElem;
                this.length = boundingRect.height;
                this.width = boundingRect.width;
                //this.startingLeftX = this.currentLeftX = boundingRect.left;
                this.pos.cx = boundingRect.left + ( (boundingRect.right - boundingRect.left) / 2);
                
                this.swingSpan = containerBoundingRect.width;
                this.J = this.mass * (this.length * this.length);  // moment of inertia
                //this.J = this.mass * (this.length * this.length / this.length);
            },
            
            /**
             * Computes the new state of the pendulum (at the current frame) by
             * using the Velocity Verlet Algorithm -- where velocity and position are 
             * BOTH calculated relative to time.
             */
            updateState: function updateState (elapsedTimeMS) {
                debugger;
                var deltaT = elapsedTimeMS / 1000;  // MS to seconds
                deltaT = adjustDeltaToHandleCrazyTimeWarping(deltaT);

                this.theta += this.omega * deltaT + (0.5 * this.alpha * deltaT * deltaT);

                /**
                 * Calculate forces from current position. 
                 * 
                 * 1) Perpendicular force is computed by 
                 * taking the [mass] * [gravity due to Earth (9.81 m/s^2)] * [length]
                 * 2) Torque is the perpendicular force multiplied by distance from center of rotation
                 */
                newPerpendicularForceOnPendulum = this.mass * 9.81 * Math.cos(this.theta) * this.length;
                newPendulumTorque = newPerpendicularForceOnPendulum * this.length;

                newPendulumAcceleration = newPendulumTorque / this.J;

                /* Calculate current angular velocity from last frame's ang. velocity and 
                average of last frame's acceleration with this frame's acceleration. */
                this.omega += 0.5 * (newPendulumAcceleration + this.alpha) * deltaT;

                /* Update acceleration */
                this.alpha = newPendulumAcceleration;  
                
//                console.log('Elapsed Time: ' + elapsedTimeMS);
//                console.log('DeltaT: ' + deltaT);
//                console.log('Theta: ' + this.theta);
//                console.log('Omega: ' + this.omega);
//                console.log('Alpha: ' + this.alpha);
//                console.log('Torque: ' + newPendulumTorque);
            },
            
            animate: function animate () {
                debugger;
                //this.currentLeftX += (this.swingSpan / 2) + (this.length * Math.cos(this.theta));
                //this.currentLeftX += this.length * Math.cos(this.theta);
                //this.currentLeftX = this.startingLeftX + ( ( Math.cos(this.theta) * (this.swingSpan/2) ) - this.width);
                
                var 
                    newX = this.pos.cx + (this.length * Math.cos(this.theta)),
                    xIncrement = newX - this.pos.cx;                        
                
                console.log('Animated el: ' + this.el);
                console.log('Previous CX: ' + this.pos.cx);
                console.log('New CX: ' + newX);
                console.log('Computed Rotation: ' + this.theta);
                console.log('Max Angle: ' + this.maxTheta);
                
                // update the state -- then set it on the element
                this.pos.cx = newX;
                
                // Subtract an extra PI/2 to account for the fact that we start in the downward (PI/2 rad) postion 
                var rotation = (this.theta - (Math.PI / 2)) / 2;
                
                
                
                if (this.maxTheta) {
                    if (this.theta > this.maxTheta) {
                        rotation = ( rotation / (Math.PI/4) ) * this.maxTheta;
                        console.log('New Rotation: ' + rotation);
                    
                    } else if (this.theta < -this.maxTheta) {
                        rotation = ( rotation / (Math.PI/4) ) * -this.maxTheta;
                        console.log('New Rotation: ' + rotation);
                    }
                }
                
                
                this.el.style.transform = 
                    'translateX(' + xIncrement + 'px) ' +
                    //'rotateZ(' + this.theta + 'rad)';
                    'rotateZ(' + rotation + 'rad)';
            }        
        },
                        
        Pendulum = Object.create(PendulumObjectProto),
        LeftEyelid = Object.create(PendulumObjectProto),
        RightEyelid = Object.create(PendulumObjectProto),
        
        
        ClockHandProto = {
            el: undefined,
            clockBaseEl: undefined,
            theta: Math.PI / 2, // (Math.PI / 2 == noon, 0 == 3:00)
            
            initFromSVGs: function initFromSVGs (mainSVG, clockBaseSVG) {
              
                this.el = mainSVG;
                this.clockBaseEl = clockBaseSVG;
                
                var yTransOriginPercentage = 
                    100 - ( Number(this.clockBaseEl.getAttribute('r')) / this.el.getBBox().height );
                            
                this.el.style.transformOrigin = ('50% ' + yTransOriginPercentage + '%');
            },
            
            animate: function animate () {
                debugger;
                this.el.style.transform = 'rotateZ(' + this.theta + 'rad)';
            }
            
        },
        
        HourHand = Object.create(ClockHandProto),    
        MinuteHand = Object.create(ClockHandProto);

        
    
    function computeHourHandTheta (time) {
        
        var 
            hours = time.getHours(),
            minutes = time.getMinutes(),
            seconds = time.getSeconds();
        
        return ( (hours % 12) + (minutes / 60) + (seconds / 3600) ) 
            * 30 
            * (Math.PI / 180) 
            - Math.PI / 2;
    }
    
    function computeMinuteHandTheta (time) {
        
        var 
            minutes = time.getMinutes(),
            seconds = time.getSeconds();
        
        return ( ((minutes / 60 * 12) % 12) + (seconds / 60) )
            * 30
            * (Math.PI / 180)
            - Math.PI / 2;            
    }
    
    function computeClockHandThetas (time) {
        
        HourHand.theta = computeHourHandTheta(time);         
        MinuteHand.theta = computeMinuteHandTheta(time);
    }
    
    function performPendulumAnimations () {
        [
            Pendulum,
            LeftEyelid,
            RightEyelid
        ]
        .forEach(function (obj) {
            obj.animate();
        });
    }
    
    function rotateClockHands () {        
        [
            HourHand,
            MinuteHand
        ]
        .forEach(function (hand) { 
            hand.animate();            
        });
    }
    
    
    function animateElements () {        
        performPendulumAnimations();
        rotateClockHands();
    }
    
    
    /** 
     *    When switching away from the window, 
     *    requestAnimationFrame is paused. Switching back after a long
     *    duration will cause us to compute a giant deltaT.
     *    
     *    To ensure that the universe remains in alignment 
     *    we'll bound deltaT to 50ms.
     */
    function adjustDeltaToHandleCrazyTimeWarping(currentDelta) {        
        if (currentDelta > MAX_FRAME_DELTA) {
            return MAX_FRAME_DELTA;
        } else {
            return currentDelta;
        }
    }
    
    
    function computePendulumStates (elapsedTimeMS) {
        [
            Pendulum,
            LeftEyelid,
            RightEyelid
        ]
        .forEach(function (obj) {
            obj.updateState(elapsedTimeMS);
        });
    }
    
    function initPendulumObjects () {
        Pendulum.initFromSVGs(tailSVG, clockBodySVG);
        LeftEyelid.initFromSVGs(leftEyelidSVG, leftEyeSVG);
        RightEyelid.initFromSVGs(rightEyelidSVG, rightEyeSVG);
    }
    
    function initClockHands () { 
        HourHand.initFromSVGs(hourHandSVG, hourHandBaseSVG);
        MinuteHand.initFromSVGs(minuteHandSVG, minuteHandBaseSVG);        
    }
    
    
    /**
     * We want to apply pendulum-swing physics to the horizontal sweeping
     * motion of the eyelid, but restrict its angle to a tighter span
     * due to the nature of its position / alignment within the eyeball
     */
    function restrictEyelidTheta (thetaLimit) {
        RightEyelid.maxTheta = thetaLimit;
        LeftEyelid.maxTheta = thetaLimit;
    }
    
            
    function runTheClock () {
                
        requestAnimationFrame(runTheClock);
        
        debugger;
        
        currentTime = new Date();
        elapsedTimeMS = currentTime.getTime() - previousTime.getTime();  // elapsed time in ms b/w frames
        previousTime = currentTime;
        
        computePendulumStates(elapsedTimeMS);
        computeClockHandThetas(currentTime);
        animateElements();                                        
    }
        
    
    function init () {                                
        initPendulumObjects();        
        restrictEyelidTheta(Math.PI/10);
        initClockHands();
        computeClockHandThetas(previousTime);
        runTheClock();
    }
    
    return {
        init: init
    };
    
}(window));

window.addEventListener('DOMContentLoaded', app.init, false);