'use strict';

var app = angular
  .module('365prompts', [
    'ngAnimate',
    'ngResource',    
    'ngRoute',    
    'firebase',
    'toaster'
  ])
  .constant('FURL', 'https://365prompts.firebaseio.com/')  
  .config(function ($routeProvider) {
    $routeProvider      
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'AuthController'   
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller:'HomeController'
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller:'ProfileController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
