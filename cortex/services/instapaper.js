function Instapaper() {
	this.loadData();
}

Instapaper.prototype = new Service('Instapaper');

Instapaper.prototype.background = '#353535';

Instapaper.prototype.authenticate = function(username, password, success, error) {
	var that = this;
	fetch('https://www.instapaper.com/api/authenticate', {
		method: 'POST',
		body: new URLSearchParams({
			username: username,
			password: password
		})
	}).then(async (res) => {
		if(res && res.status == 200) {
			that.data.username = username;
			that.data.password = password;
			that.saveData();
			success();
		} else {
			error();
		}
	}).catch((err) => {
		error()
	})
};

Instapaper.prototype.disconnect = function() {
	delete this.data.username;
	delete this.data.password;
	this.saveData();
};

Instapaper.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.username !== undefined;
};

Instapaper.prototype.post = function(options) {

	fetch('https://www.instapaper.com/api/add', {
		method: 'POST',
		body: new URLSearchParams({
			url: options.link,
			selection: options.message || '',
			username: this.data.username,
			password: this.data.password,
		})
	}).then(async (res) => {
		if(res && res.status == 200) {
			options.success({
				linkToPost: 'https://www.instapaper.com/text?u=' + encodeURIComponent(options.link),
				_id: true
			});
		} else {
			options.error();
		}
	}).catch((err) => {
		options.error()
	})
};

Instapaper.prototype.undo = function(post, success, error) {
	chrome.tabs.query({
		active: true,
		lastFocusedWindow: true
	}, function(tabs) {
		chrome.tabs.update(tabs[0].id, { url: 'https://www.instapaper.com/' });
	});
};

//Don't forget to add your service to the list in services.js!