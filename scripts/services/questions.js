'use strict';

app.factory('Question', function(FURL, $firebase, Auth) {
	var ref = new Firebase(FURL);
	var questions = $firebase(ref.child('questions')).$asArray();
	//console.log(questions);
	var user = Auth.user;

	var Question = {
		all: questions,

		getQuestion: function(questionId) {
			return $firebase(ref.child('questions').child(questionId));
		}
	};

	return Question;

});