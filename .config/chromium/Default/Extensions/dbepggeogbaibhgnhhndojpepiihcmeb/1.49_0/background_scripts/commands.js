// Generated by CoffeeScript 1.8.0
(function() {
  var Commands, commandDescriptions, defaultKeyMappings, root;

  Commands = {
    init: function() {
      var command, description, _results;
      _results = [];
      for (command in commandDescriptions) {
        description = commandDescriptions[command];
        _results.push(this.addCommand(command, description[0], description[1]));
      }
      return _results;
    },
    availableCommands: {},
    keyToCommandRegistry: {},
    addCommand: function(command, description, options) {
      if (command in this.availableCommands) {
        console.log(command, "is already defined! Check commands.coffee for duplicates.");
        return;
      }
      options || (options = {});
      return this.availableCommands[command] = {
        description: description,
        isBackgroundCommand: options.background,
        passCountToFunction: options.passCountToFunction,
        noRepeat: options.noRepeat,
        repeatLimit: options.repeatLimit
      };
    },
    mapKeyToCommand: function(key, command) {
      var commandDetails;
      if (!this.availableCommands[command]) {
        console.log(command, "doesn't exist!");
        return;
      }
      commandDetails = this.availableCommands[command];
      return this.keyToCommandRegistry[key] = {
        command: command,
        isBackgroundCommand: commandDetails.isBackgroundCommand,
        passCountToFunction: commandDetails.passCountToFunction,
        noRepeat: commandDetails.noRepeat,
        repeatLimit: commandDetails.repeatLimit
      };
    },
    unmapKey: function(key) {
      return delete this.keyToCommandRegistry[key];
    },
    normalizeKey: function(key) {
      return key.replace(/<[acm]-/ig, function(match) {
        return match.toLowerCase();
      }).replace(/<([acm]-)?([a-zA-Z0-9]{2,5})>/g, function(match, optionalPrefix, keyName) {
        return "<" + (optionalPrefix ? optionalPrefix : "") + keyName.toLowerCase() + ">";
      });
    },
    parseCustomKeyMappings: function(customKeyMappings) {
      var key, line, lineCommand, lines, splitLine, vimiumCommand, _i, _len, _results;
      lines = customKeyMappings.split("\n");
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (line[0] === "\"" || line[0] === "#") {
          continue;
        }
        splitLine = line.split(/\s+/);
        lineCommand = splitLine[0];
        if (lineCommand === "map") {
          if (splitLine.length !== 3) {
            continue;
          }
          key = this.normalizeKey(splitLine[1]);
          vimiumCommand = splitLine[2];
          if (!this.availableCommands[vimiumCommand]) {
            continue;
          }
          console.log("Mapping", key, "to", vimiumCommand);
          _results.push(this.mapKeyToCommand(key, vimiumCommand));
        } else if (lineCommand === "unmap") {
          if (splitLine.length !== 2) {
            continue;
          }
          key = this.normalizeKey(splitLine[1]);
          console.log("Unmapping", key);
          _results.push(this.unmapKey(key));
        } else if (lineCommand === "unmapAll") {
          _results.push(this.keyToCommandRegistry = {});
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    },
    clearKeyMappingsAndSetDefaults: function() {
      var key, _results;
      this.keyToCommandRegistry = {};
      _results = [];
      for (key in defaultKeyMappings) {
        _results.push(this.mapKeyToCommand(key, defaultKeyMappings[key]));
      }
      return _results;
    },
    commandGroups: {
      pageNavigation: ["scrollDown", "scrollUp", "scrollLeft", "scrollRight", "scrollToTop", "scrollToBottom", "scrollToLeft", "scrollToRight", "scrollPageDown", "scrollPageUp", "scrollFullPageUp", "scrollFullPageDown", "reload", "toggleViewSource", "copyCurrentUrl", "LinkHints.activateModeToCopyLinkUrl", "openCopiedUrlInCurrentTab", "openCopiedUrlInNewTab", "goUp", "goToRoot", "enterInsertMode", "focusInput", "LinkHints.activateMode", "LinkHints.activateModeToOpenInNewTab", "LinkHints.activateModeToOpenInNewForegroundTab", "LinkHints.activateModeWithQueue", "LinkHints.activateModeToDownloadLink", "LinkHints.activateModeToOpenIncognito", "Vomnibar.activate", "Vomnibar.activateInNewTab", "Vomnibar.activateTabSelection", "Vomnibar.activateBookmarks", "Vomnibar.activateBookmarksInNewTab", "goPrevious", "goNext", "nextFrame", "Marks.activateCreateMode", "Vomnibar.activateEditUrl", "Vomnibar.activateEditUrlInNewTab", "Marks.activateGotoMode"],
      findCommands: ["enterFindMode", "performFind", "performBackwardsFind"],
      historyNavigation: ["goBack", "goForward"],
      tabManipulation: ["nextTab", "previousTab", "firstTab", "lastTab", "createTab", "duplicateTab", "removeTab", "restoreTab", "moveTabToNewWindow", "togglePinTab", "closeTabsOnLeft", "closeTabsOnRight", "closeOtherTabs", "moveTabLeft", "moveTabRight"],
      misc: ["showHelp"]
    },
    advancedCommands: ["scrollToLeft", "scrollToRight", "moveTabToNewWindow", "goUp", "goToRoot", "focusInput", "LinkHints.activateModeWithQueue", "LinkHints.activateModeToDownloadLink", "Vomnibar.activateEditUrl", "Vomnibar.activateEditUrlInNewTab", "LinkHints.activateModeToOpenIncognito", "goNext", "goPrevious", "Marks.activateCreateMode", "Marks.activateGotoMode", "moveTabLeft", "moveTabRight", "closeTabsOnLeft", "closeTabsOnRight", "closeOtherTabs"]
  };

  defaultKeyMappings = {
    "?": "showHelp",
    "j": "scrollDown",
    "k": "scrollUp",
    "h": "scrollLeft",
    "l": "scrollRight",
    "gg": "scrollToTop",
    "G": "scrollToBottom",
    "zH": "scrollToLeft",
    "zL": "scrollToRight",
    "<c-e>": "scrollDown",
    "<c-y>": "scrollUp",
    "d": "scrollPageDown",
    "u": "scrollPageUp",
    "r": "reload",
    "gs": "toggleViewSource",
    "i": "enterInsertMode",
    "H": "goBack",
    "L": "goForward",
    "gu": "goUp",
    "gU": "goToRoot",
    "gi": "focusInput",
    "f": "LinkHints.activateMode",
    "F": "LinkHints.activateModeToOpenInNewTab",
    "<a-f>": "LinkHints.activateModeWithQueue",
    "/": "enterFindMode",
    "n": "performFind",
    "N": "performBackwardsFind",
    "[[": "goPrevious",
    "]]": "goNext",
    "yy": "copyCurrentUrl",
    "yf": "LinkHints.activateModeToCopyLinkUrl",
    "p": "openCopiedUrlInCurrentTab",
    "P": "openCopiedUrlInNewTab",
    "K": "nextTab",
    "J": "previousTab",
    "gt": "nextTab",
    "gT": "previousTab",
    "<<": "moveTabLeft",
    ">>": "moveTabRight",
    "g0": "firstTab",
    "g$": "lastTab",
    "W": "moveTabToNewWindow",
    "t": "createTab",
    "yt": "duplicateTab",
    "x": "removeTab",
    "X": "restoreTab",
    "<a-p>": "togglePinTab",
    "o": "Vomnibar.activate",
    "O": "Vomnibar.activateInNewTab",
    "T": "Vomnibar.activateTabSelection",
    "b": "Vomnibar.activateBookmarks",
    "B": "Vomnibar.activateBookmarksInNewTab",
    "ge": "Vomnibar.activateEditUrl",
    "gE": "Vomnibar.activateEditUrlInNewTab",
    "gf": "nextFrame",
    "m": "Marks.activateCreateMode",
    "`": "Marks.activateGotoMode"
  };

  commandDescriptions = {
    showHelp: [
      "Show help", {
        background: true
      }
    ],
    scrollDown: ["Scroll down"],
    scrollUp: ["Scroll up"],
    scrollLeft: ["Scroll left"],
    scrollRight: ["Scroll right"],
    scrollToTop: [
      "Scroll to the top of the page", {
        noRepeat: true
      }
    ],
    scrollToBottom: [
      "Scroll to the bottom of the page", {
        noRepeat: true
      }
    ],
    scrollToLeft: [
      "Scroll all the way to the left", {
        noRepeat: true
      }
    ],
    scrollToRight: [
      "Scroll all the way to the right", {
        noRepeat: true
      }
    ],
    scrollPageDown: ["Scroll a page down"],
    scrollPageUp: ["Scroll a page up"],
    scrollFullPageDown: ["Scroll a full page down"],
    scrollFullPageUp: ["Scroll a full page up"],
    reload: [
      "Reload the page", {
        noRepeat: true
      }
    ],
    toggleViewSource: [
      "View page source", {
        noRepeat: true
      }
    ],
    copyCurrentUrl: [
      "Copy the current URL to the clipboard", {
        noRepeat: true
      }
    ],
    "LinkHints.activateModeToCopyLinkUrl": [
      "Copy a link URL to the clipboard", {
        noRepeat: true
      }
    ],
    openCopiedUrlInCurrentTab: [
      "Open the clipboard's URL in the current tab", {
        background: true
      }
    ],
    openCopiedUrlInNewTab: [
      "Open the clipboard's URL in a new tab", {
        background: true,
        repeatLimit: 20
      }
    ],
    enterInsertMode: [
      "Enter insert mode", {
        noRepeat: true
      }
    ],
    focusInput: [
      "Focus the first text box on the page. Cycle between them using tab", {
        passCountToFunction: true
      }
    ],
    "LinkHints.activateMode": [
      "Open a link in the current tab", {
        noRepeat: true
      }
    ],
    "LinkHints.activateModeToOpenInNewTab": [
      "Open a link in a new tab", {
        noRepeat: true
      }
    ],
    "LinkHints.activateModeToOpenInNewForegroundTab": [
      "Open a link in a new tab & switch to it", {
        noRepeat: true
      }
    ],
    "LinkHints.activateModeWithQueue": [
      "Open multiple links in a new tab", {
        noRepeat: true
      }
    ],
    "LinkHints.activateModeToOpenIncognito": [
      "Open a link in incognito window", {
        noRepeat: true
      }
    ],
    "LinkHints.activateModeToDownloadLink": [
      "Download link url", {
        noRepeat: true
      }
    ],
    enterFindMode: [
      "Enter find mode", {
        noRepeat: true
      }
    ],
    performFind: ["Cycle forward to the next find match"],
    performBackwardsFind: ["Cycle backward to the previous find match"],
    goPrevious: [
      "Follow the link labeled previous or <", {
        noRepeat: true
      }
    ],
    goNext: [
      "Follow the link labeled next or >", {
        noRepeat: true
      }
    ],
    goBack: [
      "Go back in history", {
        passCountToFunction: true
      }
    ],
    goForward: [
      "Go forward in history", {
        passCountToFunction: true
      }
    ],
    goUp: [
      "Go up the URL hierarchy", {
        passCountToFunction: true
      }
    ],
    goToRoot: [
      "Go to root of current URL hierarchy", {
        passCountToFunction: true
      }
    ],
    nextTab: [
      "Go one tab right", {
        background: true
      }
    ],
    previousTab: [
      "Go one tab left", {
        background: true
      }
    ],
    firstTab: [
      "Go to the first tab", {
        background: true
      }
    ],
    lastTab: [
      "Go to the last tab", {
        background: true
      }
    ],
    createTab: [
      "Create new tab", {
        background: true,
        repeatLimit: 20
      }
    ],
    duplicateTab: [
      "Duplicate current tab", {
        background: true,
        repeatLimit: 20
      }
    ],
    removeTab: [
      "Close current tab", {
        background: true,
        repeatLimit: (chrome.session ? chrome.session.MAX_SESSION_RESULTS : 25)
      }
    ],
    restoreTab: [
      "Restore closed tab", {
        background: true,
        repeatLimit: 20
      }
    ],
    moveTabToNewWindow: [
      "Move tab to new window", {
        background: true
      }
    ],
    togglePinTab: [
      "Pin/unpin current tab", {
        background: true
      }
    ],
    closeTabsOnLeft: [
      "Close tabs on the left", {
        background: true,
        noRepeat: true
      }
    ],
    closeTabsOnRight: [
      "Close tabs on the right", {
        background: true,
        noRepeat: true
      }
    ],
    closeOtherTabs: [
      "Close all other tabs", {
        background: true,
        noRepeat: true
      }
    ],
    moveTabLeft: [
      "Move tab to the left", {
        background: true,
        passCountToFunction: true
      }
    ],
    moveTabRight: [
      "Move tab to the right", {
        background: true,
        passCountToFunction: true
      }
    ],
    "Vomnibar.activate": [
      "Open URL, bookmark, or history entry", {
        noRepeat: true
      }
    ],
    "Vomnibar.activateInNewTab": [
      "Open URL, bookmark, history entry, in a new tab", {
        noRepeat: true
      }
    ],
    "Vomnibar.activateTabSelection": [
      "Search through your open tabs", {
        noRepeat: true
      }
    ],
    "Vomnibar.activateBookmarks": [
      "Open a bookmark", {
        noRepeat: true
      }
    ],
    "Vomnibar.activateBookmarksInNewTab": [
      "Open a bookmark in a new tab", {
        noRepeat: true
      }
    ],
    "Vomnibar.activateEditUrl": [
      "Edit the current URL", {
        noRepeat: true
      }
    ],
    "Vomnibar.activateEditUrlInNewTab": [
      "Edit the current URL and open in a new tab", {
        noRepeat: true
      }
    ],
    nextFrame: [
      "Cycle forward to the next frame on the page", {
        background: true,
        passCountToFunction: true
      }
    ],
    "Marks.activateCreateMode": [
      "Create a new mark", {
        noRepeat: true
      }
    ],
    "Marks.activateGotoMode": [
      "Go to a mark", {
        noRepeat: true
      }
    ]
  };

  Commands.init();

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Commands = Commands;

}).call(this);
