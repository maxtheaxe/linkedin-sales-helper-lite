// const zoomManual = document.querySelector("#zoominfo-manual");
const nameSplit = document.querySelector("#namesplit");

function saveOptions(e) {
	e.preventDefault();
	chrome.storage.sync.set({
		settings: {
			// zoomManualSetting: zoomManual.checked,
			nameSplitSetting: nameSplit.checked
		}
	});
	console.log("saved");
}

function restoreOptions() {

	function setCurrentChoice(result) {
		// console.log(result.settings.zoomManualSetting, result.settings.nameSplitSetting);
		// zoomManual.checked = result.settings.zoomManualSetting;
		if (result.settings === undefined) {
			nameSplit.checked = false;
		}
		else {
			nameSplit.checked = result.settings.nameSplitSetting;
		}
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	chrome.storage.sync.get("settings", function(result) {
		setCurrentChoice(result);
	});
	// getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
