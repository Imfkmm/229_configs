// Generated by CoffeeScript 1.9.1
(function() {
  var Vomnibar, root;

  Vomnibar = {
    vomnibarUI: null,
    activate: function() {
      return this.open({
        completer: "omni"
      });
    },
    activateInNewTab: function() {
      return this.open({
        completer: "omni",
        selectFirst: false,
        newTab: true
      });
    },
    activateTabSelection: function() {
      return this.open({
        completer: "tabs",
        selectFirst: true
      });
    },
    activateBookmarks: function() {
      return this.open({
        completer: "bookmarks",
        selectFirst: true
      });
    },
    activateBookmarksInNewTab: function() {
      return this.open({
        completer: "bookmarks",
        selectFirst: true,
        newTab: true
      });
    },
    activateEditUrl: function() {
      return this.open({
        completer: "omni",
        selectFirst: false,
        query: window.location.href
      });
    },
    activateEditUrlInNewTab: function() {
      return this.open({
        completer: "omni",
        selectFirst: false,
        query: window.location.href,
        newTab: true
      });
    },
    init: function() {
      if (this.vomnibarUI == null) {
        return this.vomnibarUI = new UIComponent("pages/vomnibar.html", "vomnibarFrame", (function(_this) {
          return function(event) {
            if (event.data === "hide") {
              _this.vomnibarUI.hide();
              return _this.vomnibarUI.postMessage("hidden");
            }
          };
        })(this));
      }
    },
    open: function(options) {
      return this.vomnibarUI.activate(options);
    }
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Vomnibar = Vomnibar;

}).call(this);
