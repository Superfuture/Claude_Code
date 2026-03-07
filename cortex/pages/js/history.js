function fixTumblrUrl(url) {
	if (!url) return url;
	// Fix old format: https://www.tumblr.com/blog/view/blog.tumblr.com/id
	// or https://www.tumblr.com/blog.tumblr.com/id
	var m = url.match(/https?:\/\/www\.tumblr\.com\/(?:blog\/view\/)?([\w.-]+\.tumblr\.com)\/(\d+)/);
	if (m) return 'https://' + m[1] + '/post/' + m[2];
	return url;
}

function buildHistoryItem(item) {
	if (item.service === 'Tumblr') item.linkToService = fixTumblrUrl(item.linkToService);
	var html = '<li class="' + item.service + '" id="history-item-' + item.id + '">';
	
	//Find thumbnail image
	var image;
	if (item.image) image = item.image;
	else if (item.thumbnail) image = item.thumbnail;
	else image = '/images/no_image.gif';

	html += '<a href="' + (item.image || item.thumbnail || item.link) + '" class="image"><img src="' + image + '" /></a>';
	
	html += '<div class="info">' +
				'<h4><a href="' + item.linkToService + '">' + (item.message || item.title || item.link) + '</a></h4>' +
				'<small>' +
					'<a href="' + item.link + '">' +
						$.timeago(item.date) + ' shared ' + item.type + ' to ' + item.service +
						((item.friendName && item.service === 'Facebook') ? ' &#9658; ' + item.friendName : '') + 
					'</a>' +
				'</small>' +
			'</div>' +
		'</li>';
	
	return $(html);
}

var minId, maxId;

function buildHistory(options, callback) {
  options.action = 'retrieve-history';
  
	chrome.runtime.sendMessage(options, function(response) {
		
		if(!response || !response.history) return;

	  var history = response.history;
	
		//Placeholder
		if ($('#history li').length == 0 && history.length == 0) {
			$('#history').hide();
			$('#setup').show();
		}
		else {
			$('#history').show();
			$('#setup').hide();
			
			//Only add new items
			if (options.mode != 'replace')
	  		history = history.filter(function() { 
	  			return $('#history-item-' + this.id).length == 0;
	  		});

			if (history.length == 0) return callback ? callback() : undefined;

			var items = $();
			for (var i = 0; i < history.length; ++i) items = items.add(buildHistoryItem(history[i]));

			if (options.mode == 'append') $('#history').append(items);
			else if (options.mode == 'prepend') $('#history').prepend(items);
			else if (options.mode == 'replace') $('#history').html('').append(items);

			if (maxId === undefined || history[0].id > maxId) maxId = history[0].id;
			if (minId === undefined || history[items.length - 1].id < minId) minId = history[items.length - 1].id;
		}

		if (callback) callback();
	});
}

function initialize() {
	//Load history
	buildHistory({ count: 30, mode: 'append' });
	
	//Opens all links from popup in same tab underneath
	if (document.location.search == '?popup') {
		$(document).on('click', 'a', function(e) {
			var href = e.currentTarget.href;
			chrome.tabs.query({
    		active: true,
    		lastFocusedWindow: true
			}, function(tabs) {
				chrome.tabs.update(tabs[0].id, { url: href })
				window.close();
			});
			return false;
		});
	}
  
  //Search
  var searching = false, stashedItems, stashedPosition;

  $('#search').keydown(function() {
    setTimeout(function() { //Wait for keystroke to take effect
      var search = $('#search').val().trim();
    
      if (search.length > 0 && !searching) {
        stashedPosition = window.scrollY;
        stashedItems = $('#history li').remove();
        searching = true;
      }
      else if (search.length == 0 && searching) {
        $('#history').html('').append(stashedItems);
        window.scrollTo(0, stashedPosition);
        searching = false;
      }
    
      if (searching) buildHistory({ search: search, count: 30, mode: 'replace' });
    }, 1);
  });

	//Delay focusing (for whatever reason, it doesn't work without this)
	setTimeout(function() { $('#search').focus(); }, 100);
  
  var lastLazyLoad, lastPosition;
  
  //Lazy loading
  $(window).scroll(function() {
    if (searching) return;

    var now = new Date(), recentLazyLoad = lastLazyLoad && now - lastLazyLoad < 1000;

    //Fix scrolling bug in popup
    if (lastPosition && $('body').is('.popup') && window.innerHeight > 600) {
      setTimeout(function() { window.scrollTo(0, lastPosition); }, 100);
      return;
    }
    
    //Don't initiate lazy load while popup is being opened
    if (window.innerHeight < 600) return;

    if (document.body.clientHeight - window.scrollY - window.innerHeight < 500) {
      if ($('body').is('.popup')) {
        //Prevent lazyloading during element tree modification
        if (recentLazyLoad) return;

        lastLazyLoad = now;
        lastPosition = window.scrollY;
      }

      buildHistory({ maxId: minId, count: 30, mode: 'append' });
    }
  });
  
	//Live updating
	setInterval(function() {
	  var first = $('#history li:first-child');
	  
	  if (!searching && (first.length == 0 || window.scrollY < first.offset().top + first.outerHeight()))
	    buildHistory({ minId: maxId, mode: 'prepend' });
	}, 500);
	

}
initialize();