angular.module('starter').controller('homeCtrl', ['$scope', '$mdDialog', '$state', '$rootScope', function($scope, $mdDialog, $state, $rootScope) {

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
        })
      });
    });
  }

  $scope.movieChosen = function(movie){
    console.log(movie);
    $mdDialog.show({
        locals:{movie: movie, you: $rootScope.fbUser},
        clickOutsideToClose: true,
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

      $scope.cancel = function() {
        $mdDialog.cancel();
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
        $scope.sessionId = firebase.database().ref().child('sessions').push().key;
        firebase.database().ref('sessions/' + $scope.sessionId).update({
          creator: $scope.you.uid,
          invitee: friend.uid,
          movie: $scope.movie.uid,
          status: "pending"
        });
        console.log($scope.sessionId);
      }
  }
}]);
