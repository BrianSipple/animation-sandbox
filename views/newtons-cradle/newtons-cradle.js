var demo = (function (window) {
    
    'use strict';
    
    var cradleRods = document.querySelectorAll('.rod'),
        cradleBearings = document.querySelectorAll('.bearing');

        
    debugger;
        
    /**
     * Create object representations and bind event listeners
     * to each of the cradle's bearings.
     *
     * These listeners are internal bearing functions that coordinate 
     * that particular instance's timeline.
     *
     */
    function gatherOurBearings() {
        
        var bearingElem,
            bearing;
        for (var i = 0, l = cradleBearings.length; i < l; i++) {
            
            bearingElem = cradleBearings.item(i);
            
            bearing = Bearing();
            bearing.init(bearingElem);
            
            bearingElem.addEventListener('mousedown', function () {
                bearing.isDragging = true;
            });
            
            bearingElem.addEventListener('mousemove', bearing.drag.bind(bearing), false);
            bearingElem.addEventListener('mouseup', bearing.swing.bind(bearing), false);            
        }
                                      
    }

    
    
    return {
        init: gatherOurBearings
    };
    
    
}(window));


window.addEventListener('DOMContentLoaded', demo.init, false);