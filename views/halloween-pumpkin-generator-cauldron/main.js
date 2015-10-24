import TweenMax from 'TweenMax';
import { BubblingCauldronTL } from './bubbling-cauldron';   // Cauldron that stirs and bubbles in the background

const app = (function HalloweenPumpkinGeneratorCauldron () {

    let
        SELECTORS = {
            pumpkin: '.pumpkin'
        },


        masterTL;

    function runAnimation () {

        masterTL.add(BubblingCauldronTL());
        
    }

    function init () {

        masterTL = new TimelineMax();

        runAnimation();

    }

    init();
}());

export default app;
