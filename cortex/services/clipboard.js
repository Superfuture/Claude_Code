function ClipboardService() {
	this.loadData();
}

ClipboardService.prototype = new Service('ClipboardService');

ClipboardService.prototype.background = '#607d8b';

// White clipboard SVG icon for the pie menu (no local PNG exists for this service)
ClipboardService.prototype.icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z'/%3E%3C/svg%3E";

ClipboardService.prototype.connect = function(popup, success, error) {
	this.data.connected = true;
	this.saveData();
	success();
};

ClipboardService.prototype.disconnect = function() {
	this.data = {};
	this.saveData();
};

ClipboardService.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.connected === true;
};

ClipboardService.prototype.post = function(options) {
	var text = (options.title || '') + (options.link ? '\n' + options.link : '');

	// post() runs in the background service worker, so use scripting.executeScript
	// to run the clipboard write in the page context where navigator.clipboard is available.
	chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
		if (!tabs || !tabs[0]) { options.error('No active tab'); return; }

		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			func: function(t) { return navigator.clipboard.writeText(t); },
			args: [text]
		}).then(function() {
			options.success({ linkToPost: options.link });
		}).catch(function() {
			options.error('Could not copy to clipboard');
		});
	});
};
