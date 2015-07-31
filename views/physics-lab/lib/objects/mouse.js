(function (exports) {
    
    var MouseFactory = function () {
        
        },
        
        
        Mouse = function () {
            return Object.create(MouseFactory());
        };
    
    
    
    exports.Mouse = Mouse;
    
} (window));