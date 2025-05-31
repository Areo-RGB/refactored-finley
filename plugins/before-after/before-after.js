function beforeAfter(){
    var sliderBA = document.getElementById('before-after-slider');
    var beforeBA = document.getElementById('before-image');
    var afterBA = document.getElementById('after-image');
    var beforeMediaBA = beforeBA.getElementsByTagName('img')[0] || beforeBA.getElementsByTagName('video')[0];
    var afterMediaBA = afterBA.getElementsByTagName('img')[0] || afterBA.getElementsByTagName('video')[0];
    var resizerBA = document.getElementById('resizer');
    var activeBA = false;

    function active(){ activeBA = true; resizerBA.classList.add('resize');}
    function inactive(){ activeBA = false; resizerBA.classList.remove('resize');}

    //Sort overflow out for Overlay Media
    var width = sliderBA.offsetWidth;
    if (beforeMediaBA) beforeMediaBA.style.width = width + 'px';

    //Adjust width of media on resize
    window.addEventListener('resize', function () {
        var width = sliderBA.offsetWidth;
        if (beforeMediaBA) beforeMediaBA.style.width = width + 'px';
    })

    //Basic Events
    resizerBA.addEventListener('mousedown', function(){active()});
    document.body.addEventListener('mouseup',function(){inactive();});
    document.body.addEventListener('mouseleave', function (){inactive();});
    resizerBA.addEventListener('touchstart', function () {active();});
    document.body.addEventListener('touchend', function () {inactive();});
    document.body.addEventListener('touchcancel', function () {inactive();});

    //Drag & Swipe Events
    document.body.addEventListener('mousemove', function (e) {
        if (!activeBA) return;
        var x = e.pageX;
        x -= sliderBA.getBoundingClientRect().left;
        slideIt(x);
        pauseEvent(e);
    });
    document.body.addEventListener('touchmove', function (e) {
        if (!activeBA) return;
        let x;
        let i;
        for (i = 0; i < e.changedTouches.length; i++) {x = e.changedTouches[i].pageX;}
        x -= sliderBA.getBoundingClientRect().left;
        slideIt(x);
        pauseEvent(e);
    });

    function slideIt(x) {
        var transform = Math.max(0, (Math.min(x, sliderBA.offsetWidth)));
        beforeBA.style.width = transform + "px";
        resizerBA.style.left = transform - 0 + "px";
    }

    //stop divs being selected.
    function pauseEvent(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        e.cancelBubble = true;
        e.returnValue = false;
        return false;
    }
}

// Video control functionality
function initVideoControls() {
    var beforeVideo = document.querySelector('#before-image video');
    var afterVideo = document.querySelector('#after-image video');
    var beforeControl = document.getElementById('before-video-control');
    var afterControl = document.getElementById('after-video-control');

    if (beforeVideo && beforeControl) {
        beforeControl.addEventListener('click', function() {
            if (beforeVideo.paused) {
                beforeVideo.play();
                beforeControl.innerHTML = '<i class="fa fa-pause me-2"></i>Pause Bent';
            } else {
                beforeVideo.pause();
                beforeControl.innerHTML = '<i class="fa fa-play me-2"></i>Play Bent';
            }
        });

        beforeVideo.addEventListener('ended', function() {
            beforeControl.innerHTML = '<i class="fa fa-play me-2"></i>Play Bent';
        });
    }

    if (afterVideo && afterControl) {
        afterControl.addEventListener('click', function() {
            if (afterVideo.paused) {
                afterVideo.play();
                afterControl.innerHTML = '<i class="fa fa-pause me-2"></i>Pause Finley';
            } else {
                afterVideo.pause();
                afterControl.innerHTML = '<i class="fa fa-play me-2"></i>Play Finley';
            }
        });

        afterVideo.addEventListener('ended', function() {
            afterControl.innerHTML = '<i class="fa fa-play me-2"></i>Play Finley';
        });
    }
}

beforeAfter();
initVideoControls();