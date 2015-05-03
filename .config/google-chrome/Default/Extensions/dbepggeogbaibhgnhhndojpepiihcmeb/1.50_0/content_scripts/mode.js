// Generated by CoffeeScript 1.9.1
(function() {
  var BadgeMode, Mode, count, root,
    slice = [].slice,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  count = 0;

  Mode = (function() {
    Mode.prototype.debug = false;

    Mode.modes = [];

    Mode.prototype.continueBubbling = true;

    Mode.prototype.suppressEvent = false;

    Mode.prototype.stopBubblingAndTrue = handlerStack.stopBubblingAndTrue;

    Mode.prototype.stopBubblingAndFalse = handlerStack.stopBubblingAndFalse;

    Mode.prototype.restartBubbling = handlerStack.restartBubbling;

    function Mode(options) {
      this.options = options != null ? options : {};
      this.handlers = [];
      this.exitHandlers = [];
      this.modeIsActive = true;
      this.badge = this.options.badge || "";
      this.name = this.options.name || "anonymous";
      this.count = ++count;
      this.id = this.name + "-" + this.count;
      this.log("activate:", this.id);
      this.push({
        keydown: this.options.keydown || null,
        keypress: this.options.keypress || null,
        keyup: this.options.keyup || null,
        updateBadge: (function(_this) {
          return function(badge) {
            return _this.alwaysContinueBubbling(function() {
              return _this.updateBadge(badge);
            });
          };
        })(this)
      });
      if (this.options.exitOnEscape) {
        this.push({
          _name: "mode-" + this.id + "/exitOnEscape",
          "keydown": (function(_this) {
            return function(event) {
              if (!KeyboardUtils.isEscape(event)) {
                return _this.continueBubbling;
              }
              DomUtils.suppressKeyupAfterEscape(handlerStack);
              _this.exit(event, event.srcElement);
              return _this.suppressEvent;
            };
          })(this)
        });
      }
      if (this.options.exitOnBlur) {
        this.push({
          _name: "mode-" + this.id + "/exitOnBlur",
          "blur": (function(_this) {
            return function(event) {
              return _this.alwaysContinueBubbling(function() {
                if (event.target === _this.options.exitOnBlur) {
                  return _this.exit(event);
                }
              });
            };
          })(this)
        });
      }
      if (this.options.exitOnClick) {
        this.push({
          _name: "mode-" + this.id + "/exitOnClick",
          "click": (function(_this) {
            return function(event) {
              return _this.alwaysContinueBubbling(function() {
                return _this.exit(event);
              });
            };
          })(this)
        });
      }
      if (this.options.exitOnFocus) {
        this.push({
          _name: "mode-" + this.id + "/exitOnFocus",
          "focus": (function(_this) {
            return function(event) {
              return _this.alwaysContinueBubbling(function() {
                if (DomUtils.isFocusable(event.target)) {
                  return _this.exit(event);
                }
              });
            };
          })(this)
        });
      }
      if (this.options.singleton) {
        (function(_this) {
          return (function() {
            var key, singletons;
            singletons = Mode.singletons || (Mode.singletons = {});
            key = Utils.getIdentity(_this.options.singleton);
            _this.onExit(function() {
              return delete singletons[key];
            });
            _this.deactivateSingleton(_this.options.singleton);
            return singletons[key] = _this;
          });
        })(this)();
      }
      if (this.options.trackState) {
        this.enabled = false;
        this.passKeys = "";
        this.keyQueue = "";
        this.push({
          _name: "mode-" + this.id + "/registerStateChange",
          registerStateChange: (function(_this) {
            return function(arg) {
              var enabled, passKeys;
              enabled = arg.enabled, passKeys = arg.passKeys;
              return _this.alwaysContinueBubbling(function() {
                if (enabled !== _this.enabled || passKeys !== _this.passKeys) {
                  _this.enabled = enabled;
                  _this.passKeys = passKeys;
                  return typeof _this.registerStateChange === "function" ? _this.registerStateChange() : void 0;
                }
              });
            };
          })(this),
          registerKeyQueue: (function(_this) {
            return function(arg) {
              var keyQueue;
              keyQueue = arg.keyQueue;
              return _this.alwaysContinueBubbling(function() {
                return _this.keyQueue = keyQueue;
              });
            };
          })(this)
        });
      }
      if (this.options.passInitialKeyupEvents) {
        this.push({
          _name: "mode-" + this.id + "/passInitialKeyupEvents",
          keydown: (function(_this) {
            return function() {
              return _this.alwaysContinueBubbling(function() {
                return handlerStack.remove();
              });
            };
          })(this),
          keyup: (function(_this) {
            return function(event) {
              if (KeyboardUtils.isPrintable(event)) {
                return _this.stopBubblingAndFalse;
              } else {
                return _this.stopBubblingAndTrue;
              }
            };
          })(this)
        });
      }
      Mode.modes.push(this);
      Mode.updateBadge();
      this.logModes();
    }

    Mode.prototype.push = function(handlers) {
      handlers._name || (handlers._name = "mode-" + this.id);
      return this.handlers.push(handlerStack.push(handlers));
    };

    Mode.prototype.unshift = function(handlers) {
      handlers._name || (handlers._name = "mode-" + this.id);
      return this.handlers.push(handlerStack.unshift(handlers));
    };

    Mode.prototype.onExit = function(handler) {
      return this.exitHandlers.push(handler);
    };

    Mode.prototype.exit = function() {
      var handler, handlerId, i, j, len, len1, ref, ref1;
      if (this.modeIsActive) {
        this.log("deactivate:", this.id);
        ref = this.exitHandlers;
        for (i = 0, len = ref.length; i < len; i++) {
          handler = ref[i];
          handler();
        }
        ref1 = this.handlers;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          handlerId = ref1[j];
          handlerStack.remove(handlerId);
        }
        Mode.modes = Mode.modes.filter((function(_this) {
          return function(mode) {
            return mode !== _this;
          };
        })(this));
        Mode.updateBadge();
        return this.modeIsActive = false;
      }
    };

    Mode.prototype.deactivateSingleton = function(singleton) {
      var ref, ref1;
      return (ref = Mode.singletons) != null ? (ref1 = ref[Utils.getIdentity(singleton)]) != null ? ref1.exit() : void 0 : void 0;
    };

    Mode.prototype.updateBadge = function(badge) {
      return badge.badge || (badge.badge = this.badge);
    };

    Mode.prototype.alwaysContinueBubbling = handlerStack.alwaysContinueBubbling;

    Mode.prototype.cloneMode = function() {
      var i, key, len, ref;
      ref = ["keydown", "keypress", "keyup"];
      for (i = 0, len = ref.length; i < len; i++) {
        key = ref[i];
        delete this.options[key];
      }
      return new this.constructor(this.options);
    };

    Mode.updateBadge = function() {
      var badge;
      if (document.hasFocus()) {
        handlerStack.bubbleEvent("updateBadge", badge = {
          badge: ""
        });
        return chrome.runtime.sendMessage({
          handler: "setBadge",
          badge: badge.badge
        }, function() {});
      }
    };

    Mode.prototype.logModes = function() {
      var i, len, mode, ref, results;
      if (this.debug) {
        this.log("active modes (top to bottom):");
        ref = Mode.modes.slice(0).reverse();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          mode = ref[i];
          results.push(this.log(" ", mode.id));
        }
        return results;
      }
    };

    Mode.prototype.log = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (this.debug) {
        return console.log.apply(console, args);
      }
    };

    Mode.top = function() {
      return this.modes[this.modes.length - 1];
    };

    Mode.reset = function() {
      var i, len, mode, ref;
      ref = this.modes;
      for (i = 0, len = ref.length; i < len; i++) {
        mode = ref[i];
        mode.exit();
      }
      return this.modes = [];
    };

    return Mode;

  })();

  BadgeMode = (function(superClass) {
    extend(BadgeMode, superClass);

    function BadgeMode() {
      BadgeMode.__super__.constructor.call(this, {
        name: "badge",
        trackState: true
      });
      this.push({
        _name: "mode-" + this.id + "/focus",
        "focus": (function(_this) {
          return function() {
            return _this.alwaysContinueBubbling(function() {
              return Mode.updateBadge();
            });
          };
        })(this)
      });
    }

    BadgeMode.prototype.updateBadge = function(badge) {
      if (!this.enabled) {
        return badge.badge = "";
      }
    };

    BadgeMode.prototype.registerStateChange = function() {
      return Mode.updateBadge();
    };

    return BadgeMode;

  })(Mode);

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Mode = Mode;

  root.BadgeMode = BadgeMode;

}).call(this);