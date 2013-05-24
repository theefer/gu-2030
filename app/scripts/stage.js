(function() {

    var finger = $('.finger');

    // Set default scene
    var currentScene = $('.stage').find('.scene.is-current');

    var currentStory, isNowZone;

    // id to play if asked to play
    var canPlayId;

    // Calculate top offset to vertically center zones
    $('.zone').each(function () {
      var $slide = $(this);
      $slide.css('top', ($slide.outerHeight() / 2) * -1);
    });

    // We have to hide the other scenes after calcualting the top offset of
    // each zone
    currentScene.siblings().hide();

    var numScenes = $('.scene').length;

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
              oldScene.css('z-index', '');
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
        var oppositeDirection = oppositeDirections[direction];
        var current = currentScene.find('.zone.present');

        var zones = current.siblings();
        // Get the first one, as we may have two items that are in that direction
        var zone = zones.filter('.' + oppositeDirection).eq(0);

        if (!current.hasClass('middle') && !zone.hasClass('middle')) { return; }

        if (!zone.length) { return; }

        current.find('video').each(function(i, video) {
            video.pause();
        });

        zone.removeClass(oppositeDirection).addClass('present');
        current.removeClass('present').addClass(direction);

        // start playing all videos in the zone
        zone.find('video').each(function(i, video) {
            video.play();
        });

        if (zone.hasClass('zone-context')) {
            var quotes = zone.find('.friends-quotes')

            var example1 = quotes.find('.tweet').first().clone();
            var example2 = example1.clone();

            example1.find('.tweet__avatar').attr('src', 'https://si0.twimg.com/profile_images/1428739215/image_normal.jpg');
            example1.find('.tweet__user-name').text('Oliver Ash');
            example1.find('p').text('Best. Gig. Ever.');

            example2.find('.tweet__avatar').attr('src', 'https://si0.twimg.com/profile_images/3655991301/a50cb0c61e1bb65912d6ccf964089987_normal.jpeg');
            example2.find('.tweet__user-name').text('Joel Vardy');
            example2.find('p').text('I love this song! WOW! Thank you to Fever Play for tonight.');

            setTimeout(function () {
                example1.prependTo(quotes).hide().slideDown();
            }, 2500);

            setTimeout(function () {
                example2.prependTo(quotes).hide().slideDown();
            }, 4800)
        }

        if (zone.hasClass('zone-now')) {
            isNowZone = true;
        } else {
            isNowZone = false;
            selectStory(null);
        }

        canPlayId = zone.data('can-play');
    }

    function slideStory(storyNode, direction) {
        var story = $(storyNode);
        var isLeft = story.hasClass('is-left');
        var isCenter = story.hasClass('is-center');
        var isRight = story.hasClass('is-right');
        if (isLeft && direction == 'right') {
            story.removeClass('is-left');
            story.addClass('is-center');
        } else if (isCenter && direction == 'left') {
            story.removeClass('is-center');
            story.addClass('is-left');
        } else if (isCenter && direction == 'right') {
            story.removeClass('is-center');
            story.addClass('is-right');
        } else if (isRight && direction == 'left') {
            story.removeClass('is-right');
            story.addClass('is-center');
        }
        console.log("swipe story", direction)
    }

    function hasReveal() {
        return $('.reveal.visible').length > 0;
    }
    function reveal(id) {
        if (hasReveal) {
            hideReveal();
        }

        $(id).addClass('visible');
        $(id).find('video').each(function(i, video) {
            video.play();
        });
    }

    function hideReveal() {
        $('.reveal').removeClass('visible');
        $('.reveal').find('video').each(function(i, video) {
            video.play();
        });
    }


    // Leap
    var gestureStart;

    var paused = true; // for debug

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

    function handleSwipe(start, end, type) {
        var v = vector(end.startPosition, end.position);
        console.log("GESTURE", type, v.direction, start.handCount) // start, end
        if (type == 'finger') {
            if (currentStory) {
                slideStory(currentStory, v.direction);
            }
        } else if (type == 'hand') {
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
    }

    function fingerAt(pos) {
        if (pos) {
            finger.css('top', pos[1]);
            finger.css('left', pos[0]);
            finger.addClass('is-visible');

            // FIXME: find matching band, set
            if (isNowZone) {
                var story = findStoryAt(pos);
                if (story) {
                    selectStory(story);
                }
            }
        } else {
            finger.removeClass('is-visible');
        }
    }

    function findStoryAt(pos) {
        var s;
        var posX = pos[0], posY = pos[1];
        currentScene.find('.zone-now .story').each(function(i, story) {
            var ss = $(story);
            var offset = ss.offset();
            var storyTop = offset.top;
            var storyLeft = offset.left;
            var storyBottom = offset.top + ss.height();
            var storyRight = offset.left + ss.width();
            if (posX > storyLeft && posX < storyRight &&
                posY > storyTop && posY < storyBottom) {
                s = story;
            }
        });
        return s;
    }

    function selectStory(story) {
        // console.log("select:", story);
        if (currentStory && currentStory !== story) {
            $(currentStory).removeClass('is-highlighted');
        }
        currentStory = story;
        if (currentStory) {
            $(currentStory).addClass('is-highlighted');
        }
    }


    function readGesture(frame) {
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
                    var start = gestureStart;
                    gestureStart = null;
                    return [start, stoppedGesture];
                }
            }
        }
    }

    var controllerOptions = {enableGestures: true};
    Leap.loop(controllerOptions, function(frame) {
        if (! paused) {
            console.log(frame);
        }

        var gestureType;
        var fingerCount = frame.fingers.length;
        var firstFinger = frame.fingers[0];
        // if only one finger, beyond the sensor
        if (fingerCount == 1 && firstFinger.tipPosition[2] < 0) {
            var fingerPos = frame.fingers[0].tipPosition;
            var screenWidth = document.body.clientWidth;
            var screenHeight = document.body.clientHeight;
            var screenCoords = [
                ((fingerPos[0] + 300) / 600) * screenWidth,
                ((500 - fingerPos[1]) / 500 ) * screenHeight
            ];
            fingerAt(screenCoords);
            gestureType = 'finger';

        } else {
            fingerAt();
            gestureType = 'hand';
        }

        var gest = readGesture(frame);
        if (gest) {
            handleSwipe(gest[0], gest[1], gestureType);
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

        var zero = e.keyCode == 48;
        if (zero) {
            $('.explainer-container').toggle();
        }

        var s = e.keyCode == 83;
        if (s) {
            if (recognition) {
                stopSpeech();
            } else {
                initSpeech();
            }
        }
    });


    // Audio
    // http://updates.html5rocks.com/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API
    var recognition;
    function initSpeech() {
        if (!('webkitSpeechRecognition' in window)) {
            console.log("speechless")
        } else {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = function() {
                console.log("recognition started")
            }
            recognition.onresult = function(event) {
                var interim_transcript = '';

                for (var i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        console.log("final:", event.results[i][0].transcript);
	                var text = document.createElement('h2');
                        text.textContent = event.results[i][0].transcript;
	                document.body.appendChild(text);
                    } else {
                        console.log("interim:", event.results[i][0].transcript);
                        if (event.results[i][0].transcript.match('play')) {
                            if (canPlayId) {
                                reveal(canPlayId);
                            }
                        }
                        if (event.results[i][0].transcript.match('dismiss') ||
                            event.results[i][0].transcript.match('stop') ||
                            event.results[i][0].transcript.match('close')) {
                            if (hasReveal) {
                                hideReveal();
                            }
                        }
                    }
                }
            }
            recognition.onerror = function(event) {
            }
            recognition.onend = function() {
                console.log("recognition stopped")
            }


            recognition.lang = 'en-GB';
            recognition.start();
        }
    }
    function stopSpeech() {
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
    }
})();
