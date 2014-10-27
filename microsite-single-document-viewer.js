StudyNetEnhancement.Converter = function() {
	var
		// Container to house our new content
		container = $('<main class="container"></main>'),

		// Navigation list
		navigation = $('<ul>'),

		// Resources aside
		resources = $('<aside class="resources">'),

		// Reference counter for assigning unique IDs
		refCounter = 0;

	function fetch(url) {
		return $.ajax({url: url, async: false}).responseText;
	};

	function rewrite(e, href) {
		var base = href.split('/').slice(0, -1).join('/') + '/';

		$('a', e).not('[href^="http"],[href^="https"],[href^="mailto:"],[href^="#"]').each(function() {
			$(this).attr('href', function(index, value) {
				return base + value;
			});
		});

		$('[src]', e).not('[src^="http"],[src^="https"],[src^="#"]').each(function() {
			$(this).attr('src', function(index, value) {
				return base + value;
			});
		});
	};

	function unit() {
		// Fetch unit
		var content = $(fetch($(this).attr('href'))).find('.rightFeature');

		// Rename unit's header text and id
		var header = content
			.find('.genericHead')
			.text($(this).text())
			.attr('id', 'id' + refCounter++);

		// Create sub navigation element for this unit
		var subnav = $('<ul>');

		// Add unit to navigation
		navigation.append($('<li>').append($('<a>').attr('href', '#' + header.attr('id')).text(header.text())).append(subnav));

		// Rewrite unit relative URLs to absolute
		rewrite(content, $(this).attr('href'));

		// remove "Study Unit *" button
		var buttons = content.find('.genericButton').remove();

		// Remove session list and attempt to get first session link
		var first = $(':header:contains(Sessions), :header:contains(Activities)', content)
			.nextAll('ul, ol')
			.first()
			.remove()
			.find('a');

		// If there was a session button, favour that over the list
		if (buttons.length) {
			first = buttons.first().find('a');
		}

		if (first.length > 0) {
			// Fetch first session, enabling us to find the others
			var sess = $(fetch(first.attr('href')));
			
			// Rewrite session relative URLs to absolute
			rewrite(sess, first.attr('href'));

			// Create an aside for resource links
			resources.append(
				$('<div class="resource">')
					.attr('id', 'resources_'+header.attr('id'))
					.append(sess.find('.rightFeature')));

			// Find all sessions in this unit
			sess.find('#row3row1 span, #row3row1 a').each(function() {
				if ($(this).is('span')) {
					session.call(first, content, subnav, $(this).text());
				} else {
					session.call(this, content, subnav, $(this).text());
				}
			});
		}

		// Add article with unit's content
		container.append(
			$('<article class="unit">')
				.attr('data-scroll-id', header.attr('id'))
				.append(content));
	}

	function session(content, subnav, title) {
		var session = fetch($(this).attr('href'));

		// Get the session's tab content
		var tab = $('#tabArea', $(session));

		// Rename session
		var header = $('<h1>')
			.text(title)
			.attr('id', 'id' + refCounter++);

		// Add session to unit's navigation list
		subnav.append($('<li>').append($('<a>').attr('href', '#' + header.attr('id')).text(header.text())));

		// Rewrite session relative URLs to absolute
		rewrite(tab, $(this).attr('href'));

		content.append(
			$('<article class="session">')
				.attr('data-scroll-id', header.attr('id'))
				.append(header)
				.append(tab));
	}

	// Remove stylesheets & scripts
	$('head').find('[type="text/css"]').remove();
	$('head').find('[type="text/javascript"]').remove();

	// Add our stylesheets
	$('head')
		.append($('<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans" type="text/css">'))
		.append($('<link rel="stylesheet" href="https://saracen.github.io/studynet-enhancement/microsite-single-document-viewer.css" type="text/css">'));

	// Rewrite document's urls so that they're absolute
	rewrite(document.body, window.location.href);

	// Fetch units
	$('.leftFeature ul li a').each(unit);

	// Make images more responsive
	container.find('img[width]').each(function() {
		$(this).css({ 'max-width': '100%' });
		$(this).removeAttr('width');
		$(this).removeAttr('height');
	});

	// Highlight current navigation elements
	$(window).bind('scroll', function(e) {
		var position = {top: $(this).scrollTop(), left: $(this).scrollLeft()};

		$('#sidebar nav ul .active').removeClass('active');
		$('#sidebar .resource').hide();

		container.find('[data-scroll-id]').each(function() {
			if (position.top > $(this).position().top - 130 && position.top < $(this).position().top + $(this).height()) {
				var id = $(this).attr('data-scroll-id');

				$('#sidebar nav ul li').has('[href=#'+id+']').addClass('active');
				$('#resources_'+id).show();
			}
		});
	});

	// Reimplement answer reveal functionality
	container.find('input.shBtn').click(function() {
		$(this).next('.solution').toggle();
	});

	// Reimplement answer check functionality
	container.find('input[onclick]').each(function() {
		// Remove onclick/onkeypress events
		$(this)
			.removeAttr('onclick')
			.removeAttr('onkeypress');

		$(this).click(function() {
			var groups = [];
			var form = $(this).closest('form');

			// Remove previous classes
			form.find('.correct, .incorrect, .warning').removeClass('correct incorrect warning');

			// Find radio groupings
			form.find(':radio').each(function() {
				groups[this.name] = true;
			})

			// Add classes to correct/incorrect selects
			form.find(':selected').each(function() {
				if ($(this).val() == 1) {
					$(this).closest('select').addClass('correct');
				} else {
					$(this).closest('select').addClass('incorrect');
				}
			});

			// Perform select/incorrect logic on groups of radio inputs
			for (var group in groups) {
				var chosen = form.find('[name="'+ group + '"]:checked');

				if (chosen.length == 0) {
					form.find('[name="'+ group + '"]').next('label').addClass('warning');
				} else if (chosen.val() == 1) {
					chosen.next('label').addClass('correct');
				} else {
					chosen.next('label').addClass('incorrect');
				}
			}
		});
	});

	// Remove root content
	$('#root').remove();

	// Add our new container
	$(document.body).append($('<div id="sidebar">').append($('<nav>').append(navigation)).append(resources));
	$(document.body).append(container);
};

if (document.getElementById('root') && document.getElementsByClassName('ModuleOverview').length > 0) {
	var toggle = function() {
		if (localStorage.getItem('microsite-single-document-viewer') === 'enabled') {
			localStorage.removeItem('microsite-single-document-viewer');
		} else {
			localStorage.setItem('microsite-single-document-viewer', 'enabled');
		}
		window.location.reload();
	};

	var button = $('<button id="btn-single">')
		.click(toggle)
		.text('Enter single document view');

	$('body').append(button);

	if (localStorage.getItem('microsite-single-document-viewer') === 'enabled') {
		button.text('Exit single document view');
		StudyNetEnhancement.Converter();
	}
}