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
