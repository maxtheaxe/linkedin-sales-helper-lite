// toolbox.js for linkedin-sales-helper by maxtheaxe

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
	document.addEventListener("click", (e) => {

		// window.alert("hey");

		/**
		 * send a "collect" message to the content script in the active tab.
		 */
		function collect(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				command: "collect"
			});
		}

		/**
		 * send a "search" message to the content script in the active tab.
		 */
		function search(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				command: "search"
			});
		}

		/**
		 * Remove the page-hiding CSS from the active tab,
		 * send a "reset" message to the content script in the active tab.
		 */
		function reset(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				command: "reset",
			});
		}

		/**
		 * send a "export" message to the content script in the active tab.
		 * ref: https://stackoverflow.com/a/41420772/4513452
		 */
		function exportInfo(tabs) {
			// in background script, so DL api can be accessed
			chrome.runtime.sendMessage("export");
			// if it were in content script
			// chrome.tabs.sendMessage(tabs[0].id, {
			// 	command: "export"
			// });
		}

		/**
		 * Just log the error to the console.
		 */
		function reportError(error) {
			console.error(`Could not complete requested operation: ${error}`);
		}

		/**
		 * Get the active tab,
		 * then call appropriate method.
		 */
		if (e.target.id === "collect") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				collect(tabs);
			});
				// .then(collect)
				// .catch(reportError);
		}
		// else if (e.target.id === "search") {
		// 	chrome.tabs.query({active: true, currentWindow: true})
		// 		.then(search)
		// 		.catch(reportError);
		// }
		else if (e.target.id === "reset") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				reset(tabs);
			});
				// .then(reset)
				// .catch(reportError);
		}
		else if (e.target.id === "export") {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				exportInfo(tabs);
			});
				// .then(exportInfo)
				// .catch(reportError);
		}
		else if (e.target.id === "settings") {
			var openingPage = chrome.runtime.openOptionsPage();
		}
	});
}

// /**
//  * There was an error executing the script.
//  * Display the popup's error message, and hide the normal UI.
//  */
// function reportExecuteScriptError(error) {
// 	document.querySelector("#popup-content").classList.add("hidden");
// 	document.querySelector("#error-content").classList.remove("hidden");
// 	console.error(`Failed to execute sales helper content script: ${error.message}`);
// }

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
chrome.tabs.executeScript({file: "/content_scripts/helper.js"}, function() {
	listenForClicks();
});
// .then(listenForClicks)
// .catch(reportExecuteScriptError);

// listenForClicks();
