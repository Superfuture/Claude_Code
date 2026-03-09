function LinkedIn() {
	this.clientId     = 'YOUR_LINKEDIN_CLIENT_ID';
	this.clientSecret = 'YOUR_LINKEDIN_CLIENT_SECRET';
	this.redirectUri  = 'http://cortexapp.com/?service=linkedin';
	this.loadData();
}

LinkedIn.prototype = new Service('LinkedIn');

LinkedIn.prototype.background = '#0077b5';
LinkedIn.prototype.icon = 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=256';

LinkedIn.prototype.connect = function(popup, success, error) {
	var that = this;

	var authUrl = 'https://www.linkedin.com/oauth/v2/authorization?' +
		'response_type=code' +
		'&client_id=' + that.clientId +
		'&redirect_uri=' + encodeURIComponent(that.redirectUri) +
		'&scope=openid%20profile%20w_member_social';

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

LinkedIn.prototype.finishConnecting = function(params) {
	var that = this;
	if (!params.code) return;

	// Exchange authorization code for access token
	fetch('https://www.linkedin.com/oauth/v2/accessToken', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type:    'authorization_code',
			code:          params.code,
			redirect_uri:  that.redirectUri,
			client_id:     that.clientId,
			client_secret: that.clientSecret
		})
	})
	.then(function(res) { return res.json(); })
	.then(function(token) {
		if (!token.access_token) throw new Error('No token');
		that.data.accessToken = token.access_token;

		// Fetch the person's ID via the OIDC userinfo endpoint
		return fetch('https://api.linkedin.com/v2/userinfo', {
			headers: { 'Authorization': 'Bearer ' + token.access_token }
		})
		.then(function(res) { return res.json(); })
		.then(function(profile) {
			that.data.personId = profile.sub;
			that.saveData();
		});
	})
	.catch(function(err) {
		console.error('LinkedIn finishConnecting error:', err);
	});
};

LinkedIn.prototype.disconnect = function() {
	this.data = {};
	this.saveData();
};

LinkedIn.prototype.isConnected = async function() {
	await this.loadData();
	return !!this.data.accessToken;
};

LinkedIn.prototype.post = function(options) {
	var that = this;

	var body = {
		author: 'urn:li:person:' + that.data.personId,
		lifecycleState: 'PUBLISHED',
		specificContent: {
			'com.linkedin.ugc.ShareContent': {
				shareCommentary: {
					text: (options.message || '') + (options.link ? '\n' + options.link : '')
				},
				shareMediaCategory: 'ARTICLE',
				media: [{
					status: 'READY',
					description: { text: options.message || options.title || '' },
					originalUrl: options.link || '',
					title: { text: options.title || '' }
				}]
			}
		},
		visibility: {
			'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
		}
	};

	fetch('https://api.linkedin.com/v2/ugcPosts', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + that.data.accessToken,
			'Content-Type': 'application/json',
			'X-Restli-Protocol-Version': '2.0.0'
		},
		body: JSON.stringify(body)
	})
	.then(function(res) { return res.json(); })
	.then(function(data) {
		if (data.id) {
			options.success({ linkToPost: 'https://www.linkedin.com/feed/' });
		} else {
			console.error('LinkedIn post error:', JSON.stringify(data));
			options.error('Could not post to LinkedIn');
		}
	})
	.catch(function() {
		options.error('Could not post to LinkedIn');
	});
};
