(function (exports) {
    
    'use strict';
    
    
    var BearingFactory = {
                
            el: null,
            dragTL: null,
            swingTL: null,
            isDragging: false,
            

            init: function init (el) {

                this.el = el;
                this.dragTL = new TimelineMax({paused: true});
                this.swingTL = new TimelineMax({paused: true});

            },
            
            swing: function swing (ev) {
                
                debugger;
            
                this.isDragging = false;

                var bearing = this.el;

                this.swingTL.add()

                this.dragTL.pause();
                this.swingTL.play();
            },
        
            drag: function drag (ev) {

                if (this.isDragging) {

                    var bearing = this.el;

                    this.dragTL.add()

                    ////
                    this.swingTL.pause();
                    this.dragTL.play();
                }           
            }                                                
        },
                                                                                                                      
                
        Bearing = function () {            
            return Object.create(BearingFactory);            
        };
                
    
    exports.Bearing = Bearing;
    
}(window));


