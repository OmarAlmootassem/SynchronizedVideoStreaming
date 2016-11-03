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

angular.module('starter').controller('homeCtrl', ['$scope', '$mdDialog', '$state', '$rootScope', '$mdToast', '$timeout', function($scope, $mdDialog, $state, $rootScope, $mdToast, $timeout) {

  $scope.movies = [];

  $scope.getMovies = function(){
    firebase.database().ref('movies').once('value').then(function(snapshot){
      snapshot.forEach(function(childSnapshot){
        firebase.storage().ref('images/' + childSnapshot.val().poster).getDownloadURL().then(function(url){
          $scope.movies.push({
            uid: childSnapshot.key,
            name: childSnapshot.val().name,
            year: childSnapshot.val().year,
            poster: url
          });
          $scope.$applyAsync();
        });
      });
    });
  }

  $scope.movieChosen = function(movie){
    console.log(movie);
    $mdDialog.show({
        locals:{movie: movie, you: $rootScope.fbUser},
        clickOutsideToClose: false,
        controllerAs: 'ctrl',
        templateUrl: 'templates/choose_friend.html',
        controller: mdDialogCtrl,
    });
  }

  var mdDialogCtrl = function ($scope, movie, you) {
      $scope.movie = movie;
      $scope.you = you;
      $scope.friends = [];
      $scope.friendIds = [];
      $scope.waiting = false;

      $scope.cancel = function() {
        if ($scope.sessionId.length > 0){
          firebase.database().ref('sessions/' + $scope.sessionId).update({
            status: "canceled"
          },function(error){
            if (error){} else {
              $mdDialog.cancel();
              $mdToast.show(
              $mdToast.simple()
                .textContent("Session Canceled!")
                .hideDelay(3000)
              );
            }
          });
        }
      }

      $scope.showFriends = function(){
        firebase.database().ref('users/' + $scope.you.uid + '/friends').once('value').then(function(snapshot){
          snapshot.forEach(function(childSnapshot){
            $scope.friendIds.push(childSnapshot.key);
          });
          ($scope.friendIds).forEach(function(friend){
            //console.log("FRIEND: " + friend);
            firebase.database().ref('users/' + friend).once('value').then(function(friendSnapshot){
              $scope.friends.push({
                uid: friendSnapshot.key,
                name: friendSnapshot.val().name,
                status: friendSnapshot.val().status
              });
              $scope.$applyAsync();
            });
          });
          // console.log($scope.friends);
        });
      }

      $scope.inviteFriend = function(friend){
        $scope.waiting = true;
        $scope.sessionId = firebase.database().ref().child('sessions').push().key;
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          creator: $scope.you.uid,
          invitee: friend.uid,
          movie: $scope.movie.uid,
          status: "pending"
        },function(error){
          if (error){
            var errorCode = error.code;
            var errorMessage = error.message;
            $scope.statusMessage = "Error: " + errorMessage;
          } else {
            $scope.statusMessage = "Request Sent! Waiting on Response...";
            firebase.database().ref('sessions/' + $scope.sessionId).on('value', function(snapshot){
              if (snapshot.val().status == "pending"){
                $scope.statusMessage = "Request Sent! Waiting on Response...";
              } else if (snapshot.val().status == "rejected"){
                $scope.statusMessage = friend.name + " rejected your request...";
                $timeout(function () {
                  $mdDialog.cancel();
                }, 3000);
              } else if (snapshot.val().status == "accepted"){
                $scope.statusMessage = friend.name + " accepted your request. You will be transfered to the video page in 3 seconds";
                firebase.database().ref('users/' + you.uid).update({
                  watching: $scope.sessionId
                });
                $timeout(function () {
                  $mdDialog.cancel();
                  $state.go('watch');
                }, 3000);
              }
              $scope.$applyAsync();
            });
          }
          $scope.$applyAsync();
        });
        console.log($scope.sessionId);
      }
  }
}]);

