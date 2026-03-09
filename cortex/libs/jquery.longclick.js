$.fn.extend({
	longclick: function longClickHandler(holdTime, handler, filter) {
		var activationTimeout, clickedElement, startMousePos, startScrollY;

		//Aborts timeout and clears variables
		function cancel() {
			if (activationTimeout) {
				clearTimeout(activationTimeout);
				activationTimeout = clickedElement = undefined;
			}
		}

		//Add abortion handlers as early as possible, using capture
		document.addEventListener('mouseup', cancel, true);

		// Only cancel on real user scrolls (ignore synthetic scroll events from page scripts)
		document.addEventListener('scroll', function() {
			if (Math.abs(window.scrollY - startScrollY) > 8) cancel();
		}, true);

		// Use capture so sites that call stopPropagation() on mousedown don't block us
		document.addEventListener('mousedown', function(e) {
			//Verify user conditions, left mouse button, first firing of event, no scrollbar clicked
			if (filter(e) && e.button == 0 && clickedElement === undefined && e.clientX < $(window).width() - 20) {
				clickedElement = e.target;
				startMousePos = { x: e.clientX, y: e.clientY };
				startScrollY = window.scrollY;

				//Initiate timeout after holdTime
				activationTimeout = setTimeout(function() {
					//Allow up to 5px movement — exact match was too strict
					var dx = window.mouse.screenPos.x - startMousePos.x;
					var dy = window.mouse.screenPos.y - startMousePos.y;
					if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5 && window.mouse.isPressed) {
						//Call handler
						handler.apply(clickedElement);
					}

					//Clear variables
					activationTimeout = clickedElement = undefined
				}, holdTime);
			}
		}, true);
	}
});