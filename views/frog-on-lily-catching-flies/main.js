import 'TweenMax';
import Fly from './fly';
import Frog from './frog';


const
    LABELS = {
        fliesEntrance: 'fliesEntrance'
    }

    SETTINGS = {
        maxFlies: 8,
        flyRespawnTime: 6
    };

let flies = [];


function retrieveClickedFlyOnClick (ev) {
    let clickedElem = ev.target;
    for (let fly of flies) {
        if (fly.el === clickedElem) {
            return fly;
        }
    }
    return null;
}

function tryToCatchAFlyOnClick (ev) {

    let clickedFly = retrieveClickedFlyOnClick(ev);

    if (clickedFly) {

    }



}

function wireUpEventListeners () {
    sceneContainer.addEventListener('click', tryToCatchAFlyOnClick, false);
}

function init () {


    masterTL = new TimelineMax();

    wireUpEventListeners();

    masterTL.add(rrrribit(), 0);
    masterTL.addLabel(LABELS.fliesEntrance);
    masterTL.add(sendInTheFlies(), LABELS.fliesEntrance);
}
