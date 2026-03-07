importScripts(
	"/libs/oauth.js",
	"/libs/oauth.client.js",
	"/services/service.js",
	"/services/urlshortener.js",
	"/services/twitter.js",
	"/services/tumblr.js",
	"/services/gmail.js",
	"/services/instapaper.js",
	"/services/pocket.js",
	"/services/services.js"
);
var setupTab = false;

async function checkSetupCompleted() {
	const readLocalStorage = async (key) => {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get([key], function (result) {
				if (result[key] === undefined) {
					resolve(false);
				} else {
					resolve(true);
				}
			});
		});
	};
	return await readLocalStorage('setupCompleted');
}

init();

async function init() {
	const setupCompleted = await checkSetupCompleted();
	if(setupCompleted) {
		chrome.action.setPopup({ popup: '/pages/history.htm?popup' });
	} else {
		showSetup();
	}
}
async function showSetup() {
	if(setupTab ) {
		chrome.tabs.get(setupTab.id,existCheckCallback);
	} else {
		createSetupTab()
	}
}
function existCheckCallback() {
	if (chrome.runtime.lastError) {
			createSetupTab()
	} else {
		chrome.tabs.update(setupTab.id, {active: true})
	}
}
function createSetupTab() {
	chrome.tabs.create({
		url: '/pages/setup.htm'
	}).then((tab) => {
		setupTab = tab
	});
}

async function readLocalStorage(key) {
	const readLocalStorage = async (key) => {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get([key], function (result) {
				resolve(result[key]);
			});
		});
	};
	return await readLocalStorage(key);
}
//Migrate history from localStorage if necessary
readLocalStorage('history').then((history) => {
	if(!history) return;
	readLocalStorage('historyMigrated').then((historyMigrated) => {
		if(historyMigrated) return;
		var history = JSON.parse(history);
	
		for (var i = 0; i < history.length; ++i) {
			var item = history[i];
			item.date = new Date(item.date).toJSON();
			storeHistoryItem(item);
		}
		chrome.storage.local.set({historyMigrated: true})
	})

})

//Helper function to write history
function storeHistoryItem(item) {
	var objectToStore  = {
		//'id': null,
		'service': '', 
		'_id': '', 
		'linkToService': '', 
		'date': '', 
		'link': '', 
		'type': '', 
		'title': '', 
		'message': '', 
		'image': '', 
		'thumbnail': '', 
		'friendName': '', 
		'friendId': '' 
	};

	for (const [key, value] of Object.entries(objectToStore)) {
		objectToStore[key] = item[key] !== undefined ? item[key] : null;
	}
	
	if (item.friend) {
		objectToStore.friendName = item.friend.name;
		objectToStore.friendId = item.friend.id;
	}

	if (item._id === undefined) {
		objectToStore._id = item.linkToService;
	}

	saveToIndexedDB(objectToStore)
}

