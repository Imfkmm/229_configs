/*
 For review team:
 The "Better wikipedia" extension has been completely rewritten in this version.
 Originally it used the CrossRider platform, and now it is a complete stand alone extension.

 Most of the functionality in the new version originates from the older version, with a few additions/modifications:

 1. Added buttons in DOM to allow user to easily switch between wikipedia/wikiwand
 2. Not redirecting on non-article wikipedia pages.
 3. Added Google Analytics tracking
 */

//Our transition from Quickiwiki to Wikiwand is now complete
//This version now handles only one target domain - www.Wikiwand.com
console.log=function(){};

var WIKIWAND_ANALYTICS_STATS_VIEW = 'UA-49207730-8';
var EXTENSION_ID = 'emffkefkbkpkgpdeeooapgaicgmcbolj';
//EXTENSION_ID='kkmablcemiofeojnhfhlhindlpookken'; //TODO remove before flight
var tabs={};
var alreadyCached={};

// =====================================================================================================================
// Analytics
// =====================================================================================================================
function makeid()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	for( var i=0; i < 8; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

try {
	// This is Google Analytics code, used to anonymously report to GA. This is used by us to count the number of active anonymous users
	(function (i, s, o, g, r, a, m) {
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] || function () {
			(i[r].q = i[r].q || []).push (arguments)
		}, i[r].l = 1 * new Date ();
		a = s.createElement (o),
			m = s.getElementsByTagName (o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore (a, m)
	}) (window, document, 'script', 'chrome-extension://' + EXTENSION_ID + '/lib/google-analytics.js', 'ga');
	/*
	 IMPORTANT NOTE:
	 We are using a modified version of the file google-analytics.js and not the one available through google cdn
	 The reason is a known issue with the google-analytics file which does not allow reporting from extensions (protocol
	 test allows http and https but not chrome-extension protocol), when in universal analytics mode.
	 This issue and workaround are describe in:
	 http://stackoverflow.com/questions/16135000/how-do-you-integrate-universal-analytics-in-to-chrome-extensions
	 */

	gaReport = function () {
		ga ('create', WIKIWAND_ANALYTICS_STATS_VIEW, 'auto');
		ga ('set', 'dimension1', 'wikiwand');
		ga ('set', 'dimension2', localStorage['autoRedirect']);
		ga ('set', 'dimension3', 'Chrome-' + chrome.app.getDetails ().version.toString ());
		ga ('send', 'pageview', 'extension-active');
		if (localStorage['hash']){
			ga('send','event','extension-alive','chrome-'+localStorage['autoRedirect'],localStorage['hash']);
		}
	};
	setTimeout (gaReport, 10 * 1000);
	setInterval (gaReport, 60 * 60 * 1000);
}
catch (err) {
	console.log ('Could not load analytics');
}


if (!localStorage['hash']){
	localStorage['hash'] =makeid();
}

// Reset autoRedirect to true on every browser start
localStorage['autoRedirect'] = 'true';


// =====================================================================================================================
// Handle navigation events
// =====================================================================================================================


chrome.webRequest.onBeforeRequest.addListener(
	//this code redirects wikipedia pages to wikiwand pages.
	function(details) {
		if (localStorage['autoRedirect'] !== 'true') {
			return {cancel:false};
		}
		console.log('details (on before request )',details);
		console.log('onbeforerequest');
		var requestedURL = details.url;
		var returnVal = testAutoRedirect (requestedURL);
		if (returnVal.redirectURL !== null) {
			//Do we need to redirect to the HTTPS wikiwand?
			console.log('tabId ',details.tabId);
			if (tabs[details.url] && tabs[details.url].protocol == 'https') {
				console.log('from https');
				if (parseInt(localStorage['wikiwand_last_save']) > 0) {
					returnVal.redirectURL = returnVal.redirectURL.replace('http://', 'https://');
				}
			}
			if (tabs[details.url]){
				try {
					var temphost = tabs[details.url].hostname;
					$.ajax
					(
						{
							type: "POST",
							url: "http://www.wikiwand.com/extension/linkFollow",
							data: {
								href: details.url,
								hostname: temphost
							},
							success: function(msg) {
								//console.log("success");
							}//end function
						}
					);//End ajax
				}catch(ex){};
			}

			return {redirectUrl: returnVal.redirectURL}
		}else{
			return {cancel:false};
		}
	},
	{urls: ["*://*.wikipedia.org/*"]},
	["blocking"]
);

// =====================================================================================================================
// Helpers for content scripts
// =====================================================================================================================

function redirectCurrentTab() {
	chrome.tabs.query ({currentWindow: true, active: true}, function (tabs) {
		var tab = tabs[0];
		var returnVal = getRedirectUrl (tab.url);
		if (returnVal.redirectURL) {
			chrome.tabs.update (tab.id, {url: returnVal.redirectURL});
		}
	});
}
// This listener is used to communicate with the content_script which runs on both wikipedia pages and wikiwand pages
// This allows the button presented within the DOM to manipulate the redirect-state desired by the user.
chrome.extension.onMessage.addListener (function (message, sender,sendResponse) {
	//messaging system between content scripts and background.
	if (message.command === 'auto-redirect-on') {
		localStorage['autoRedirect'] = 'true';
		ga ('send', 'event','extension','redirect','on');
		redirectCurrentTab ();
	}

	if (message.command === 'auto-redirect-off') {
		localStorage['autoRedirect'] = 'false';
		ga ('send', 'event','extension','redirect','off');
		redirectCurrentTab ();
	}

	if (message.command==='get-auto-redirect'){
		if (localStorage['autoRedirect']=='true'){
			sendResponse({'autoRedirect':true});
		}else {
			sendResponse({'autoRedirect': false});
		}
	}
	if (message.command === 'registerTab') {
		if (sender && sender.tab){
			//console.log('sender ',sender);
			tabs[message.href]={};
			tabs[message.href].hostname=message.hostname;
			if (sender.tab.url.indexOf('https://')==0){
				tabs[message.href].protocol='https';
			}else{
				tabs[message.href].protocol='other';
			}
			//console.log('tabs ',tabs);
		}
	}
	if (message.command === 'warmCache') {
		if (message.data.href==null){
			return;
		}
		if (alreadyCached[message.data.href]){return;}
		alreadyCached[message.data.href]=true;
		console.log('warmCache ',message.data);
		//console.log('message.data ',message.data);
		try {
			$.post("http://www.wikiwand.com/extension/warmCache",
				message.data, function() {
					//console.log('received response');
				}, 'json');
		}catch(ex){}
		sendResponse({'success':true});
	}

	if (message.command === 'version') {
		sendResponse({'ver': chrome.app.getDetails().version.toString()});
	}
	if (message.command === 'syncStorage'){
		//console.log('command syncstorage');
		if (!localStorage['wikiwand_last_save']){
			localStorage['wikiwand_last_save']=-1;
		}
		if (message.stamp>parseInt(localStorage['wikiwand_last_save'])) {
			try{
				for (key in message.bigObject){
					if (typeof ( message.bigObject[key]) != 'string') {
						//console.log('non string');
						return;
					}
					localStorage[key] = message.bigObject[key];
				}
				//console.log('backing up');
				var data=JSON.parse(localStorage['wikiwand_activation']);
				ga('send', 'event', 'extension-backup-userID', data.userID);
				ga('send', 'event', 'extension-backup-vetek', data.vetek);
				sendResponse({result:'background updated',stamp:localStorage['wikiwand_last_save']});
				return;
			}catch(e){
				//console.log('error saving to local storage ',e);
			}
		}else{
			if (message.stamp<parseInt(localStorage['wikiwand_last_save'])){

				var data=JSON.parse(localStorage['wikiwand_activation']);
				//console.log('restoring ',data.userID);
				ga('send', 'event', 'extension-restore-userID', data.userID);

				var bigObject = {};
				for (key in localStorage) {
					if (key.slice(0, 9) == 'wikiwand_') {
						bigObject[key] = localStorage[key];
					}
				}
				sendResponse({result:'background newer',bigObject:bigObject,stamp:localStorage['wikiwand_last_save']});
				return;
			}
			// if stamps are equal
			sendResponse({result:'background is same',stamp:localStorage['wikiwand_last_save']});
		}
	}
});

if (chrome.runtime.setUninstallURL) {
	chrome.runtime.setUninstallURL("https://www.wikiwand.com/extension/uninstalled");
}

chrome.runtime.onInstalled.addListener(function(){ //this happens on install and on update
	//install/update code
	localStorage['installed'] = 'true';
	chrome.tabs.query ({}, function (tabs) {
		for (var i = 0; i < tabs.length; i++) {
			var appRegExp = new RegExp ("^https?://([a-zA-Z0-9_\\-\\.]+)?\\.(wikiwand|localwiki)\\.com", "i");
			var match = tabs[i].url.match (appRegExp);
			if (!match) {
				var wikipediaRegExp = new RegExp ("^https?://([a-zA-Z0-9\\-_]+)\\.(?:m\\.)?wikipedia\\.org", "i");
				match = tabs[i].url.match (wikipediaRegExp);
			}
			if (match) {
				chrome.tabs.reload (tabs[i].id, {}, null);
			}
		}
	});

	if (localStorage['thank you']) { //this happens only on update
		try {
			setTimeout (function() {
				//console.log('reported extension update');
				ga('send', 'event', 'extension-installed', 'update', "chrome-"+chrome.app.getDetails().version.toString());
			}, 10 * 1000);
		}catch(e){}
	}else{
		localStorage['thank you'] = 'already opened thank you page';
		try {
			setTimeout (function() {
				//console.log('reported extension first install');
				ga('send', 'event', 'extension-installed', 'install', "chrome-"+chrome.app.getDetails().version.toString());
				if (localStorage['hash']) {
					ga('send', 'event', 'extension-installed', 'install-unique',localStorage['hash']);
				};
			}, 10 * 1000);
		}catch(e){}
		chrome.tabs.create ({url: "http://www.wikiwand.com/extension/thank-you"});
	}
});

