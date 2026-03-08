$('#services').listCortexServices();

// Sound toggle — persist preference
chrome.storage.local.get(['soundEnabled'], function(result) {
	var enabled = result.soundEnabled !== false; // default on
	$('#sound-toggle').prop('checked', enabled);
});

$('#sound-toggle').on('change', function() {
	chrome.storage.local.set({ soundEnabled: this.checked });
});