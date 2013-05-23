(function() {

    // Set default scene
    var currentScene = $('.stage').find('.scene.is-current');

    // Calculate top offset to vertically center zones
    $('.zone').each(function () {
      var $slide = $(this);
      $slide.css('top', ($slide.outerHeight() / 2) * -1);
    });

    // We have to hide the other scenes after calcualting the top offset of
    // each zone
    currentScene.siblings().hide();

    var numScenes = 2;

    function swapScene(offset) {
        var oldScene = currentScene;
        var currentSceneIndex = $('.stage').data('scene');
        var nextSceneIndex = Math.min(Math.max(currentSceneIndex + offset, 1), numScenes);
        if (nextSceneIndex) {
            $('.stage').removeClass('show-scene-' + currentSceneIndex);
            $('.stage .scene-'+currentSceneIndex).removeClass('is-current');
            $('.stage').data('scene', nextSceneIndex);
            $('.stage').addClass('show-scene-' + nextSceneIndex);
            oldScene.css('z-index', 100);
            oldScene.fadeOut(function () {
              oldScene.css('z-index', '')
            });
            currentScene = $('.stage .scene-'+nextSceneIndex).addClass('is-current');
            currentScene.fadeIn();
        }
    }

    var oppositeDirections = {
      'left': 'right',
      'right': 'left',
      'up': 'down',
      'down': 'up'
    };

    function moveZone(direction) {
        // @todo Current scene
        var oppositeDirection = oppositeDirections[direction]
        var current = currentScene.find('.zone.present');

        var zones = current.siblings();
        // Get the first one, as we may have two items that are in that direction
        var zone = zones.filter('.' + oppositeDirection).eq(0);

        if (!current.hasClass('middle') && !zone.hasClass('middle')) { return; }

        if (!zone.length) { return; }

        zone.removeClass(oppositeDirection).addClass('present');
        current.removeClass('present').addClass(direction);
    }

    // Leap
    var gestureStart;

    var paused = false; // for debug

    function vector(start, end) {
        var diff = [
            end[0] - start[0],
            end[1] - start[1],
            end[2] - start[2]
        ];
        var direction;
        var mainAxis = Math.abs(diff[0]) > Math.abs(diff[1]) ? 'x' : 'y';
        if (mainAxis == 'x') {
            direction = (diff[0] > 0) ? 'right' : 'left';
        } else {
            direction = (diff[1] > 0) ? 'up' : 'down';
        }
        return {
            diff: diff,
            direction: direction
        };
    }

    function handleSwipe(start, end) {
        var v = vector(end.startPosition, end.position);
        console.log("GESTURE", v.direction, start.handCount) // start, end
        if (start.handCount > 1) {
            if (v.direction == 'left') {
                swapScene(1);
            } else if (v.direction == 'right') {
                swapScene(-1);
            }
        } else {
            moveZone(v.direction);
        }
    }

    var controllerOptions = {enableGestures: true};
    Leap.loop(controllerOptions, function(frame) {
        if (! paused) {
            console.log(frame);
        }

        if (frame.gestures && frame.gestures.length > 0) {
            var startSwipeGestures = _.filter(frame.gestures, function(g) {
                return g.state == 'start' && g.type == 'swipe';
            });
            var stopSwipeGestures = _.filter(frame.gestures, function(g) {
                return g.state == 'stop' && g.type == 'swipe';
            });
            if (startSwipeGestures.length > 0 && ! gestureStart) {
                // if starting gestures and not already tracking some
                gestureStart = startSwipeGestures[0];
                gestureStart.handCount = frame.hands.length;
            } else if (stopSwipeGestures.length > 0 && gestureStart) {
                // if stopping gestures and some was started
                var stoppedGesture = _.find(stopSwipeGestures, function(g) {
                    return g.id == gestureStart.id;
                });
                // if stopping a started gesture
                if (stoppedGesture) {
                    handleSwipe(gestureStart, stoppedGesture);
                    gestureStart = null;
                }
            }
        }

        if (frame.fingers.length == 1) {
            console.log(frame.fingers[0].tipPosition)
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

        if (direction) {
            if (shift) {
                if (direction == 'left') {
                    swapScene(-1);
                } else if (direction == 'right') {
                    swapScene(+1);
                }
            } else {
                moveZone(direction);
            }
        }

        var space = e.keyCode == 32;
        if (space) {
            paused = ! paused;
        }

    });
})();
