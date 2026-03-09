$.fn.listCortexServices = async function(options) {
	options = options || { };
	
	//Triggers update in all tabs to add new services/friends
	function updateTabs() {
		chrome.windows.getAll({ populate: true }, function(wins) {
			for (var i = 0; i < wins.length; i++) {
				for (var j = 0; j < wins[i].tabs.length; j++) {
					chrome.tabs.sendMessage(wins[i].tabs[j].id, { action: 'update-pie'}, function(response) { void chrome.runtime.lastError; });
				}
			}
		});
	}
	
	//Event handler for the Connect/Disconnect button
	async function toggleConnect(e) {
		//Prevent activation during connecting and from within auth lightbox
		if ($(this).is('.disabled') || $(e.target).closest('#lightbox').length > 0) return;
		
		var li = $(this).closest('li'), button = li.find('.connect');
			
		//Get service
		var serviceName = li.data('service') || (li.attr('id')[0].toUpperCase() + li.attr('id').substr(1));
		var service = services[serviceName];
		
		if (!await service.isConnected()) { //Connect
			var that = this, lightbox;
			
			function success() { 
				$("a.next").removeClass('disabled');
				if (lightbox) lightbox.hide();
				li.removeClass('disconnected').addClass('connected');
				button.text('Remove').removeClass('disabled');
				if (options.connected) options.connected.call(service);
				
				if (service.loadFriends) {
				  loadFriends(service);
				  $('#' + service.name.toLowerCase() + '-friends').show();
				}
				
				updateTabs();
			}

			if (service.authenticate) { //Direct authentication using username/password
				lightbox = li.find('.auth').showInLightbox({ width: 300, height: 215 });
				li.find('.auth .connect').click(completeAuthentication);
				li.find('.username, .password').val('').keydown(function(e) {
					if (e.keyCode == 13) completeAuthentication();
				});
				setTimeout(function() { li.find('.username').focus(); }, 500);
				
				function completeAuthentication() {
					button.text('Connecting...').addClass('disabled');
					service.authenticate(li.find('.username').val(), li.find('.password').val(), success, function() {
						button.text('Add').removeClass('disabled');
						li.find('.password').select().focus();
					});
					
					return false;
				};
			}
			else { //Custom authentication via OAuth, etc.
				button.text('Connecting...').addClass('disabled');
				service.connect(function(popupUrl) {
					chrome.windows.create({
						url: popupUrl,
						width: 900,
						height: 600,
						left: Math.round((screen.width - 800) / 2),
						top: Math.round((screen.height - 600) / 2),
						type: 'popup'
					});
				}, success, function() {
						button.text('Add').removeClass('disabled');
						alert('Could not connect, please try again.');
				});
			}
		}
		else { //Disconnect
			service.disconnect();
			if (options.disconnected) options.disconnected.call(service);
			updateTabs();
			
			li.removeClass('connected').addClass('disconnected');
			button.text('Add');
			$('#' + service.name.toLowerCase() + '-friends').hide();
			$('#' + service.name.toLowerCase() + '-friends .friend-picker').remove();
		}
		
		return false;
	}

	function pickFriends(e) {
		//Prevent activation during connecting and from within auth lightbox
		if ($(this).is('.disabled') || $(e.target).closest('#lightbox').length > 0) return;
		
		var li = $(this).closest('li');
				
		var lightbox = li.find('.friend-picker').showInLightbox({ width: 520, height: 122 });
		setTimeout(function() { li.find('#token-input-').focus(); }, 500);
		
		function closeLightbox() {
			lightbox.hide();
			li.find('.save').unbind('click', closeLightbox);
			updateTabs();
			return false;
		}
		
		li.find('.save').click(closeLightbox);
		li.find('#token-input-').keydown(function onKeyDown(e) {
			if (!e.isDefaultPrevented() && e.keyCode == 13) {
				closeLightbox();
				$(this).unbind('keydown', onKeyDown);
			} 
		});
		
		return false;
	}

	//Load friend picker for the specified service - if supported
	function loadFriends(service) {
		var li = $('#' + service.name.toLowerCase() + '-friends');
		
		li.append('<div class="friend-picker">' +
						'<h3>Pick ' + service.name + ' friends to share via wall post</h3>' +
						'<input type="text" class="search" />' +
						'<a class="save" href="#">Save</a>' +
						'</div>');

		//Let service load the list of friends
		service.loadFriends(function(friends) {
			//Load already selected best friends
			li.find('.search')
				.tokenInput(friends, {
					hintText: 'Type in the names of up to 9 of your ' + service.name + ' friends',
					prePopulate: service.data.bestFriends,
					searchDelay: 0,
					tokenLimit: 9,
					animateDropdown: false,
					preventDuplicates: true,
					theme: 'facebook'
				});
				
			li.find('.save').click(function() {
				service.data.bestFriends = li.find('.search').tokenInput('get').map(function() {
					var friendId = this.id;
					var friend = friends.find(function(f) { return f.id == friendId; });
					
					if (friend) return [ friend ];
					else return [ ];
				});
				
				service.saveData();
				
				chrome.runtime.sendMessage({ action: 'detect-faces' }, function(response) { });
			});
		}, function() {
			//TODO: Add error handling
		});
	}

	var that = this;
	
	var serviceIcons = {
		twitter:    'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg',
		facebook:   'https://www.google.com/s2/favicons?domain=facebook.com&sz=256',
		tumblr:     'https://www.google.com/s2/favicons?domain=tumblr.com&sz=256',
		gmail:      'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico',
		instapaper: 'https://www.google.com/s2/favicons?domain=instapaper.com&sz=256',
		pinterest:  'https://www.google.com/s2/favicons?domain=pinterest.com&sz=256',
		linkedin:   'https://www.google.com/s2/favicons?domain=linkedin.com&sz=256',
		reddit:     'https://www.google.com/s2/favicons?domain=reddit.com&sz=256',
		slack:      'https://www.google.com/s2/favicons?domain=slack.com&sz=256'
	};

	forEachIn(services, async function() {
		var html = '';
		var iconName = this.name.toLowerCase();
		var iconSrc = serviceIcons[iconName] || ('https://www.google.com/s2/favicons?domain=' + iconName + '.com&sz=256');
		html += '<li id="' + iconName + '" data-service="' + this.name + '" class="clearfix ' + (await this.isConnected() ? 'connected' : 'disconnected') + '">' +
					'<span class="service-label">' + this.name + '</span>' +
					'<img src="' + iconSrc + '" ' +
					     'alt="' + this.name + '" title="' + this.name + '" />'+
						'<a class="connect" href="#">' + (await this.isConnected() ? 'Remove' : 'Add') + '</a>';
			
		if (this.authenticate) {
			var userPlaceholder = (this.authPlaceholders && this.authPlaceholders.username) || 'Username';
			var pwPlaceholder   = (this.authPlaceholders && 'password' in this.authPlaceholders)
				? this.authPlaceholders.password
				: 'Password';
			html += '<div class="auth">' +
							  '<h3>Connect to ' + this.name + ':</h3>' +
							  '<input type="text" class="username" placeholder="' + userPlaceholder + '" />' +
							  (pwPlaceholder !== null ? '<input type="password" class="password" placeholder="' + pwPlaceholder + '" />' : '') +
							  '<a class="connect" href="#">Add</a>' +
							'</div>';
		}

		html += '</li>';
				
		$(html).appendTo(that)
			.click(toggleConnect)
			.tooltip(this.name, ':not(#lightbox):not(#lightbox *)');
				
		if (this.loadFriends)
	   	$('<li id="' + this.name.toLowerCase() + '-friends">' +
					'<img src="' + (serviceIcons[this.name.toLowerCase()] || ('/images/icons/' + this.name.toLowerCase() + '-friends_32.png')) + '" ' +
							'alt="' + this.name + ' Friends" title ="' + this.name + ' Friends" />' +
						'<a class="pick-friends" href="#">Pick friends</a>' +
				'</li>')
			.appendTo(that)
			.tooltip(this.name, ':not(#lightbox):not(#lightbox *)')
			.click(pickFriends);

		//Load friend list, if necessary
		if (await this.isConnected() && this.loadFriends) loadFriends(this);
		
		//Hide friend picker if disconnected
		if (!await this.isConnected()) $('#' + this.name.toLowerCase() + '-friends').hide();

	});

	if($("#services li.connected").length > 0)
			$("a.next").removeClass('disabled');
	
};
