function Slack() {
	this.loadData();
}

Slack.prototype = new Service('Slack');

Slack.prototype.background = '#4a154b';
Slack.prototype.icon = 'https://www.google.com/s2/favicons?domain=slack.com&sz=256';

// Customise the auth form: single webhook URL field, no password field.
Slack.prototype.authPlaceholders = { username: 'Paste your Incoming Webhook URL', password: null };

// authenticate(webhookUrl, _, success, error) — called from the settings page auth lightbox.
Slack.prototype.authenticate = function(webhookUrl, _, success, error) {
	if (!webhookUrl || webhookUrl.indexOf('hooks.slack.com') === -1) {
		error();
		return;
	}

	// Validate the webhook with a test message
	fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text: 'Cortex connected to Slack.' })
	}).then(function(res) {
		if (res.ok) {
			this.data.webhookUrl = webhookUrl;
			this.saveData();
			success();
		} else {
			error();
		}
	}.bind(this)).catch(function() {
		error();
	});
};

Slack.prototype.disconnect = function() {
	this.data = {};
	this.saveData();
};

Slack.prototype.isConnected = async function() {
	await this.loadData();
	return !!this.data.webhookUrl;
};

Slack.prototype.post = function(options) {
	var that = this;

	var text = (options.message ? options.message + '\n' : '') +
		(options.title ? '*' + options.title + '*\n' : '') +
		(options.link || '');

	fetch(that.data.webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ text: text })
	}).then(function(res) {
		if (res.ok) {
			options.success({ linkToPost: options.link });
		} else {
			options.error('Could not post to Slack');
		}
	}).catch(function() {
		options.error('Could not post to Slack');
	});
};
