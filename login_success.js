var backgroundpage = chrome.extension.getBackgroundPage();							//Global Variable for Background Page Location
var microP1S = 1000;																//Microseconds per second
var timerId, syncValue;																//Global Variables for Timer and Sync Time

$(function (){																		//Start JSON Function
	var $checkbox = $(":checkbox");													//Variable to hold checkbox location
	var checkboxValue = JSON.parse(localStorage.getItem('checkboxValue')) || {};	//Variable to hold checkbox value
	var checkValue = JSON.parse(localStorage.getItem('checkValue'));				//Variable to hold check value
	
	startRequest(microP1S);															//Start Sync Time Update Timer
	
	if (checkValue) {																//Check for page reload
			$('#Tracking1').text(" OFF");											//Reset Text
			$('#Tracking1').css('color','red');										//Reset Color
			$checkbox.prop('checked', true);										//Reset Checkbox
	}
	if (!checkValue) {backgroundpage.start();}										//Start Background Script
	
	$.each(checkboxValue, function(key, value) {									//Go through Checkboxes
		$("#" + key).prop('checked', value);										//Reset Checkbox
		if (value) {																//If Reset
			$('#Tracking1').text(" OFF");											//Reset Text
			$('#Tracking1').css('color','red');										//Reset Color
			backgroundpage.stop();													//Stop Background Script
		}
	});
	
	$checkbox.on('change', function(){												//On Checkbox Change
		$checkbox.each(function(){													//Go through Checkboxes
			checkboxValue[this.id] = this.checked;									//Grab Checkbox Values
		});
		localStorage.setItem("checkboxValue", JSON.stringify(checkboxValue));		//Save Checkbox Values in LocalStorage
		if (this.checked == true) {													//If Checked Off
			chrome.browserAction.setIcon({path: "Branding/Off-Icon.png"});			//Reset Icon
			$('#Tracking1').text(" OFF");											//Reset Text
			$('#Tracking1').css('color','red');										//Reset Color
			localStorage.setItem('checkValue', 'true');								//Reset Check Value
			backgroundpage.stop();													//Stop Background Script
		}
		else {																		//Else Checked On
			chrome.browserAction.setIcon({path: "Branding/On-Icon.png"});			//Reset Icon
			$('#Tracking1').text(" ON");											//Reset Text
			$('#Tracking1').css('color','green');									//Reset Color
			localStorage.setItem('checkValue', 'false');							//Reset Check Value
			backgroundpage.start();													//Start Background Script
		}
	});

    $('#Logout').click(function (){													//When Logout button is pressed do this
		localStorage.removeItem("checkboxValue");									//Remove Checkbox Value
		localStorage.removeItem("checkValue");										//Remove Check Value
		chrome.browserAction.setIcon({path: "Branding/Off-Icon.png"});				//Reset Icon
		logoutPage();																//Call Logout Helper
    });
});

function logoutPage(){																//Logout Helper Function
    location.href = 'login.html';													//Transition to next page
    chrome.browserAction.setPopup({popup: "login.html"});							//Make the transition persistent
}

function update() {																	//Update Function for Timer
	$(function (){																	//JSON Wrapper
		syncValue = JSON.parse(localStorage.getItem('syncValue'));					//Grab Sync Time from LocalStorage
		if (syncValue) {															//If there
			$('#Sync1').text(syncValue+" UTC");										//Update on HTML page
		}
	});
}

function startRequest(time) {														//Start Helper for Timer
	update();																		//Call to Update function
	timerId = window.setTimeout(startRequest, time);								//Set actual timer in global variable
}
