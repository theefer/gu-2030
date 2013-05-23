'use strict';

angular.module('gu2030App', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/scenes.html',
        controller: 'ScenesCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function($document) {
  });
