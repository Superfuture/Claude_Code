//Note: All functions still support a fallback for the old API v2

function Pocket() {
	//API v2 key
	this.apiKey = '5eDA6G59d7626K76f6p285fH4cT0d7b0';

	//API v3 OAuth consumer key
	this.consumerKey = '10595-0d3a8333736710fe395efdcd';

	this.loadData();
}

Pocket.prototype = new Service('Pocket');

Pocket.prototype.background = '#ee5f70';
Pocket.prototype.supportsMessage = false;

Pocket.prototype.connect = function(popup, success, error) {
	var redirectUri = escape('http://cortexapp.com?service=pocket'),
			that = this;

	
	//Obtain request token
	fetch('https://getpocket.com/v3/oauth/request', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Accept': 'application/json'
		},
		body: JSON.stringify({
			consumer_key: this.consumerKey,
			redirect_uri: redirectUri
		})
	}).then(async (res) => {
		if(res && res.status == 200) {
			res = await res.json()
			that.data.requestToken = res.code;
			that.saveData();

			//Send user to authorization
			popup('https://getpocket.com/auth/authorize' +
				'?request_token=' + escape(that.data.requestToken) +
				'&redirect_uri=' + redirectUri
			);

			//Wait for access token
			var interval = setInterval(function() {
				that.loadData();
				if (!that.data.accessToken) return;

				clearInterval(interval);
				success();
			}, 400);

		} else {
			error();
		}
	}).catch((err) => {
		error()
	})
};

Pocket.prototype.finishConnecting = function(data) {
	var that = this;

	//Obtain access token
	fetch('https://getpocket.com/v3/oauth/authorize', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Accept': 'application/json'
		},
		body: JSON.stringify({
			consumer_key: this.consumerKey,
			code: this.data.requestToken
		})
	}).then(async (res) => {
		if(res && res.status == 200) {
			res = await res.json()
			//Store access token
			delete that.data.requestToken;
			that.data.accessToken = res.access_token;
			that.saveData();
		}
	}).catch((err) => {
		
	})
};

Pocket.prototype.disconnect = function() {
	delete this.data.username;
	delete this.data.password;
	delete this.data.accessToken;

	this.saveData();
};

Pocket.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.accessToken !== undefined || this.data.username !== undefined;
};

Pocket.prototype.post = function(options) {
	var that = this, timeOfPost = new Date;
	
	//New API v3 using OAuth
	if (this.data.accessToken !== undefined) {

		fetch('https://getpocket.com/v3/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Accept': 'application/json'
			},
			body: JSON.stringify({
				url: options.link,
				title: options.title,
				consumer_key: this.consumerKey,
				access_token: this.data.accessToken
			})
		}).then(async (res) => {
			if(res && res.status == 200) {
				res = await res.json()
				var linkToPost;

				//Link to reading view on Pocket if possible
				if (res.item.extended_item_id)
					linkToPost = 'https://getpocket.com/a/read/' + res.item.extended_item_id;
				//Link to overview if not (e.g. for videos)
				else
					linkToPost = 'https://getpocket.com/a/queue/';
				
				options.success({
					linkToPost: 'https://getpocket.com/a/read/' + res.item.extended_item_id,
					_id: res.item.item_id
				})
			} else {
				options.error()
			}
		}).catch((err) => {
			options.error()
		});
	//Fallback for old API v1
	} else {
		fetch('https://readitlaterlist.com/v2/add', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-Accept': 'application/json'
			},
			body: {
				apikey: this.apiKey,
				username: this.data.username,
				password: this.data.password,
				url: options.link
			}
		}).then(async (res) => {
			if(res && res.status == 200) {
				//Fallback function to indicate success when id of posted item cannot be retrieved
				function fallbackSuccess() {
					options.success({
						linkToPost: 'http://text.readitlaterlist.com/v2/text?apikey=' + this.apiKey + '&url=' + escape(options.link),
						_id: options.link
					});
				}

				fetch('https://readitlaterlist.com/v2/get', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'X-Accept': 'application/json'
					},
					body: {
						apikey: that.apiKey,
						username: that.data.username,
						password: that.data.password,
						myAppOnly: 1,
						since: Math.floor(+timeOfPost / 1000) - 1
					}
				}).then(async (res) => {
					if(res && res.status == 200) {

						res = await res.json()

						for (id in res.list) {
							if (res.list.hasOwnProperty(id) && res.list[id].url == options.link) {
								return options.success({
									linkToPost: 'https://getpocket.com/a/read/' + escape(id),
									_id: options.link
								});
							}
						}
					} else {
						fallbackSuccess();
					}
				}).catch((err) => {
					fallbackSuccess();
				});
			} else {
				options.error()
			}
		}).catch((err) => {
			options.error()
		});
	}
};

Pocket.prototype.undo = function(post, success, error) {
	//New API v3 using OAuth
	if (this.data.accessToken !== undefined) {
		fetch('https://getpocket.com/v3/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Accept': 'application/json'
			},
			body: JSON.stringify({
				actions: [ {
					action: 'delete',
					item_id: post
				} ],
				consumer_key: this.consumerKey,
				access_token: this.data.accessToken
			})
		}).then(async (res) => {
			if(res && res.status == 200) {
				success()
			} else {
				error()
			}
		}).catch((err) => {
			error()
		});
	//Fallback for old API v1
	} else {
		fetch('https://readitlaterlist.com/v2/send', {
			method: 'GET',
			headers: {
				apikey: this.apiKey,
				username: this.data.username,
				password: this.data.password,
				read: JSON.stringify({ '0': { url: post } })
			},
			body: {
				actions: JSON.stringify([ {
					action: 'delete',
					item_id: post
				} ]),
				consumer_key: this.consumerKey,
				access_token: this.data.accessToken
			}
		}).then(async (res) => {
			if(res && res.status == 200) {
				success()
			} else {
				error()
			}
		}).catch((err) => {
			error()
		});
	}
};