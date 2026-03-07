function CortexTutorial() {
	var that = this;
	
	this.initialize = function() {
		document.title = 'Cortex';
		document.location.hash = '';
		
		this.currentStep = 'welcome';
		
		chrome.runtime.sendMessage({ action: 'get-extension-uri' }, function(response) {
			that.extensionUri = response.uri;
			
			$(function() {
				$('#demo, #download, #footer').hide();
				$('.button, img[src="mov.gif"], span.footer').hide();
				that.steps = {
					welcome: $('<div id="welcome" class="step">' +
												'<h1>Welcome, let\'s get started.</h1>' + 
												'<p>1) Hold down mouse button</p>' +
												'<div id="hold">' +
													'<h1>Hold down longer</h1>' +
													'<p>and don\'t move your mouse.</p>' +
												'</div>' +
											'</div>').appendTo('body'),
					activated: $('<div id="activated" class="step">' +
												 '<p>2) Select a network to share to</p>' +
											 '</div>').appendTo('body'),
					comment: $('<div id="comment" class="step">' +
											 '<p>3) Write your message and hit enter to send</p>' +
										 '</div>').appendTo('body'),
					commentToGmail: $('<div id="comment-to-gmail" class="step">' +
															'<p>3) Enter a recipient, write your message and hit enter to send</p>' +
														'</div>').appendTo('body'),
					completedWithMessage: $('<div id="completed" class="step">' +
																		'<h1>Success!</h1>' +
																		'<p>You\'ve made your first share via Cortex.</p>' +
																	'</div>').appendTo('body'),
					completedWithoutMessage: $('<div id="completed" class="step">' +
																		 	'<h1>Success!</h1>' +
																		 	'<p>You\'ve made your first share via Cortex.</p>' +
																			'<p><strong>Tip:</strong> Keep holding on the network icon to add a comment.</p>' +
																	 	 '</div>').appendTo('body'),
				};
				
				$(cortex).on('activated', function() {
					that.onActivation();
					that.currentStep = 'activated';
					that.updateSteps();
				}).on('comment', function(e, targetServices) {
					that.onComment(_.has(targetServices, 'Gmail'));
					that.currentStep = _.has(targetServices, 'Gmail') ? 'commentToGmail' : 'comment';
					that.updateSteps();
					$('#hold').hide();
				}).on('completed', function() {
					if (that.currentStep == 'activated') that.currentStep = 'completedWithoutMessage';
					else that.currentStep = 'completedWithMessage';
					that.updateSteps();
				}).on('aborted', function() {
					that.currentStep = 'welcome';
					that.updateSteps();
				});
				
				$('html').on('click', function(e) {
					if (that.currentStep == 'welcome' && !$(e.target).is('#cortex-overlay')) $('#hold').fadeTo(200, 1);
				}).on('focus', '#the-social-comment .textarea', function() {
					if (that.currentStep.indexOf('comment') == 0 && $('#the-social-comment .textarea').text() == 'Check out Cortex, a beautiful new way to share fast.')
						that.selectCommentBoxContents();
				});
			});
		});
	};
	
	this.updateSteps = function() {
		_.each(that.steps, function(step, i) {
			step.stop(true).fadeTo(200, +(i == that.currentStep));		
		});
	};
	
	this.onActivation = function(pieMenu) {
		var width = that.steps.activated.outerWidth(), height = that.steps.activated.outerHeight();
		var x = cortex.pieMenu.position.x + 95, y = cortex.pieMenu.position.y + 95;
		if (x + width > document.documentElement.clientWidth) x -= 2 * 95 + width;
		if (y + height > document.documentElement.clientHeight) y -= 2 * 95 + height;
		that.steps.activated.css({ left: x + 'px', top: y + 'px' });
	};
	
	this.onComment = function(toGmail) {
		var commentBoxBounds = cortex.pieMenu.commentBoxBounds;
		$('#the-social-comment .textarea').text('Check out Cortex, a beautiful new way to share fast.');
		
		var step = toGmail ? that.steps.commentToGmail : that.steps.comment;
		
		var x = commentBoxBounds.left - document.body.scrollLeft + commentBoxBounds.width + 5;
		var y = commentBoxBounds.top - document.body.scrollTop;
		
		if (x + step.outerWidth() > document.documentElement.clientWidth) 
			x -= commentBox.outerWidth() + step.outerWidth() + 10;

		step.css({ left: x + 'px', top: y + 'px' });
		
		if ($(document.activeElement).is('#the-social-comment .textarea'))
			$(document).one('mouseup', that.selectCommentBoxContents);
	};
		
	this.selectCommentBoxContents = function() {
		var range = document.createRange();
		range.selectNodeContents($('#the-social-comment').find('.textarea')[0]);
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		
		if (window.mouse.isPressed)
			document.addEventListener('mouseup', function onMouseUp(e) {
				if ($(e.target).is('#the-social-comment .textarea, #the-social-comment .textarea *'))
					e.preventDefault();
			
				document.removeEventListener('mouseup', onMouseUp, true);
			}, true);
	}
	
	setInterval(function() {
		_.each(cortex.popups, function(popup) {
			popup.autoHide = function() { };
			clearTimeout(popup.hideTimeout);
		});
	}, 2500);
}

if (document.location.hash == '#tutorial' || location.pathname === '/pages/tutorial.htm')
	new CortexTutorial().initialize();