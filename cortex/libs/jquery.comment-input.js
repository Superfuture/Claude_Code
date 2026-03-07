//Fades excess text and strips pasted HTML
$.fn.commentInput = function(maxChars, wrapElement, wrapAttributes) {
	var that = this[0], lastHTML,　lastState;
	
	//Clear previous interval
	if ($(this).data('comment-input-interval'))
		clearInterval($(this).data('comment-input-interval'));
	//Skip initial processing if this element has not been processed before
	else {
		lastHTML = that.innerHTML;
		lastState = 'OK';
	}
	
	var interval = setInterval(function() {
		//Only trigger on change
		if (lastHTML == that.innerHTML) return;
		lastHTML = that.innerHTML;
		
		var children = $(that).children();
		if (children.length == 0 || children.length == 1 && children.is(wrapElement) && children.children().length == 0) {
			var len = $(that).text().length;
			if (lastState == 'CUTOFF' && len > maxChars && $(that).find(wrapElement).text().length == len - maxChars ||
					lastState == 'OK' && len <= maxChars) {
				return;
			}
		}
		
		// Save the selection
	  var savedSel = rangy.saveSelection();

	  // Strip HTML and extract rangy markers
		var markers = [ ], text = '', htmlPos = 0;

		function escapeForHTML(text) {
			return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;');
		}

		function processNode(node) {
			if (node.nodeType == 3) 
				text += escapeForHTML(node.nodeValue);
			else if (node.nodeName == 'SPAN' && node.id && node.id.indexOf('selectionBoundary_') === 0)
				markers.push({ index: text.length, html: node.outerHTML });
			else
				for (var i = 0; i < node.childNodes.length; ++i)
					processNode(node.childNodes[i]);
		}

		processNode(that);

		// Do formatting
		var getOffset, markerOffset = 0;
		
		if (text.length > maxChars) {
			var startTag = '<' + wrapElement + ' ' + wrapAttributes + '>';
			var endTag = '</' + wrapElement + '>';
			
			text = text.substr(0, maxChars) + startTag + text.substr(maxChars) + endTag;
			
			getOffset = function(index) {
				if (index > maxChars) return startTag.length;
				else return 0;
			};
			
			lastState = 'CUTOFF';
		}
		else {
			getOffset = function() { return 0; };
			lastState = 'OK';
		}

		// Re-inject markers
		for (var i = 0; i < markers.length; ++i) {
			var marker = markers[i];
			var index = marker.index + getOffset(marker.index) + markerOffset;

			text = text.substr(0, index) + marker.html + text.substr(index);
			markerOffset += marker.html.length;
		}

		that.innerHTML = text;

	  // Restore the original selection 
	  rangy.restoreSelection(savedSel);
	}, 20);
	
	$(this).data('comment-input-interval', interval);
	
	return $(this);
};