// Intercept OAuth callback redirects by watching tab URLs — works even if cortexapp.com is down
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	if (!changeInfo.url) return;
	var serviceMatch = /[?&]service=(.*?)(&|$)/.exec(changeInfo.url);
	if (!serviceMatch) return;

	var serviceName = serviceMatch[1][0].toUpperCase() + serviceMatch[1].substr(1);
	if (!services[serviceName] || !services[serviceName].finishConnecting) return;

	var params = Object.fromEntries(new URLSearchParams(new URL(changeInfo.url).search));
	services[serviceName].finishConnecting(params);
	chrome.tabs.remove(tabId);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	switch (request.action) {
		case 'post': //Generic handler to post to any service
			postThenRespond(request, sendResponse)
			
			break;
		case 'preparePost':
			var service = services[request.service];
			
			if (service.preparePost) services[request.service].preparePost(request.options, sendResponse);
			else sendResponse(request.options);
			
			break;
		case 'undo':
			undoThenRespond(request, sendResponse)
			
			break;
		case 'get-services-and-friends':

			getServicesAndFriendsThenRespond(sendResponse)
			break;
		case 'retrieve-history':
			getHistroyThenRespond(request.count, request.search, request.minId, request.maxId, sendResponse)
		  break;
		case 'get-extension-uri':
			sendResponse({ uri:  chrome.runtime.getURL() });
			break;
		case 'finish-connecting':
			services[request.service].finishConnecting(request.data);
			chrome.tabs.remove(sender.tab.id);
			sendResponse({ success: true });
			break;
		case 'shorten-url':
			UrlShortener.shorten(request.url, function(shortUrl) {
				sendResponse({ shortUrl: shortUrl });
			});
			break;
		case 'detect-faces':
			//detectFaces(); //See below
			sendResponse({ success: true });
			break;
	}
	return true;
});
async function postTo(serviceName, post) {
	//Retrieve service object
	var service = services[serviceName];
	if (!await service.isConnected()) return error();
	
	//Prepare history item
	post = Object.assign({}, post, {
		service: serviceName,
		date: new Date().toJSON(),
		success: onSuccess,
		error: onError
	});

	//Let service do the posting
	service.post(post);
	

	//Show sharing popup
	notifyTabs('pending', post);
	
	function notifyTabs(status, post, error) {
		chrome.tabs.query({}, function(tabs) {
			for (var i = 0; i < tabs.length; ++i) {
				chrome.tabs.sendMessage(tabs[i].id, {
					action: 'notify',
					status: status,
					post: post,
					error: error
				}, function(response) { void chrome.runtime.lastError; });
			}
		});
	}
	
	//After sharing was successful
	function onSuccess(options) {
		//Store post in history
		Object.assign(post, {
			linkToService: options.linkToPost,
			_id: options._id
		});
		
		storeHistoryItem(post);

		//Show success popup
		notifyTabs('success', post);
	};
	
	//Error handler
	function onError(error, textStatus, ajaxError) { 
		console.error(ajaxError || error);
		
		//Show error popup
		notifyTabs('error', post, ajaxError || error);
	};
}
async function postThenRespond(request, sendResponse) {

	var targetServices = [ ];
		  
	if (request.service == 'shareToAll') {
		for (var i in services) 
			if (await services[i].isConnected() && i !== 'Gmail')
				targetServices.push(i);
	}
	else  
		targetServices.push(request.service);
				
	for (var i = 0; i < targetServices.length; ++i)
		postTo(targetServices[i], request.options);
	
	sendResponse({ success: true });

}
async function undoThenRespond(request, sendResponse) {

	//Find requested post in database
	const result = await loadIdFromIndexedDB(request.post)
	
	services[result.service].undo(request.post, function() {
		//Post removed, now delete it from database
		deleteIdFromIndexedDB(result.id);
		sendResponse({ success: true });
	}, function() {
		sendResponse({ success: false });
	});
}
async function getHistroyThenRespond(limit, search, minId, maxId, sendResponse) {
	const items = await loadAllFromIndexedDB(limit, search, minId, maxId);
	sendResponse({ history: items });
}
async function getServicesAndFriendsThenRespond(sendResponse) {
	var shortUrlRequiredByAny = false, undoSupportedByAny = false, messageSupportedByAny = false, showShareToAll = 0;
	var connectedServices = {};

	
	for (var serviceName in services) {
		if (await services[serviceName].isConnected()) {
			var item = { 
				name: serviceName, 
				background: services[serviceName].background, 
				friendsBackground: services[serviceName].friendsBackground,
				requiresShortUrl: services[serviceName].requiresShortUrl,
				requiresMessage: services[serviceName].requiresMessage,
				supportsMessage: services[serviceName].supportsMessage !== false,
				canUndo: services[serviceName].undo !== undefined,
				maxLength: services[serviceName].maxLength
			};
			
			if (services[serviceName].loadFriends)
				if (services[serviceName].data.bestFriends)
					item.bestFriends = services[serviceName].data.bestFriends;
				else
					item.bestFriends = [ ];

			if (services[serviceName].loadContacts)
				if (services[serviceName].data.contacts)
					item.contacts = services[serviceName].data.contacts;
				else
					item.contacts = [ ];
			
			connectedServices[serviceName] = item;
			
			//Aggregate requirements of all services, necessary for share-to-all
			shortUrlRequiredByAny |= item.requiresShortUrl;
			undoSupportedByAny |= item.canUndo;
			messageSupportedByAny |= item.supportsMessage;
			
			if (serviceName != 'Gmail') ++showShareToAll;
		}
	}
	//Share-to-all if more than one non-Gmail service is connected
	if ((await Service.readLocalStorage('shareToAllEnabled')) == 'true' && showShareToAll > 1)
		connectedServices['shareToAll'] = {
			name: 'shareToAll',
			background: '#ff78be',
			requiresShortUrl: shortUrlRequiredByAny,
			supportsMessage: messageSupportedByAny,
			canUndo: undoSupportedByAny,
			maxLength: 140 //TODO: More flexibility
	};
	
	sendResponse({ services: connectedServices });
}
//Update face positions on start
//detectFaces();

//Periodically update face positions every 5 minutes
//setInterval(detectFaces, 5 * 60 * 1000);

