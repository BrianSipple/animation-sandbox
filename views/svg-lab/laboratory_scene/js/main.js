var app = (function (exports) {

    
    var 
        SELECTORS = {
            mainSVG: '#lab-svg',
            coinSVG: '#Coin',
            mainBulbSVG: '#MainBulb',
            liquidSVGs: '.liquid',
            liquidMasks: '.liquid-mask',
            liquidMaskDefs: '.liquid-mask__def'
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
        liquidMasks = mainSVG.querySelectorAll(SELECTORS.liquidMasks),
        liquidMaskDefs = mainSVG.querySelectorAll(SELECTORS.liquidMaskDefs),
        liquid1MaskDef = mainSVG.querySelector(SELECTORS.liquidMaskDefs + '-1'),
        
        
        clearTL,
        masterTL;
    
    
    /**
     * Helper to remove the liquid from each flask by tweening the <defs> that each 
     * liquid mask path is using. 
     */
    function removeLiquidsFromFlasks(tl) {
        
        var liquidMaskDef,
            yPosToSet;
        for (var i = 0; i < liquidMaskDefs.length; i++) {
            liquidMaskDef = liquidMaskDefs.item(i);
            yPosToSet = Number(liquidMaskDef.getAttribute('y')) + Number(liquidMaskDef.getAttribute('height'));
            tl.set(liquidMaskDef, {attr: { y: yPosToSet } });
        }
    }
    
    
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
        clearTL.set(mainBulbSVG, { fill: '#FFFFFF' });
        clearTL.set(liquidSVGs, { stroke: '#FFFFFF' });
        removeLiquidsFromFlasks(clearTL);        
                            
        return clearTL;
    }
    
    
    function init () {
        
        masterTL = new TimelineMax();        
        masterTL.add(clearStage());
    }
    
    return {
        init: init
    };
    
} (window));



window.addEventListener('DOMContentLoaded', app.init, false);