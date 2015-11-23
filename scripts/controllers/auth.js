'use strict';

app.controller('AuthController', function($scope, $rootScope, $location, Auth, toaster){
	

	// console.log("get auth data here?", Auth);

	if( Auth.signedIn() ){
		$location.path('/home');
	}


	$scope.register = function(user){
		Auth.register(user).then(function(){
			toaster.pop('success', "Registered succesfully");
			$location.path('/home');
			}, function(err){
				toaster.pop('error', "Oops, something went wrong");
			});
		};

	$scope.login = function(user){
		Auth.login(user).then(function(){
			toaster.pop('success', "Logged in succesfully");
			$location.path('/home');
			}, function(err){
				toaster.pop('error', "Oops, something went wrong");
			});
		};

	$scope.changePassword = function(user){
		Auth.changePassword(user).then(function(){
			
			//reset form
			$scope.user.email = '';
			$scope.user.oldPass = '';
			$scope.user.newPass = '';

			toaster.pop('success', "Password changed succesfully");
			}, function(err){
				toaster.pop('error', "Oops, something went wrong"); 
			});
		};

});
