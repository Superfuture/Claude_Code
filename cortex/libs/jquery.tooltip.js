$.fn.extend({
  tooltip: function(title, filter) {
		function hideTooltip() {
			if (!(this instanceof jQuery)) return hideTooltip.call($(this));
			if (this.data('hiding')) return;
			
			this.stop().data('hiding', true).animate({ opacity: 0, top: this.offset().top + 5 }, 200, function() { $(this).data('hiding', false); });
		}
	
  	$(this).hover(function(e) {
			if (filter && !$(e.target).is(filter)) return;
	
  	  if (!$(this).data('tooltip'))
  	    $(this).data('tooltip', $('<div class="tooltip"><div class="text">' + (title || el.attr('title')) + '</div><div class="pointer"></div></div>').appendTo('body'));
  	  
  	  var tooltip = $(this).data('tooltip');
  	  var pointer = tooltip.children('.pointer');
  		var text = tooltip.children('.text');

  		// Locate center bottom of link
  		var pos = $(this).offset();
  		pos.left += $(this).width() / 2,
  		pos.top -= tooltip.height() - 5;

      var width = tooltip.width();

      // Center tooltip below link
      pos.left = pos.left - width / 2;
      
      pos.left = Math.min(Math.max(0, pos.left), $(document).width() - width);
      pos.top = Math.min(Math.max(0, pos.top), $(document).height() + tooltip.height());

  		tooltip.css({
  			left: pos.left + 'px',
  			top: (pos.top + 5) + 'px'
  		});

			//Hide all other tooltips
			$('.tooltip:visible').each(hideTooltip);

  		// And go!
  		tooltip.stop().data('hiding', false).css({ display: 'block', opacity: 0 }).animate({ opacity: 0.7, top: pos.top  }, 200);
  		
  		$(this).data('tooltip', tooltip);
  	},function() {
  	  var tooltip = $(this).data('tooltip');
  	  if (tooltip) hideTooltip.call(tooltip);
  	});

		return this;
  }
});