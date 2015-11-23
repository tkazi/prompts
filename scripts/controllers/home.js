
'use strict';

app.controller('HomeController', function($scope, $location, FURL, $firebase, Auth, Question, Prompt, toaster){

var ref = new Firebase(FURL);

$scope.currentUser = Auth.user;

$scope.signedIn = Auth.signedIn;


//set active on today's prompt nav option
$scope.navSelectedIndex = 0;
$scope.todayPromptOption = true;

var prompts;
var all;
var navSelected = '';

$scope.key = 0;
$scope.prompt = '';

var pd = get_date();
var prompt_date = pd[2] + '/' + pd[3] + '/' + pd[4];

var user_questions = [];
var saved = 0;
ref.on("value", function(snapshot) {
	all = snapshot.val();	

	prompts = all["prompts"];

	// initialize prompts object by creating a record
	if(!prompts){
		save_daily_prompt_question();
	}

	for (var i = 0; i < Object.keys(prompts).length; i++){
		var key = Object.keys(prompts)[i]
		var check_user = all["prompts"][key].user_id;
		var check_date = all["prompts"][key].prompt_start_date;
		var prompt = all["prompts"][key].prompt;

		// check to see if the current user already has a question for the day
		if ( ($scope.currentUser.uid == check_user) && (prompt_date == check_date) ){
			saved = 1;
			//console.log(a["prompts"][key].question_id);
			
			var questionId = all["prompts"][key].question_id;
			var question = Question.getQuestion(questionId).$asObject();
			$scope.question = question;
			$scope.key = key;
			$scope.prompt = prompt;
			
			//console.log("old_time_key ", $scope.key);
		} 
		else{
			$scope.no_question = '';
		}

	}// ends the for loop
	var user_completed_questions = [];
	if (!$scope.question){
		//console.log(prompts);
		for (var j = 0; j < Object.keys(prompts).length; j++){
			var key = Object.keys(prompts)[j]
			var check_user = prompts[key].user_id;
			//console.log(check_user, $scope.currentUser.uid);
			if(check_user == $scope.currentUser.uid){
				user_completed_questions.push(prompts[key].question_id);
				//console.log(check_user, user_completed_questions, prompts[key].prompt_start_date);
			}
		}
		//console.log(user_completed_questions);
		save_daily_prompt_question(user_completed_questions);
	}
	
}, function (errorObject) {
	  console.log("The read failed: " + errorObject.code);
}); // ends ref.on


// generate a random question for the day
function save_daily_prompt_question(user_completed_questions){
	$scope.all_questions = Question.all;
	$scope.all_questions.$loaded().then(function(data){

		var pd = get_date();
		var prompt_start_date = pd[2] + '/' + pd[3] + '/' + pd[4];
		var prompt_end_date = pd[2] + '/' + (pd[3] + 1) + '/' + pd[4];

		var all_questions = [];
		for (var g = 0; g < data.length; g++){
			all_questions.push(data[g].$id);
			//console.log(data[g].$id);
		}
		
		var index;
		for (var i=0; i<user_completed_questions.length; i++) {
		    index = all_questions.indexOf(user_completed_questions[i]);
		    if (index > -1) {
		        all_questions.splice(index, 1);
		    }
		}

		//console.log(all_questions);

		var questions_l = all_questions.length;
		var questionId_index = Math.floor(Math.random()*questions_l);
		var questionId = all_questions[questionId_index];
		var question = Question.getQuestion(questionId).$asObject();
		$scope.question = question;
		var question_id = question.$id;


		//console.log(questionId, question_id, $.inArray(question_id, user_completed_questions));
		dailyUserPrompt(prompt_start_date, prompt_end_date, $scope.currentUser.uid, question_id)
			.then(function(){
				toaster.pop('success', "Prompt saved successfully!");
			});
	});	
}


// save a random question for a user to firebase			
function dailyUserPrompt(prompt_start_date, prompt_end_date, uid, question_id){
	var userPromptRef = $firebase(ref.child('prompts'));
    var prompt = '';
    return userPromptRef.$push({prompt_start_date: prompt_start_date, prompt_end_date:prompt_end_date, user_id: uid, question_id: question_id, prompt:prompt})
    .then(function(data){
    	//console.log(data);
    	//console.log(Object.keys(data));
    	//console.log(data["path"]["u"][1]);
    	$scope.key = data["path"]["u"][1];
    	//console.log("first_time_key ", $scope.key);
    });
}


$scope.logout = function(){
		Auth.logout();
		// toaster.pop('success', "Logged out successfully");
		$location.path('/#')
	}

$scope.navOptions = ["Today's Prompt","My Prompts","Public Prompts"];
$scope.showOptions = function(option, $index) {
	
	reset();

	// $scope.navOptionSelected = option;
	$scope.navSelectedIndex = $index;

	// option selected = completed prompts
	if ($index == 1){
		navSelected = 'completed';
		$scope.todayPromptOption = false;
		$scope.completedPromptOption = true;
		$scope.publicPromptOption = false;
		
		get_completed_prompt_questions(prompts, $scope.currentUser.uid);
	}
	else if ($index == 2){
		//$scope.completed_prompt_selected = false;
		$scope.todayPromptOption = false;
		$scope.completedPromptOption = false;
		$scope.publicPromptOption = true;

		generate_random_public_prompts(all, prompts, $scope.currentUser.uid);
	}
	else{
		$scope.todayPromptOption = true;
		$scope.completedPromptOption = false;
		$scope.publicPromptOption = false;
	}
}




// get word count on keyup 
$scope.getWordCount = function(){
	get_word_count();
}

function get_word_count(){
	var area = document.getElementById('today_textarea')
	Countable.live(area, function (counter) {
	  $scope.word_count = counter.characters;
	});
}

var d = get_date();
$scope.day = d[0];
//console.log($scope.day, d[0]);
$scope.month = d[1];
$scope.date = d[3];
$scope.year = d[4];

// check if there is something saved for prompt or if this is firs time
$("#today_textarea").focus();

// every 5 seconds save user's prompt to the database
var save_on = 1;
$scope.saveUserPrompt = function(){
		if (save_on == 1){
			setTimeout(function(){
				if( $("#today_textarea").is(':focus') ) {
					
					var pr = get_prompt();
					var prompt = pr.replace(/\r?\n/g, '\n');
					//console.log(prompt);

					var d = get_date();
					var hour = d[5];
					var min = d[6];
					var secs = d[7];
					//console.log(hour, min, secs);
						if (hour >= 12) {
							    if (hour == 12){
							    	hour = 12;
							    }else{
							    	hour -= 12;
							    }
							    var period = "pm";
							} else if (hour === 0) {
							   hour = 12;
							   var period = "am";
							}

				//console.log($scope.key);
				savePrompt($scope.key, prompt);

				$scope.save_time = hour + ":" + min + ":" + secs + " " + period;
				//console.log($scope.save_time);
				save_on = 1;
				}
			}, 2500);	
		}
	save_on = 0;
}



function get_prompt(){
	var prompt = $("#today_textarea").val();
	return prompt;
}

function savePrompt(prompt_id, prompt){
	var p =  $firebase(ref.child('prompts').child(prompt_id));
	//console.log(p);
	//console.log(prompt);
	return p.$update({prompt:prompt});
}

function get_date(){
	// current date functions
	var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
	var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

	var d = new Date();
	var day = dayNames[d.getDay()];
	//console.log(d.getDay());
	var month = monthNames[d.getMonth()];
	var month_n = d.getMonth();
	var date = d.getDate();
	var year = d.getFullYear();
	var hour = d.getHours();
	var min = d.getMinutes();
	var secs = d.getSeconds();

	return [day, month, month_n + 1, date, year, hour, min, secs];
}


// reset function 
function reset(){
	$scope.selectedIndex = -1;
	$scope.promptSelected = false;
	$scope.totalContainer = "";
	$scope.word_count = 0;
}




//completed prompts section
function get_completed_prompt_questions(prompts, currentUser){
	//console.log(Object.keys(prompts), currentUser);
	$scope.completed_questions = [];
	var completed_questions = [];
	for (var i = 0; i < Object.keys(prompts).length; i++){
		var key = Object.keys(prompts)[i]
		if(prompts[key].user_id == currentUser){
			var start_date = prompts[key].prompt_start_date;
			var end_date = prompts[key].prompt_end_date;
			if ( new Date(end_date) <= new Date(prompt_date) ) {
				//console.log(start_date, prompts[key].question_id, prompts[key].prompt);
				// var question = $firebase(ref.child('questions').child(prompts[key].question_id)).$asObject();
				// console.log(question);
				$scope.all_questions = Question.all;
				var completed_question = $scope.all_questions[prompts[key].question_id].$value;
				completed_questions.push({
					"prompt_date": start_date, 
					"prompt_question_id": prompts[key].question_id, 
					"prompt_question": completed_question,
					"prompt": prompts[key].prompt,
					"data_id": prompts[key].question_id
				});
			}
		}
		
	}
	
	$scope.completed_questions = completed_questions.sort(compare);

	function compare(a,b) {
	  if (a.prompt_date < b.prompt_date)
	    return 1;
	  if (a.prompt_date > b.prompt_date)
	    return -1;
	  return 0;
	}
}


$scope.get_completed_prompt_response = function(data_id, $index){
	$scope.selectedPromptIndex = $index;
	$scope.completed_prompt_selected = true;
	for (var i=0; i < $scope.completed_questions.length; i ++){
		if($scope.completed_questions[i]['data_id'] == data_id){
			$scope.completed_prompt = $scope.completed_questions[i]['prompt'];
			// setTimeout(function(){
			// 	var area = document.getElementById('completed_textarea')
			// 	Countable.once(area, function (counter) {
			// 	console.log(counter);
			// 	$scope.word_count = counter.characters;
			// });
			// },1500);
		}
	}
}


// function generate_random_hats(){
// 	var hats = ['images/thinking_cap_cropped.png','images/hat5.png','images/hat6.png','images/hat9.png','images/hat10.png','images/hat11.png','images/hat12.png','images/hat13.png','images/hat14.png'];
// 	for (var i=0; i < 500; i++){
// 		var r = Math.floor(Math.random()*hats.length);
// 		console.log(hats[r]);
// 		$(".publicPromptHolder").append("<img src='"+hats[r]+"'/>");	
// 	}
	
// }


$scope.generate_random_public_prompts = function() {
	$scope.public_questions = [];
	generate_random_public_prompts(all, prompts, $scope.currentUser.uid);
}

$scope.public_questions = [];
var public_questions = [];
function generate_random_public_prompts(all, prompts, currentUser){
	$scope.public_questions = [];
	var public_questions = [];
	//console.log(Object.keys(prompts).length);
	for (var i = 0; i < Object.keys(prompts).length; i++){
	var key = Object.keys(prompts)[i]
		if(prompts[key].user_id != currentUser){
			var start_date = prompts[key].prompt_start_date;
			var end_date = prompts[key].prompt_end_date;
			if ( new Date(end_date) <= new Date(prompt_date) ) {
				$scope.all_questions = Question.all;
				var public_question = $scope.all_questions[prompts[key].question_id].$value;
				var hat_icon = all['profile'][prompts[key].user_id]["hat_icon"];
				var pseudo_name = all['profile'][prompts[key].user_id]["pseudo"];
				public_questions.push({
						"user_id": prompts[key].user_id,
						"prompt_date": start_date, 
						"prompt_question_id": prompts[key].question_id, 
						"prompt_question": public_question,
						"prompt": prompts[key].prompt,
						"data_id": prompts[key].question_id,
						"hat_icon":hat_icon,
						"pseudo_name": pseudo_name
				});
			}
		}
	}

	$scope.public_questions = [];
	var track_questions = [];
	for (var r =0; r < 3; r++){
		var random_index = Math.floor(Math.random()*public_questions.length);
		var random_prompt = public_questions[random_index];
		if ( r > 0 && $.inArray(random_prompt.prompt_question_id, track_questions) > -1 ) {
			console.log(r, "yo");
			r = r - 1;
		}
		else {
			track_questions.push(random_prompt.prompt_question_id);
			$scope.public_questions.push(random_prompt);
		}
		
	}
	console.log($scope.public_questions);

}

});













