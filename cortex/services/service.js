function Service(name) {
	this.name = name;
}

Service.prototype.saveData = function() {
	const data = {};
	data[this.name + 'ServiceData'] = JSON.stringify(this.data)
	chrome.storage.local.set(data)
}

Service.prototype.loadData = async function() {
	const appStorage = await this.readLocalStorage(this.name + 'ServiceData');
	if (appStorage === undefined)
		this.data = { };
	else
		this.data = JSON.parse(appStorage);
}

Service.prototype.readLocalStorage = async function(key) {
	const readLocalStorage = async (key) => {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get([key], function (result) {
				resolve(result[key]);
			});
		});
	};
	return await readLocalStorage(key);
}

//Template for new services
function MyService() { }

MyService.prototype = new Service('MyService');

MyService.prototype.constructor = function() {
	//Initialization logic
};

MyService.prototype.authenticate = function(username, password, success, error) {
	//Verify if specified login is valid
	//Store username and password in localStorage if it is
	//Call success if authentication succeeded, and error if authentication failed or a general error occured
};
//OR:
MyService.prototype.connect = function(popup, success, error) {
	//Use different system to authenticate (like OAuth)
	//Direct the user to a verification page or something like that
	//Then call one of the specified callbacks
};

MyService.prototype.disconnect = function() {
	//Delete authentication information from localStorage
};

MyService.prototype.isConnected = function() {
	//Check if authentication data are stored in localStorage to determine if the user is connected to this service
};

MyService.prototype.post = function(options) {
	var options = {
		type: 'link|image',
		link: 'http://...',
		message: 'Brief description',
		image: 'http://... (optional)',
		friend: '## optional)',
		success: function() { },
		error: function() { }
	};
};

MyService.prototype.loadFriends = function(success, error) {
	//Load a list of friends that content can be posted to directly
	//Optional
};

MyService.prototype.loadContacts = function(success) {

};

//Don't forget to add your service to the list in services.js!
