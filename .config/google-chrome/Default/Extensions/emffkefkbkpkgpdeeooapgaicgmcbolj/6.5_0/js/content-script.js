/*
 This content script is used to add a toggle button to both Wikipedia and WikiWand pages
 This toggle button allows the user to switch the redirect configuration between those 2 sites
 with just a single mouse click from the DOM itself
 This is very important, so the user can easily and intuitively go back and forth between Wikipedia and WikiWand.
 */


var version = '0';
var autoRedirectState;
var last_save_time = -1;
var cache_count = 0;
var last_save_string = '';
var link_count=0;
var query;
var locationDict={};
var queryName={
	'www.baidu.com':'wd',
	'baidu.com':'wd',
	'www.yandex.com':'text',
	'yandex.com':'text',
	'www.sogou.com':'query',
	'sogou.com':'query',
	'www.yandex.ru':'text',
	'yandex.ru':'text'
};
console.log=function(){};
//<editor-fold desc="Functions">
function toggleButtons() {
	//this function displays the buttons on wikiwand and on wikipedia which allow to toggle wikiwand on and off
	var validDomain = (window.location.hostname === 'www.localwiki.com' || window.location.host === 'www.wikiwand.com'
	|| window.location.host === 'www.ww-web-stage.wikiwand.com' || window.location.host.indexOf('.wikipedia.org') > -1);
	if (!validDomain) return;

	chrome.runtime.sendMessage({command: 'get-auto-redirect'}, function(response) {
		autoRedirectState = response.autoRedirect;
		if (window.location.hostname === 'www.localwiki.com' || window.location.host === 'www.wikiwand.com'
			|| window.location.host === 'www.ww-web-stage.wikiwand.com') {
			if (autoRedirectState == false) {
				$(document).ready(function() {
					$('.toggle_wiki').hide(); //don't show button if it is not alighned with the current state
				});
			}
		}
		if (autoRedirectState == true) {
			$(document).ready(function() {
				$('#switch_to_wikiwand').hide(); //don't show button if it is not alighned with the current state
			});
		}
	});
	$(document).ready(function() {
		var url = window.location.href;
		var buttonState = getRedirectUrl(url);
		if (buttonState.redirectURL !== null) {
			// Show the switch button on wikipedia
			var element;
			if (buttonState.domain === 'wikipedia') {
				var wikiwandLogo = chrome.extension.getURL("images/wikiwand_logo.png");
				var wikipediaLogo = chrome.extension.getURL("images/wikipedia_logo.png");
				var wandIcon = chrome.extension.getURL("images/wand.png");
				element = "<div class='toggle_wiki_wikiwand' id='switch_to_wikiwand'><i><img src='" + wandIcon +
				"' alt='wikwand icon'/></i>" +
				"<div class='switch_logo_wikiwand'>" +
				"<img src='" + wikipediaLogo + "' alt='wikipedia logo'/>" +
				"</div>" +
				"<a  href='javascript:void(0)' id='switch_btn_wikiwand' class='wikiwand_switch'></a>" +
				"<div class='switch_logo_wikiwand wikiwand_switch'>" +
				"<a href='javascript:void(0)' ><img src='" + wikiwandLogo + "' alt='wikipedia logo'/></a>" +
				"</div>" +
				"</div>";
				$('html').append($(element));
			}

			//bind click event to action.

			$(".wikiwand_switch , #switch_btn").click(function(event) {
				if (event.ctrlKey || event.shiftKey || event.altKey) {
					return true;
				}
				if (buttonState.domain === 'wikipedia') {
					chrome.extension.sendMessage({command: 'auto-redirect-on'});
					$('#switch_btn_wikiwand').addClass('wand_wikiwand');
					return false; // Ignore the href
				}
				else {  // From WikiWand to Wikipedia
					// We send a message to the background process to change the redirect setting.
					// This will trigger the redirect to Wikipedia immediately.
					chrome.extension.sendMessage({command: 'auto-redirect-off'});
					$('#switch_btn_wikiwand').addClass('wand_wikiwand');
					return false; // Ignore the href
				}
			});
		}
	});
}

