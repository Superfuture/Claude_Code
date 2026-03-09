function Pinterest() {
	this.clientId = 'YOUR_PINTEREST_APP_ID';
	this.clientSecret = 'YOUR_PINTEREST_APP_SECRET';
	this.redirectUri = 'http://cortexapp.com/?service=pinterest';

	this.loadData();
}

Pinterest.prototype = new Service('Pinterest');

Pinterest.prototype.background = '#e60023';
Pinterest.prototype.supportsMessage = true;

Pinterest.prototype.connect = function(popup, success, error) {
	var that = this;

	var authUrl = 'https://www.pinterest.com/oauth/' +
		'?client_id=' + this.clientId +
		'&redirect_uri=' + encodeURIComponent(this.redirectUri) +
		'&response_type=code' +
		'&scope=pins%3Awrite%2Cboards%3Aread%2Cuser_accounts%3Aread';

	popup(authUrl);

	// Poll for access token after user authorizes
	var interval = setInterval(function() {
		that.loadData().then(function() {
			if (!that.data.accessToken) return;
			clearInterval(interval);
			success();
		});
	}, 500);
};

Pinterest.prototype.finishConnecting = function(data) {
	var that = this;
	if (!data.code) return;

	fetch('https://api.pinterest.com/v5/oauth/token', {
		method: 'POST',
		headers: {
			'Authorization': 'Basic ' + btoa(that.clientId + ':' + that.clientSecret),
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: 'grant_type=authorization_code' +
			'&code=' + encodeURIComponent(data.code) +
			'&redirect_uri=' + encodeURIComponent(that.redirectUri)
	})
	.then(function(res) { return res.json(); })
	.then(function(res) {
		if (res.access_token) {
			that.data.accessToken = res.access_token;
			if (res.refresh_token) that.data.refreshToken = res.refresh_token;
			that.saveData();
			that.fetchBoards();
		}
	});
};

Pinterest.prototype.fetchBoards = function() {
	var that = this;
	fetch('https://api.pinterest.com/v5/boards', {
		headers: { 'Authorization': 'Bearer ' + that.data.accessToken }
	})
	.then(function(res) { return res.json(); })
	.then(function(res) {
		if (res.items && res.items.length > 0) {
			that.data.boards = res.items.map(function(b) { return { id: b.id, name: b.name }; });
			that.data.boardId = res.items[0].id;
			that.saveData();
		}
	});
};

Pinterest.prototype.disconnect = function() {
	this.data = {};
	this.saveData();
};

Pinterest.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.accessToken !== undefined;
};

Pinterest.prototype.post = function(options) {
	var that = this;

	if (!this.data.boardId) {
		options.error('No Pinterest board selected.');
		return;
	}

	var body = {
		board_id: that.data.boardId,
		link: options.link || '',
		title: options.title || '',
		description: options.message || options.title || ''
	};

	if (options.image) {
		body.media_source = {
			source_type: 'image_url',
			url: options.image
		};
	}

	fetch('https://api.pinterest.com/v5/pins', {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + that.data.accessToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	.then(function(res) { return res.json(); })
	.then(function(res) {
		if (res.id) {
			options.success({ linkToPost: 'https://pinterest.com/pin/' + res.id + '/', _id: res.id });
		} else {
			options.error(res);
		}
	})
	.catch(function(err) { options.error(err); });
};
