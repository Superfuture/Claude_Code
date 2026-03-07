function OAuthClient(options) {
	this.consumer = options.consumer;
	this.serviceProvider = options.serviceProvider;
	this.state = options.state !== undefined ? options.state : { };
	this.loadState = options.loadState;
	this.updateState = options.updateState;
	
	this.state = this.loadState();
	
	this.request = async function(options) { //Executes a signed OAuth request
		this.state = await this.loadState();
		
		var accessor = {
			consumerSecret: this.consumer.consumerSecret,
			tokenSecret: this.state.tokenSecret
		};
	
		if (this.consumer.scope) {
			var message = {
				method: 'POST',
				parameters: [ [ 'oauth_consumer_key', this.consumer.consumerKey ],
							  [ 'oauth_signature_method', this.serviceProvider.signatureMethod ],
			   				  [ 'scope', this.consumer.scope ]	]
			};

		} else {
			var message = {
				method: 'POST',
				parameters: [ [ 'oauth_consumer_key', this.consumer.consumerKey ],
							  [ 'oauth_signature_method', this.serviceProvider.signatureMethod ] ]
			};
		}

		if (options.method) {
			message.method = options.method;
		}	
			
		if (typeof(options.parameters) == 'object')
			for (var key in options.parameters)
				message.parameters.push([ key, options.parameters[key] ]);
		
		message.action = options.action;
		
    // If state token is not undefined 
    // and params doesn't already include the token
		if (
         typeof(this.state.token) != 'undefined' &&  
         (-1 == (JSON.stringify(message.parameters)).indexOf(JSON.stringify([ 'oauth_token', this.state.token ])))
    ) {
      message.parameters.push([ 'oauth_token', this.state.token ]);
    }
	
		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);

		const params = { 
			method: message.method,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'},
			body: OAuth.formEncode(message.parameters)
		}
		fetch(message.action, params).then(async res => {
			if(res && res.status >= 200 && res.status <= 226) {
				var resType = res.headers.get("Content-Type") || '', result;

				if(!resType.includes("json")) {
					//Convert text response to object
					result = Object.fromEntries(new URLSearchParams(await res.text()))
				} else {
					result = await res.json()
				}
				options.success(result)
			} else {
				options.error()
			}
		}).catch(err => {
			options.error()
		})
	};
	
	this.authorize = function(popup, success, error) {
		var client = this;

		//Clear state
		this.state = { };
		this.updateState(this.state);
		//Acquire request token
		this.request({
			action: this.serviceProvider.requestTokenURL,
			parameters: { oauth_callback: client.consumer.callbackURL },
			success: function(response) {

				var parameters = OAuth.getParameterMap(response);
				client.state.token = parameters.oauth_token;
				client.state.tokenSecret = parameters.oauth_token_secret;
				client.updateState(client.state);

				//Send user to authorization
				popup(client.serviceProvider.userAuthorizationURL +
							'?oauth_token=' + escape(client.state.token));
				//Wait for background to acquire verifier via tab URL interception
				var interval = setInterval(async function() {
					client.state = await client.loadState();
					if (client.state.verifier !== undefined) {
						//Acquire access token
						client.request({
							action: client.serviceProvider.accessTokenURL,
							parameters: {
								oauth_verifier: client.state.verifier,
								oauth_token: client.state.token
							},
							success: function(response) {
								var parameters = OAuth.getParameterMap(response);

								client.state.token = parameters.oauth_token;
								client.state.tokenSecret = parameters.oauth_token_secret;
								client.state.isAuthorized = true;
								client.updateState(client.state);

								success(); //Done!
							},
							error: error
						});

						clearInterval(interval);

						delete client.state.verifier;
						client.updateState(client.state);
					}
				}, 40);
			},
			error: error
		});
	};
	
	this.completeAuthorization = async function(verifier) {

		this.state = await this.loadState();
		this.state.verifier = verifier;
		this.updateState(this.state);
	};
	
	this.isAuthorized = function() {
		return this.state.isAuthorized === true;
	};
}