async function detectFaces() {
	if(typeof services == 'undefined') return;
	for (var i in services) {
		var service = services[i];
		
		//Skip services that are not connected or do not support friends
		if (!await service.isConnected() || !await service.loadFriends) continue;
		
		for (var j = 0; j < service.data.bestFriends.length; ++j) {
			var friend = service.data.bestFriends[j];
			
			var img = new Image();
			img.src = friend.image + '&' + new Date().getTime(); //Prevent caching

			//Wait for image to load
			(function(service, i, friend, j) {
				img.onload = function() {
					var faces = $(this).faceDetection();
				  var n = 0, x = 0, y = 0;
			  
				  //Add coordinates of all faces detected with a confidence of at least 1
				  for (var k = 0; k < faces.length; ++k)
				    if (faces[k].confidence >= 1)
				      { ++n; x += faces[k].x + faces[k].width / 2; y += faces[k].y + faces[k].height / 2; }
			      
				  if (n > 0)
				    //Determine average coordinates and store position
						services[i].data.bestFriends[j].face = {
							x: x / n,
							y: y / n
						};
					else
					  delete services[i].data.bestFriends[j].face;
					
					services[i].saveData();
				};
			})(service, i, friend, j);
		}
	}
}
function saveToIndexedDB(object){
  return new Promise(
    function(resolve, reject) {
      //if (object.id === undefined) reject(Error('object has no id.'));
      var dbRequest = indexedDB.open("Cortex");

      dbRequest.onerror = function(event) {
        reject(Error("IndexedDB database error"));
      };

      dbRequest.onupgradeneeded = function(event) {
        var database    = event.target.result;
        var objectStore = database.createObjectStore('history', { keyPath: 'id', autoIncrement : true });
				objectStore.createIndex("_id", "_id", { unique: false })
      };

      dbRequest.onsuccess = function(event) {
        var database      = event.target.result;
        var transaction   = database.transaction(["history"], 'readwrite');
        var objectStore   = transaction.objectStore("history");
        var objectRequest = objectStore.put(object); // Overwrite if exists

        objectRequest.onerror = function(event) {
          reject(Error('Error text'));
        };

        objectRequest.onsuccess = function(event) {
          resolve('Data saved OK');
        };
      };
    }
  );
}
function deleteIdFromIndexedDB(id){
  return new Promise(
    function(resolve, reject) {
      var dbRequest = indexedDB.open("Cortex");

      dbRequest.onerror = function(event) {
        reject(Error("Error text"));
      };

      dbRequest.onupgradeneeded = function(event) {
        // Objectstore does not exist. Nothing to load
        event.target.transaction.abort();
        reject(Error('Not found'));
      };

      dbRequest.onsuccess = function(event) {
        var database      = event.target.result;
        var transaction   = database.transaction(["history"], "readwrite");
        var objectStore   = transaction.objectStore("history");
        var objectRequest = objectStore.delete(id);

        objectRequest.onerror = function(event) {
          reject(Error('Failed to Delete'));
        };

        objectRequest.onsuccess = function(event) {
          resolve();
        };
      };
    }
  );
}
function loadIdFromIndexedDB(_id){
  return new Promise(
    function(resolve, reject) {
      var dbRequest = indexedDB.open("Cortex");

      dbRequest.onerror = function(event) {
        reject(Error("Error text"));
      };

      dbRequest.onupgradeneeded = function(event) {
        // Objectstore does not exist. Nothing to load
        event.target.transaction.abort();
        reject(Error('Not found'));
      };

      dbRequest.onsuccess = function(event) {
        var database      = event.target.result;
        var transaction   = database.transaction(["history"]);
        var objectStore   = transaction.objectStore("history");
        var idIndex = objectStore.index('_id');
				var objectRequest = idIndex.get(_id);

        objectRequest.onerror = function(event) {
          reject(Error('Error text'));
        };

        objectRequest.onsuccess = function(event) {
          if (objectRequest.result) resolve(objectRequest.result);
          else reject(Error('object not found'));
        };
      };
    }
  );
}
function loadAllFromIndexedDB(limit, search = false, minId = null, maxId = null){
  return new Promise(
    function(resolve, reject) {
      var dbRequest = indexedDB.open("Cortex");

      dbRequest.onerror = function(event) {
        reject(Error("Error text"));
      };

      dbRequest.onupgradeneeded = function(event) {
        var database    = event.target.result;
        var objectStore = database.createObjectStore('history', { keyPath: 'id', autoIncrement : true });
        objectStore.createIndex("_id", "_id", { unique: false })
      };

      dbRequest.onsuccess = function(event) {
        var database    = event.target.result;
        var transaction = database.transaction(["history"]);
        var objectStore = transaction.objectStore("history");

        // Build key range for pagination
        var keyRange = null;
        if (maxId != null && minId != null)
          keyRange = IDBKeyRange.bound(minId, maxId, true, true);
        else if (maxId != null)
          keyRange = IDBKeyRange.upperBound(maxId, true);
        else if (minId != null)
          keyRange = IDBKeyRange.lowerBound(minId, true);

        var fetchLimit = (search || minId != null || maxId != null) ? undefined : (limit || 5000);
        var objectRequest = objectStore.getAll(keyRange, fetchLimit);

        objectRequest.onerror = function(event) {
          reject(Error('Error text'));
        };

        objectRequest.onsuccess = function(e) {
          if (!objectRequest.result) reject(Error('object not found'));
          var results = objectRequest.result;

          if (search && results.length > 0) {
            var q = search.toLowerCase();
            results = results.filter(function(result) {
              return (result.title && result.title.toLowerCase().includes(q)) ||
                     (result.message && result.message.toLowerCase().includes(q));
            });
          }

          results.sort(function(a, b) {
            var keyA = new Date(a.date), keyB = new Date(b.date);
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
          });

          // Apply limit after filtering
          if (limit && !search) results = results.slice(0, limit);

          resolve(results);
        };
      };
    }
  );
}