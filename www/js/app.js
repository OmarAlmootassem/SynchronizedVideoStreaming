// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngMaterial'])

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
            $state.go("home");
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

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'homeCtrl'
  });

  $urlRouterProvider.otherwise('/home');
}]);

angular.module('starter').controller('authCtrl', ['$scope', '$mdToast', function($scope, $mdToast) {

  $scope.showSignIn = false;

    $scope.signUp = function(user){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(function(fbUser){
        firebase.database().ref('users/' + fbUser.uid).update({
          name: user.name,
          username: user.username,
          status: 'online',
          email: user.email
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

angular.module('starter').controller('homeCtrl', ['$scope', '$timeout', '$state', function($scope, $timeout, $state) {

  $scope.movies = [];

  $scope.getMovies = function(){
    firebase.database().ref('movies').once('value').then(function(snapshot){
      snapshot.forEach(function(childSnapshot){
        firebase.storage().ref('images/' + childSnapshot.val().poster).getDownloadURL().then(function(url){
          $scope.movies.push({
            name: childSnapshot.val().name,
            year: childSnapshot.val().year,
            poster: url
          });
          $scope.$applyAsync();
        })
      });
    });
  }

  $scope.movieChosen = function(movie){
    console.log(movie);
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

    $scope.goToProfile = function(){
      $state.go("profile");
    }

    $scope.ETgoHome = function(){
      $state.go("home");
    }
  }]);

angular.module('starter').controller('profileCtrl', ['$scope', '$mdToast', '$state', '$rootScope', function($scope, $mdToast, $state, $rootScope) {

    $scope.friendIds = [];
    $scope.friends = [];

    $scope.getProfileInfo = function(){
      firebase.database().ref('users/' + $rootScope.fbUser.uid).once('value').then(function(snapshot){
        $scope.user = snapshot.val();
        console.log($scope.user);
        console.log($scope.friendIds);
        if (!$scope.user.phone){
          $scope.user.phone = "";
        }
      });
      firebase.database().ref('users/' + $rootScope.fbUser.uid + '/friends').once('value').then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
          $scope.friendIds.push(childSnapshot.key);
        });
        ($scope.friendIds).forEach(function(friend){
          console.log("FRIEND: " + friend);
          firebase.database().ref('users/' + friend).once('value').then(function(friendSnapshot){
            $scope.friends.push({
              name: friendSnapshot.val().name,
              status: friendSnapshot.val().status
            });
            $scope.$applyAsync();
          });
        });
        console.log($scope.friends);
      });
    }

    $scope.updateProfile = function(){

      firebase.database().ref('users/' + $rootScope.fbUser.uid).update({
        name: $scope.user.name,
        phone: $scope.user.phone,
        email: $rootScope.fbUser.email,
        username: $scope.user.username
      }, function(error){
        var message;
        if (error){
          message = 'Error ' + errorCode + ": " + errorMessage
        } else {
          message = 'Profile Updated'
        }
        $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .hideDelay(3000)
        );
      });
    }
  }]);
