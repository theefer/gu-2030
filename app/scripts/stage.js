(function() {


    var numScenes = 2;

    function swapScene(offset) {
        var currentScene = $('.stage').data('scene');
        var nextScene = Math.min(Math.max(currentScene + offset, 1), numScenes);
        if (nextScene) {
            $('.stage').removeClass('show-scene-' + currentScene);
            $('.stage .scene-'+currentScene).removeClass('is-current');
            $('.stage').data('scene', nextScene);
            $('.stage').addClass('show-scene-' + nextScene);
            $('.stage .scene-'+nextScene).addClass('is-current');
        }
    }

    function moveZone(direction) {
        var current = $('.stage .scene.is-current');
            // switch(direction) {
            // case 'left':
            //     break;
            // case 'right':
            //     break;
            // case 'up':
            //     break;
            // case 'down':
            //     break;
            // }
        // TODO: ?
    }

    // Leap
    var controllerOptions = {enableGestures: true};
    Leap.loop(controllerOptions, function(frame) {
        if (frame.gestures.length > 0) {
            console.log(frame.gestures)
        }
    });

    // Keyboard nav
    $(document.documentElement).bind('keydown', function(e) {
        var direction = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        }[e.keyCode];
        var shift = e.shiftKey;

        if (shift) {
            if (direction == 'left') {
                swapScene(-1);
            } else if (direction == 'right') {
                swapScene(+1);
            }
        } else {
            moveZone(direction);
        }

    });
})();