angular.module('starter').controller('navCtrl', ['$scope', '$rootScope', '$state', '$timeout', '$mdToast', function($scope, $rootScope, $state, $timeout, $mdToast) {
    $scope.title = "Synchronized Video Streaming";
    $scope.invites = [];
    $scope.inviteIds = [];

    $scope.signOut = function(){
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }, function(error) {
        // An error happened.
      });
    }

    $scope.start = function(){
      $timeout(function () {
        $scope.watchInvites();
      }, 1000);
    }

    $scope.watchInvites = function(){
      var sessionsRef = firebase.database().ref('sessions').orderByChild('invitee').equalTo($rootScope.fbUser.uid);
      sessionsRef.on('value', function(snapshot){
        $scope.invites.length = 0;
        snapshot.forEach(function(childSnapshot){
          if (childSnapshot.val().status == 'pending'){
            $scope.invites.push(childSnapshot.val());
            $scope.inviteIds.push(childSnapshot.key);
          }
        });
        //console.log($scope.invites);
        if ($scope.invites.length == 1){
          firebase.database().ref('users/' + $scope.invites[0].creator).once('value').then(function(userSnap){
            firebase.database().ref('movies/' + $scope.invites[0].movie).once('value').then(function(movieSnap){
              //console.log(userSnap.val());
              var message = "You have an invite from " + userSnap.val().name + " to watch " + movieSnap.val().name;
              $mdToast.show({
                locals: {title: message, button1: "Watch", button2: "Reject", invite: $scope.invites[0], id: $scope.inviteIds[0]},
                controller: mdToastCtrl,
                templateUrl: 'templates/toast_multi_action.html',
                hideDelay: false
              });
            });
          });
        } else {
          $mdToast.hide();
        }
      });
    }

    var mdToastCtrl = function ($scope, title, button1, button2, invite, id) {
        $scope.title = title;
        $scope.button1 = button1;
        $scope.button2 = button2;

        $scope.reject = function() {
          firebase.database().ref('sessions/' + id).update({
            status: "rejected"
          });
        }

        $scope.watch = function(friend){
          firebase.database().ref('sessions/' + id).update({
            status: "accepted"
          }, function(error){
            if (error){
              var errorCode = error.code;
              var errorMessage = error.message;
            } else {
              $timeout(function () {
                firebase.database().ref('users/' + firebase.auth().currentUser.uid).update({
                  watching: id
                });
                $state.go('watch');
              }, 3000);
            }
          });
        }
    }

    $scope.goToProfile = function(){
      $state.go("profile");
    }

    $scope.ETgoHome = function(){
      $state.go("home");
    }
  }]);

angular.module('starter').controller('profileCtrl', ['$scope', '$mdToast', '$state', '$rootScope', '$mdDialog', function($scope, $mdToast, $state, $rootScope, $mdDialog) {

    $scope.friendIds = [];
    $scope.friends = [];
    $scope.allUsers = [];

    $scope.getProfileInfo = function(){
      firebase.database().ref('users/' + $rootScope.fbUser.uid).once('value').then(function(snapshot){
        $scope.user = snapshot.val();
        //console.log($scope.user);
        //console.log($scope.friendIds);
        if (!$scope.user.phone){
          $scope.user.phone = "";
        }
      });
      firebase.database().ref('users/' + $rootScope.fbUser.uid + '/friends').once('value').then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
          $scope.friendIds.push(childSnapshot.key);
        });
        ($scope.friendIds).forEach(function(friend){
          //console.log("FRIEND: " + friend);
          firebase.database().ref('users/' + friend).once('value').then(function(friendSnapshot){
            $scope.friends.push({
              name: friendSnapshot.val().name,
              status: friendSnapshot.val().status
            });
            $scope.$applyAsync();
          });
        });
        //console.log($scope.friends);
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
          var errorCode = error.code;
          var errorMessage = error.message;
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

    $scope.searchForFriends = function(){
      $scope.allUsers.length = 0;
      firebase.database().ref('users').once('value').then(function(snapshot){
        snapshot.forEach(function(childSnapshot){
          if (childSnapshot.key != $rootScope.fbUser.uid){
            $scope.allUsers.push({
              name: childSnapshot.val().name,
              username: childSnapshot.val().username,
              uid: childSnapshot.key
            });
            $scope.$applyAsync();
          }
        });
        //console.log($scope.allUsers);
        $mdDialog.show({
            locals:{dataToPass: $scope.allUsers, you: $rootScope.fbUser},
            clickOutsideToClose: true,
            controllerAs: 'ctrl',
            templateUrl: 'templates/add_friends.html',
            controller: mdDialogCtrl,
        });
      });
    }
    var mdDialogCtrl = function ($scope, dataToPass, you) {
        $scope.allUsers = dataToPass;
        $scope.fbUser = you;

        $scope.cancel = function() {
          $mdDialog.cancel();
        }

        $scope.addFriend = function(friend){
          //console.log(friend);
          //console.log($scope.fbUser);
          var friendUid = friend.uid;
          var fbData = {};
          fbData[friendUid] = 1;
          firebase.database().ref('users/' + $scope.fbUser.uid + '/friends').update(fbData);
          $mdDialog.cancel();
        }
    }
  }]);


