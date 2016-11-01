// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ngSanitize', 'ionic', 'ngMaterial', 'com.2fdevs.videogular'])

.run(['$ionicPlatform', '$rootScope', '$state', function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    firebase.auth().onAuthStateChanged(function(administrators) {
        $rootScope.fbUser = firebase.auth().currentUser;
        if ($rootScope.fbUser != null) {
            $rootScope.isLoggedIn = true;
            console.log("loggedIN");
            $state.go("watch");
            // redirect to dashboard
        } else {
            $rootScope.isLoggedIn = false;
            console.log("loggedOUT");
            $state.go("auth");
            // No user is signed in.
            // console.log("loggedout");
            // $state.go("tab.dash");
        }
    });
  });
}])

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
  $ionicConfigProvider.views.transition('none');

  $stateProvider

  .state('auth', {
    url: '/auth',
    templateUrl: 'templates/auth.html',
    controller: 'authCtrl'
  })

  .state('profile', {
    url: '/profile',
    templateUrl: 'templates/profile.html',
    controller: 'profileCtrl'
  })

  .state('watch', {
    url: '/watch',
    templateUrl: 'templates/watch.html',
    controller: 'watchCtrl'
  })

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  });

  $urlRouterProvider.otherwise('/home');
}]);
