function Facebook() {
	this.loadData();
}

Facebook.prototype = new Service('Facebook');

Facebook.prototype.background = '#1877F2';
Facebook.prototype.supportsMessage = false;

// No OAuth needed — Facebook share dialog is public
Facebook.prototype.connect = function(popup, success, error) {
	this.data.connected = true;
	this.saveData();
	success();
};

Facebook.prototype.disconnect = function() {
	this.data = {};
	this.saveData();
};

Facebook.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.connected === true;
};

Facebook.prototype.post = function(options) {
	var shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(options.link || options.shortUrl || '');
	chrome.tabs.create({ url: shareUrl });
	options.success({ linkToPost: 'https://www.facebook.com' });
};