angular.module('starter').controller('watchCtrl', ['$scope', '$sce', '$state', '$rootScope', '$mdToast', '$timeout', function($scope, $sce, $state, $rootScope, $mdToast, $timeout) {

  $scope.getMovieInfo = function(){
    firebase.database().ref('users/' + $rootScope.fbUser.uid).once('value').then(function(snapshot){
      $scope.sessionId = snapshot.val().watching;
      // console.log($scope.sessionId);
      firebase.database().ref('sessions/' + $scope.sessionId).once('value').then(function(sessionSnapshot){
        $scope.sessionInfo = sessionSnapshot.val();
        // console.log($scope.sessionInfo);
        firebase.database().ref('movies/' + $scope.sessionInfo.movie).once('value').then(function(movieSnapshot){
          firebase.storage().ref('images/' + movieSnapshot.val().poster).getDownloadURL().then(function(image){
            firebase.storage().ref('movies/' + movieSnapshot.val().movie).getDownloadURL().then(function(movie){
              $scope.movie = {
                uid: movieSnapshot.key,
                name: movieSnapshot.val().name,
                year: movieSnapshot.val().year,
                poster: image,
                movie: movie
              };

              $scope.$applyAsync();
              $scope.config = {
        				preload: "none",
        				sources: [
        					{src: $sce.trustAsResourceUrl($scope.movie.movie), type: "video/mp4"}
        				]
        			};
              $scope.$applyAsync();
            });
          });
        });
      });
    });
  }
  var api = null;
  $scope.onPlayerReady = function(API){
    api = API;
    $timeout(function () {
      // console.log($scope.sessionInfo);
      if ($scope.sessionInfo.creator == $rootScope.fbUser.uid){
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          creator_status: "ready"
        });
      } else if ($scope.sessionInfo.invitee == $rootScope.fbUser.uid){
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          invitee_status: "ready"
        });
      }
      var oldSnap = {status: "null"};
      firebase.database().ref('sessions/' + $scope.sessionId).on('value', function(snapshot){
        if (snapshot.val().creator_status == "ready" && snapshot.val().invitee_status == "ready" && oldSnap.status == "null"){
          api.play();
          console.log("START");
          oldSnap.status = "playing";
        }
        if (snapshot.val().status == "paused"){
          api.pause();
          console.log("PAUSE");
          oldSnap.status = "paused";
        } else if (snapshot.val().status == "playing"){
          api.seekTime(snapshot.val().pause_time, false);
          api.play();
          console.log("PLAY");
          oldSnap.status = "playing";
        }
      });
    }, 2000);
  }

  var oldState = "play";
  $scope.onUpdateState = function($state){
    console.log("Current: " + $state + " Old: " + oldState);
    if ($state == "pause" && oldState != "seeking"){
      //console.log("STATE PAUSED");
      firebase.database().ref('sessions/' + $scope.sessionId).update({
        status: "paused",
        pause_time: $scope.currentTime
      });
    } else if ($state == "play" && oldState != "seeking"){
      firebase.database().ref('sessions/' + $scope.sessionId).update({
        status: "playing"
      });
    } else if (oldState == "seeking"){
      firebase.database().ref('sessions/' + $scope.sessionId).update({
        status: "playing",
        pause_time: $scope.currentTime
      });
    }
    oldState = $state;
  }

  var oldTime = 0;
  $scope.onUpdateTime = function($currentTime, $duration){
    if ($currentTime - oldTime > 10){
      console.log("YES");
      oldTime = $currentTime;
      api.seekTime($currentTime, false);
      oldState = "seeking";
    } else {
      oldState = "play";
    }
    $scope.currentTime = $currentTime;
  }
}]);
