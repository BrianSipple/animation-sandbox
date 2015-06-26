var frame = Snap('.mainFrame'),
    objects,
    scene,
    bigCircle,
    leftCircle,
    rightCircle,
    discs;

frame.rect(0, 0, 800, 800)
    .attr({
        fill: '#826FFF'
    });

bigCircle = frame.circle(100, 100, 50);
bigCircle.attr({
    fill: '#bada55',
    stroke: '#000',
    strokeWidth: 5
});

leftCircle = frame.circle(70, 100, 30);
rightCircle = leftCircle.clone().transform('translateX: 60');


discs = frame.group(leftCircle, rightCircle)
    .attr({
        fill: Snap('#pattern')
    });

bigCircle.attr({
    mask: discs
});

Snap.load('../../../img/Eye.svg', function (frag) {
    var eye = frag.select('g');
    eye.attr({
        x: '500',
        y: '500'
    });
    frame.append(eye);
});




objects = frame.group(bigCircle, discs);
