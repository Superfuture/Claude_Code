var UrlShortener = {
	shorten: function(url, success, error) {
		success(url);
		// URL shortening is disabled
		// $.ajax({
		// 	type: 'get',
		// 	url: 'http://api.bit.ly/v3/shorten',
		// 	data: {
		// 		longUrl: url,
		// 		domain: 'bit.ly',
		// 		login: 'jprim',
		// 		apiKey: 'R_b61ef34095674dcc4827b5ac28a86b27'
		// 	},
		// 	dataType: 'json',
		// 	success: function(response) {
		// 		if (response.status_code != 200) error(response);
		// 		else success(response.data.url);
		// 	},
		// 	error: error
		// });
	}
};