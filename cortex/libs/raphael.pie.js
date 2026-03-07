//Creates an SVG pie
//Parameters:
//center: { x: number, y: number }
//innerR, outerR: number
//items: [ { image: string, background: color, ... }, ... ]
//The id field is optional, it will be added to the slice object for identification
//Returns: { pie: Raphael set, center: circle, slices: { set: set, path: path, overlay: path, image: image }}
function Pie(innerR, outerR, items) {
	if (Pie.lastId === undefined) Pie.lastId = -1;
	
	//Create a div for each pie
	this.element = $('<div id="cortex-pie-' + ++Pie.lastId + '" class="cortex-pie"></div>')
		.hide()
		.insertBefore('#cortex-overlay');
	
	//Initialize Raphael canvas
	this.paper = Raphael('cortex-pie-' + Pie.lastId, 0, 0);
	
	var pie = this;
	
	//Converts polar to cartesian coordinates
	function toCartesian(r, theta, offsetX, offsetY)  {
		var cartesian = {
			x: r * Math.cos(-theta),
			y: r * Math.sin(-theta)
		};
		
		if (offsetX !== undefined) cartesian.x += offsetX;
		if (offsetY !== undefined) cartesian.y += offsetY;
		
		return cartesian;
	}
	
	//Creates a new slice on the paper and returns a Slice object:
	//{ set, background, image / overlay, imageWidth (delayed), imageHeight (delayed) }
	function Slice(item) {
		//Create set for collective modification of slice
		item.set = this.paper.set();
		
		//Create dummy path (actual path is computed in arrangeSlices())
		var dummyPath = [ 'M', 0, 0, 'L', 10, 0, 'L', 10, 10, 'L', 0, 10, 'Z' ];
		
		//Create background element
		item.background = this.paper.path(dummyPath);
		item.background.attr('stroke-opacity', 0);
		item.set.push(item.background);
		
		//Regular image display at the center of the slice plus background color
		if (!item.fillWithImage) {
			item.background.attr('fill', item.backgroundColor);
			
			item.image = this.paper.image(item.image, 0, 0, 10, 10);
			item.set.push(item.image);
			
			//Hover effect
			item.mouseEnter = function() {
				item.background.animate({ fill: item.backgroundColorOnHover }, 100);
			};
			
			item.mouseLeave = function() {
				item.background.animate({ fill: item.backgroundColor }, 100);
			};
		}
		//Image filling entire slice
		else {
			//Create overlay for hover
			item.overlay = this.paper.path(dummyPath);
			item.set.push(item.overlay);
			
			item.overlay.attr({
				fill: '#000000',
				'stroke-opacity': 0,
				opacity: 0
			});
			
			//Hover effect
			item.mouseEnter = function() {
				item.overlay.animate({ opacity: 0.3 }, 100);
			};
			
			item.mouseLeave = function() {
				item.overlay.animate({ opacity: 0 }, 100);
			};
			
			//Preload image and measure it (used in arrangeSlices())
			$.measureImage(item.image, function(width, height) {
				item.imageWidth = width;
				item.imageHeight = height;
			});
			
			//Set background image
			item.background.attr('fill', 'url(' + item.image + ')');
		}
		
		return item;
	}

	//Initializes slices and creates background
	this.createSlices = function() {
		if (items.length == 0) return;

		//Create slices
		var slices = [ ];

		for (var i = 0; i < items.length; ++i)
			slices.push(Slice.call(this, items[i]));
		
		//Create background
		this.background = this.paper.rect(0, 0, screen.width, screen.height);
		this.background.attr({ fill: 'transparent', 'stroke-opacity': 0 }).toBack();
		
		return slices;
	};

	//Arranges the slices around the specified center
	this.arrangeSlices = function(center, box) {
		//Compute start and end angle
		var startAngle = -1, endAngle = 4;
		
		//Change start end angle angles in case of activation near edges or corners
		if (center) {
			var r = (innerR + outerR) / 2;
			if (center.x < r) { //Left edge
				var x = -center.x;
				var y = Math.sqrt(r * r - x * x);
				var angle = Ratio(Math.atan2(y, x), Math.PI).reduce();
				var angleDelta = Ratio(1).subtract(angle);
				startAngle = Ratio(1).add(angleDelta);
				endAngle = Ratio(3).subtract(angleDelta);
			}
			if (center.y < r) { //Top edge
				var y = center.y;
				var x = Math.sqrt(r * r - y * y);
				var angle = Ratio(Math.atan2(y, x), Math.PI).reduce();
				var angleDelta = Ratio(1, 2).subtract(angle);
				startAngle = startAngle > 0.5 + angleDelta ? startAngle : Ratio(0.5).add(angleDelta);
				endAngle = endAngle < 2.5 - angleDelta ? endAngle : Ratio(5, 2).subtract(angleDelta);
			}
			if (center.x > document.documentElement.clientWidth - r) { //Right edge
				var x = document.documentElement.clientWidth - center.x;
				var y = Math.sqrt(r * r - x * x);
				var angle = Ratio(Math.atan2(y, x), Math.PI).reduce();
				var angleDelta = angle;
				startAngle = startAngle > angleDelta ? startAngle : angleDelta;
				endAngle = endAngle	< 2 - angleDelta ? endAngle : Ratio(2).subtract(angleDelta);
			}
			if (center.y > document.documentElement.clientHeight - r) { //Bottom edge
				var y = -(document.documentElement.clientHeight - center.y);
				var x = Math.sqrt(r * r - y * y);
				var angle = Ratio(Math.atan2(y, x), Math.PI).reduce();
				var angleDelta = angle.multiply(-1);
				
				//Special conditions for the last corners
				if (center.x <= document.documentElement.clientWidth - r)
					startAngle = startAngle > 2 - angleDelta ? startAngle : Ratio(2).subtract(angleDelta);
				if (center.x >= r && 1 + angleDelta < endAngle)
					endAngle = Ratio((center.x <= document.documentElement.clientWidth - r ? 2 : 0) + 1).add(angleDelta);
			}
		}
		
		//Pick default angles if previous conditions didn't kick in
		if (startAngle == -1) startAngle = 0;
		if (endAngle == 4) endAngle = 2;

		const sliceAngle = Ratio(endAngle).subtract(startAngle).divide(items.length);
		const largeSliceAngle = Ratio(sliceAngle).add(Ratio(startAngle).subtract(endAngle).add(2).divide(2));
		var imageSize = Math.min(59, 59 * sliceAngle * Math.PI / 0.9);
		var that = this;
		
		//Move paper and place pie in the middle of the paper 
		//(necessary due to performance issues with animations on big papers)
		var paperBounds = {
			left: Math.min(center.x - outerR, box.left),
			top: Math.min(center.y - outerR, box.top),
			right: Math.max(center.x + outerR, box.left + box.width),
			bottom: Math.max(center.y + outerR, box.top + box.height)
		};
		
		paperBounds.width = paperBounds.right - paperBounds.left;
		paperBounds.height = paperBounds.bottom - paperBounds.top;
					
		this.center = center;
		center = this.centerOnPaper = { x: center.x - paperBounds.left, y: center.y - paperBounds.top };
		
		this.element.css({
			left: paperBounds.left + 'px',
			top: paperBounds.top + 'px',
			width: paperBounds.width + 'px',
			height: paperBounds.height + 'px',
			webkitTransformOrigin: center.x + 'px ' + center.y + 'px'
		});
		
		this.paper.setSize(paperBounds.width, paperBounds.height);
				
		//Arrange each slice
		_.each(this.slices, function(slice, i) {
			var currentAngle = Ratio(startAngle).add(Ratio(sliceAngle).multiply(i)), anglePerSlice = sliceAngle;
			var imgCurrentAngle = currentAngle, imgAnglePerSlice = anglePerSlice;
			
			if (i == 0) {
				anglePerSlice = largeSliceAngle; 
				currentAngle = Ratio(currentAngle).subtract(largeSliceAngle).add(sliceAngle);
			}
			if (i == that.slices.length - 1)
				anglePerSlice = largeSliceAngle;
			
			//Compute points
			var outerStart = toCartesian(outerR, currentAngle * Math.PI, center.x, center.y),
				outerEnd = toCartesian(outerR, (currentAngle + anglePerSlice + 0.01) * Math.PI, center.x, center.y),
				innerStart = toCartesian(innerR, currentAngle * Math.PI, center.x, center.y),
				innerEnd = toCartesian(innerR, (currentAngle + anglePerSlice + 0.01) * Math.PI, center.x, center.y),
				sliceCenter = toCartesian((outerR + innerR) / 2, (imgCurrentAngle + imgAnglePerSlice / 2) * Math.PI, 
					center.x, center.y);
						
			//Store angles in slice to allow later modification of path for the morph effect
			slice.startAngle = currentAngle;
			slice.endAngle = Ratio(currentAngle).add(anglePerSlice);
			slice.arcs = { };
			
			slice.path = [ ];
			
			//Adds an arc of the specified radius and end angle to the current path at the current position/angle
			//Splits up the arc into multiple segments that allow the pie menu to be morphed into a box later
			function addArc(x, y, r, a) {
				//Determine start angle (a can be negative since there is an inner and outer arc in each slice)
				var startAngle = a > 0 ? currentAngle : Ratio(currentAngle).subtract(a);
								
				//Determine start and end quadrant (note that quadrants are zero-based)
				var q0 = Math.floor(Ratio(startAngle).multiply(2)), qn = Math.floor(Ratio(startAngle).add(a).multiply(2));
				
				//Determine direction for for-loop (=sign(a))
				var step = a / Math.abs(a);
				
				//Adds a line segment to the path that is later prolonged to become a side of the box
				function addLine(x, y, angle) {
					var quadrant = Math.floor(Ratio(angle).multiply(2));
					slice.path.push(quadrant % 2 ? [ 'H', x ] : [ 'V', y ]);
				}
				
				//If we are starting at the beginning of a quadrant, add a line segment rightaway
				if (startAngle % 0.5 == 0) addLine(x, y, startAngle);
				
				//Iterate through quadrants and add arcs and lines
				for (var q = q0; q != qn + step; q += step) {
					//Determine end angle in this quadrant
					var endAngle = (q + (step == 1)) / 2;
					
					if (q == qn) {
						//Only in the last quadrant does the slice not last until the end of the quadrant
						endAngle = startAngle.add(a);
												
						//Return prematurely if arc has already been completed
						if (endAngle == (qn - (step == -1)) / 2) break;
					}
					
					//Skip arc/line in first quadrant if arc doesn't start before the end of the quadrant
					if (q == q0 && startAngle == endAngle) continue;
					
					//Calculate end point of arc
					var endX = center.x + Math.cos(endAngle * Math.PI) * r, endY = center.y - Math.sin(endAngle * Math.PI) * r;
					
					//Add segment to path and store angle for later use
					var arcSegment = [ 'A', r, r, 0, 0, +(a < 0), endX, endY ];
					slice.arcs[slice.path.length] = endAngle;
					slice.path.push(arcSegment);
					
					//If we arrived at the beginning of a quadrant, insert a line segment
					if (endAngle % 0.5 == 0) addLine(endX, endY, endAngle);
				}
			}
			
			//Build actual path
			slice.path.push([ 'M', innerStart.x, innerStart.y ]);
			slice.path.push([ 'L', outerStart.x, outerStart.y ]);
			addArc(outerStart.x, outerStart.y, outerR, Ratio(anglePerSlice));
			slice.path.push([ 'L', innerEnd.x, innerEnd.y ]);
			addArc(innerEnd.x, innerEnd.y, innerR, Ratio(anglePerSlice).negate());
			slice.path.push([ 'Z' ]);
			
			//Use path for background element			
			slice.background.attr('path', slice.path);
			
			//In case image should fill the background instead of being placed in the center of the slice
			if (slice.fillWithImage) {
				//Also use path for overlay element
				slice.overlay.attr('path', slice.path);
	
				//By default the fill image is tiled in original size, beginning from the top left of the path's bounding box
				//We need to change that to fill the entire path without repeating the image
				//Furthermore, we want to center the image
				
				//Find the pattern element generated by Raphael
				var pattern = document.getElementById(/\(#(.*?)\)/.exec(slice.background.node.attributes['fill'].nodeValue)[1]);
			
				//Get path's bounding box
				var bbox = slice.background.getBBox();
				
				//Calculate transform to be appliad to the image
				var transform = { };
				
				//Show as much of the image as possible
				transform.scale = Math.max(bbox.width / slice.imageWidth, bbox.height / slice.imageHeight);
				
				//Target (face) to close in on is known
				if (slice.center) {
					if (transform.scale < 1) transform.scale = 1; //Show target as big as possible without clipping (don't scale down)
					
					//Determine target position
					var targetCenter = { x: sliceCenter.x - bbox.x, y: sliceCenter.y - bbox.y };

					//Align image according to target
					transform.x = bbox.x + targetCenter.x - slice.center.x * transform.scale;
					transform.y = bbox.y + targetCenter.y - slice.center.y * transform.scale;
					
					//Find limits to ensure image fills path
					var minX = bbox.x + bbox.width - slice.imageWidth * transform.scale;
					var maxX = bbox.x;
					var minY = bbox.y + bbox.height - slice.imageHeight * transform.scale;
					var maxY = bbox.y;
					
					//Enforce these limits
					transform.x = Math.min(Math.max(transform.x, minX), maxX);
					transform.y = Math.min(Math.max(transform.y, minY), maxY);
				}
				//No target is known
				else {
					//Center image
					transform.x = bbox.x -(slice.imageWidth * transform.scale - bbox.width) / 2;
					transform.y = bbox.y -(slice.imageHeight * transform.scale - bbox.height) / 2;
				}
				
				//Get image from inside the pattern
				var image = pattern.childNodes[0];

				//Set image size
				image.setAttribute('width', slice.imageWidth);
				image.setAttribute('height', slice.imageHeight);
				
				//Apply transform to image
				image.setAttribute('transform', 'translate(' + transform.x + ', ' + transform.y + ') scale(' + transform.scale + ')');
				
				//Update pattern size according to scale
				pattern.setAttribute('width', bbox.x + slice.imageWidth * transform.scale);
				pattern.setAttribute('height', bbox.y + slice.imageHeight * transform.scale);
			}
			//Normal icon, centered in the slice
			else
				//Align image
				slice.image.attr({
					x: sliceCenter.x - imageSize / 2,
					y: sliceCenter.y - imageSize / 2,
					width: imageSize,
					height: imageSize
				});
		});
	};
	
	//Morphs the pie menu into a box
	this.morphToBox = function(x, y, w, h, c, b, fill, stroke, duration, callback) {
		var bounds = {
			left: Math.min(x, this.center.x - outerR),
			top: Math.min(y, this.center.y - outerR)
		};
		
		bounds.width = Math.max(w, this.center.x + outerR - bounds.left);
		bounds.height = Math.max(h, this.center.y + outerR - bounds.height);
		
		var startTransform = { x: 0, y: 0 };
		var endTransform = { x: 0, y: 0 };
		x -= this.element.offset().left - $(document).scrollLeft();
		y -= this.element.offset().top - $(document).scrollTop();
		
		function addAnimation(slice, segment, index, to) {
			if (!slice.animations) slice.animations = [ ];
			slice.animations.push({ segment: segment, index: index, from: segment[index], delta: to - segment[index] });
		}
		
		function calculatePoint(angle, inner, snapTo) {
			var quadrant = Math.floor(Ratio(angle).multiply(2)) % 4;
			
			if (angle % 0.5 != 0) {
				var cx = x + ((quadrant == 0 || quadrant == 3) ? (w - c) : c);
				var cy = y + ((quadrant == 2 || quadrant == 3) ? (h - c) : c);
				var r = inner ? (c - b) : c;
				return { x: cx + Math.cos(angle * Math.PI) * r, y: cy - Math.sin(angle * Math.PI) * r };					
			}
			else {
				var px = x, py = y, border = (inner ? b : 0);
				
				if (quadrant % 2 == 0) {
					px += (quadrant == 0) ? w - border : border;
					py += h / 2;
					
					if (snapTo != 'center')  {
						var sign = (quadrant == 2) ? 1 : -1;
						if (snapTo == 'start') sign *= -1;
						var delta = h / 2;
						py += sign * (h / 2 - c);
					}
				}
				else {
					px += w / 2;
					py += (quadrant == 1) ? border : h - border;
					
					if (snapTo != 'center') {
						var sign = (quadrant == 3) ? 1 : -1;
						if (snapTo == 'start') sign *= -1;
						px += sign * (w / 2 - c);
					}
				}

				return { x: px, y: py };
			}
		}
		
		_.each(this.slices, function(slice) {
      var currentAngle = slice.startAngle, inner = true, currentPos;
    	
      _.each(slice.path, function(seg, i) {
      	var pointIndex = -1;
     
				switch (seg[0]) {
					case 'L':
						inner = !inner;
					case 'M':
						currentPos = calculatePoint(currentAngle, inner, 'center');
						pointIndex = 1;
						break;
					case 'A':
						addAnimation(slice, seg, 1, inner ? c - b : c);
						addAnimation(slice, seg, 2, inner ? c - b : c);
						
						currentAngle = slice.arcs[i];
						currentPos = calculatePoint(currentAngle, inner, inner ? 'end' : 'start');
						pointIndex = 6;
						break;
					case 'H': case 'V':
						var snapTo = inner ? 'start' : 'end';
						
						if (!(seg[0] == 'H' && currentPos.x == x + w / 2 || seg[0] == 'V' && currentPos.y == y + h / 2))
							if (!inner && slice.path[i + 1][0] != 'A' || inner && slice.path[i - 1][0] != 'A') 
								snapTo = 'center';
						
						currentPos = calculatePoint(currentAngle, inner, snapTo);
						
						if (seg[0] == 'H') addAnimation(slice, seg, 1, currentPos.x);
						else addAnimation(slice, seg, 1, currentPos.y);

						break;
				}
		
				if (pointIndex != -1) {
					addAnimation(slice, seg, pointIndex, currentPos.x);
					addAnimation(slice, seg, pointIndex + 1, currentPos.y);
				}

			 	if (!slice.fillWithImage)	slice.background.animate({ fill: stroke }, duration);
				else slice.overlay.animate({ fill: stroke });
      });
		});
		
		this.middle = {
			path: [ [ 'M', this.centerOnPaper.x + innerR, this.centerOnPaper.y ],
							[ 'A', innerR, innerR, 0, 0, 0, this.centerOnPaper.x, this.centerOnPaper.y - innerR ],
							[ 'H', this.centerOnPaper.x ], 
							[ 'A', innerR, innerR, 0, 0, 0, this.centerOnPaper.x - innerR, this.centerOnPaper.y ],
							[ 'V', this.centerOnPaper.y ],
							[ 'A', innerR, innerR, 0, 0, 0, this.centerOnPaper.x, this.centerOnPaper.y + innerR ],
							[ 'H', this.centerOnPaper.x ],
							[ 'A', innerR, innerR, 0, 0, 0, this.centerOnPaper.x + innerR, this.centerOnPaper.y ],
							[ 'V', this.centerOnPaper.y ],
							[ 'Z' ] ]
		};
		
		this.middle.element = this.paper.path(this.middle.path).transform(startTransform).attr({ 'stroke-opacity': 0, fill: fill, opacity: 0 });
		var currentAngle = 0;
		
		_.each(this.middle.path, function(seg) {
			switch (seg[0]) {
				case 'A':
					currentAngle = Ratio(currentAngle).add(0.5);
					var pos = calculatePoint(currentAngle, true, 'start');
					addAnimation(pie.middle, seg, 1, c);
					addAnimation(pie.middle, seg, 2, c);
					addAnimation(pie.middle, seg, 6, pos.x);
					addAnimation(pie.middle, seg, 7, pos.y);
					break;
				case 'M': case 'H': case 'V':
					var pos = calculatePoint(currentAngle, true, 'end');
					if (seg[0] == 'H') addAnimation(pie.middle, seg, 1, pos.x);
					else if (seg[0] == 'V') addAnimation(pie.middle, seg, 1, pos.y);
					else {
						addAnimation(pie.middle, seg, 1, pos.x);
						addAnimation(pie.middle, seg, 2, pos.y);
					}
					break;
			}
		});		
		
		var start = +new Date;
		var animation = setInterval(function() {
			var time = Math.min((+new Date - start) / duration, 1);
						
			_.each(pie.slices.concat(pie.middle), function(slice) {
				_.each(slice.animations, function(animation) {
					animation.segment[animation.index] = animation.from + animation.delta * time;
				});
			
				if (slice == pie.middle) slice.element.attr({ path: slice.path, opacity: time });
				else {
					slice.background.attr({ path: slice.path });
					
					if (!slice.fillWithImage) {
						var transform = 't' + (startTransform.x + (endTransform.x - startTransform.x) * time.x) + ',' + 
							(startTransform.y + (endTransform.y - startTransform.y) * time);
						
						slice.image.transform(transform).attr({ opacity: 1 - time });
					}
					else slice.overlay.attr({ path: slice.path, opacity: time });
				}
			});
			
			if (time == 1) {
				clearInterval(animation);
				if (callback) callback();
			}
		}, $.fx.interval);
	};
	
	this.resetAfterMorph = function() {
		if (this.middle) {
			this.middle.element.remove();
			delete this.middle;
		}
		
		_.each(this.slices, function(slice) {			
			slice.background.attr('fill', slice.backgroundColor);
			delete slice.animations;
			
			if (!slice.fillWithImage) slice.image.attr({ transform:'', opacity: 1 });
			else slice.overlay.attr({ opacity: 0, fill: 'black' });
		});
		
		this.paper.setSize(2 * outerR, 2 * outerR);
		this.element.css({ width: 2 * outerR + 'px', height: 2 * outerR + 'px' });
	}
	
	//Initialize
	this.slices = this.createSlices();
};