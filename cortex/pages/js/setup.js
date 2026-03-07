const that = this;

$('#services').listCortexServices( {
	connected: async function() {
		$('#next').removeClass('disabled');
		this.loadData()
		const setupCompleted = await checkSetupCompleted();
		if (!setupCompleted) injectCortex();
	},
	disconnected: async function() {
		for (var i in services)
			if (services.hasOwnProperty(i) && await services[i].isConnected()) return;
			
		$('#next').addClass('disabled');
	}
});
checkConnections();

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

async function checkConnections() {
	for (var i in services) {
		if (services.hasOwnProperty(i) && await services[i].isConnected()) {
			$('#next').removeClass('disabled');
			break;
		}
	}
}

$('#next').click(function() {
	if ($(this).is('.disabled')) {
		alert('You have to add one or more services before using Cortex');
		return false;
	}
});

function injectCortex() {
	chrome.storage.local.set({setupCompleted: true})

	chrome.action.setPopup({ popup: '/pages/history.htm?popup' });
	
	//Inject Cortex into all open tabs
	var scripts = [ "libs/underscore.js",  "libs/basic.js", "libs/jquery.js", "libs/jquery.mousetracing.js", 
			"libs/jquery.longclick.js", "libs/raphael.js", "libs/raphael.pie.js", "libs/measure.js",  "libs/ratio.js",
			"libs/jquery.thumbnail.js", "libs/piemenu.js", "libs/jquery.patch-css-transforms.js",
			"libs/jquery.color.js", "libs/jquery.measure-image.js", "libs/rangy.js", "libs/jquery.comment-input.js",
			 "blacklist.js", "cortex.js" ];
	
	chrome.windows.getAll({ populate: true }, function(windows) {
		for (var i = 0; i < windows.length; ++i)
			for (var j = 0; j < windows[i].tabs.length; ++j) {
				var tab = windows[i].tabs[j];
				
				//Navigate from Cortex page in Chrome webstore to Cortex website
				//Extensions are disabled on webstore pages which causes users to think Cortex doesn't work
				if (tab.url.indexOf('https://chrome.google.com/webstore/detail/decglnkhpfoocpafihfbeodhgofefaoc') === 0)
					chrome.tabs.update(tab.id, { url: 'http://cortexapp.com/' });
				
				if (!/^https?:\/\//.test(windows[i].tabs[j].url)) continue;
				
				chrome.scripting.insertCSS({
					target: { tabId: windows[i].tabs[j].id },
					files: [ 'cortex.css' ]
				}).catch(function() {});

				chrome.scripting.executeScript({
					target: { tabId: windows[i].tabs[j].id },
					files: scripts
				}).catch(function() {});
			}
	});
}
