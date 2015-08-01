(function (exports) {
    
    var
        BallFactory = function BallFactory () {
            
            var 
                sceneRect,                
                sceneContainerElem,
                boundaryHeight,
                boundaryWidth,
                api = {},     
                mouse = mouse,
                
                _boundMove = function _boundMove () {
                    this.el.setAttribute('cx', Number(this.position.x).toFixed(5));
                    this.el.setAttribute('cy', Number(this.position.y).toFixed(5));
                };
            
            api.init = function init (params) {
                
                params = params || {};

                api.el = params.svg || {};

                api.position = {
                    x: Number(api.el.getAttribute('cx')),
                    y: Number(api.el.getAttribute('cy'))
                };
                api.radius = Number(api.el.getAttribute('r'));

                api.velocity = params.velocity || {x: 10, y: 0};
                api.mass = params.mass || 0.1;   // kg
                api.restitution = params.restitution || -0.7; 
                
                mouse = params.mouse || {};

                // TODO: Pick one of the following two
                sceneRect = 
                    params.sceneRect || 
                    api.el.parentNode.getBoundingClientRect() || 
                    document.body.getBoundingClientRect();

                sceneContainerElem = 
                    params.sceneContainerElem || 
                    api.el.parentNode || 
                    document.body;

                boundaryHeight = sceneRect.height;                    
                boundaryWidth = sceneRect.width;

            };
                
            /**
             * Set the initial velocity params for the object when the mouse is released. 
             * After setting here, we'll continue to integrate from these values on every animation frame 
             */
            api.handleMouseUp = function handleMouseUp (ev) {
                

                // diff b/w position where ball drag began, and where the mouse currenly resides
                api.velocity.y = (api.position.y - mouse.y) / 10;                        
                api.velocity.x = (api.position.x - mouse.x) / 10;                
            };


            /**
            * The user has indicted that they would like to move the ball to 
            * this position.
            */
            api.handleMouseDown = function handleMouseDown(ev) {
                if (ev.which === mouse.CODES.mouseDown) {

                    api.position.x = ev.pageX - sceneRect.left;
                    api.position.y = ev.pageY - sceneRect.top;
                    _boundMove.call(api);
                }  
            };

            api.handleWallCollisions = function handleWallCollisions () {
                
                // Left boundary collision
                if (api.position.x < api.radius) { 
                    
                    api.velocity.x *= api.restitution;
                    api.position.x = api.radius;
                }

                // Right boundary collision
                if (api.position.x > boundaryWidth - api.radius) {
                    api.velocity.x *= api.restitution;
                    api.position.x = boundaryWidth - api.radius;
                }

                // Bottom boundary collision
                if (api.position.y > boundaryHeight - api.radius) {          
                    api.velocity.y *= api.restitution;
                    api.position.y = boundaryHeight - api.radius;
                }
                
                // Top boundary collision
                if (api.position.y < api.radius) {
                    api.velocity.y *= api.restitution;
                    api.position.y = api.radius;
                }
            };

            api.move = _boundMove.bind(api);      
            
            return api;
        },
                
    
        Ball = function (params) {
            
            var ball = Object.create(BallFactory());            
            if (params) ball.init(params);      // allow for immediate or deferred initialization
            
            return ball;
        };
        
    
    exports.Ball = Ball;
    
} (window));