jsPsych.plugins["scosn-interface"] = (function() {

    var plugin = {};

    plugin.info = {
		name: 'SCoSN-interface',
		description: 'Single page loader for SCoSN experiment',
		parameters: {
			user: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'User',
				default: undefined,
				description: 'The user "profile" to load for the page'
			},
			network: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Network',
				default: undefined,
				description: 'The network that the user is engaging with.'
			},
			targetnum: {
				type: jsPsych.plugins.parameterType.INT,
				default: undefined,
				description: 'The target that the user is searching for.'
			}
		}
    }

    plugin.trial = function(display_element, trial) {

		/*---------------------
		   CONTENT VARIABLES
		   -----------------------*/

		var headerdiv = {
			border: 'none',
			height: 'auto',
			width: '100%'
		}

		var imagediv = {
			border: 'none',
			height: '600px',
			width: '75%'
		}

		var friendlistdiv = {
			border: 'none',
			height: imagediv.height,
			width: '20%'
		}

		var liked_image_opacity = "0.75";
		var minimum_visits_to_stop = 5;
		var minimum_likes_to_stop = 5;

		/*------------------------------------
		   GENERATE HEADER FOR CURRENT USER 
		   -------------------------------------*/

		if (trial.user==""){
			trial.user = starting_profile;
		}
		
		var new_html = "<center>\
<div class='w3-animate-opacity' id='currentUser' name='currentUser' style='border: "+headerdiv.border+"; height: "+headerdiv.height+";width: "+headerdiv.width+"; margin: 0em 0;'>";
		var datasofar = jsPsych.data.get().values();
		var previous_user = datasofar[datasofar.length - 1];
		if (previous_user!=undefined && previous_user.user!=undefined){
			var previous_username = previous_user.user.substring( 0, previous_user.user.match(/_/) );
			var imagename = previous_user.user.substring( previous_user.user.match(/_/).index+1, previous_user.user.length ).toLowerCase();
			/* THE TWO FOLLOWING LINES ADD IN THE BACK BUTTON. MAKE SURE TO TURN ON FUNCTIONATILY FOR IT AT THE BOTTOM OF THIS CODE. 
			   new_html += "<p style='float: left;font-size:100%;opacity:0.4;'>\
			   <img src='animal-collection/png/"+imagename+".png' id='prevUser' style='width:auto;height:70px; cursor: pointer;'>";
			   new_html += "  "+previous_username+"</p>";*/
		}
		var username = trial.user.substring( 0, trial.user.match(/_/).index );
		var imagename = trial.user.substring( trial.user.match(/_/).index+1, trial.user.length ).toLowerCase();
		new_html += "<p style='font-size:200%;float: center;'><img src='animal-collection/png/"+imagename+".png' style='width:auto;height:100px;'>";
		new_html += "  "+username+"</p>";
		new_html += "</div></center>";
		new_html += "<hr style='display: block;height: 1px; border: 0; border-top: 3px solid #bec1c6; margin: 0em 0; padding: 0;'>";

		/*------------------------------------
		   GENERATE FLOATING DIV FOR TARGET
		   This may be removed in future updates pending testing. 
		   -------------------------------------*/

		new_html += "<div style= 'position: absolute; top: 100px; left: 150px; z-index: 10;'>";
		var target_username = target_profile[trial.targetnum].substring( 0, target_profile[trial.targetnum].match(/_/).index );
		new_html += "<p align='left' style='font-size:130%;'> Find this user: "+target_username+"</p></div>";
		
		/*------------------------------------
		   GENERATE USER IMAGE CONTENT
		   -------------------------------------*/

		new_html += "<div class='w3-container w3-center w3-animate-opacity'\
 id='imageContent' style='border: "+imagediv.border+"; height: "+imagediv.height+"; width: "+imagediv.width+"; float: left;overflow-y: scroll;display:inline-block;'>";

		//Getting images from folder
		var folder = "data/"+trial.network+"/"+trial.user+"/img/";
		var imp = imagemap[trial.user];

		for (i=0;i<imp.length;i++){
			val = imp[i];
			new_html += "<img src='"+ folder + val +"' style='width:25%;height:auto;margin: 20px 20px;border-bottom: 7px solid;border-radius: 8px;' id="+val+" name='imageContent'>";
		}

		// $.ajax({
		//     url : folder,
		//     success: function (data) {
		// 	$(data).find("a").attr("href", function (i, val) {
		// 	    if( val.match(/\.(jpe?g|png|gif)$/) ) {
		// 		new_html += "<img src='"+ folder + val +"' style='width:45%;height:auto;margin: 20px 20px;cursor: pointer;border-bottom: 7px solid;border-radius: 8px;' id="+val+" name='imageContent'>";
		// 	    } 
		// 	});
		//     },
		//     async: false
		// });
		new_html += "</div>";

		/*------------------------------------
		   GENERATE FRIENDLIST
		   -------------------------------------*/
		new_html += "<div\
 id='friendslist' name='friendslist' style='border: "+friendlistdiv.border+"; height: "+friendlistdiv.height+"; width: "+friendlistdiv.width+"; float: right; overflow-y: scroll;'>";
		new_html += "<p><h1>Friends</h1></p>";
		//Get list of friends from friendlists.js file
		var fl = friendlist[trial.user];
		
		//For every friend
		for (i=0;i<fl.length;i++){
			var fl_username = fl[i].substring( 0, fl[i].match(/_/).index);
			var imagename = fl[i].substring( fl[i].match(/_/).index+1, fl[i].length ).toLowerCase();
			new_html += "<p align='left' style='font-size:130%;' name='friendContent' id='"+fl[i]+"'>\
<img src='animal-collection/png/"+imagename+".png'>"; /* style='width:auto;height:75px;cursor:pointer;'>";*/
			/* new_html += "<svg width='70px' height='70px'>\
			   <rect id='"+fl[i]+"' name='friendContent' width='70px' height='70px' style='fill:rgb(0,"+(i-1)*50+",0)'>\
			   </svg>"; */
			new_html += "  <span style='cursor:pointer'>"+fl_username+"</span></p>";
			//new_html += "<br>";
		}
		new_html += "</div>";

		/*------------------------------------
		   GENERATE FINALIZER BUTTON
		   -------------------------------------*/

		new_html += "<br><br><br>";
		var button_text = '';
		var okay_to_proceed;
		
		/*-----------CODE FOR REQUIREMENT: MINIMUM NUM PROFILES VISITED-----------*/
		
		/* <-- Remove this to enable this section

		//Get the number of uniquely visited users
		var data = jsPsych.data.get().values();
		var num_uniquely_visited_profiles = [trial.user];
		for (i=1;i<data.length;i++){
			if (data[i]['user'] != undefined){
				num_uniquely_visited_profiles.push(data[i]['user']); 
			}
		}
		
		//Check if visited particular profiles
		var required_profiles_maximum = 15; //This cannot be greater than the length of the previous
		var required_profiles_visited = 0;
		for (i=1;i<required_profiles.length;i++){
			if (num_uniquely_visited_profiles.includes(required_profiles[i])){
				required_profiles_visited++;
			}
		}
		
		//Unique-ifying the list
		//num_uniquely_visited_profiles = num_uniquely_visited_profiles.filter(function(val, i, arr) {return arr.indexOf(val) === i;}).length;

		//CODE FOR GETTING NUMBER OF LIKED IMAGES, if needed
		// var data = jsPsych.data.get().values().map(a => a.liked_images).filter(function(n){ return n != undefined });
		// num_liked_images = data.flat().length;
		
		//if (num_uniquely_visited_profiles < minimum_visits_to_stop){ //<--Not sure what this is anymore
		//	button_text = num_uniquely_visited_profiles + " of " + minimum_visits_to_stop + " pages visited";

		//AT THIS POINT THE CODE CHECKS IF MIN NUM PROFILES VISITED
		if (required_profiles_visited < required_profiles_maximum){
			button_text = required_profiles_visited + " of " + required_profiles_maximum + " required pages visited";
			okay_to_proceed = false;
		} else {
			button_text = "Continue to survey!";
			okay_to_proceed = true;
		}

		/*-----------CODE FOR REQUIREMENT: TARGET FOUND-----------*/
		var userhistory = jsPsych.data.get().values().map( a => a.user); //Get list of users
		userhistory = userhistory.slice( userhistory.lastIndexOf(undefined));
		userhistory.push(trial.user);
		
		if (!userhistory.includes(target_profile[trial.targetnum])){
			button_text = "Keep searching!";
			okay_to_proceed = false;
		} else {
			okay_to_proceed = true;
			if (target_profile[trial.targetnum]==target_profile[target_profile.length-1]){
				button_text = "Continue to survey!";
			} else {
				button_text = "Next search";
			}
		}
		

		//HTML for creating the button itself
		new_html += "<button type='button' id='finalButton' style=' background-color: #9b9b9b;\
					 border: none;\
					 color: white;\
					 padding: 12px 28px;\
					 text-align: center;\
					 text-decoration: none;\
					 display: inline-block;\
					 font-size: 21px;\
					 margin: 4px 2px;\
					 cursor: pointer;\
				 '>" + button_text + "</button>";

		/*---------------------
		   PLUGIN FUNCTIONS
		   -----------------------*/

		// function to end trial when it is time
		var end_trial = function() {

			//Store which ones were "liked"
			var liked_images = [];
			var images = document.getElementsByName("imageContent");
			for (i=0;i<images.length;i++){
				if (images[i].style.opacity==liked_image_opacity){
					liked_images.push(images[i].id)
				}
			}
			
			// gather the data to store for the trial
			var trial_data = {
				user: trial.user,
				liked_images: liked_images,
				next_person: next_person
			};

			// clear the display
			display_element.innerHTML = '';

			// move on to the next trial
			jsPsych.finishTrial(trial_data);
		};

		/*---------------------
		   START PROCESSES
		   -----------------------*/

		// draw page
		display_element.innerHTML = new_html;

		var next_person = null;

		//Set up the finalizer button
		var finalbutton = document.getElementById("finalButton");
		if (!okay_to_proceed) {
			finalbutton.disabled = true;
		} else {
			finalbutton.style.backgroundColor = "#e59244";
			finalbutton.addEventListener("click", function() {
				if (target_profile[trial.targetnum]==target_profile[target_profile.length-1]){
					if ( confirm("If you leave, you cannot return. Are you sure you'd like to leave the social network and go to the survey?") ){
						end_trial();
					}
				} else {
					end_trial();
				}
			}, false);
		}

		//Set up friendlist functionality
		var friends = document.getElementsByName("friendContent");
		for (i=0;i<friends.length;i++){
			friends[i].addEventListener("click", function(){
				next_person = this.id;
				end_trial();
			}, false);
		}

		//Set up next target functionality
		var number_of_target_profiles = target_profile.length;
		if (trial.targetnum < number_of_target_profiles - 1){
			next_person = "newtarget";
		}

		//Set up previous user functionality
		/*if (previous_user!=undefined && previous_user.user!=undefined){
	       var prev_user_img = document.getElementById("prevUser");
	       prev_user_img.addEventListener("click", function(){
		   next_person = previous_user.user;
		   end_trial();
	       }, false);
		   }*/

		//Set up image clicking behavior
		var images = document.getElementsByName("imageContent");
		// var prev_likes = jsPsych.data.get().values().filter(obj=>obj.user===trial.user);
		// if (prev_likes.length > 0){
		// 	prev_likes = prev_likes[prev_likes.length - 1].liked_images;
		// }
		// for (i=0;i<images.length;i++){
		// 	if (prev_likes.includes(images[i].id)){
		// 		images[i].style.opacity=liked_image_opacity;
		// 		images[i].style.borderBottomColor = "green";
		// 	}
		// 	images[i].addEventListener("click", function() {
		// 		if (this.style.opacity==""){
		// 			this.style.opacity = liked_image_opacity;
		// 			this.style.borderBottomColor = "green";
		// 		} else if (this.style.opacity==liked_image_opacity){
		// 			this.style.opacity = "";
		// 			this.style.borderBottomColor = "black";
		// 		}
		// 	}, false);
		// }
    };

    return plugin;
})();
