// Cache extension base URL immediately — chrome.runtime.getURL throws after extension reload
var cortexBaseUrl = (function() {
	try { return chrome.runtime.getURL(''); } catch(e) { return ''; }
})();
function cortexUrl(path) { return cortexBaseUrl + path.replace(/^\//, ''); }

// Cache sound preference and keep it in sync
var cortexSoundEnabled = true;
chrome.storage.local.get(['soundEnabled'], function(result) {
	cortexSoundEnabled = result.soundEnabled !== false;
});
chrome.storage.onChanged.addListener(function(changes) {
	if (changes.soundEnabled) cortexSoundEnabled = changes.soundEnabled.newValue !== false;
});

// Safe wrapper for chrome.runtime.sendMessage — silently fails if extension context is invalidated
function safelySendMessage(message, callback) {
	try {
		chrome.runtime.sendMessage(message, callback || function() { void chrome.runtime.lastError; });
	} catch(e) { /* Extension context invalidated after reload */ }
}

function Cortex() {
	var that = this;
	
	this.initialize = function() {
		document.addEventListener('keydown', this.onKeyPress, true);
		document.addEventListener('keyup', this.onKeyPress, true);
		document.addEventListener('keypress', this.onKeyPress, true);

		$(function() {
			//Attempt to place pie menu above flash elements
			$('embed').attr('wmode', 'opaque').wrap('<div>').unwrap();

			//Create  elements
			that.overlay = $('<div id="cortex-overlay" />').appendTo($('body')).hide();
			that.focus = $('<img id="cortex-focus" crossorigin="anonymous" />').appendTo($('body')).hide();
			that.rainbow = $('<div id="cortex-rainbow" />').appendTo($('body')).hide();
			that.popupContainer = $('<div id="cortex-popups" />').appendTo($('body'));
			that.popups = { };
		
			function loadAndBuildPieMenu() {
				safelySendMessage({ action: 'get-services-and-friends' }, function(response) {
					if (response) that.buildPieMenu(response.services);
				});
			};

			loadAndBuildPieMenu();

			$(document).longclick(500, function() {
				if (!that.overlay.is(':visible')) that.onActivation.call(this);
			}, function(e) {
				//Activation filters
				return document.documentElement.clientWidth - e.clientX > 2 &&
					document.documentElement.clientHeight - e.clientY > 2 &&
					(!that.overlay.is(':visible')) &&
					e.target.nodeName != 'INPUT' &&
					e.target.nodeName != 'TEXTAREA' &&
					e.target.nodeName != 'SELECT' &&
					e.target.nodeName != 'EMBED' &&
					e.target.nodeName != 'OBJECT' &&
					!e.ctrlKey;
			});

			that.overlay.mouseup(function() { 
				if (!$('#the-social-comment').is(':visible'))
					that.onCompletion(undefined, false); 
			});

			//Popup notifications / update pie menu on change
			chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
				if (request.action == 'notify') that.notify(request.status, request.post, request.error);
				else if (request.action == 'update-pie') loadAndBuildPieMenu();
				sendResponse(true);
			});
				
		});
	}
	
	this.buildPieMenu = function(services, actualCenter) {
		//Abort if pie menu is activated
		if (this.pieMenu && this.pieMenu.isVisible) return;
		//Update
		this.services = services;
	
		//Remove previous pie menu if present
		$('.cortex-pie').remove();
		
		//Build pie menu
		var slices = [ ];
		_.each(services, function(service, name) {
			var slice = {
				type: 'service',
				service: service,
				image: cortexUrl('/images/icons/' + name.toLowerCase() + '.png'),
				backgroundColor: service.background,
				backgroundColorOnHover: new $.Color(service.background).toHSL().adjust([0, 0, -0.3]).fix().toHEX()
			};
			
			slices.push(slice);
			
			if (service.bestFriends && service.bestFriends.length > 0) {
				var friendSlice = {
					type: 'friends',
					service: service,
					image: cortexUrl('/images/icons/' + name.toLowerCase() + '-friends.png'),
					backgroundColor: service.friendsBackground,
					backgroundColorOnHover: new $.Color(service.friendsBackground).toHSL().adjust([0, 0, -0.3]).fix().toHEX(),
					children: [ ]
				};
				
				_.each(service.bestFriends, function(friend) {
					friendSlice.children.push({
						type: 'friend',
						service: service,
						friend: friend,
						image: friend.image,
						center: friend.face,
						fillWithImage: true
					});
				});					
					
				slices.push(friendSlice);
			}
		});
		//Build pie menu (see libs/piemenu.js)
		this.pieMenu = new PieMenu({
			slices: slices,
			subPieDelay: 0, //For friends menu
			modeDelay: 400, //For comment box,
			cancel: that.onCompletion,
			sliceSelected: that.onCompletion,
			actualCenter: actualCenter,
			calculateCommentBoxBounds: that.calculateCommentBoxBounds
		});
	};
	
	this.calculateCommentBoxBounds = function(pieCenter) {
		const width = 337, height = 110;
		
		return {
			left: Math.min(Math.max(window.mouse.screenPos.x - width / 2, 24), document.documentElement.clientWidth - width - 26),
			top: Math.min(Math.max(window.mouse.screenPos.y - height / 2, 24), document.documentElement.clientHeight - height - 26),
			width: width, 
			height: height,
		};
	};
	
	this.onActivation = function() {
		//Abort if no services are connected
		if (_.isEmpty(that.services)) return;
		
		//Make Cortex ignore zoom properties on html and body
		var zoom = (parseFloat($('html').css('zoom')) * parseFloat($('body').css('zoom')));
		if (zoom != 1) $('.cortex-pie').css('zoom', 1 / zoom);
		
		//Show overlay to avoid selections
		that.overlay.css({
			width: $(document).width(),
			height: $(document).height(),
			display: 'block'
		});

		that.clickedElement = $(this);
		
		//If user has selected image
		if ($(this).is('img')) {
			//Determine image dimensions
			var bounds = that.clickedElement.offset();
			
			for (var side in bounds)
				bounds[side] += parseFloat(/^(\d+)(\.\d+)?/.exec(that.clickedElement.css('padding-' + side))[0]) +
								parseFloat(/^(\d+)(\.\d+)?/.exec(that.clickedElement.css('border-' + side + '-width'))[0]);

			bounds.width = that.clickedElement.width();
			bounds.height = that.clickedElement.height();
			
			//Clone image
			that.focus.attr('src', that.clickedElement.attr('src'))
				.css({
					left: bounds.left + 'px',
					top: bounds.top + 'px',
					width: bounds.width + 'px',
					height: bounds.height + 'px',
					display: 'block'
				});
				
			//Add rainbow
			that.rainbow.css({
					left: (bounds.left - 10) + 'px',
					top: (bounds.top - 10) + 'px',
					width: (bounds.width + 20) + 'px',
					height: (bounds.height + 20) + 'px',
					backgroundImage: 'url(' + cortexUrl('/images/rainbow.png') + ')'
				}).fadeIn(150);
			}
	
		//Prevent any accidental selction
		that.selectionCleaner = setInterval(function() {
			if (document.getSelection().toString().length > 0)
				document.getSelection().empty();
		}, 10);
	
		//Activate pie menu
		$('#the-social-comment').remove();
		that.pieMenu.show();
		$(that).trigger('activated');
	};

	this.onCompletion = function(slice, longClick) {
		function closeCortex(success) {
			if (popup) {
				//Let popup explode/implode
				popup.stop(true).animate({ scale: (success === true) ? 2 : 0, opacity: 0 }, 200, function() { $(this).remove(); });
				
				that.overlay.add(that.focus).add(that.rainbow).unbind('click');
				clearInterval(overflowUpdater);	
			}
			
			//Fade out rainbow to highlight selected image
			that.rainbow.fadeOut(200, function() {
				that.focus.hide();
				that.rainbow.hide();
			});
			
			that.overlay.unbind('click').hide();
			
			if (success === true) $(that).trigger('completed');
			else $(that).trigger('aborted');
		}
		
		//Stop preventing all selections
		clearInterval(that.selectionCleaner);
				
		//Abort here if no slice has been selected
		if (!slice) {
			that.pieMenu.hide();
			return closeCortex(false);
		}
		
		function post() {
			//Wait for options and short url to be ready
			var requiresShortUrl = _.any(targetServices, function(service) { return service.requiresShortUrl; });

			setTimeout(function tryToPost() {
				if (!options || (requiresShortUrl && !options.shortUrl)) return setTimeout(tryToPost, 10);
				
				//Post
				_.each(targetServices, function(service) {
					safelySendMessage({
						action: 'post',
						service: service.name,
						options: options
					}, function(response) {
						if (response && !response.success) { console.error(response.error); } else if (response) {
							//Play sound (if enabled)
							if (cortexSoundEnabled) {
								new Audio(cortexUrl('/sounds/swoosh.mp3')).play();
							}
						}
					});
				});
			}, 10);
		}
		
		//Determine default target services
		var targetServices = { };
		
		if (slice.service.name == 'shareToAll') {
			targetServices = _.clone(that.services);
			delete targetServices.Gmail;
			delete targetServices.shareToAll;
		}
		else targetServices[slice.service.name] = slice.service;
		
		//Prepare post options (particularly: use API if necessary to fetch thumbnail)
		var options;
		
		that.buildPostOptions(undefined, slice.friend, function(postOptions) {
			options = postOptions;
		});
		
		//Updates max comment length depending on target services and short url
		var maxLength;
		
		function updateMaxLength() {
			//Find shortest maximum length, subtract space between message and URI
			maxLength = _.min(_.filter(_.pluck(targetServices, 'maxLength'), _.identity)) - 1;
			
			if (options.shortUrl) maxLength -= options.shortUrl.length;
			
			//Wait for mouse to be released to prevent selection issues upon activation
			var commentInputActivation = setInterval(function() {
				if (window.mouse.isPressed) return;
				clearInterval(commentInputActivation);
				
				//Activate length limit
				commentBox.commentInput(maxLength, 'span', 'class="cut-off"');
			});
		}
		
		//Get short url for max comment length and for stats
		safelySendMessage({
			action: 'shorten-url',
			url: that.clickedElement.is('img') ? that.clickedElement[0].src : document.location.href
		}, function(response) {
			if (response) options.shortUrl = response.shortUrl;
			if (commentBox) updateMaxLength();
		});
		
		//Demand comment if required by service or user
		if (slice.service.supportsMessage && (longClick || slice.service.requiresMessage)) {
			//Create elements
			var popup = $('<div id="the-social-comment" />').appendTo('body');
			var toField = $('<input type="text" name="to" placeholder="To" autocomplete="off" />').appendTo(popup).hide();
			var dropDown = $('<div class="dropdown" style="display: none;" />').appendTo(popup);
			var commentBox = $('<div class="textarea" contentEditable />').appendTo(popup);
						
			//Trigger overflow only when necessary to avoid scrollbars; hide prompt to hit return when user enters more text
			var overflowUpdater = setInterval(function() {
					if (commentBox[0].scrollHeight > commentBox[0].clientHeight && commentBox.css('overflow-y') != 'scroll')
						commentBox.css('overflow-y', 'scroll');
					else if (commentBox[0].scrollHeight <= commentBox[0].clientHeight && commentBox.css('overflow-y') != 'auto')
						commentBox.css('overflow-y', 'auto');
			}, 40);
			
			//Handle keyboard navigation in dropdown
			toField.keydown(function (e) {
				//Find selected recipient from dropdown
				var selected = dropDown.find('.selected');
				
				switch (e.keyCode) {
					case 13: case 9: //Return and tab
						//Add selection to to-field if possible
						if (selected.length > 0) {
							//Append recipient to to-field after last comma
							var val = (toField.val().substr(0, toField.val().lastIndexOf(',') + 1) + ' ' + selected.attr('data-email')).trim();

							//Append another comma when tabbing
							if (e.keyCode == 9) val += ', '; 

							toField.val(val);
						}
												
						//Stay in to-field when tabbing and when recipient has been added
						if (e.keyCode == 9 && selected.length > 0) {
							//Set selection
							toField.focus()[0].setSelectionRange(toField.val().length, toField.val().length);
							
							//Scroll to right as far as possible
							toField[0].scrollLeft = 999999;
						} 
						//Otherwise, move on to comment box
						else commentBox.focus();
						
						dropDown.html('').hide();

						break;
					case 40: //Arrow down
						if (selected.is(':not(:last-child)'))
							selected.removeClass('selected').next().addClass('selected');
						break;
					case 38: //Arrow up
						if (selected.is(':not(:first-child)'))
							selected.removeClass('selected').prev().addClass('selected');
						break;
					case 27: //Escape
						closeCortex(false);
						break;
				}
				
				//Prevent action on processed keys
				//if (_.contains([ 13, 9, 40, 38, 27 ], e.keyCode)) return false;
			})
			//Show dropdown while typing
			.keyup(function(e) {
				//Prevent action on processed keys
				if (_.contains([ 13, 9, 40, 38, 27 ], e.keyCode)) return;
						
				//Find query string after last comma
				var search = _.last($(this).val().split(',')).trim().toLowerCase();
				if (search == '') return dropDown.hide(); 
				
				//Take contacts from Gmail
				var contacts = that.services.Gmail.contacts;
				
				//Regex escaping function
				RegExp.escape = function(text) {
				  if (!arguments.callee.sRE) {
				    var specials = [
				      '/', '.', '*', '+', '?', '|',
				      '(', ')', '[', ']', '{', '}', '\\'
				    ];
				    arguments.callee.sRE = new RegExp(
				      '(\\' + specials.join('|\\') + ')', 'g'
				    );
				  }
				  return text.replace(arguments.callee.sRE, '\\$1');
				}
				
				//Find matching contacts
				var matches = [ ];
				_.each(contacts, function(contact) {
					var score = 0;
					
					//Determine score in range of 0 to 1 for each contact
					if (new RegExp('\\b' + RegExp.escape(search), 'i').test(contact.title)) score = 1;
					else if (contact.email.toLowerCase().indexOf(search) == 0) score = 0.5;
					
					//Add matching contacts to results together with their score
					if (score > 0) matches.push(_.extend({ score: score }, contact));
				});
				
				//Sort results by score and limit to 6 items
				matches = _.sortBy(matches, function(contact) {
					return 1 - contact.score;
				}).slice(0, 6);
								
				//Hide dropdown when no contacts are matching
				if (matches.length == 0) {
					dropDown.html('').hide();
					return;
				}
								
				//Populate dropdown
				var dropDownItem = _.template('<a href="" data-email="<%- email %>"><strong><%- title %></strong> (<%- email %>)</a>');
				dropDown.html(_.map(matches, dropDownItem).join('')).show();
				
				//Select first item
				dropDown.find('a:first-child').addClass('selected');

				//Select items on hover
				dropDown.find('a').mouseover(function() {
					$(this).addClass('selected').siblings().removeClass('selected');
				})
				//Simulate return key to choose item by clicking
				.click(function() {
					var keydown = $.Event('keydown');
					keydown.keyCode = 13;
					toField.trigger(keydown);
				});
			});
			
			//Hide dropdown when clicking away
			popup.click(function() {
				dropDown.html('').hide();
				return false;
			});
			
			//Handle final submission
			commentBox.keydown(function(e) {
				if (e.keyCode == 13) { //Return
					//Cancel if no Gmail recipients were specified
					if (targetServices.Gmail && toField.val().trim() == '') {
						//Shake popup
						popup.stop(true)
							.animate({ left: that.pieMenu.commentBoxBounds.left - 15 + 'px'}, 25)
							.animate({ left: that.pieMenu.commentBoxBounds.left + 10 + 'px'}, 50)
							.animate({ left: that.pieMenu.commentBoxBounds.left - 6 + 'px'}, 50)
							.animate({ left: that.pieMenu.commentBoxBounds.left + 3 + 'px'}, 50)
							.animate({ left: that.pieMenu.commentBoxBounds.left + 'px' }, 25);							
						return;
					}
					
					//Prepare post
					options.recipients = toField.val();
					options.message = commentBox.text();
					if (maxLength) options.message = options.message.substr(0, maxLength);
					
					post();
					closeCortex(true);
				}
				else if (e.keyCode == 9 && e.shiftKey && targetServices.Gmail) //Shift + Tab
					toField.focus();
				else if (e.keyCode == 27) closeCortex(false); //Esc
			});

			//Register cancel handlers
			that.overlay.add(that.focus).add(that.rainbow).click(closeCortex);
			
			//Calculate dimensions of comment box
			var bounds = that.pieMenu.commentBoxBounds;
			
			//Hide pie menu
			that.pieMenu.hide(true, { cornerRadius: 5, borderThickness: 1, fill: '#ffffff', stroke: '#cccccc' });
			
			//Hide popup until pie menu animation has been completed
			popup.hide();
			
			setTimeout(function() {
				popup.css($.extend(bounds, {
					//Ignore zoom properties on html and body
					zoom: 1 / (parseFloat($('html').css('zoom')) * parseFloat($('body').css('zoom')))
				})).show();
				
				//Show to field if sharing to Gmail
				if (_.has(targetServices, 'Gmail')) {
					toField.fadeIn(200, function() {
						toField.focus();
					});
				}
				else commentBox.focus();
			}, 200);
			
			$(that).trigger('comment', [ targetServices ]);
		}
		//No comment required, just post
		else {
			that.pieMenu.hide();
			post();
			closeCortex(true);
		}
	}
	
	this.onKeyPress = function(e) {
		var commentBox = $('#the-social-comment .textarea'), toField = $('#the-social-comment [name=to]');
		
		//If Cortex comment prompt is active
		if (commentBox.is(':visible') && (commentBox[0] == document.activeElement || toField[0] == document.activeElement)) {
			//Prevent any other event handlers from triggering any page actions or aborting the event
			e.stopImmediatePropagation();
			
			//Prevent return key from creating newline
			if (e.keyCode == 13 || e.keyCode == 9) e.preventDefault();
			
			//Pass event on
			$(document.activeElement).trigger(e);
		}
	};
	
	this.buildPostOptions = function(message, friend, callback) {
		var opengraph = { };
		$('meta[property^="og:"], meta[name^="og:"]').each(function() {
			var key = ($(this).attr('property') || $(this).attr('name')).substr(3);
			var value = $(this).attr('content');
			opengraph[key] = value;
		});
		
		var excerpt;
		if (opengraph.description) excerpt = opengraph.description;
		else if ($('meta[name=description]').length > 0) excerpt = $('meta[name=description]').attr('content');
		else {
			var paragraph = _.find($('p'), function(p) { return p.innerText.trim().length >= 120; });
			if (paragraph) excerpt = paragraph.innerText;
		}
		
		var options = {
			link: document.location.href,
			title: opengraph.title || document.title.replace(/[^a-z0-9\s]/gi, ''),
			message: message,
			image: that.clickedElement.is('img') ? that.clickedElement[0].src : undefined,
			thumbnail: opengraph.image,
			excerpt: excerpt,
			friend: friend,
			opengraph: opengraph
		};

		if (/^https?:\/\/www\.youtube\.com\/watch/.test(options.link))
			options.title = options.title.replace(' - YouTube', '').replace(' - Youtube', '');

		if (that.clickedElement.is('img')) options.type = 'image';
		else options.type = 'link';

		if (!options.thumbnail)
			$(document).thumbnail(function(thumbnail) {
				options.thumbnail = thumbnail;
				callback(options);
			});
		else callback(options);
	};	
	
	this.notify = function(status, post, error) {
	  var that = this;

		//Log error message
		if (error) console.error(error);

    	//Creates and shows a popup
		function createPopup(message, thumbnail, onUndo) {
			var popup = { autoHideEnabled: false };

			//Fades popup out after 3 seconds
			popup.autoHide = function() {
				popup.autoHideEnabled = true;
				popup.hideTimeout = setTimeout(function() {
					//Keep popup at opacity:0 to continue occupying space in order not to break the layout
					popup.element.fadeTo(300, 0, function() {
						if ($('.cortex-popup').filter(function() { return $(this).css('opacity') != 0; }).length == 0)
							$('.cortex-popup').remove();
					});
				}, 3000);
			};

			popup.addButtons = function(link, onUndo) {
				//Add view button
				$('<a href="' + link + '">View Post</a>').appendTo(popup.element.find('.cortex-popup-body'));

				//Add undo button
				if (onUndo)
					$('<a href="">Undo</a>')
						.appendTo(popup.element.find('.cortex-popup-body'))
						.click(function undoClicked() {
							$(this).unbind('click', undoClicked); //One-way button

							popup.element.find('h1').text('Undoing...');
							popup.element.find('a').fadeTo(50, 0);

							popup.autoHideEnabled = false;
							onUndo.call(popup);

							return false;
						});
			};

			//Create popup element
			popup.element = $('<div class="cortex-popup"><div class="cortex-popup-bar"></div><div class="cortex-popup-body"><h1>' + message + '</h1></div></div>');
			popup.element.find('.cortex-popup-bar').css('background-image', 'url(' + cortexUrl('/images/bgbar.jpg') + ')');

			//Add thumbnail
			if (thumbnail)
				$('<a href="javascript:return false;"><img src="' + thumbnail + '" crossorigin="anonymous" /></a>').prependTo(popup.element);
			else
				popup.element.addClass('no-image');

			//Show popup
			popup.element.appendTo(that.popupContainer)
				.hide()
				.fadeIn(200)
				.bind('mouseenter mousemove', function() {
					clearTimeout(popup.hideTimeout);
					$(this).stop(true).fadeTo(100, 1);
				})
				.mouseleave(function() {
					if (popup.autoHideEnabled) popup.autoHide();
				});

			return popup;
		}

		//Handler for undo button
		function onUndo() {
			var popup = this;
			safelySendMessage({ action: 'undo', post: post._id }, function(response) {
				if (response && response.success) popup.element.find('h1').text('Sharing to ' + post.service + ' has been undone');
				else popup.element.find('h1').text('Sorry, undo failed :-(');

				popup.autoHide();
			});
		}

		//Choose message depending on status
		var message;

		if (status == 'pending') message = 'Sharing to ' + post.service + '...';
		else if (status == 'error') message = 'Sharing to ' + post.service + ' failed, try again.';
		else {
			message = 'Your ' + post.type + ' has been shared to ';
			if (post.friend)
				message += post.friend.name + "'" + (post.friend.name[post.friend.name.length - 1] != 's' ? 's' : '') + ' wall';
			else
				message += post.service;
		}

		//Look for existing popup
		var popup = this.popups[post.id];

		//Create popup if not found, otherwise update message
		if (!popup) popup = this.popups[post.id] = createPopup(message, post.image || post.thumbnail);
		else popup.element.find('h1').text(message);
		//Add buttons
		if (status == 'success') {
			popup.element.find('a').attr('href', post.linkToService);
			popup.addButtons(post.linkToService, post._id ? onUndo : false);
		}

		//Hide popup after 4 seconds
		if (status != 'pending') popup.autoHide();
	};

	this.initialize();
};

if (blacklist.trueForAll(function() { return !this.test(document.location.href); })) {
  var cortex = new Cortex();
}