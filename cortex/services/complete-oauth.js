var serviceMatch = /service=(.*?)(&|$)/.exec(window.location.search);

if (serviceMatch) {
  var service = serviceMatch[1][0].toUpperCase() + serviceMatch[1].substr(1);
  
	//Process GET parameters
	var parameters = { };
	
	var parameterSource = document.location.search;
	if (service == 'Facebook' || service == 'Gmail') parameterSource = document.location.hash;
	
	if (parameterSource != '') {
		var pairs = parameterSource.substring(1).split('&');
		for (var i = 0; i < pairs.length; ++i) {
			var keyVal = pairs[i].split('=');
			if (keyVal.length == 2) parameters[unescape(keyVal[0])] = unescape(keyVal[1]);
			else if (keyVal.length == 1) parameters[unescape(keyVal[0])] = null;
		}
	}

	chrome.runtime.sendMessage({ action: 'finish-connecting', service: service, data: parameters }, function() { });
}