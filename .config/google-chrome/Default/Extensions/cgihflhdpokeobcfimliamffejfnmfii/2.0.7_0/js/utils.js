'use strict';

var Utils = { // jshint ignore:line
  DEFAULT_SIM_SETTINGS: {
    country: 'USA',
    operator: 'T-Mobile',
    operatorCode: '31020'
  },

  DEFAULT_DEVICE: {
    sdk: '16',
    codename: 'hammerhead'
  },

  saveAccount: function(data, callback) {
    BrowserStorage.set({
      account: data
    }, callback);
  },

  setupTooltips: function() {
    var tooltips = document.querySelectorAll('.help-msg');
    for (var i = 0, size = tooltips.length; i < size; i++) {
      tooltips[i].addEventListener('mousedown', function(e) {
        if (e.target.nodeName === 'A') {
          e.target.click();
        }
      });
    }
  },

  getAccountSettings: function(callback) {
    BrowserStorage.get(['sim', 'account'], function(items) {
      if (!items.sims) {
        Utils.setSimSettings(Utils.DEFAULT_SIM_SETTINGS);
        items.sim = Utils.DEFAULT_SIM_SETTINGS;
      }

      callback.call(null, items);
    });
  },

  setSimSettings: function(sim, callback) {
    BrowserStorage.set({
      sim: sim
    }, callback);
  }
};