// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// A generic onclick callback function.
  
function genericOnClick(info, tab) {
	
      var custom_url = encodeURIComponent(info.pageUrl);
      var action_url = custom_url.replace("%s", encodeURIComponent(action_url));
      action_url='http://www.flvcd.com/parse.php?kw='+custom_url;
      console.log('Custom url: ' + action_url);
      chrome.tabs.create({ url: action_url });
}

function genericOnClick2(info, tab) {
	
	
      var custom_url = encodeURIComponent(info.linkUrl);
      var action_url = custom_url.replace("%s", encodeURIComponent(action_url));
      action_url='http://www.flvcd.com/parse.php?kw='+custom_url;
      console.log('Custom url: ' + action_url);
      chrome.tabs.create({ url: action_url });

}

// Create one test item for each context type.
var contexts = ["page","selection","link","editable","image","video",
                "audio"];

var context = contexts[0];
  var title = "用FLVCD解析本页面的视频";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
                                       
var context = contexts[2];
  var title = "用FLVCD解析该链接的视频";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick2});


