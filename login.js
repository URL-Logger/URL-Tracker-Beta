function isNumber (o) {																	//Function to check if string is just number
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;						//Check checks if string is just number
}

$(function (){
	if (localStorage.getItem('checkValue')) {											//Check for Sync and Page Consistency
		location.href = 'login_success.html';											//If Consisent, Transition to next page
		chrome.browserAction.setPopup({popup: "login_success.html"});					//Make the transition persistent
	}
    var $username = $('#username');														//Collect Username using JSON
    var $password = $('#password');														//Collect Password using JSON
	
    $('#login').on('click', function() {												//When login button is pushed
        var login_info = "user=" + $username.val() + "&" + "pass=" + $password.val();	//Format login data for sending
        $.post(																			//POST - Send login data to server-side script for processing
			'http://Sample-env.zssmubuwik.us-west-1.elasticbeanstalk.com/login.php',	//Web Interface URL of login script
			login_info, 																//Send the Login Data
			function (message) {														//Callback Success Function
				if (isNumber(message)) {												//Check to make sure Error not sent back
					localStorage.setItem("ParticipantID", JSON.stringify(message));		//Save ParticipantID
					chrome.browserAction.setIcon({path: "Branding/On-Icon.png"});		//Set Tracking Icon
					localStorage.setItem('checkValue', 'false');						//Set Tracking to On
					location.href = 'login_success.html';								//Transition to next page
					chrome.browserAction.setPopup({popup: "login_success.html"});		//Make the transition persistent
				}	
			});
    });
});