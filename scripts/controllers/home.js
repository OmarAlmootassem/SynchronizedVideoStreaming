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
