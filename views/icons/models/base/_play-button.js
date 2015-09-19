import Icon from './_icon';

let PlayButton = () => {

    let icon = Icon();

    icon.isShowingPlay = true;   // default to being paused

    // track whether or not each state has been activated by the user
    icon.hasBeenPaused = false;
    icon.hasBeenPlayed = false;


    return Object.create(icon);
};

export default PlayButton
