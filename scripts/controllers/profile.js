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
