function Twitter() { 
	var that = this;
		
	this.loadData().then(() => {
		this.oauthClient = new OAuthClient({
			consumer: {
				consumerKey: 'X1nTvyACNi7CVqspyg1BmA',
				consumerSecret: 'PI4LBHnmxQRKu2meg6Q0DrgOtUH6Y5xTgLqK0NBqMs',
				callbackURL: 'http://cortexapp.com/?service=twitter'
			},
			serviceProvider: {
				signatureMethod: 'HMAC-SHA1',
				requestTokenURL: 'https://api.twitter.com/oauth/request_token',
				userAuthorizationURL: 'https://api.twitter.com/oauth/authorize',
				accessTokenURL: 'https://api.twitter.com/oauth/access_token'
			},
			loadState: async function() {
				await that.loadData();
				if (that.data.oauth !== undefined) return that.data.oauth;
				else return { };
			},
			updateState: function(state) {
				that.data.oauth = state;
				that.saveData();
			}
		});
	})
}

Twitter.prototype = new Service('Twitter');

Twitter.prototype.background = '#95e4e8';
Twitter.prototype.requiresShortUrl = true;
Twitter.prototype.maxLength = 140;

Twitter.prototype.connect = function(popup, success, error) {
	this.oauthClient.authorize(popup, success, error);
};

Twitter.prototype.finishConnecting = function(data) {
	this.oauthClient.completeAuthorization(data.oauth_verifier);
};

Twitter.prototype.disconnect = function() {
	delete this.data.oauth;
	this.saveData();
};

Twitter.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.oauth !== undefined && this.data.oauth.isAuthorized;
};

Twitter.prototype.post = function(options) {
	//Build tweet from custom message or document title and shortened URL
	var tweet = (options.message || options.title) + ' ' + options.shortUrl;
	
	this.oauthClient.request({
		action: 'https://api.twitter.com/1.1/statuses/update.json',
		dataType: 'json',
		parameters: { status: tweet },
		success: function(response) {
			options.success({
				linkToPost: 'https://x.com/' + response.user.screen_name + '/status/' + response.id_str,
				_id: response.id_str
			});
		},
		error: options.error
	});
};

Twitter.prototype.preparePost = function(options, callback) {
	//Link to image if sharing image, otherwise use regular link
	var link = options.type == 'image' ? options.image : options.link;
	
	UrlShortener.shorten(link, function(shortUrl) {
		var maxMessageLength = 139 - shortUrl.length;
		
		callback(Object.assign({
			maxMessageLength: maxMessageLength,
			shortUrl: shortUrl
		}, options ));
	});
};

Twitter.prototype.undo = function(post, success, error) {
	this.oauthClient.request({
		action: 'https://api.twitter.com/1.1/statuses/destroy/' + post + '.json',
		dataType: 'json',
		success: success,
		error: error
	})
};