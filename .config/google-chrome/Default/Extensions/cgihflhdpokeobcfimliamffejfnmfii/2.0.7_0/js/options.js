'use strict';

(function() {
  var SDK_LIST = {
    '4':  'Donut 1.6',
    '5':  'Eclair 2.0',
    '6':  'Eclair 2.0.1',
    '7':  'Eclair 2.1',
    '8':  'Froyo 2.2-2.2.3',
    '9':  'Gingerbread 2.3-2.3.2',
    '10': 'Gingerbread 2.3.3-2.3.7',
    '11': 'Honeycomb 3.0',
    '12': 'Honeycomb 3.1',
    '13': 'Honeycomb 3.2',
    '14': 'Ice Cream Sandwich 4.0-4.0.2',
    '15': 'Ice Cream Sandwich 4.0.3-4.0.4',
    '16': 'Jelly Bean 4.1',
    '17': 'Jelly Bean 4.2',
    '18': 'Jelly Bean 4.3',
    '19': 'KitKat 4.4',
    '20': 'KitKat (wearable extensions) 4.4',
    '21': 'Lollipop 5.0',
    '22': 'Lolipop 5.1'
  };

  var DEVICE_LIST = {
    'tilapia':      'Asus Nexus 7',
    'enrc2b':       'HTC One X+',
    'g3':           'LG G3',
    'cosmo':        'LG Google TV',
    'mako':         'LG Nexus 4',
    'hammerhead':   'LG Nexus 5',
    'ghost':        'Motorola Moto X',
    'roth':         'Nvidia Shield',
    'm0':           'Samsung Galaxy S3',
    'ja3g':         'Samsung Galaxy S4',
    'k3g':          'Samsung Galaxy S5',
    'cross77_3776': 'Sony Xperia Fusion',
    'togari':       'Sony Xperia Z'
  };

  var clearData = function(callback) {
    BrowserStorage.remove(['account', 'sim'], callback);
  };

  var renderSdkList = function(currentSdk) {
    var sltSdk = document.getElementById('android_version');
    if (sltSdk.hasAttribute('rendered')) {
      return;
    }

    for (var key in SDK_LIST) {
      var option = document.createElement('option');
      option.value = key;
      option.textContent = SDK_LIST[key] + ' (SDK ' + key + ')';
      if (currentSdk && currentSdk === key) {
        option.selected = 'selected';
      }

      sltSdk.appendChild(option);
    }
    sltSdk.setAttribute('rendered', 1);
  };

  var renderDeviceList = function(codename) {
    var sltDevice = document.getElementById('android_device');
    if (sltDevice.hasAttribute('rendered')) {
      sltDevice.dispatchEvent(new Event('change', {'bubbles': true}));
      return;
    }

    var selected = false;
    for (var key in DEVICE_LIST) {
      var option = document.createElement('option');
      option.value = key;
      option.textContent = DEVICE_LIST[key];
      if (codename && codename === key) {
        option.selected = 'selected';
        selected = true;
      }

      sltDevice.appendChild(option);
    }

    var txtCodename = document.getElementById('android_codename');
    var customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom';
    if (!selected) {
      customOption.selected = 'selected';
      txtCodename.value = codename;
    }
    sltDevice.appendChild(customOption);

    sltDevice.addEventListener('change', function(e) {
      var value = e.target.value;
      if (value === 'custom') {
        txtCodename.removeAttribute('disabled');
      } else {
        txtCodename.disabled = 'disabled';
        txtCodename.value = value;
      }
    });
    sltDevice.setAttribute('rendered', 1);
    sltDevice.dispatchEvent(new Event('change', {'bubbles': true}));
  };

  var initForm = function(items) {
    document.querySelector('.content-wrapper').style.display = 'block';

    var txtAuthEmail = document.getElementById('auth_email');
    var txtDeviceId = document.getElementById('device_id');

    var btnLogout = document.getElementById('btn_logout');
    btnLogout.addEventListener('click', function(e) {
      e.preventDefault();

      if (confirm('Change to another email?')) {
        clearData(function() {
          window.location.reload();
        });
      }
    });

    var btnSave = document.getElementById('btn_save');
    btnSave.addEventListener('click', function(e) {
      e.preventDefault();

      var sdkVersion = document.getElementById('android_version').value;

      var txtCodename = document.getElementById('android_codename');
      var codename = txtCodename.value.trim();
      if (codename.length === 0) {
        alert('Please enter device codename');
        txtCodename.focus();
        return;
      }

      Utils.getAccountSettings(function(items) {
        items.account.deviceSdk = '' + sdkVersion;
        items.account.deviceCodename = codename;

        Utils.saveAccount(items.account, function() {
          window.location.reload();
        });
      });
    });

    Utils.setupTooltips();

    if (!items.account.deviceCodename) {
      items.account.deviceCodename = Utils.DEFAULT_DEVICE.codename;
    }

    if (!items.account.deviceSdk) {
      items.account.deviceSdk = Utils.DEFAULT_DEVICE.sdk;
    }

    txtAuthEmail.textContent = items.account.email;
    txtDeviceId.textContent = items.account.deviceId.toUpperCase();

    renderSdkList('' + items.account.deviceSdk);
    renderDeviceList(items.account.deviceCodename);
  };

  var init = function() {
    Utils.getAccountSettings(function(items) {
      if (!items.account) {
        window.location = 'login.html';
      } else {
        initForm(items);
      }
    });
  };

  init();
})();