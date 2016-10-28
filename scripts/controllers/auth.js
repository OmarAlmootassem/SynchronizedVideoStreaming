angular.module('starter').controller('authCtrl', ['$scope', '$timeout', '$state', '$mdToast', function($scope, $timeout, $state, $mdToast) {

  $scope.showSignIn = false;

    $scope.signUp = function(user){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(function(fbUser){
        firebase.database().ref('users/' + fbUser.uid).update({
          name: user.name,
          username: user.username,
          status: 'online'
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
