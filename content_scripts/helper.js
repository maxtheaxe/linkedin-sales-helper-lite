// helper.js for linkedin-sales-helper by maxtheaxe

(function() {
	/**
	 * Check and set a global guard variable.
	 * If this content script is injected into the same page again,
	 * it will do nothing next time.
	 */
	if (window.hasRun) {
		return;
	}
	window.hasRun = true;


	/**
	 * returns boolean of whether obj is empty
	 */
	function isEmpty(obj) {
		for(var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}

	/**
	 * collect all leads from lead list page, extends given existing stored leads
	 */
	function collectLeads() {
		// verify that all leads have complete accounts, profile info
		let missingAccounts = document.querySelectorAll(
			"span.list-detail-account-matching__text");
		if (missingAccounts.length > 0) {
			// there's obv a better way to do multiline
			window.alert(
				"Some leads were missing info, so they were hidden and " +
				"excluded from the collection."
				);
			// return "error: incomplete info";
			// remove leads with missing info
			for (let i = 0; i < missingAccounts.length; i++) {
				// delete problematic lead (doesn't actually remove from linkedin)
				missingAccounts[i].parentNode.parentNode.parentNode.parentNode.remove();
			}
		}
		// identify names of all leads listed on page
		let leadNames = document.querySelectorAll(
			"[data-anonymize='person-name']");
		// identify titles of all leads listed on page
		let leadTitles = document.querySelectorAll(
			"[data-anonymize='job-title']");
		// identify companies of all leads listed on page
		// number of co names is dynamically sliced to number
		// of ppl names (since it's double)
		// if errors are caused, might need to delete extras assoc w missing accs
		let leadCompanies = Array.from(document.querySelectorAll(
			"[data-anonymize='company-name'")).slice(0, leadNames.length);
		let leadsInfo = []; // extracted info about each lead
		// extract, collect data about each lead (and clean up)
		for (let i = 0; i < leadNames.length; i++) {
			// extract name, remove whitespace/qualifications
			let name = leadNames[i].textContent.trim().split(",")[0]
			// extract title (with commas stripped for csv later)
			let title = leadTitles[i].textContent.trim().replaceAll(",", "");
			// extract company (with commas stripped for csv later)
			let company = leadCompanies[i].textContent.trim().replaceAll(",", "");
			// append info per lead to main list
			leadsInfo.push([name, title, company]);
		}
		// retrieve previously collected data from local storage
		browser.storage.local.get("leadsInfo", function(result) {
			let retrievedStorage = result.leadsInfo;
			// stringify for lazy dupe searching
			let unparsedStorage = JSON.stringify(retrievedStorage);
			// if there was previously collected data, extend it w/o dupes
			// verify these boolean statements, they seem sketchy
			if (!isEmpty(retrievedStorage)) {
				for (let i = 0; i < leadsInfo.length; i++) {
					// if not dupe, extend old list
					// (checks if name is substring of unparsed JSON)
					if (!unparsedStorage.includes(leadsInfo[i][0])) {
						// console.log(`here: ${typeof(retrievedStorage)}`);
						// console.log(`here: ${(retrievedStorage)}`)
						retrievedStorage.push(leadsInfo[i]);
					}
				}
				leadsInfo = retrievedStorage; // save extended list to leadsInfo
			}
			addLeadCounter(leadsInfo.length);
			// save collected data to local storage
			browser.storage.local.set({"leadsInfo": leadsInfo});
			console.log(leadsInfo);
		});
	}

	/**
	 * add counter element to linkedin page to reflect number leads collected
	 */
	function addLeadCounter(numLeads) {
		// if count element already exists on page, remove it
		if (document.getElementById("helper-counter")) {
			document.getElementById("helper-counter").remove();
		}
		// create element, add to page
		let leadCounter = document.createElement("p");
		leadCounter.id = "helper-counter";
		// borrow linkedin styling
		leadCounter.classList = `
			linkedin-sales-helper
			artdeco-button
			ml2 mr2 mt2
			artdeco-button--2
			artdeco-button--primary
			ember-view
			lists-nav-inline-action-buttons__share`;
		leadCounter.textContent = `${numLeads} Collected`;
		leadCounter.style.cssText = "background-color: red;";
		// identify parent menu, append element
		let targetMenu = document.querySelector(".mlA");
		targetMenu.appendChild(leadCounter);
	}

	/**
	 * reset all collected info leads
	 */
	function resetLeads() {
		// clear data stored in local storage
		browser.storage.local.remove("leadsInfo", function() {
			console.log("reset stored leads");
			// if count element exists on page, update it
			if (document.getElementById("helper-counter")) {
				document.getElementById("helper-counter").textContent = "0 Collected";
			}
		});
	}

	/**
	 * on successful storage of lead info
	 */
	function setLeads() {
		console.log("leads successfully stored");
	}

	/**
	 * log errors related to storage of leads
	 */
	function onLeadsError(error) {
		console.log(`leads storage error:\n\n${error}`);
	}

	/**
	 * Listen for messages from the background script.
	 * Call appropriate method.
	*/
	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "collect") {
			// after a lot of storage f-ery, i think this handles it
			collectLeads();
		}
		else if (message.command === "reset") {
			resetLeads();
		}
	});

})();
