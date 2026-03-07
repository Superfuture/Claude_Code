//Finds the biggest image on the current website
jQuery.fn.findBiggestImage = function() {
	var maxArea = 0, maxImage = false;
	
	$(this).find('img').each(function() {
		//Exclude images from the Facebook CDN, FB doesn't like those
		if (/^https?:\/\/(([\w-]+)\.)*fbcdn\.net/.test(this.src)) return;
		
		//Reject invisible images
		if (!$(this).is(':visible') || $(this).css('visibility') != 'visible') return;
		
		var aspectRatio = $(this).width() / $(this).height();
		if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
		
		//Reject images with an aspect ratio > 2:1
		if (aspectRatio > 2) return;
		
		var area = $(this).width() * $(this).height();
		if (area > maxArea) { maxArea = area; maxImage = this.src; }
	});
	
	return maxImage;
};

jQuery.fn.thumbnail = function(callback) {
	var location = this[0].location ? this[0].location.href : false;
	
	if (location)
		if (/^https?:\/\/www.youtube.com\/watch/.test(location)) {
			var videoId = /(\?|&)v=([\w-_]+?)(&|$)/.exec(location)[2];
			callback('http://i.ytimg.com/vi/' + videoId + '/0.jpg'); return;
		}
		else if (/^https?:\/\/vimeo.com\/\d+(\?|#|$)/.test(location)) {
			var videoId = /^https?:\/\/vimeo\.com\/(\d+)(\?|#|$)/.exec(location)[1];
		
			$.ajax({
				type: 'get',
				dataType: 'json',
				url: 'https://vimeo.com/api/v2/video/' + videoId + '.json',
				success: function(response) {
					callback(response[0].thumbnail_medium);
				},
				error: function() {
					callback($(this).findBiggestImage());
				}
			});
		}
	else callback($(this).findBiggestImage());
};