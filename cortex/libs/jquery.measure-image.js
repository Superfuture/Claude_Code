$.extend({
	measureImage: function(uri, callback) {
	  var img = new Image();
	  
	  $(img).load(function loaded() {
			if (img.width > 0) {
				callback(img.width, img.height);
			}
			else setTimeout(loaded, 40);
		});
		
		img.src = uri;
	}
});