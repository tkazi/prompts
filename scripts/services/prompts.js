'use strict';

app.factory('Prompt', function(FURL, $firebase, Auth) {
	
	var ref = new Firebase(FURL);
	
	var prompts = $firebase(ref.child('prompts')).$asArray();

	var user = Auth.user;

	var Prompt = {
		all: prompts,

		getPrompt: function(promptId) {
			return $firebase(ref.child('prompts').child(promptId));
		}
	};

	return Prompt;

});