function precacheLink(wikiwandURl) {
	//this function precaches a wikiwand article for a wikipedia link, by opening an invisible iframe to that wikiwand
	//page. the wikiwand page detects that it was loaded from this function (by hashtag) and only loads the essential few
	//resources so they later load faster when the user clicks the link
	console.log('precacheLink');
	var url = wikiwandURl.split('#')[0].split('?')[0]; //remove any hashtags and get parameters
	url = url + "#precache_from_extension=true";
	var iframe = document.createElement('iframe');
	iframe.frameBorder = 'none';
	iframe.id = 'wikiwand_precache_' + cache_count;
	iframe.src = url;
	document.body.appendChild(iframe);
	$(iframe).css({
		'width': '0px', 'height': '0px', 'top': '0px', 'left': '100%',
		'z-index': 1000, 'position': 'fixed'
	});
}

function prefetchWikiwand() {
	var queryValue;
	if (locationDict[location.href]){
		console.log('already handeled');
		return;
	}else{
		console.log('prefetch wikiwand');
	}
	cache_count=0;
	//perform prefetching of wikipedia links to make browsing faster
	if (document.location.host === 'www.wikiwand.com') {
		return;
	}
	if (document.location.host === 'www.quickiwiki.com') {
		return;
	}

	if (queryName[location.host]){
		query=document.getElementsByName(queryName[location.host])[0];
		console.log('query name ',queryName[location.host]);
	}else {
		query = document.getElementsByName("q")[0];
	}
	if (query){	queryValue=query.value;}
	//console.log('query '+query +'value '+ queryValue );
	// Find links that lead to Wikipedia
	$('a[href*=".wikipedia."]').each(function() {
		link_count++;
	});
	//console.log('link count ',link_count);

	$('a[href*=".wikipedia."]').each(function() {
		var href = $(this).attr('href');
		if (!href) return;
		var newURL = testAutoRedirect(href);
		if (newURL.redirectURL) {
			//console.log('link');
			//console.log('link no. '+link_count+' href ',href, ' query  ',query.value);
			if (cache_count > 0) {return;}
			cache_count++;
			precacheLink(newURL.redirectURL.replace('http://', '//'));
			if (query && query.value!='') {
				chrome.extension.sendMessage({command: 'registerTab',hostname:location.hostname,href:href});
				locationDict[location.href]=true;
				//console.log('has wiki');
				chrome.extension.sendMessage({
					command: 'warmCache',
					data: {
						hostname: location.hostname,
						href: href,
						linkCount: link_count
					}
				});
			}

		}
	});

	if (query && query.value!='' && cache_count==0) {
		console.log('no wiki');

		chrome.extension.sendMessage({
			command: 'warmCache',
			data: {
				hostname: location.hostname,
				href: location.hostname+' query '+queryValue,
				linkCount: 0
			}
		});
	}

}


function synchLocalStorage() {
	//sync wikiwand user prefs to background to save them from accidental deletion, and also to allow user
	//to sync preferences across
	if (!localStorage['wikiwand_last_save']) {localStorage['wikiwand_last_save'] = '0';}

	if (localStorage['wikiwand_last_save'] !== last_save_string) {
		last_save_string = localStorage['wikiwand_last_save'];
		last_save_time = parseInt(last_save_string);
		var bigObject = {};
		for (key in localStorage) {
			if (key.slice(0, 9) == 'wikiwand_') {
				bigObject[key] = localStorage[key];
			}
		}

		chrome.runtime.sendMessage({
			command: 'syncStorage',
			stamp: last_save_time,
			bigObject:bigObject
		}, function(response) {
			if (response.result == 'background newer') {
				for (key in response.bigObject){
					if (typeof ( response.bigObject[key]) != 'string') {
						//console.log('non string');
						return;
					}
					localStorage[key] = response.bigObject[key];
				}
				//console.log('restored from extension ', response.key);
			}
		});
	}


}

function setExtensionCookie() {
	//set the extension cookie so wikiwand.com can regard the user accordingly
	var date = new Date();
	date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
	document.cookie = "wikiwand.extension.installed=True; expires=" + date.toUTCString() + "; path=/";
}
//</editor-fold>


//<editor-fold desc="Run on all websites">
toggleButtons();
$(document).ready(function(){
});
//</editor-fold>

//<editor-fold desc="Run only on Wikiwand pages">

if ((document.location.host === 'www.wikiwand.com') ||
	(document.location.host === 'www.localwiki.com:3000') ||
	(document.location.host === 'www.ww-web-stage.wikiwand.com')) {
	setExtensionCookie();
	synchLocalStorage();
	setInterval(synchLocalStorage, 1000);
}

var lastHash;
$(document).ready(function() {
	setInterval(function() {
		if (lastHash != location.href) {
			lastHash = location.href;
			setTimeout(prefetchWikiwand, 1000);
		}
	}, 100);
});
//</editor-fold>
