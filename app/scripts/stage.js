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

    $(document.documentElement).bind('keydown', function(e) {
        var direction = {
            37: 'left',
            38: 'top',
            39: 'right',
            40: 'bottom'
        }[e.keyCode];
        var shift = e.shiftKey;

        if (shift) {
            if (direction == 'left') {
                swapScene(-1);
            } else if (direction == 'right') {
                swapScene(+1);
            }
        } else {
            // TODO: change zone
            if (direction == 'left') {
                
            } else if (direction == 'right') {
            }
            var current = $('.stage .scene.is-current');

        }

    });
})();
