// Generated by CoffeeScript 1.9.1
(function() {
  var Utils, globalRoot, root,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    slice = [].slice;

  Utils = {
    getCurrentVersion: function() {
      return chrome.runtime.getManifest().version;
    },
    invokeCommandString: function(str, argArray) {
      var component, components, func, j, len, obj, ref;
      components = str.split('.');
      obj = window;
      ref = components.slice(0, -1);
      for (j = 0, len = ref.length; j < len; j++) {
        component = ref[j];
        obj = obj[component];
      }
      func = obj[components.pop()];
      return func.apply(obj, argArray);
    },
    createElementFromHtml: function(html) {
      var tmp;
      tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.firstChild;
    },
    escapeHtml: function(string) {
      return string.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    createUniqueId: (function() {
      var id;
      id = 0;
      return function() {
        return id += 1;
      };
    })(),
    hasChromePrefix: (function() {
      var chromePrefixes;
      chromePrefixes = ["about:", "view-source:", "extension:", "chrome-extension:", "data:", "javascript:"];
      return function(url) {
        var j, len, prefix;
        for (j = 0, len = chromePrefixes.length; j < len; j++) {
          prefix = chromePrefixes[j];
          if (url.startsWith(prefix)) {
            return true;
          }
        }
        return false;
      };
    })(),
    hasFullUrlPrefix: (function() {
      var urlPrefix;
      urlPrefix = new RegExp("^[a-z]{3,}://.");
      return function(url) {
        return urlPrefix.test(url);
      };
    })(),
    createFullUrl: function(partialUrl) {
      if (this.hasFullUrlPrefix(partialUrl)) {
        return partialUrl;
      } else {
        return "http://" + partialUrl;
      }
    },
    isUrl: function(str) {
      var dottedParts, hostName, lastPart, longTlds, match, ref, specialHostNames, urlRegex;
      if (indexOf.call(str, ' ') >= 0) {
        return false;
      }
      if (this.hasFullUrlPrefix(str)) {
        return true;
      }
      urlRegex = new RegExp('^(?:([^:]+)(?::([^:]+))?@)?' + '([^:]+|\\[[^\\]]+\\])' + '(?::(\\d+))?$');
      longTlds = ['arpa', 'asia', 'coop', 'info', 'jobs', 'local', 'mobi', 'museum', 'name', 'onion'];
      specialHostNames = ['localhost'];
      match = urlRegex.exec((str.split('/'))[0]);
      if (!match) {
        return false;
      }
      hostName = match[3];
      if (indexOf.call(specialHostNames, hostName) >= 0) {
        return true;
      }
      if (indexOf.call(hostName, ':') >= 0) {
        return true;
      }
      dottedParts = hostName.split('.');
      if (dottedParts.length > 1) {
        lastPart = dottedParts.pop();
        if ((2 <= (ref = lastPart.length) && ref <= 3) || indexOf.call(longTlds, lastPart) >= 0) {
          return true;
        }
      }
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostName)) {
        return true;
      }
      return false;
    },
    createSearchQuery: function(query) {
      if (typeof query === "string") {
        query = query.split(/\s+/);
      }
      return query.map(encodeURIComponent).join("+");
    },
    createSearchUrl: function(query) {
      return Settings.get("searchUrl") + this.createSearchQuery(query);
    },
    convertToUrl: function(string) {
      string = string.trim();
      if (Utils.hasChromePrefix(string)) {
        return string;
      } else if (Utils.isUrl(string)) {
        return Utils.createFullUrl(string);
      } else {
        return Utils.createSearchUrl(string);
      }
    },
    isString: function(obj) {
      return typeof obj === 'string' || obj instanceof String;
    },
    distinctCharacters: function(str) {
      var char, j, len, ref, unique;
      unique = "";
      ref = str.split("").sort();
      for (j = 0, len = ref.length; j < len; j++) {
        char = ref[j];
        if (!(0 <= unique.indexOf(char))) {
          unique += char;
        }
      }
      return unique;
    },
    compareVersions: function(versionA, versionB) {
      var a, b, i, j, ref;
      versionA = versionA.split(".");
      versionB = versionB.split(".");
      for (i = j = 0, ref = Math.max(versionA.length, versionB.length); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        a = parseInt(versionA[i] || 0, 10);
        b = parseInt(versionB[i] || 0, 10);
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
      }
      return 0;
    },
    haveChromeVersion: function(required) {
      var chromeVersion, ref;
      chromeVersion = (ref = navigator.appVersion.match(/Chrome\/(.*?) /)) != null ? ref[1] : void 0;
      return chromeVersion && 0 <= Utils.compareVersions(chromeVersion, required);
    },
    zip: function(arrays) {
      return arrays[0].map(function(_, i) {
        return arrays.map(function(array) {
          return array[i];
        });
      });
    },
    hasUpperCase: function(s) {
      return s.toLowerCase() !== s;
    },
    getIdentity: (function() {
      var identities;
      identities = [];
      return function(obj) {
        var index;
        index = identities.indexOf(obj);
        if (index < 0) {
          index = identities.length;
          identities.push(obj);
        }
        return "identity-" + index;
      };
    })(),
    copyObjectOmittingProperties: function() {
      var j, len, obj, properties, property;
      obj = arguments[0], properties = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      obj = extend({}, obj);
      for (j = 0, len = properties.length; j < len; j++) {
        property = properties[j];
        delete obj[property];
      }
      return obj;
    }
  };

  Function.prototype.curry = function() {
    var fixedArguments, fn;
    fixedArguments = Array.copy(arguments);
    fn = this;
    return function() {
      return fn.apply(this, fixedArguments.concat(Array.copy(arguments)));
    };
  };

  Array.copy = function(array) {
    return Array.prototype.slice.call(array, 0);
  };

  String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
  };

  globalRoot = typeof window !== "undefined" && window !== null ? window : global;

  globalRoot.extend = function(hash1, hash2) {
    var key;
    for (key in hash2) {
      hash1[key] = hash2[key];
    }
    return hash1;
  };

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Utils = Utils;

}).call(this);
