(function (exports) {

    var AnimUtils = {

        findLabelTime: function findLabelTime (timeline, label) {

            var time = timeline.getLabelTime(label),
                i = 0,
                children,
                tl;

            //if the label is in the main timeline, just return the time (performance optimization)
            if (time !== -1) {
                return time;
            }

            //if the label wasn't found, we need to seach all the child timelines
            children = timeline.getChildren(true, false, true);
            while (time === -1 && i < children.length) {
                tl = children[i];
                time = tl.getLabelTime(label);
                i++;
            }

            // If we're still here, the label doesn't exist
            if (time === -1) {
                return -1;
            }

            time = tl.startTime() + ( time / tl.timeScale() );
            tl = tl.timeline();

            while (tl && tl !== timeline) {
                time = tl.startTime() + (time / tl.timeScale());
                tl = tl.timeline();
            }

            return time;

        }


    };

    exports.AnimUtils = AnimUtils;

}( (typeof exports === 'undefined') ? window : exports));
