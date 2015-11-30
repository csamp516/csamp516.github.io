/* Google Authorization
 *
 * @author  Chris Samperisi
 * @date    11/19/2015
 * @purpose Connect to the Google API
 */
function checkAuth() {
	gapi.auth.authorize({
		'client_id': CLIENT_ID,
		'scope': SCOPES.join(' '),
		'immediate': true
	}, handleAuthResult);
	
}

var CLIENT_ID = '296317412784-2geap51q3rdn2d2n20tsc04qo9jnjs4c.apps.googleusercontent.com';
var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];


var pfx = ["webkit", "moz", "ms", "o", ""];
function RunPrefixMethod(obj, method) {
	
	var p = 0, m, t;
	while (p < pfx.length && !obj[m]) {
		m = method;
		if (pfx[p] == "") {
			m = m.substr(0,1).toLowerCase() + m.substr(1);
		}
		m = pfx[p] + m;
		t = typeof obj[m];
		if (t != "undefined") {
			pfx = [pfx[p]];
			return (t == "function" ? obj[m]() : obj[m]);
		}
		p++;
	}

}
function requestFullScreen() {
	if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
		RunPrefixMethod(document, "CancelFullScreen");
	}
	else {
		RunPrefixMethod(document.getElementById('fullscreen-area'), "RequestFullScreen");
	}
	$(window).trigger('resize');
}
var calendars;
$(function() {
	$('.loading-indicator').show();
	
	$('.clock').FlipClock({
		clockFace: 'TwelveHourClock'
	});
	
	calendars = {
		"West" : {
			"Pitch":"3drobotics.com_3238373533303331393132@resource.calendar.google.com",
			"Roll":"3drobotics.com_39303332353534322d313736@resource.calendar.google.com"
		},
		"North East" : {
			'Vector': '3drobotics.com_2d3539313539363532333632@resource.calendar.google.com',
			'Over': '3drobotics.com_2d3139313635373038363537@resource.calendar.google.com',
			'Roger': '3drobotics.com_2d3830313535373233323434@resource.calendar.google.com',
			'Cygnus': '3drobotics.com_39333539363633332d353237@resource.calendar.google.com',
			
		},
		"South East": {
			'Fly': '3drobotics.com_3231393733333739373530@resource.calendar.google.com',
			"Loiter": "3drobotics.com_2d363437313531332d393937@resource.calendar.google.com",
			"Drift": "3drobotics.com_3238393535333839383832@resource.calendar.google.com",
			"Sport": "3drobotics.com_3636303334363836393739@resource.calendar.google.com",
			"Acro": "3drobotics.com_2d3530393130323832353234@resource.calendar.google.com"
		}
	};
	for(i in calendars) {
		$('.area').append($('<option>').text(i));
	}
	$('.area').change(loadCalendarApi);
	$('.fullscreen').click(requestFullScreen);
	setTimeout(loadCalendarApi, 1000*10);
});


function handleAuthResult(authResult) {
	var authorizeDiv = $('#authorize-div');
	if (authResult && !authResult.error) {
		// Hide auth UI, then load client library.
		authorizeDiv.hide();
		loadCalendarApi();
	} else {
		// Show auth UI, allowing the user to initiate authorization by
		// clicking authorize button.
		$('.loading-indicator').hide();
		authorizeDiv.show();
	}
}
function handleAuthClick(event) {
	$('.loading-indicator').show();
	gapi.auth.authorize({
		client_id: CLIENT_ID,
		scope: SCOPES,
		immediate: false
	}, handleAuthResult);
	return false;
}

function loadCalendarApi() {
	$('#calendars').empty();
	$('.loading-indicator').show();
	gapi.client.load('calendar', 'v3', listUpcomingEvents);
}
function listUpcomingEvents() {
	n_calendars=0;
	var area =  $('.area').val();
	for(j in calendars[area]) {
		n_calendars++;
		
	}
	var batch = gapi.client.newBatch();
	for(j in calendars[area]) {
		var room = j;
		
		request = gapi.client.calendar.events.list({
			'calendarId':calendars[area][j],
			'timeMin': (new Date()).toISOString(),
			'showDeleted': false,
			'singleEvents': true,
			'maxResults': 10,
			'orderBy': 'startTime',
			'room': j
		});
		batch.add(request);
		
	}

	batch.then(function(resp) {
		var height = $('#calendars').height();
		console.log(height);
		for(j in resp.result) {
			
			var calendar = $('<div class="calendar">');
			$('#calendars').append(calendar);
		
			console.log(resp);
			var result = resp['result'][j]['result'];
			var events = result.items;
			var appointments = [];
		
			for (i = 0; i < events.length; i++) {
				var event = events[i];
				var when = event.start.dateTime;
				if (!when) {
					when = event.start.date;
				}
				appointments.push({
					id: event.id,
					title:event.summary,
					start: event.start.dateTime || event.start.date, // try timed. will fall back to all-day
					end: event.end.dateTime || event.end.date, // same
					//url: url,
					location: event.location,
					description: event.description
				});
			}
			calendar.fullCalendar({
				defaultView:'agendaDay',
				events: appointments,
				minTime: "09:00:00",
				maxTime: "18:00:00",
				weekends: false,
				header: false,
				contentHeight: height,
				eventColor: '#74B800',
				slotLabelFormat: 'h(:mm) A',
				allDayText: 'ALL DAY'
			
			});
			
			calendar.find('.fc-day-header').text(result.summary.replace("[BK] ", ""));
	
			calendar.css({
				'width':(100/n_calendars)+'%',
				'display':'inline-block'	
			});
			calendar.fullCalendar('render');
		}
		$('.loading-indicator').hide();
	});
}