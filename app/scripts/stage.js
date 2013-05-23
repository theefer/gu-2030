(function() {

    // Set default scene
    var currentScene = $('.stage').find('.scene-1');

    $('.zone').each(function () {
      var $slide = $(this);
      $slide.css('top', ($slide.outerHeight() / 2) * -1);
    });

    var numScenes = 2;

    function swapScene(offset) {
        currentScene = $('.stage').data('scene');
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
        // @todo Current scene
        var current = currentScene.find('.zone.present');

        var zones = current.siblings();
        // Get the first one, as we may have two items that are in that direction
        var zone = zones.filter('.' + direction).eq(0);

        if (!current.hasClass('middle') && !zone.hasClass('middle')) { return; }

        if (!zone.length) { return; }

        zone.removeClass(direction).addClass('present');
        var oppositeDirection = {
          'left': 'right',
          'right': 'left',
          'up': 'down',
          'down': 'up'
        };
        current.removeClass('present').addClass(oppositeDirection[direction]);
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
