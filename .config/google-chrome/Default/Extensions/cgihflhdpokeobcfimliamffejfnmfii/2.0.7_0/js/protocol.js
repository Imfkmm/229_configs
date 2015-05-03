'use strict';

/**
 * Protocol-related functions. For a PHP implementation, see
 * http://thomascannon.net/blog/2011/06/downloading-apks-from-android-market/
 *
 * Authors:
 *    redphx <http://codekiem.com/>
 *    Stephan Schmitz <eyecatchup@gmail.com>
 *    Peter Wu <lekensteyn@gmail.com>
 */

/**
 * Serialize Javascript types in a special format used by MarketSession.
 */
var Utils = {
  parseParams: function(url) {
    var params = {};
    url.split('?')[1].split('&').forEach(function(el) {
      el = el.split('=');
      params[el[0]] = el[1];
    });
    return params;
  },

  stringToByteArray: function(str) {
    var b = [];
    for (var pos = 0, size = str.length; pos < size; ++pos) {
      b.push(str.charCodeAt(pos));
    }
    return b;
  },

  serializeInt32: function(num) {
    var data = [];
    for (var times = 0; times < 5; times++) {
      var elm = num % 128;
      if ((num >>>= 7)) { // jshint ignore:line
        elm += 128;
      }
      data.push(elm);
      if (num === 0) {
        break;
      }
    }
    return data;
  },

  serializeData: function(arr, value, dataType) {
    var newData = [];
    switch (dataType) {
      case 'string':
        newData = newData.concat(this.serializeInt32(value.length));
        newData = newData.concat(this.stringToByteArray(value));
        break;
      case 'int32':
        newData = newData.concat(this.serializeInt32(value));
        break;
      case 'bool':
        newData.push(value ? 1 : 0);
        break;
    }
    return arr.concat(newData);
  }
};

