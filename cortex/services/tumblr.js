function Tumblr() {
	var that = this;
	
	this.loadData().then(() => {
		this.oauthClient = new OAuthClient({
			consumer: {
				consumerKey: 'OszCaEC5Y9OZbwwLYpw8EsrHx08QfejWo269WCreQYHcq9a6SQ',
				consumerSecret: 'V3S8qWHeJiToZOKD1GvWvOQHNU2QZWqADztZIAeijXWxr1dJTl',
				callbackURL: 'http://cortexapp.com/?service=tumblr'
			},
			serviceProvider: {
				signatureMethod: 'HMAC-SHA1',
				requestTokenURL: 'https://www.tumblr.com/oauth/request_token',
				userAuthorizationURL: 'https://www.tumblr.com/oauth/authorize',
				accessTokenURL: 'https://www.tumblr.com/oauth/access_token'
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
	
		//Migrate to newer API: replace blog url by hostname
		if (this.data.url !== undefined) {
			this.data.blog = /^https?:\/\/([\w.\-_]+)\//.exec(this.data.url)[1];
			delete this.data.url;
	
			this.saveData();
		}
	})
}

Tumblr.prototype = new Service('Tumblr');

Tumblr.prototype.background = '#545b6c';

Tumblr.prototype.connect = function(popup, success, error) {
	var that = this;

	this.oauthClient.authorize(popup, function() {
		that.oauthClient.request({
			action: 'https://api.tumblr.com/v2/user/info',
			dataType: 'json',
			success: function(response) {
				var blogs = response.response.user.blogs;

				var blogUrl = _.find(blogs, function(blog) {
					return blog.primary === true;
				}).url;

				that.data.blog = /^https?:\/\/([\w.\-_]+)\//.exec(blogUrl)[1];
				
				that.saveData();
				success();
			},
			error: function() {
				delete that.data.oauth;
				that.saveData();

				error();
			}
		});
	}, error);
};

Tumblr.prototype.finishConnecting = function(data) {
	this.oauthClient.completeAuthorization(data.oauth_verifier);
};

Tumblr.prototype.disconnect = function() {
	delete this.data.oauth;
	this.saveData();
};

Tumblr.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.oauth !== undefined && this.data.oauth.isAuthorized;
};

Tumblr.prototype.post = function(options) {
	var that = this, data;
	
	//Find hashtags
	var tagRegex = /(^|[\s.,;])#(\w+)\b/g;
	var tags = [ ], match;
	
	while (match = tagRegex.exec(options.message))
		tags.push(match[2]);
		
	//Remove tags from message
	if (options.message) options.message = options.message.replace(tagRegex, '');
	
	if (options.type == 'link' && /^https?:\/\/www\.youtube\.com\/watch/.test(options.link))
		data = {
			type: 'video',
			embed: options.link,
			caption: options.message || options.title
		};
	else if (options.type == 'link' && /^https?:\/\/vimeo\.com\/\d+(\?|#|$)/.test(options.link)) {
		var videoId = /^https?:\/\/vimeo\.com\/(\d+)(\?|#|$)/.exec(options.link)[1];

		data = {
			type: 'video',
			embed: '<iframe src="http://player.vimeo.com/video/' + videoId + '?title=0&amp;byline=0&amp;portrait=0" width="398" height="224" frameborder="0"></iframe>',
			caption: options.message || options.title
		};
	}
	else if (options.type == 'link')
		data = { 
			type: 'link',
			title: options.title,
			url: options.link,
			description: options.message
		}; 
	else if (options.type == 'image') 
		data = { 
			type: 'photo',
			link: options.link,
			source: options.image,
			caption: options.message
		};
		
	data.tags = tags.join(',');
	
	this.oauthClient.request({
		action: 'https://api.tumblr.com/v2/blog/' + this.data.blog + '/post',
		parameters: data,
		dataType: 'json',
		success: function(response) {
			options.success({
				linkToPost: 'https://'+that.data.blog+'/post/'+response.response.id_string,
				_id: response.response.id_string
			});
		},
		error: options.error
	});
};

Tumblr.prototype.undo = function(post, success, error) {
	this.oauthClient.request({
		action: 'https://api.tumblr.com/v2/blog/' + this.data.blog + '/post/delete',
		parameters: { id: post },
		success: success,
		error: error
	});
};