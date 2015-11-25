/**
 * This file wires up SVG icon objects with the DOM selectors that
 * we want to provide them with, and organizes everything into a
 * "metadata" object. Our main application file can then just import the object.
 */

import WandIcon from './models/wand-icon';
import ShrkinkingToCloseXIcon from './models/x-icon';
import PlayPauseButton from './models/play-pause-button';


const SVG_METADATA = {
    wand1: {
        id: '#WandIcon1',
        obj: WandIcon(document.querySelector('#WandIcon1'))
    },

    wand2: {
        id: '#WandIcon2',
        obj: WandIcon(document.querySelector('#WandIcon2'))
    },

    x: {
        id: '#CloseXIcon',
        obj: ShrkinkingToCloseXIcon(
            document.querySelector('#CloseXIcon'),
            { refreshTime: 3 }
        ),
        // customClickHandlers: [
        //     { name: 'callMeOnClick', fn: function () {debugger; console.log('Yay!'); } }
        // ]
    },
    playPauseButton: {
        id: '#PlayPauseButton',
        obj: PlayPauseButton(document.querySelector('#PlayPauseButton'))
    }
};

export default SVG_METADATA;
