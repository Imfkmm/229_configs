// Generated by CoffeeScript 1.8.0
(function() {
  var marks, removeMarksForTab, root;

  root = window.Marks = {};

  marks = {};

  root.create = function(req, sender) {
    return marks[req.markName] = {
      tabId: sender.tab.id,
      scrollX: req.scrollX,
      scrollY: req.scrollY
    };
  };

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url != null) {
      return removeMarksForTab(tabId);
    }
  });

  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    return removeMarksForTab(tabId);
  });

  removeMarksForTab = function(id) {
    var mark, markName, _results;
    _results = [];
    for (markName in marks) {
      mark = marks[markName];
      if (mark.tabId === id) {
        _results.push(delete marks[markName]);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  root.goto = function(req, sender) {
    var mark;
    mark = marks[req.markName];
    chrome.tabs.update(mark.tabId, {
      selected: true
    });
    chrome.tabs.sendMessage(mark.tabId, {
      name: "setScrollPosition",
      scrollX: mark.scrollX,
      scrollY: mark.scrollY
    });
    return chrome.tabs.sendMessage(mark.tabId, {
      name: "showHUDforDuration",
      text: "Jumped to global mark '" + req.markName + "'",
      duration: 1000
    });
  };

}).call(this);
