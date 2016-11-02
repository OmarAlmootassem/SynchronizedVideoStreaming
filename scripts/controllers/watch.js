
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
              // console.log($scope.movie);

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
          // firebase.database().ref('sessions/' + $scope.sessionId).update({
          //   invitee_status: "paused",
          //   creator_status: "paused"
          // });
        } else if (snapshot.val().status == "playing"){
          api.seekTime(snapshot.val().pause_time, false);
          api.play();
          console.log("PLAY");
          oldSnap.status = "playing";
          // firebase.database().ref('sessions/' + $scope.sessionId).update({
          //   invitee_status: "playing",
          //   creator_status: "playing"
          // });
        }
        //console.log(oldSnap);
        // oldSnap = snapshot.val();
      });
    }, 2000);
  }

  var oldState = "play";
  $scope.onUpdateState = function($state){
    console.log("Current: " + $state + " Old: " + oldState);
    if ($state == "pause" && oldState != "pause"){
      //console.log("STATE PAUSED");
      if ($scope.sessionInfo.creator == $rootScope.fbUser.uid){
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          status: "paused",
          pause_time: $scope.currentTime
        });
      } else if ($scope.sessionInfo.invitee == $rootScope.fbUser.uid){
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          status: "paused",
          pause_time: $scope.currentTime
        });
      }
    } else if ($state == "play" && oldState != "play"){
      if ($scope.sessionInfo.creator == $rootScope.fbUser.uid){
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          status: "playing"
        });
      } else if ($scope.sessionInfo.invitee == $rootScope.fbUser.uid){
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          status: "playing"
        });
      }
    }
    oldState = $state;
  }
  var oldTime = 0;
  $scope.onUpdateTime = function($currentTime, $duration){
    if ($currentTime - oldTime > 10){
      console.log("YES");
      oldTime = $currentTime;
      api.seekTime($currentTime, false);
    }
    $scope.currentTime = $currentTime;
  }
}]);
