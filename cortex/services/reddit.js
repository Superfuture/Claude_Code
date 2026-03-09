function Reddit() {
	this.clientId     = 'YOUR_REDDIT_CLIENT_ID';
	this.clientSecret = 'YOUR_REDDIT_CLIENT_SECRET';
	this.redirectUri  = 'http://cortexapp.com/?service=reddit';
	this.loadData();
}

Reddit.prototype = new Service('Reddit');

Reddit.prototype.background = '#ff4500';
Reddit.prototype.icon = 'https://www.google.com/s2/favicons?domain=reddit.com&sz=256';

Reddit.prototype.connect = function(popup, success, error) {
	var that = this;

	var state = Math.random().toString(36).substr(2);

	var authUrl = 'https://www.reddit.com/api/v1/authorize?' +
		'client_id=' + that.clientId +
		'&response_type=code' +
		'&state=' + state +
		'&redirect_uri=' + encodeURIComponent(that.redirectUri) +
		'&duration=permanent' +
		'&scope=submit%20identity';

	popup(authUrl);

	// Poll storage until finishConnecting (running in background) saves the token.
	var attempts = 0;
	var poll = setInterval(function() {
		attempts++;
		if (attempts > 300) { clearInterval(poll); error(); return; }

		that.loadData().then(function() {
			if (that.data.accessToken) {
				clearInterval(poll);
				success();
			}
		});
	}, 1000);
};

Reddit.prototype.finishConnecting = function(params) {
	var that = this;
	if (!params.code || params.error) return;

	// Exchange authorization code for access token using Basic auth
	fetch('https://www.reddit.com/api/v1/access_token', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(that.clientId + ':' + that.clientSecret),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type:   'authorization_code',
			code:         params.code,
			redirect_uri: that.redirectUri
		})
	})
	.then(function(res) { return res.json(); })
	.then(function(token) {
		if (!token.access_token) throw new Error('No token');
		that.data.accessToken  = token.access_token;
		that.data.refreshToken = token.refresh_token;

		// Fetch the username so we can post to u/<username>
		return fetch('https://oauth.reddit.com/api/v1/me', {
			headers: {
				'Authorization': 'Bearer ' + token.access_token,
				'User-Agent': 'Cortex/2.1'
			}
		})
		.then(function(res) { return res.json(); })
		.then(function(me) {
			that.data.username = me.name;
			that.saveData();
		});
	})
	.catch(function(err) {
		console.error('Reddit finishConnecting error:', err);
	});
};

Reddit.prototype.disconnect = function() {
	this.data = {};
	this.saveData();
};

Reddit.prototype.isConnected = async function() {
	await this.loadData();
	return !!this.data.accessToken;
};

Reddit.prototype.post = function(options) {
	var that = this;

	// Posts to the user's own profile (u/<username>) — no subreddit needed
	fetch('https://oauth.reddit.com/api/submit', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + that.data.accessToken,
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'Cortex/2.1'
		},
		body: new URLSearchParams({
			api_type: 'json',
			kind:      'link',
			sr:        'u_' + that.data.username,
			title:     options.title || options.link || '',
			url:       options.link || '',
			resubmit:  'true'
		})
	})
	.then(function(res) { return res.json(); })
	.then(function(data) {
		if (data.json && data.json.errors && data.json.errors.length === 0) {
			var postUrl = (data.json.data && data.json.data.url) ||
				'https://www.reddit.com/user/' + that.data.username + '/submitted/';
			options.success({ linkToPost: postUrl });
		} else {
			var errs = data.json && data.json.errors ? JSON.stringify(data.json.errors) : 'unknown';
			console.error('Reddit post error:', errs);
			options.error('Could not post to Reddit');
		}
	})
	.catch(function() {
		options.error('Could not post to Reddit');
	});
};
