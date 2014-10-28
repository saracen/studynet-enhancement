StudyNetEnhancement.ThreadComments = function() {
	// Store posts ready for the rearrangement
	var posts = {};

	// Add our threaded comments stylesheet
	$('head').append($('<link rel="stylesheet" href="https://saracen.github.io/studynet-enhancement/threaded-comments.css" type="text/css">'));


	// Find each comment
	$('.discussread').each(function() {
		// Replace br tags in the small column with spaces to prevent new lines, but with spaces between elements
		$(this).find('.smallcol br').replaceWith(' ');

		// Find post's id and parent id if available
		var number = $(this).find('.postnumber').text();
		var parent = $(this).find('.description').text().match(/\#(\d+)/);
		if (parent instanceof Array) {
		  parent = parent[0];
		}

		// Insert child posts into parent's container
		posts[number] = $(this);
		if (parent in posts) {
			var container = posts[parent].find('.child-posts:first-child');
			if (container.length == 0) {
				container = $('<div class="child-posts">');
				posts[parent].append(container);
			}
			container.append(posts[number].detach());
		}
	});
};

StudyNetEnhancement.ThreadCommentsLinks = function(parent) {
	var enhanceUrl = function(value) {
		if (!value.match(/LinearThread/) && !value.match(/\/Class+Discussion\//)) {
			return value;
		}

		value = value.replace('\/Class+Discussion\/', '\/LinearThread?OpenAgent&thread=');
		value = value.replace('\?OpenDocument', '');
		return value + '&dp=9999&studynet_enhanced=true';
	};

	parent
		.find('td[onclick]')
		.attr('onclick', function(index, value) {
			return enhanceUrl(value.substr(0, value.length - 3)) + '\');';
		})

	parent
		.find('a')
		.attr('href', function(index, value) {
			return enhanceUrl(value);
		});
};


var forum = $('#forumtable, #courseactivity');

// Place a button to disable/enabled threaded comments.
// If enabled, call ThreadedCommentsLinks to rewrite discussion URLs
if (forum.length > 0) {
	var toggle = function() {
		if (localStorage.getItem('enhanced-threaded-comments') === 'enabled') {
			localStorage.removeItem('enhanced-threaded-comments');
		} else {
			localStorage.setItem('enhanced-threaded-comments', 'enabled');
		}
		window.location.reload();
	};

	var button = $('<button style="margin-left: 10px">')
		.click(toggle)
		.text('Enable enhanced threading');
	
	if (localStorage.getItem('enhanced-threaded-comments') === 'enabled') {
		button.text('Disable enhanced threading');
		$('p.right').has('strong.grey').empty().append(button);

		StudyNetEnhancement.ThreadCommentsLinks(forum);
	} else {
		$('p.right').has('strong.grey').append(button);
	}
}

// If we're viewing a discussion with a rewritten URL then perform comment threading
if ($(location).attr('href').match('studynet_enhanced=true')) {
	StudyNetEnhancement.ThreadComments();
}