var visits = [];																					//visits holds general history objects info
var urls = [];																						//urls holds the urls for history objects
var titles = [];																					//titles holds the titles for history objects
var obj = {};																						//Helps to ensure no duplicate data
var timerId = null;																					//Global Timer Variable
var ParticipantID;																					//Global Variable for ParticipantID

function twoDigits(d) {																				//Helper Function for Formatting Date for mySQL
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

function toMysqlFormat(date) {																		//Helper Function that returns mySQL Date
    return date.getUTCFullYear() + "-" + twoDigits(1 + date.getUTCMonth())
								 + "-" + twoDigits(date.getUTCDate()) 
								 + " " + twoDigits(date.getUTCHours()) 
								 + ":" + twoDigits(date.getUTCMinutes())
								 + ":" + twoDigits(date.getUTCSeconds());
};

function update() {																					//Update function runs when timer terminates
	ParticipantID = JSON.parse(localStorage.getItem('ParticipantID'));								//Grab ParticipantID from LocalStorage
	genURLData();																					//Call for sending URL data to Web Service
	var hold = new Date();																			//Grab time after previous execution
	hold = toMysqlFormat(hold);																		//Format time for mySQL
	localStorage.setItem("syncValue", JSON.stringify(hold));										//Store time in LocalStorage
}

function startRequest() {																			//Helper function for repeating timer
  update();																							//Call to update function
  timerId = window.setTimeout(startRequest, 150000);												//Set timer for 2.5 minutes
}

function stopRequest() {																			//Helper function for stopping timer
  window.clearTimeout(timerId);																		//Clear Global Timer Variable
  timerId = null;																					//Reset to null
}

function start(){																					//Helper function for login_success
	if(timerId == null) {startRequest();}															//If timer isnt already going, start it.
}

function stop(){																					//Helper function for login_success
	stopRequest();																					//Call to helper function
}

function sendCurrentUrl(userid, url, title, time, urlid, urlvid, urlrid, trans) {					//Helper function for sending URL data
	var xhr = new XMLHttpRequest();																	//Generate new request
	xhr.open("POST", 																				//Declare type
		'http://Sample-env.zssmubuwik.us-west-1.elasticbeanstalk.com/post_chrome.php', true);		//Declare destination URL
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");						//Send proper header info along w/ request
	xhr.send(																						//Start the data transfer
		'UserID=' + encodeURIComponent(userid) + 													//Tag ParticipantID
		'&URL=' + encodeURIComponent(url) +															//Tag URL
		'&Title=' + encodeURIComponent(title) +														//Tag Title
		'&Timestamp=' + encodeURIComponent(time) +													//Tag Timestamp
		'&URLID=' + encodeURIComponent(urlid) +														//Tag URL ID#
		'&URLVID=' + encodeURIComponent(urlvid) +													//Tag URL Visit ID#
		'&URLRID=' + encodeURIComponent(urlrid) +													//Tag URL Referring Visit ID#
		'&Transition=' + encodeURIComponent(trans)); 												//Tag Transition & End Transfer
}

function genURLData() {																				//Helper Function to get Chrome Browser History
	var microseconds = 150000;																		//Microseconds in 2.5 minutes									
	var hold0 = new Date();																			//Current time
 	var oneWeekAgo = hold0 - microseconds;															//2.5 minutes from Current time
	var numRequestsOutstanding = 0;																	//Track callbacks, when zero we have all results.

	chrome.history.search({																			//Access Chrome Browser History
		'text': '',              																	//Return every history item....
		'startTime': oneWeekAgo  																	//that was accessed less than 2.5 minutes ago.
	},
	function(historyItems) {																		//Callback function needed with Chrome
		for (var i = 0; i < historyItems.length; ++i) {												//For each history item, get details on visits.
			var url = historyItems[i].url;															//Grab URL data
			var title = historyItems[i].title;														//Grab Title data
			var processVisitsWithUrl = function(url, title) {										//We need the url to process the visit.
					return function(visitItems) {processVisits(url, title, visitItems);};			//Use a closure to bind url into callback's args.
			};
			chrome.history.getVisits({url: url}, processVisitsWithUrl(url, title));					//For each History Item grab its Visit Items
			numRequestsOutstanding++;																//Increment Outstanding Requests
		}
		if (!numRequestsOutstanding) {																//Check Outstanding Requests
			onAllVisitsProcessed();																	//Call to Helper Function when finished
		}
	});

	var processVisits = function(url, title, visitItems) {											//Callback for chrome.history.getVisits()
		for (var i = 0, ie = visitItems.length; i < ie; ++i) {										//Iterate through visitItems
			urls.push(url);																			//Grab URL data
			titles.push(title);																		//Grab Title data
			visits.push(visitItems[i]);																//Grab VisitItem data
		}

		if (!--numRequestsOutstanding) {															//Check if this is final outstanding call
			onAllVisitsProcessed();																	//Call to Helper Function
		}
	};

	var onAllVisitsProcessed = function() {															//Called when the final list of URLs is done.
		for (var i = 0, ie = visits.length; i < ie; ++i) {											//Looks to go through all returned items												
			var form = {																			//Save all the data is one form
				partid: ParticipantID, 																//Save ParticipantID
				url: urls[i], 																		//Save URL
				title: titles[i], 																	//Save Title
				time: visits[i].visitTime, 															//Save Time
				id: visits[i].id,																	//Save URLID
				vid: visits[i].visitId, 															//Save visitID
				rid: visits[i].referringVisitId,													//Save referring visitID
				tran: visits[i].transition															//Save transition
			};		
			if (!obj[form.time]) {																	//Check object for unique key(timestamp)
				obj[form.time] = form;																//Save to object as key it not there								
				var d = new Date(form.time);														//Grab time
				var send = toMysqlFormat(d);														//Format time
				sendCurrentUrl( form.partid, form.url, form.title, 									//Send Data
								send, form.id, form.vid, form.rid, 
								form.tran);
			}		
		}
    };
}
