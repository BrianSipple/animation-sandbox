var app = (function (exports) {

    
    var 
        SELECTORS = {
            mainSVG: '#lab-svg',
            coinSVG: '#Coin',
            mainBulbSVG: '#MainBulb',
            liquidSVGs: '.liquid',
        },
        
        DURATIONS = {
            elementScaling: 0.3
        },
        
        EASINGS = {
            elementScaling: Power4.easeInOut
        },
        
        mainSVG = document.querySelector(SELECTORS.mainSVG),
        coinSVG = mainSVG.querySelector(SELECTORS.coinSVG),
        mainBulbSVG = mainSVG.querySelector(SELECTORS.mainBulbSVG),
        liquidSVGs = mainSVG.querySelectorAll(SELECTORS.liquidSVGs),
        
        
        clearTL,
        masterTL;
    
    
    
    function clearStage () {
        
        clearTL = new TimelineMax();
        
        // Scale down the coin and move it behind the head (measurements taken by Pixel Winch are super helpful!)
        clearTL.set(
            coinSVG, 
            { 
                scale: 0.5, 
                transformOrigin: '50% 50%',
                x: -80,
                y: 124
            }
        );
        clearTL.set(mainBulbSVG, {fill: '#FFFFFF'});
        clearTL.set(liquidSVGs, {stroke: '#FFFFFF'});
        

        
        
        
        return clearTL;
    }
    
    
//    /**
//     * Convert the liquid references to an actual array,
//     * then sort them ascending based on id
//     */
//    function sortLiquids () {
//        liquidSVGs = [].slice.call(liquidSVGs);  
//        
//        liquidSVGs.sort(function (elem1, elem2) {
//            return 
//                elem1.getAttribute('id').replace(/[^0-9]/g, '') > 
//                elem2.getAttribute('id').replace(/[^0-9]/g, '');
//        });
//        
//        debugger;
//    }
    
    function init () {
        
        masterTL = new TimelineMax();        
        masterTL.add(clearStage());
    }
    
    return {
        init: init
    };
    
} (window));



window.addEventListener('DOMContentLoaded', app.init, false);