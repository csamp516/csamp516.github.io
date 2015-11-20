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
		RunPrefixMethod(document.getElementById('calendars'), "RequestFullScreen");
	}
}

$(function() {
	$('.loading-indicator').show();
	$('.fullscreen').click(requestFullScreen);
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
	gapi.client.load('calendar', 'v3', listUpcomingEvents);
}
function listUpcomingEvents() {
	
	calendars = {
		'Vector': '3drobotics.com_2d3539313539363532333632@resource.calendar.google.com',
		'Over': '3drobotics.com_2d3139313635373038363537@resource.calendar.google.com',
		'Roger': '3drobotics.com_2d3830313535373233323434@resource.calendar.google.com',
		
		'Fly': '3drobotics.com_3231393733333739373530@resource.calendar.google.com',
		'Cygnus': '3drobotics.com_39333539363633332d353237@resource.calendar.google.com',
		
	};
	n_calendars=0;
	for(j in calendars) {
		n_calendars++;
	}
	for(j in calendars) {
		var room = j;
		var request = gapi.client.calendar.events.list({
			'calendarId':calendars[j],
			'timeMin': (new Date()).toISOString(),
			'showDeleted': false,
			'singleEvents': true,
			'maxResults': 10,
			'orderBy': 'startTime'
		});

		request.execute(function(resp) {
			//console.log(resp);
			var calendar = $('<div id="'+resp.etag+'" class="calendar">');
			$('#calendars').append(calendar);
			
			var events = resp.items;
			//appendPre(resp['summary']+' -- Upcoming events:');
			var appointments = [];
			if (events.length > 0) {
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
					//appendPre(event.summary + ' (' + when + ')')
				}
				calendar.fullCalendar({
					defaultView:'agendaDay',
					events: appointments,
					businessHours:true,
					weekends: false,
					header: false
					
				});
				calendar.find('.fc-day-header').text(resp.summary);
			
				calendar.css({
					'width':(100/n_calendars)+'%',
					'display':'inline-block'	
				});
				calendar.fullCalendar('render');
				//calendar.fullCalendar('today');
			} else {
				//appendPre('No upcoming events found for '+resp['summary']+'.');
			}
			
			$('.loading-indicator').hide();
		});
	}
}
