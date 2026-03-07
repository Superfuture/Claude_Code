function PieMenu(options) {
	options = $.extend({
		cancel: function() { },
		sliceSelected: function() { },
		subPieDelay: 500,
		modeDelay: 500,
		preventExplosion: false
	}, options);
	
	this.slices = options.slices;

	var pieMenu = this;
	var subPieTimeout, modeTimeout;
	
	//Event handlers
	var enterSlice = function(pie) {
		if (pie.isAnimated) return;
		
		this.mouseEnter();
		pieMenu.hoveredSlice = this;
		
		var slice = this;
		
		//If this slice has a sub pie, show it!
		if (this.pie) {
			subPieTimeout = setTimeout(function() {
				pieMenu.hoveredSlice.mouseLeave();
				hidePie(pieMenu.foregroundPie, 'fade');
	
				pieMenu.backgroundPies.push(pieMenu.foregroundPie);
				pieMenu.foregroundPie = slice.pie;
				delete pieMenu.hoveredSlice;
				
				showPie(slice.pie);
			}, options.subPieDelay);
		}
		else if (window.mouse.isPressed) {
			modeTimeout = setTimeout(function() {
				options.sliceSelected(slice, true);
			}, options.modeDelay);
		}
	};
	var mousedownSlice = function(pie) {
		if (!modeTimeout && !pie.isAnimated) 
			modeTimeout = setTimeout(function() {
				options.sliceSelected(this, true);
			}, options.modeDelay);
	};
	var mouseupSlice = function(pie) {
		if (!pie.isAnimated) {
			clearTimeout(subPieTimeout); subPieTimeout = null;
			clearTimeout(modeTimeout); modeTimeout = null;
			
			options.sliceSelected(this, false);
		}
	};
	var leaveSlice = function() {
		//Turn previously hovered slice grey
		if (pieMenu.hoveredSlice) pieMenu.hoveredSlice.mouseLeave();
		
		clearTimeout(subPieTimeout); subPieTimeout = null;
		clearTimeout(modeTimeout); modeTimeout = null;
		delete pieMenu.hoveredSlice;
	};
	var mouseupOutside = function() {
		if (!pieMenu.foregroundPie.isAnimated) options.cancel();
	};

	//Hides all non-root slices
	this.reset = function() {
		if (this.hoveredSlice) {
			this.hoveredSlice.mouseLeave();
			delete this.hoveredSlice;
		}
		
		this.backgroundPies = [ ];
		this.foregroundPie = this.rootPie;
	};
	
	//Create sub pies
	this.slices.recursiveEach(function() {
		return this._children;
	}, function() {
		if (this.children instanceof Array && this.children.length > 0) {
			this.pie = new Pie(50, 130, this.children);
			setupPie(this.pie);
			
			//Hide children to prevent creation of a multi-layer pie
			this._children = this.children; delete this.children;
		}
	});
	
	//Create root pie
	this.rootPie = new Pie(50, 130, this.slices);
	setupPie(this.rootPie);
	
	function setupPie(pie) {
		pie.slices.each(function() {
			//Attach event handlers
			(function(slice) {
				slice.set.mouseover(function() {
					enterSlice.call(slice, pie);
				}).mouseout(function() {
					leaveSlice.call(slice, pie);
				}).mousedown(function() {
					mousedownSlice.call(slice, pie);
				}).mouseup(function() {
					mouseupSlice.call(slice, pie);
				});
			})(this);
		});
		
		pie.background.mouseup(mouseupOutside);
	}
	
	function showPie(pie) {
		pieMenu.position = window.mouse.screenPos;
		pieMenu.commentBoxBounds = options.calculateCommentBoxBounds(pieMenu.position);
		pie.arrangeSlices(pieMenu.position, pieMenu.commentBoxBounds);
		
		pie.element.css({
			display: 'block',
			opacity: 0,
			webkitTransform: 'scale(0,0)'
		});
			
		animatePie(pie, 1, 1);
	}

	function hidePie(pie, animation, box) {
		clearTimeout(subPieTimeout);
		clearTimeout(modeTimeout);
		
		if (animation == 'morph') {
			pie.isAnimated = true;
			
			pie.morphToBox(pieMenu.commentBoxBounds.left, pieMenu.commentBoxBounds.top, pieMenu.commentBoxBounds.width, 
						pieMenu.commentBoxBounds.height, box.cornerRadius, box.borderThickness, box.fill, box.stroke, 200, function() {
				
				pie.element.hide();
				pie.isAnimated = false;
				
				//Avoid messing up pie
				setTimeout(function() {
					pie.resetAfterMorph();
				}, 100);
			});
		}
		else {
			var scale = 1;
			
			if (animation == 'implode') scale = 0;
			else if (animation == 'explode') scale = 2;
			
			animatePie(pie, scale, 0, function() {
				pie.element.hide();
			});
		}
	}
	
	//Animate pie manually so we can animate the transform
	function animatePie(pie, scale, opacity, callback) {
		pie.isAnimated = true;
		
		var computedStyle = window.getComputedStyle(pie.element[0]);
		
		var currentOpacity = parseFloat($(pie.element).css('opacity'));;
		var opacityDelta = opacity - currentOpacity;
		
		var currentScale = 1;
		var numberPattern = /(\d+(\.\d+)?)/;
		var match;
		
		if (match = numberPattern.exec($(pie.element).css('-webkit-transform'))) currentScale = parseFloat(match[0]);
		
		var scaleDelta = scale - currentScale;
		
		const duration = 200;
		var startTime = +new Date;
		
		if (pie.animation) clearInterval(pie.animation);
		
		pie.animation = setInterval(function() {
			var time = Math.min((+new Date - startTime) / duration, 1);
			
			pie.element[0].style.opacity = currentOpacity + opacityDelta * time;

			var scale = currentScale + scaleDelta * time;
			pie.element[0].style.webkitTransform = 'scale(' + scale + ',' + scale + ') translate3d(0, 0, 0)';
			
			if (time == 1) {
				clearInterval(pie.animation);
				delete pie.animation;
				pie.isAnimated = false;
				if (callback) callback();
			}
		}, $.fx.interval);
	}
	
	this.show = function() {
		this.reset();
		this.isVisible = true;
		
		this.foregroundPie = this.rootPie;
		showPie.call(this, this.rootPie);
	};
	
	this.hide = function(secondaryFunction, box) {
		this.isVisible = false;
		
		var animation;
		
		if (secondaryFunction || options.preventExplosion) animation = 'morph';
		else if (this.hoveredSlice !== undefined) animation = 'explode';
		else animation = 'implode';
		
		hidePie(this.foregroundPie, animation, box);
	};

	this.reset();
}
