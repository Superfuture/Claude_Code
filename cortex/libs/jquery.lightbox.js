$.fn.showInLightbox = function(options) {
	options = $.extend({
		animationDuration: 200,
		width: 500,
		height: 300,
		closed: function() { }
	}, options || { });

	var that = this;

	$('body').append('<div id="lightbox-overlay"></div>');
	$(this).wrap('<div id="lightbox"><div class="content"></div></div>');

	$('#lightbox-overlay').hide().fadeIn(options.animationDuration);

	$('#lightbox > .content').hide();

	$('#lightbox').css({
		width: 0,
		opacity: 0
	}).animate({
		width: options.width + 'px',
		opacity: 1
	}, function() {
		$('#lightbox > .content').fadeIn(options.animationDuration);
	});

	function hideLightbox() {
		if (hideLightbox.alreadyHiding) return;
		hideLightbox.alreadyHiding = true;
		$('#lightbox, #lightbox-overlay').fadeOut(options.animationDuration, function() {
			$(that).unwrap();
			$('#lightbox-overlay').remove();
		});

		options.closed();
	}

	$('#lightbox-overlay').click(hideLightbox);

	return {
		hide: hideLightbox
	};
};
