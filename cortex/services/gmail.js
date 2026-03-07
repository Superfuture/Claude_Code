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
    that.data.token = token
    that.finishConnecting(token)

    fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token,
    {}).then((res) => {
      if(res.status == 200) {
        success();
      } else {
        that.disconnect();
        error();
      }
    }).catch((err) => {
      that.disconnect();
      error();
    })
		
	});
};

Gmail.prototype.finishConnecting = function(token) {

	this.data.token = token;
	this.saveData();
	this.getUserEmail(this.data)
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
		
	var message = 'From: ' + escapeEmail(this.data.userEmail) + '\r\n' +
		'To: ' + escapeFrom(options.recipients) + '\r\n' +
		'Subject: ' + escapeEmail(options.title) + '\r\n\r\n' + // TODO: Escape
		options.message + '\r\n' +
		options.link + '\r\n\r\n' +
		'Sent from my Cortex';

	var requestBody = JSON.stringify({ raw: btoa(unescape(encodeURIComponent(message))).replace(/\+/g, '-').replace(/\//g, '_') });
	const url = 'https://www.googleapis.com/gmail/v1/users/me/messages/send?access_token=' + this.data.token
	
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: requestBody
	}).then(async (res) => {
		res = await res.json(); 
		if(!res.error) {
			options.success({
				linkToPost: 'https://mail.google.com/mail/u/0/#sent/' + res.id
			})
		} else {
			options.error('Could not send email');
		}
	}).catch((err) => {
		options.error('Could not send email');
	})
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
