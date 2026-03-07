$.fn.extend({
	longclick: function longClickHandler(holdTime, handler, filter) {
		var activationTimeout, clickedElement, startMousePos;
		
		//Aborts timeout and clears variables
		function cancel() {
			if (activationTimeout) {
				clearTimeout(activationTimeout);
				activationTimeout = clickedElement = undefined;
			}
		}
		
		//Add abortion handlers as early as possible, using capture
		document.addEventListener('mouseup', cancel, true);
		document.addEventListener('scroll', cancel, true);
		
		$(this).mousedown(function(e) {
			//Verify user conditions, left mouse button, first firing of event, no scrollbar clicked
			if (filter(e) && e.button == 0 && clickedElement === undefined && e.clientX < $(window).width() - 20) {
				clickedElement = e.target;
				startMousePos = { x: e.clientX, y: e.clientY };
				
				//Initiate timeout after holdTime
				activationTimeout = setTimeout(function() {
					//Check if mouse has moved, is still pressed
					if (window.mouse.screenPos.x == startMousePos.x &&
							window.mouse.screenPos.y == startMousePos.y &&
							window.mouse.isPressed) {
						//Call handler
						handler.apply(clickedElement);
					}
					
					//Clear variables
					activationTimeout = clickedElement = undefined
				}, holdTime);	
			}
		});
	}
});