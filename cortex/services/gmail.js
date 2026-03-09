function Gmail() {
	var that = this;
	
	that.loadData();
}	
Gmail.prototype = new Service('Gmail');

Gmail.prototype.background = '#df5747';
Gmail.prototype.requiresMessage = true;

Gmail.prototype.connect = function(popup, success, error) {
	var that = this;

	chrome.identity.getAuthToken({interactive: true}, function(token) {
    if (chrome.runtime.lastError || !token) {
      console.log('Gmail auth error:', chrome.runtime.lastError && chrome.runtime.lastError.message);
      error();
      return;
    }

    fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token,
    {}).then((res) => {
      if(res.status == 200) {
        that.data.token = token;
        that.finishConnecting(token);
        success();
      } else {
        error();
      }
    }).catch((err) => {
      error();
    });

	});
};

Gmail.prototype.finishConnecting = function(token) {
	this.data.token = token;
	this.saveData();
	this.getUserEmail(this.data);
	this.loadContacts();
};

Gmail.prototype.loadContacts = function(success, error) {
	var that = this;

	chrome.identity.getAuthToken({ interactive: false }, function(token) {
		if (chrome.runtime.lastError || !token) {
			if (error) error();
			return;
		}

		fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses&pageSize=1000', {
			headers: { 'Authorization': 'Bearer ' + token }
		})
		.then(function(res) { return res.json(); })
		.then(function(res) {
			var contacts = [];
			if (res.connections) {
				res.connections.forEach(function(person) {
					var name = person.names && person.names[0] ? person.names[0].displayName : '';
					if (person.emailAddresses) {
						person.emailAddresses.forEach(function(emailObj) {
							if (emailObj.value) {
								contacts.push({ title: name || emailObj.value, email: emailObj.value });
							}
						});
					}
				});
			}
			that.data.contacts = contacts;
			that.saveData();
			if (success) success(contacts);
		})
		.catch(function(err) {
			console.error('Failed to load contacts:', err);
			if (error) error(err);
		});
	});
};

Gmail.prototype.disconnect = function() {
	// TODO: remove permissions
	this.data = {}
	this.saveData()
};

Gmail.prototype.isConnected = async function() {
	await this.loadData();
	return this.data.token !== undefined;
};
Gmail.prototype.getUserEmail = async function(data) {
	
	await fetch( 
		'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + data.token,
		{ 
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		}
	).then(async (res) => {
		res = await res.json()
		if(res && res.email) {
			data.userEmail = res.email
		}
	}).catch((err) => {
		console.log("GOOGLE PROFILE ERROR RESPONSE", err)
	})
	this.data = data;
	this.saveData();
};
Gmail.prototype.post = function(options) {
	var that = this;

	function escapeEmail(text) {
		return escapeFrom(text).replace(/,/g, '')
	}

	function escapeFrom(text) {
		return text.replace(/\r/g, '')
				   .replace(/\n/g, '')
				   .replace(/\t/g, '')
				   .replace(/"/g, '')
				   .replace(/</g, '')
				   .replace(/>/g, '');
	}

	function mimeEncodeSubject(text) {
		if (/[^\x00-\x7F]/.test(text))
			return '=?UTF-8?B?' + btoa(unescape(encodeURIComponent(text))) + '?=';
		return text;
	}

	function sendWithToken(token) {
		var body = '<p>' + (options.message || '') + '</p>' +
			'<p><a href="' + (options.link || '') + '">' + (options.link || '') + '</a></p>' +
			'<p>Sent from my <a href="http://cortexapp.com">Cortex</a></p>';

		var message = (that.data.userEmail ? 'From: ' + escapeEmail(that.data.userEmail) + '\r\n' : '') +
			'To: ' + escapeFrom(options.recipients || '') + '\r\n' +
			'Subject: ' + mimeEncodeSubject(escapeEmail(options.title || '')) + '\r\n' +
			'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
			body;

		var requestBody = JSON.stringify({ raw: btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_') });

		fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: requestBody
		}).then(async (res) => {
			var json = await res.json();
			if (!json.error) {
				options.success({
					linkToPost: 'https://mail.google.com/mail/u/0/#sent/' + json.id
				});
			} else {
				console.error('Gmail API error:', JSON.stringify(json.error));
				options.error('Could not send email');
			}
		}).catch((err) => {
			console.error('Gmail fetch error:', err);
			options.error('Could not send email');
		});
	}

	// Reload data first (service worker may have restarted and lost in-memory state)
	that.loadData().then(function() {
		function tryWithToken(token) {
			that.data.token = token;
			that.saveData();
			sendWithToken(token);
		}

		chrome.identity.getAuthToken({ interactive: false }, function(token) {
			if (!chrome.runtime.lastError && token) return tryWithToken(token);

			// Silent refresh failed — try interactive auth
			chrome.identity.getAuthToken({ interactive: true }, function(token2) {
				if (chrome.runtime.lastError || !token2) {
					options.error('Could not send email');
					return;
				}
				tryWithToken(token2);
			});
		});
	});
};

function parse(str) {
  if (typeof str !== 'string') {
    return {};
  }
  str = str.trim().replace(/^(\?|#|&)/, '');
  if (!str) {
    return {};
  }
  return str.split('&').reduce(function (ret, param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    // Firefox (pre 40) decodes `%3D` to `=`
    // https://github.com/sindresorhus/query-string/pull/37
    var key = parts.shift();
    var val = parts.length > 0 ? parts.join('=') : undefined;
    key = decodeURIComponent(key);
    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    val = val === undefined ? null : decodeURIComponent(val);
    if (!ret.hasOwnProperty(key)) {
      ret[key] = val;
    }
    else if (Array.isArray(ret[key])) {
      ret[key].push(val);
    }
    else {
      ret[key] = [ret[key], val];
    }
    return ret;
  }, {});
}
