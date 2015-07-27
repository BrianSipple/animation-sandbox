var demo = (function (window) {
    
    'use strict';
    
    
    var SELECTORS = {
            textRows: '.row'
        },
        
        CLASSES = {
            drawingWord: 'drawing'
        },
        
        textRows = document.querySelectorAll(SELECTORS.textRows);
    
        
    
    function applyStaggeredDraw (rowSVG) {        
        return setTimeout(function () {            
            rowSVG.classList.add(CLASSES.drawingWord);            
        }, 500);
    }
        
    
    function drawWords () {        
        [].forEach.call(textRows, applyStaggeredDraw);        
    }
    
    
    function init () {
        drawWords();    
    }
    
    
    return {
        init: init
    };
    
}(window));




window.addEventListener('DOMContentLoaded', demo.init, false);