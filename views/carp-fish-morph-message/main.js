
function setFish() {

}

function startSwimming () {
    let masterSwimmingTL = new TimelineMax();

    masterSwimmingTL.add(swimSteadilyTowardCenter());
    masterSwimmingTL.add(morphOutOfWaterToMessage());
    masterSwimmingTL.add(diveAndMorphBackToFish());
    masterSwimmingTL.add(swooshBackAroundAndContinueSwim());
}


const init = (function init () {

    setFish();
    startSwimming();


}());


export default init;
