var embed_videos=false;

(function () {
	function init() {
		$(function() {
		
			var iframe_width = '220px',
				iframe_height = '';
			function convertYouTubeUrl(url) {
			
				var regEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
				var match = url.match(regEx);
				
				if(match && match[2].length == 11) {
					return "<iframe src='https://www.youtube.com/embed/"+match[2]+"' frameborder='0' allowfullscreen width='"+iframe_width+"' height='"+iframe_height+"'></iframe>";
				} else {
					return false;
				}
		
			}
			function convertGoogleUrl(url) {
				var regEx = /^.*(drive.google\/|\/d\/|\?id=)([^\/#\&\?]*).*/;
				var match = url.match(regEx);
				if(match && match[2].length == 28) {
					return "<iframe src='https://drive.google.com/a/3drobotics.com/file/d/"+match[2]+"/preview' frameborder='0' allowfullscreen  width='"+iframe_width+"' height='"+iframe_height+"'></iframe>";
				} else {
					return false;
				}
			}
			// select the target node
			var target = document.querySelector('#chart1');

			// create an observer instance
			var observer = new MutationObserver(function(mutations) {
			  mutations.forEach(function(mutation) {
				console.log(mutation.type);
				embed_videos()
			  });    
			});

			// configuration of the observer:
			var config = { attributes: true, childList: true, characterData: true };

			// pass in the target node, as well as the observer options
			observer.observe(target, config);

			
			embed_videos = function() {
				$('.video_embed').each(function () {
					var iframe = false;
					var href=$(this).data('url');
					if(iframe = convertYouTubeUrl(href)) {
		
						$(this).html(iframe);
					} else if(iframe=convertGoogleUrl(href)) {
						$(this).html(iframe);
					} else {
			
						if(href="") {
							$(this).addClass("placeholder").html("No Video Provided");
						} else {					
							$(this).addClass("placeholder").html("Video Not Found");
						}
					};
				});
			};
			embed_videos();
		});
		
		
	}
	// Load jquery
	var script = document.createElement("script");
	script.src = 'https://code.jquery.com/jquery-1.11.3.min.js';
	script.type = 'text/javascript';
	
	document.body.appendChild(script);
// safe loading
	script.onload = function () {
		init()
	};
	

})();