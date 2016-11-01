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
              console.log($scope.movie);

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

  $scope.onUpdateState = function($state){
    console.log($state);
  }

  $scope.onUpdateTime = function($currentTime, $duration){
    console.log($currentTime + " " + $duration);
  }
}]);
