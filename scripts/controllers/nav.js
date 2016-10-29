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
