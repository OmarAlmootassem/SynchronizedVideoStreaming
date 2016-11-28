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
      console.log("monitoring Invites");
      var sessionsRef = firebase.database().ref('sessions').orderByChild('invitee').equalTo($rootScope.fbUser.uid);
      sessionsRef.on('value', function(snapshot){
        $scope.invites.length = 0;
        $scope.inviteIds.length = 0;
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
              console.log($scope.inviteIds[0]);
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
        console.log(id);

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
