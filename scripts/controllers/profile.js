'use strict';

app.controller('ProfileController', function($scope, $location, FURL, $firebase, Question, Auth, toaster){

var ref = new Firebase(FURL);

$scope.currentUser = Auth.user;

$(".pseudonymContainer input").focus();

$scope.hats = ['images/thinking_cap_cropped.png','images/hat5.png','images/hat6.png','images/hat9.png','images/hat10.png','images/hat11.png','images/hat12.png','images/hat13.png','images/hat14.png'];

var t = '';

setTimeout(function(){
	
	$scope.hatSelectedIndex = hat_index();
	t = hat_index();

	},2000)

function hat_index(){
	var hatSelectedIndex = 0;
	return hatSelectedIndex;
}

//set default hat selection to thinking_cap_cropped.png
$scope.selected_hat = 'thinking_cap_cropped.png';

$scope.select_hat = function(hat, $index, t){
	$scope.hatSelectedIndex = $index;
	$scope.selected_hat = hat;
	$scope.profileEdited = true;
}

$scope.profileEdited = false;
$scope.profileChangesMade = function(){
	$scope.profileEdited = true;
}

$scope.saveProfile = function(){
	$scope.profileEdited = false;
	//save hat selection
	var selected_hat = $(".hatPicsContainer .active").attr("src");
	
	//save pseudonym name
	var pseudo_name = $(".profileContainer .pseudo_input").val();

	//save email
	var email = $(".profileContainer .email_input").val();


	setProfileSettings($scope.currentUser.uid, selected_hat, pseudo_name, email).then(function(){
		toaster.pop('success', "Profile saved successfully!");
	});

	
}


function setProfileSettings(uid, hat, pseudo_name, email){
	var h =  $firebase(ref.child('profile').child(uid));
	return h.$update({hat_icon:hat, pseudo:pseudo_name, email:email});
}


// $scope.logout = function(){
// 		Auth.logout();
// 		toaster.pop('success', "Logged out successfully");
// 		$location.path('/')
// 	}


});
	