/* Starts an APK download attempt */
var MarketSession = {
  /**
   * Called when pressing the APK Downloader icon in the location bar.
   */
  download: function(packageName, versionCode, tabId) {
    BrowserStorage.get(['account', 'sim'], function(items) {
      if (!items.account || !items.sim) {
        BrowserTabs.create({
          url: 'options.html'
        });
        return;
      }

      if (!items.account.deviceCodename) {
        items.account.deviceCodename = 'hammerhead';
      }

      if (!items.account.deviceSdk) {
        items.account.deviceSdk = 16;
      }

      var pkg = versionCode ? 'v2:' + packageName + ':1:' + versionCode : packageName;

      var options = {
        authToken: items.account.authToken,
        isSecure: true,
        sdkVersion: 2009011,
        deviceId: items.account.deviceId,
        deviceAndSdkVersion: items.account.deviceCodename + ':' + items.account.deviceSdk,
        locale: 'en',
        country: 'us',
        operatorAlpha: items.sim.operator,
        simOperatorAlpha: items.sim.operator,
        operatorNumeric: items.sim.operatorCode,
        simOperatorNumeric: items.sim.operatorCode,
        packageName: pkg
      };

      var assetQueryBase64 = MarketSession.generateAssetRequest(options);

      var API_URL = 'https://android.clients.google.com/market/api/ApiRequest';
      BrowserCookie.set({
          url: API_URL,
          name: 'ANDROIDSECURE',
          value: items.account.authToken,
        }, function() {
          var postData = {
            version: 2,
            request: assetQueryBase64
          };

          BrowserApi.post(postData, function(xhr) {
            if (xhr.status !== 200) {
              BrowserTabs.sendMessage(tabId, {
                cmd: 'downloadResponse',
                error: -1
              });
              return;
            }

            var chars = new Uint8Array(xhr.response);
            /* gzipped content, try to unpack */
            var data = BrowserGzip.uncompress(chars);
            var appUrl, marketDA;

            var urls = data.match(/https?:\/\/.*?downloadId=[0-9\-\_]+/ig);
            if (urls && urls.length > 0) {
              /* not sure if decoding is even necessary */
              appUrl = decodeURIComponent(urls[0]);

              /* format: 'MarketDA', 0x72 ('r'), length of data, data */
              if ((marketDA = /MarketDA..(\d+)/.exec(data))) {
                marketDA = marketDA[1];
                var filename = packageName + (versionCode ? '-' + versionCode : '') + '.apk';
                BrowserCookie.set({
                  url: appUrl,
                  name: 'MarketDA',
                  value: marketDA
                }, function() {
                  BrowserDownloads.download(appUrl, filename);

                  // expansion files available
                  if (urls.length > 1) {
                    for (var i = 1; i < urls.length; i++) {
                      var url = urls[i],
                        params = Utils.parseParams(url),
                        obb = ((url.indexOf('&ft=o') >= 0) ? 'main' : 'patch') + '.' + params.versionCode + '.' + params.packageName + '.obb';
                      BrowserDownloads.download(url, obb);
                    }
                  }
                });
                return;
              }
            } else {
              BrowserTabs.sendMessage(tabId, {
                cmd: 'downloadResponse',
                error: -2
              });
            }
          });
      });
    });
  },
  /**
   * @returns base64 encoded binary data that can be passed to Google Play API.
   */
  generateAssetRequest: function(options) {
    /* some constants to avoid magic numbers */
    var FIELD_AUTHTOKEN = 0;
    var FIELD_ISSECURE = 2;
    var FIELD_SDKVERSION = 4;
    var FIELD_DEVICEID = 6;
    var FIELD_DEVICEANDSDKVERSION = 8;
    var FIELD_LOCALE = 10;
    var FIELD_COUNTRY = 12;
    var FIELD_OPERATORALPHA = 14;
    var FIELD_SIMOPERATORALPHA = 16;
    var FIELD_OPERATORNUMERIC = 18;
    var FIELD_SIMOPERATORNUMERIC = 20;
    var FIELD_PACKAGENAME_LENGTH = 22;
    var FIELD_PACKAGENAME = 24;
    /* describes format of request, numbers will be filled in, arrays of
     * numbers will be appended as-is */
    var desc = [
      FIELD_AUTHTOKEN,
      [0x10], FIELD_ISSECURE,
      [0x18], FIELD_SDKVERSION,
      [0x22], FIELD_DEVICEID,
      [0x2A], FIELD_DEVICEANDSDKVERSION,
      [0x32], FIELD_LOCALE,
      [0x3A], FIELD_COUNTRY,
      [0x42], FIELD_OPERATORALPHA,
      [0x4A], FIELD_SIMOPERATORALPHA,
      [0x52], FIELD_OPERATORNUMERIC,
      [0x5A], FIELD_SIMOPERATORNUMERIC,
      [0x13],
      [0x52], FIELD_PACKAGENAME_LENGTH,
      [0x0A], FIELD_PACKAGENAME,
      [0x14]
    ];
    var out = [];
    var simOperatorLength = 0;
    for (var i = 0, size = desc.length; i < size; i++) {
      if (typeof desc[i] === 'object') {
        /* array, just append it as raw numbers to the output */
        out = out.concat(desc[i]);
        continue;
      }
      switch (desc[i]) {
        case FIELD_AUTHTOKEN:
          out = Utils.serializeData(out, options.authToken, 'string');
          break;
        case FIELD_ISSECURE:
          out = Utils.serializeData(out, options.isSecure, 'bool');
          break;
        case FIELD_SDKVERSION:
          out = Utils.serializeData(out, options.sdkVersion, 'int32');
          break;
        case FIELD_DEVICEID:
          out = Utils.serializeData(out, options.deviceId, 'string');
          break;
        case FIELD_DEVICEANDSDKVERSION:
          out = Utils.serializeData(out, options.deviceAndSdkVersion, 'string');
          break;
        case FIELD_LOCALE:
          out = Utils.serializeData(out, options.locale, 'string');
          break;
        case FIELD_COUNTRY:
          out = Utils.serializeData(out, options.country, 'string');
          break;
        case FIELD_OPERATORALPHA:
          out = Utils.serializeData(out, options.operatorAlpha, 'string');
          break;
        case FIELD_SIMOPERATORALPHA:
          out = Utils.serializeData(out, options.simOperatorAlpha, 'string');
          break;
        case FIELD_OPERATORNUMERIC:
          out = Utils.serializeData(out, options.operatorNumeric, 'string');
          break;
        case FIELD_SIMOPERATORNUMERIC:
          out = Utils.serializeData(out, options.simOperatorNumeric, 'string');
          simOperatorLength = out.length + 1;
          break;
        case FIELD_PACKAGENAME_LENGTH:
          out = out.concat(Utils.serializeInt32(options.packageName.length + 2));
          break;
        case FIELD_PACKAGENAME:
          out = Utils.serializeData(out, options.packageName, 'string');
          break;
      }
    }
    out = [0x0A].concat(Utils.serializeInt32(simOperatorLength)).concat([0x0A]).concat(out);
    var binary = out.map(function (c) {
      return String.fromCharCode(c);
    }).join('');

    return btoa(binary);
  }
};
