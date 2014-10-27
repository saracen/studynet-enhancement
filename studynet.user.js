// ==UserScript==
// @name        StudyNet Enhancement
// @version     0.1
// @description StudyNet Enhancement userscripts
// @match       http://www.studynet2.herts.ac.uk/*
// @auther      Arran Walker (github@fiveturns.org)
// @updateURL   https://saracen.github.io/studynet-enhancement/studynet.user.js
// ==/UserScript==

function bootstrap() {
	var script = document.createElement('script');

	script.textContent = "\
		var StudyNetEnhancement = {}; \
		StudyNetEnhancement.script = function(url, options) { \
			return jQuery.ajax($.extend(options || {}, { \
				dataType: 'script', \
				cache: true, \
				url: url \
			})); \
		}; \
		StudyNetEnhancement.script('https://saracen.github.io/studynet-enhancement/bootstrap.js');"

	document.body.appendChild(script);
}

if (typeof jQuery == 'undefined') {
	var js = document.createElement('script');
	js.src = 'https://code.jquery.com/jquery-latest.min.js';
	js.addEventListener('load', bootstrap);
	document.getElementsByTagName("head")[0].appendChild(js);
} else {
	bootstrap();
}
