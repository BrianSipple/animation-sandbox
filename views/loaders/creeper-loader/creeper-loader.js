var
    pathAreaSVG = document.querySelector('#areaContainer'),
    pathLineSVG = document.querySelector('#l0'),
    pathPoint0 = document.querySelector('#p0'),
    pathPoint1 = document.querySelector('#p1'),

    controlPointMid = document.querySelector('.control-point_mid'),
    controlPointP0 = document.querySelector('.control-point_p0'),
    controlPointP1 = document.querySelector('.control-point_p1');


function init () {

    TweenMax.set(
        pathAreaSVG,
        {
            position: 'absolute',
            top: '50%',
            left: 0,
            xPercent: 0,
            yPercent: -50
        }
    );

    TweenMax.set( [p0, p1], { position: 'absolute'} );

    TweenMax.set( controlPointMid, { position: 'absolute', x: 300, y: 300 });

}

window.addEventListener('load', function () {
   init();
}, false);
