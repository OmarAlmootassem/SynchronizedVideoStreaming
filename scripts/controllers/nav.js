angular.module('starter').controller('navCtrl', ['$scope', '$timeout', '$state', function($scope, $timeout, $state) {
    $scope.title = "Ionic Blank Starter";

    firebase.database().ref('hi').once('value').then(function(snapshot){
      console.log(snapshot.val());
    });
    
  }]);
