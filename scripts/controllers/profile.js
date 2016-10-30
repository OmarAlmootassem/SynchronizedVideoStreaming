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
        console.log($scope.allUsers);
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
          console.log(friend);
          console.log($scope.fbUser);
          var friendUid = friend.uid;
          var fbData = {};
          fbData[friendUid] = 1;
          firebase.database().ref('users/' + $scope.fbUser.uid + '/friends').update(fbData);
          $mdDialog.cancel();
        }
    }
  }]);
