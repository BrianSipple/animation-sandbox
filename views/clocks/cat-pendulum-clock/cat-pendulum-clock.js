var app = (function (exports) {
    
    'use strict';
    
    var 
        SELECTORS = {
            clockSVG: '#Clock',
            clockBodySVG: '#ClockBody',
            tailSVG: '#Tail',
            leftEyelidSVG: '#EyelidLeft',
            rightEyelidSVG: '#EyelidRight',
            hourHandBaseSVG: '#HourHandBase',
            minuteHandBaseSVG: '#MinuteHandBase'
        },
            
        clockSVG = document.querySelector(SELECTORS.clockSVG),
        clockBodySVG = clockSVG.querySelector(SELECTORS.clockBodySVG),
        tailSVG = clockSVG.querySelector(SELECTORS.tailSVG),
        leftEyelidSVG = clockSVG.querySelector(SELECTORS.leftEyelidSVG),
        rightEyelidSVG = clockSVG.querySelector(SELECTORS.rightEyelidSVG),
        hourHandBaseSVG = clockSVG.querySelector(SELECTORS.hourHandBaseSVG),
        minuteHandBaseSVG = clockSVG.querySelector(SELECTORS.minuteHandBaseSVG),
                    
        
        // Use to prevent ugly timing behavior
        MAX_FRAME_DELTA = 0.050,
        
        
        //////////////////////// Animation variables ////////////////////////
        
        // Timing
        previousTime = new Date(),
        currentTime,
        elapsedTimeMS,
        deltaT,         // elapsed time normalized to seconds
        
        // Pendulum
        newPerpendicularForceOnPendulum,
        newPendulumTorque,
        newPendulumAcceleration,        
        
        
        //////////////////////// Models ////////////////////////
        
        
//        /**
//         * We'll model the clock pendulum as a point-mass at the end of a weightless rod (i.e: no friction in the equation)
//         */
//        Pendulum = {
//            el: undefined,
//            mass: 1,
//            length: 0,
//            swingSpan: 0,
//            startingLeftX: 0,
//            currentLeftX: 0,
//            
//            /* angle of rotation (theta 0 == pointing horizontally to the right) */
//            theta: Math.PI / 2 - 0.05,
//                
//            /* Angular velocity (radians per second) */
//            omega: 0,
//            
//            /* Angular acceleration (radians per second^2) */
//            alpha: 0,
//            
//            /* Moment of Inertia (Resistance to change in rotation (kg / m^2)) */
//            J: 0                        
//        },
        
        PendulumObjectProto = {
            el: undefined,
            startingLeftX: 0,
            currentLeftX: 0,
            mass: 1,
            length: 0,
            width: 0,
            theta: Math.PI / 2,
            omega: 0,
            alpha: 0,
            J: 0,
            
            initFromSVG: function initFromSVG (svgElem) {
                
                var elBox = svgElem.getBBox();
        
                this.el = svgElem;
                this.length = elBox.width;
                this.width = elBox.height;
                this.startingLeftX = this.currentLeftX = elBox.x;
                this.swingSpan = ( this.length / Math.tan(Math.PI/2) ) * 2;
                //this.J = this.mass * (this.length * this.length);
                this.J = this.mass * (this.length * this.length / this.length);
            },
            
            /**
             * Computes the new state of the pendulum (at the current frame) by
             * using the Velocity Verlet Algorithm -- where velocity and position are 
             * BOTH calculated relative to time.
             */
            updateState: function updateState (elapsedTimeMS) {
                var deltaT = elapsedTimeMS / 1000;  // MS to seconds
                preventCrazyTimeWarping();

                this.theta += this.omega * deltaT + (0.5 * this.alpha * deltaT * deltaT);

                /**
                 * Calculate forces from current position. 
                 * 
                 * 1) Perpendicular force is computed by 
                 * taking the [mass] * [gravity due to Earth (9.81 m/s^2)] * [length]
                 * 2) Torque is the perpendicular force multiplied by distance from center of rotation
                 */
                newPerpendicularForceOnPendulum = this.mass * 9.81 * Math.cos(this.theta);
                newPendulumTorque = newPerpendicularForceOnPendulum * this.length;

                newPendulumAcceleration = newPendulumTorque / this.J;

                /* Calculate current angular velocity from last frame's ang. velocity and 
                average of last frame's acceleration with this frame's acceleration. */
                this.omega += 0.5 * (newPendulumAcceleration + this.alpha);

                /* Update acceleration */
                this.alpha = newPendulumAcceleration;  
            },
            
            animate: function animate () {
                this.currentLeftX += (this.swingSpan / 2) + (this.length * Math.cos(this.theta));

                this.el.style.transform = 
                    'translateX(' + (this.startingLeftX - this.currentLeftX) + 'px) ' +
                    'rotateZ(' + this.theta + 'rad)';
            }        
        },
                        
        Pendulum = Object.create(PendulumObjectProto),
        LeftEyelid = Object.create(PendulumObjectProto),
        RightEyelid = Object.create(PendulumObjectProto),
        
        
        ClockHandProto = {
            el: undefined,
            diameter: 0,
            theta: Math.PI / 2 // (Math.PI / 2 == noon, 0 == 3:00)
        },
        
        HourHandBase = Object.create(ClockHandProto),    
        MinuteHandBase = Object.create(ClockHandProto);

        
    
    function getHoursTheta(numHours) {
        return Math.PI * 2 * ( ( numHours % 12) / 12 );
    }
    
    function getMinutesTheta(numMinutes) {
        return (Math.PI * 2 / 12) * ( (numMinutes % 60) / 60);
    }
    
    
    function computeClockHandThetas (time) {
        var 
            hours = time.getHours(),
            mins = time.getMinutes();
        
        HourHandBase.theta = 
            getHoursTheta(hours) + 
            getMinutesTheta(mins) -
            Math.PI / 2; 
        
        MinuteHandBase.theta = getMinutesTheta(mins);  
    }
    
    function initClockHands () {        
        HourHandBase.el = hourHandBaseSVG;
        MinuteHandBase.el = minuteHandBaseSVG;        
        computeClockHandThetas(previousTime);          
    }
    
        
    function performPendulumAnimations () {
        debugger;                   
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
        debugger;
        [
            HourHandBase,
            MinuteHandBase
        ]
        .forEach(function (handBase) {   
            handBase.el.style.transform = 'rotateZ(' + handBase.theta + 'rad)';            
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
    function preventCrazyTimeWarping() {        
        if (deltaT > MAX_FRAME_DELTA) {
            deltaT = MAX_FRAME_DELTA;
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
        Pendulum.initFromSVG(tailSVG);
        LeftEyelid.initFromSVG(leftEyelidSVG);
        RightEyelid.initFromSVG(rightEyelidSVG);
    }
            
    function runTheClock () {
                
        requestAnimationFrame(runTheClock);
        
        currentTime = new Date();
        elapsedTimeMS = currentTime.getTime() - previousTime.getTime();  // elapsed time in ms b/w frames
        
        computePendulumStates(elapsedTimeMS);
        computeClockHandThetas(currentTime);
        animateElements();                                        
    }
        
    
    function init () {                                
        initPendulumObjects();        
        initClockHands();

        runTheClock();
    }
    
    return {
        init: init
    };
    
}(window));

window.addEventListener('DOMContentLoaded', app.init, false);