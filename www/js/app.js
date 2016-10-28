// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngMaterial'])

.run(['$ionicPlatform', function($ionicPlatform) {
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
  });
}])

.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
  $ionicConfigProvider.views.transition('none');

  $stateProvider

  .state('auth', {
    url: '/auth',
    templateUrl: 'templates/auth.html',
    controller: 'authCtrl'
  });

  $urlRouterProvider.otherwise('/auth');
}]);

angular.module('starter').controller('authCtrl', ['$scope', '$timeout', '$state', '$mdToast', function($scope, $timeout, $state, $mdToast) {

  $scope.showSignIn = false;

    $scope.signUp = function(user){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(function(fbUser){
        firebase.database().ref('users/' + fbUser.uid).update({
          name: user.name,
          username: user.username,
          status: 'online'
        });
        console.log(user);
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        $mdToast.show(
        $mdToast.simple()
          .textContent('Error ' + errorCode + ": " + errorMessage)
          .hideDelay(3000)
        );
      });
    }

    $scope.signIn = function(user){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(function(fbUser){
        firebase.database().ref('users/' + fbUser.uid).update({
          status: 'online'
        });
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        $mdToast.show(
        $mdToast.simple()
          .textContent('Error ' + errorCode + ": " + errorMessage)
          .hideDelay(3000)
        );
      });
      console.log("sign in");
    }

    $scope.switch = function(){
      if ($scope.showSignIn == false) $scope.showSignIn = true;
      else if ($scope.showSignIn == true) $scope.showSignIn = false;
      console.log($scope.showSignIn);
    }

  }]);

angular.module('starter').controller('navCtrl', ['$scope', '$timeout', '$state', function($scope, $timeout, $state) {
    $scope.title = "Synchronized Video Streaming";

    $scope.signOut = function(){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }, function(error) {
        // An error happened.
      });
    }
  }]);
