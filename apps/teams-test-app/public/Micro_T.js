(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("microsoftTeams", [], factory);
	else if(typeof exports === 'object')
		exports["microsoftTeams"] = factory();
	else
		root["microsoftTeams"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 22:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var v1 = __webpack_require__(481);
var v4 = __webpack_require__(426);

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;


/***/ }),

/***/ 725:
/***/ ((module) => {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]], '-',
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]],
    bth[buf[i++]], bth[buf[i++]]
  ]).join('');
}

module.exports = bytesToUuid;


/***/ }),

/***/ 157:
/***/ ((module) => {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),

/***/ 481:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var rng = __webpack_require__(157);
var bytesToUuid = __webpack_require__(725);

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/uuidjs/uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),

/***/ 426:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var rng = __webpack_require__(157);
var bytesToUuid = __webpack_require__(725);

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "ChannelType": () => (/* reexport */ ChannelType),
  "ChildAppWindow": () => (/* reexport */ ChildAppWindow),
  "DialogDimension": () => (/* reexport */ DialogDimension),
  "ErrorCode": () => (/* reexport */ ErrorCode),
  "FileOpenPreference": () => (/* reexport */ FileOpenPreference),
  "FrameContexts": () => (/* reexport */ FrameContexts),
  "HostClientType": () => (/* reexport */ HostClientType),
  "NotificationTypes": () => (/* reexport */ NotificationTypes),
  "ParentAppWindow": () => (/* reexport */ ParentAppWindow),
  "TaskModuleDimension": () => (/* reexport */ TaskModuleDimension),
  "TeamType": () => (/* reexport */ TeamType),
  "UserSettingTypes": () => (/* reexport */ UserSettingTypes),
  "UserTeamRole": () => (/* reexport */ UserTeamRole),
  "ViewerActionTypes": () => (/* reexport */ ViewerActionTypes),
  "app": () => (/* reexport */ app_app),
  "appEntity": () => (/* reexport */ appEntity),
  "appInitialization": () => (/* reexport */ appInitialization),
  "appInstallDialog": () => (/* reexport */ appInstallDialog),
  "authentication": () => (/* reexport */ authentication),
  "bot": () => (/* reexport */ bot),
  "calendar": () => (/* reexport */ calendar),
  "call": () => (/* reexport */ call),
  "chat": () => (/* reexport */ chat),
  "core": () => (/* reexport */ core),
  "dialog": () => (/* reexport */ dialog),
  "enablePrintCapability": () => (/* reexport */ enablePrintCapability),
  "executeDeepLink": () => (/* reexport */ executeDeepLink),
  "files": () => (/* reexport */ files),
  "getContext": () => (/* reexport */ getContext),
  "getMruTabInstances": () => (/* reexport */ getMruTabInstances),
  "getTabInstances": () => (/* reexport */ getTabInstances),
  "initialize": () => (/* reexport */ initialize),
  "initializeWithFrameContext": () => (/* reexport */ initializeWithFrameContext),
  "legacy": () => (/* reexport */ legacy),
  "location": () => (/* reexport */ location_location),
  "logs": () => (/* reexport */ logs),
  "mail": () => (/* reexport */ mail),
  "media": () => (/* reexport */ media),
  "meeting": () => (/* reexport */ meeting),
  "meetingRoom": () => (/* reexport */ meetingRoom),
  "menus": () => (/* reexport */ menus),
  "monetization": () => (/* reexport */ monetization),
  "navigateBack": () => (/* reexport */ navigateBack),
  "navigateCrossDomain": () => (/* reexport */ navigateCrossDomain),
  "navigateToTab": () => (/* reexport */ navigateToTab),
  "notifications": () => (/* reexport */ notifications),
  "pages": () => (/* reexport */ pages),
  "people": () => (/* reexport */ people),
  "print": () => (/* reexport */ print),
  "registerAppButtonClickHandler": () => (/* reexport */ registerAppButtonClickHandler),
  "registerAppButtonHoverEnterHandler": () => (/* reexport */ registerAppButtonHoverEnterHandler),
  "registerAppButtonHoverLeaveHandler": () => (/* reexport */ registerAppButtonHoverLeaveHandler),
  "registerBackButtonHandler": () => (/* reexport */ registerBackButtonHandler),
  "registerBeforeUnloadHandler": () => (/* reexport */ registerBeforeUnloadHandler),
  "registerCustomHandler": () => (/* reexport */ registerCustomHandler),
  "registerEnterSettingsHandler": () => (/* reexport */ registerEnterSettingsHandler),
  "registerFocusEnterHandler": () => (/* reexport */ registerFocusEnterHandler),
  "registerFullScreenHandler": () => (/* reexport */ registerFullScreenHandler),
  "registerOnLoadHandler": () => (/* reexport */ registerOnLoadHandler),
  "registerOnThemeChangeHandler": () => (/* reexport */ registerOnThemeChangeHandler),
  "registerUserSettingsChangeHandler": () => (/* reexport */ registerUserSettingsChangeHandler),
  "remoteCamera": () => (/* reexport */ remoteCamera),
  "returnFocus": () => (/* reexport */ returnFocus),
  "sendCustomEvent": () => (/* reexport */ sendCustomEvent),
  "sendCustomMessage": () => (/* reexport */ sendCustomMessage),
  "setFrameContext": () => (/* reexport */ setFrameContext),
  "settings": () => (/* reexport */ settings),
  "shareDeepLink": () => (/* reexport */ shareDeepLink),
  "sharing": () => (/* reexport */ sharing),
  "tasks": () => (/* reexport */ tasks),
  "teams": () => (/* reexport */ teams),
  "teamsCore": () => (/* reexport */ teamsCore),
  "uploadCustomApp": () => (/* reexport */ uploadCustomApp),
  "video": () => (/* reexport */ video)
});

;// CONCATENATED MODULE: external "es6-promise"
const external_es6_promise_namespaceObject = require("es6-promise");
;// CONCATENATED MODULE: ./src/internal/constants.ts
var version = '2.0.0-beta.1';
/**
 * @hidden
 * The SDK version when all SDK APIs started to check platform compatibility for the APIs was 1.6.0.
 * Modified to 2.0.1 which is hightest till now so that if any client doesn't pass version in initialize function, it will be set to highest.
 * Mobile clients are passing versions, hence will be applicable to web and desktop clients only.
 *
 * @internal
 */
var defaultSDKVersionForCompatCheck = '2.0.1';
/**
 * @hidden
 * This is the SDK version when selectMedia API - VideoAndImage is supported on mobile.
 *
 * @internal
 */
var videoAndImageMediaAPISupportVersion = '2.0.2';
/**
 * @hidden
 * Minimum required client supported version for {@link getUserJoinedTeams} to be supported on {@link HostClientType.android}
 *
 * @internal
 */
var getUserJoinedTeamsSupportedAndroidClientVersion = '2.0.1';
/**
 * @hidden
 * This is the SDK version when location APIs (getLocation and showLocation) are supported.
 *
 * @internal
 */
var locationAPIsRequiredVersion = '1.9.0';
/**
 * @hidden
 * This is the SDK version when people picker API is supported on mobile.
 *
 * @internal
 */
var peoplePickerRequiredVersion = '2.0.0';
/**
 * @hidden
 * This is the SDK version when captureImage API is supported on mobile.
 *
 * @internal
 */
var captureImageMobileSupportVersion = '1.7.0';
/**
 * @hidden
 * This is the SDK version when media APIs are supported on all three platforms ios, android and web.
 *
 * @internal
 */
var mediaAPISupportVersion = '1.8.0';
/**
 * @hidden
 * This is the SDK version when getMedia API is supported via Callbacks on all three platforms ios, android and web.
 *
 * @internal
 */
var getMediaCallbackSupportVersion = '2.0.0';
/**
 * @hidden
 * This is the SDK version when scanBarCode API is supported on mobile.
 *
 * @internal
 */
var scanBarCodeAPIMobileSupportVersion = '1.9.0';
/**
 * @hidden
 * List of supported Host origins
 *
 * @internal
 */
var validOrigins = [
    'teams.microsoft.com',
    'teams.microsoft.us',
    'gov.teams.microsoft.us',
    'dod.teams.microsoft.us',
    'int.teams.microsoft.com',
    'teams.live.com',
    'devspaces.skype.com',
    'ssauth.skype.com',
    'local.teams.live.com',
    'local.teams.live.com:8080',
    'local.teams.office.com',
    'local.teams.office.com:8080',
    'msft.spoppe.com',
    '*.sharepoint.com',
    '*.sharepoint-df.com',
    '*.sharepointonline.com',
    'outlook.office.com',
    'outlook-sdf.office.com',
    '*.teams.microsoft.com',
    'www.office.com',
    'word.office.com',
    'excel.office.com',
    'powerpoint.office.com',
    'www.officeppe.com',
    '*.www.office.com',
];
/**
 * @hidden
 * USer specified message origins should satisfy this test
 *
 * @internal
 */
var userOriginUrlValidationRegExp = /^https:\/\//;

;// CONCATENATED MODULE: ./src/internal/globalVars.ts
var GlobalVars = /** @class */ (function () {
    function GlobalVars() {
    }
    GlobalVars.initializeCalled = false;
    GlobalVars.initializeCompleted = false;
    GlobalVars.additionalValidOrigins = [];
    GlobalVars.isFramelessWindow = false;
    GlobalVars.printCapabilityEnabled = false;
    return GlobalVars;
}());


// EXTERNAL MODULE: ../../node_modules/uuid/index.js
var uuid = __webpack_require__(22);
;// CONCATENATED MODULE: ./src/internal/utils.ts
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */



/**
 * @param pattern - reference pattern
 * @param host - candidate string
 * @returns returns true if host matches pre-know valid pattern
 *
 * @example
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 *
 * @internal
 */
function validateHostAgainstPattern(pattern, host) {
    if (pattern.substring(0, 2) === '*.') {
        var suffix = pattern.substring(1);
        if (host.length > suffix.length &&
            host.split('.').length === suffix.split('.').length &&
            host.substring(host.length - suffix.length) === suffix) {
            return true;
        }
    }
    else if (pattern === host) {
        return true;
    }
    return false;
}
/**@internal */
function validateOrigin(messageOrigin) {
    // Check whether the url is in the pre-known allowlist or supplied by user
    if (messageOrigin.protocol !== 'https:') {
        return false;
    }
    var messageOriginHost = messageOrigin.host;
    if (validOrigins.some(function (pattern) { return validateHostAgainstPattern(pattern, messageOriginHost); })) {
        return true;
    }
    for (var _i = 0, _a = GlobalVars.additionalValidOrigins; _i < _a.length; _i++) {
        var domainOrPattern = _a[_i];
        var pattern = domainOrPattern.substring(0, 8) === 'https://' ? domainOrPattern.substring(8) : domainOrPattern;
        if (validateHostAgainstPattern(pattern, messageOriginHost)) {
            return true;
        }
    }
    return false;
}
/**@internal */
function getGenericOnCompleteHandler(errorMessage) {
    return function (success, reason) {
        if (!success) {
            throw new Error(errorMessage ? errorMessage : reason);
        }
    };
}
/**
 * @hidden
 * Compares SDK versions.
 *
 * @param v1 - first version
 * @param v2 - second version
 * @returns NaN in case inputs are not in right format
 *         -1 if v1 < v2
 *          1 if v1 > v2
 *          0 otherwise
 * @example
 *    compareSDKVersions('1.2', '1.2.0') returns 0
 *    compareSDKVersions('1.2a', '1.2b') returns NaN
 *    compareSDKVersions('1.2', '1.3') returns -1
 *    compareSDKVersions('2.0', '1.3.2') returns 1
 *    compareSDKVersions('2.0', 2.0) returns NaN
 *
 * @internal
 */
function compareSDKVersions(v1, v2) {
    if (typeof v1 !== 'string' || typeof v2 !== 'string') {
        return NaN;
    }
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');
    function isValidPart(x) {
        // input has to have one or more digits
        // For ex - returns true for '11', false for '1a1', false for 'a', false for '2b'
        return /^\d+$/.test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    // Make length of both parts equal
    while (v1parts.length < v2parts.length) {
        v1parts.push('0');
    }
    while (v2parts.length < v1parts.length) {
        v2parts.push('0');
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (Number(v1parts[i]) == Number(v2parts[i])) {
            continue;
        }
        else if (Number(v1parts[i]) > Number(v2parts[i])) {
            return 1;
        }
        else {
            return -1;
        }
    }
    return 0;
}
/**
 * @hidden
 * Generates a GUID
 *
 * @internal
 */
function generateGUID() {
    return uuid.v4();
}
function deepFreeze(obj) {
    Object.keys(obj).forEach(function (prop) {
        if (typeof obj[prop] === 'object') {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
}
/**
 * This utility function is used when the result of the promise is same as the result in the callback.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 */
function callCallbackWithErrorOrResultFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function (result) {
        if (callback) {
            callback(undefined, result);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e);
        }
    });
    return p;
}
/**
 * This utility function is used when the return type of the promise is usually void and
 * the result in the callback is a boolean type (true for success and false for error)
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 * @internal
 */
function callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function () {
        if (callback) {
            callback(undefined, true);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e, false);
        }
    });
    return p;
}
/**
 * This utility function is called when the callback has only Error/SdkError as the primary argument.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 * @internal
 */
function callCallbackWithSdkErrorFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function () {
        if (callback) {
            callback(null);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e);
        }
    });
    return p;
}
/**
 * This utility function is used when the result of the promise is same as the result in the callback.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 */
function callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function (result) {
        if (callback) {
            callback(null, result);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e, null);
        }
    });
    return p;
}

;// CONCATENATED MODULE: ./src/internal/internalAPIs.ts



/** @internal */
function ensureInitialized() {
    var expectedFrameContexts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        expectedFrameContexts[_i] = arguments[_i];
    }
    if (!GlobalVars.initializeCalled) {
        throw new Error('The library has not yet been initialized');
    }
    if (GlobalVars.frameContext && expectedFrameContexts && expectedFrameContexts.length > 0) {
        var found = false;
        for (var i = 0; i < expectedFrameContexts.length; i++) {
            if (expectedFrameContexts[i] === GlobalVars.frameContext) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error("This call is not allowed in the '" + GlobalVars.frameContext + "' context");
        }
    }
}
/**
 * @hidden
 * Checks whether the platform has knowledge of this API by doing a comparison
 * on API required version and platform supported version of the SDK
 *
 * @param requiredVersion - SDK version required by the API
 *
 * @internal
 */
function isAPISupportedByPlatform(requiredVersion) {
    if (requiredVersion === void 0) { requiredVersion = defaultSDKVersionForCompatCheck; }
    var value = compareSDKVersions(GlobalVars.clientSupportedSDKVersion, requiredVersion);
    if (isNaN(value)) {
        return false;
    }
    return value >= 0;
}
/**
 * @hidden
 * Processes the valid origins specifuied by the user, de-duplicates and converts them into a regexp
 * which is used later for message source/origin validation
 *
 * @internal
 */
function processAdditionalValidOrigins(validMessageOrigins) {
    var combinedOriginUrls = GlobalVars.additionalValidOrigins.concat(validMessageOrigins.filter(function (_origin) {
        return typeof _origin === 'string' && userOriginUrlValidationRegExp.test(_origin);
    }));
    var dedupUrls = {};
    combinedOriginUrls = combinedOriginUrls.filter(function (_originUrl) {
        if (dedupUrls[_originUrl]) {
            return false;
        }
        dedupUrls[_originUrl] = true;
        return true;
    });
    GlobalVars.additionalValidOrigins = combinedOriginUrls;
}

;// CONCATENATED MODULE: ./src/public/runtime.ts
/* eslint-disable @typescript-eslint/ban-types */

var runtime = {
    apiVersion: 1,
    supports: {
        appInstallDialog: undefined,
        bot: undefined,
        calendar: undefined,
        call: undefined,
        chat: undefined,
        dialog: undefined,
        location: undefined,
        logs: undefined,
        mail: undefined,
        media: undefined,
        meeting: undefined,
        meetingRoom: undefined,
        menus: undefined,
        monetization: undefined,
        notifications: undefined,
        pages: {
            appButton: undefined,
            tabs: undefined,
            config: undefined,
            backStack: undefined,
            fullTrust: undefined,
        },
        people: undefined,
        remoteCamera: undefined,
        sharing: undefined,
        teams: {
            fullTrust: undefined,
        },
        teamsCore: undefined,
        video: undefined,
    },
};
var teamsRuntimeConfig = {
    apiVersion: 1,
    supports: {
        appInstallDialog: {},
        appEntity: {},
        bot: {},
        calendar: {},
        call: {},
        chat: {},
        dialog: {},
        files: {},
        location: {},
        logs: {},
        mail: {},
        media: {},
        meeting: {},
        meetingRoom: {},
        menus: {},
        monetization: {},
        notifications: {},
        pages: {
            appButton: {},
            tabs: {},
            config: {},
            backStack: {},
            fullTrust: {},
        },
        people: {},
        remoteCamera: {},
        sharing: {},
        teams: {
            fullTrust: {},
        },
        teamsCore: {},
        video: {},
    },
};
function applyRuntimeConfig(runtimeConfig) {
    runtime = deepFreeze(runtimeConfig);
}

;// CONCATENATED MODULE: ./src/private/logs.ts




/**
 * @hidden
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * Hide from docs
 *
 * @internal
 */
var logs;
(function (logs) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Registers a handler for getting app log
     *
     * @param handler - The handler to invoke to get the app log
     */
    function registerGetLogHandler(handler) {
        ensureInitialized();
        if (handler) {
            registerHandler('log.request', function () {
                var log = handler();
                sendMessageToParent('log.receive', [log]);
            });
        }
        else {
            removeHandler('log.request');
        }
    }
    logs.registerGetLogHandler = registerGetLogHandler;
    function isSupported() {
        return runtime.supports.logs ? true : false;
    }
    logs.isSupported = isSupported;
})(logs || (logs = {}));

;// CONCATENATED MODULE: ./src/private/menus.ts




/**
 * @hidden
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 *
 * Hide from docs until feature is complete
 * @alpha
 */
var menus;
(function (menus) {
    /**
     * @hidden
     * Represents information about menu item for Action Menu and Navigation Bar Menu.
     */
    var MenuItem = /** @class */ (function () {
        function MenuItem() {
            /**
             * @hidden
             * State of the menu item
             */
            this.enabled = true;
            /**
             * @hidden
             * Whether the menu item is selected or not
             */
            this.selected = false;
        }
        return MenuItem;
    }());
    menus.MenuItem = MenuItem;
    /**
     * @hidden
     * Represents information about type of list to display in Navigation Bar Menu.
     */
    var MenuListType;
    (function (MenuListType) {
        MenuListType["dropDown"] = "dropDown";
        MenuListType["popOver"] = "popOver";
    })(MenuListType = menus.MenuListType || (menus.MenuListType = {}));
    var navBarMenuItemPressHandler;
    var actionMenuItemPressHandler;
    var viewConfigItemPressHandler;
    function initialize() {
        registerHandler('navBarMenuItemPress', handleNavBarMenuItemPress, false);
        registerHandler('actionMenuItemPress', handleActionMenuItemPress, false);
        registerHandler('setModuleView', handleViewConfigItemPress, false);
    }
    menus.initialize = initialize;
    /**
     * @hidden
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     *
     * @param viewConfig - List of view configurations. Minimum 1 value is required.
     * @param handler - The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig, handler) {
        ensureInitialized();
        viewConfigItemPressHandler = handler;
        sendMessageToParent('setUpViews', [viewConfig]);
    }
    menus.setUpViews = setUpViews;
    function handleViewConfigItemPress(id) {
        if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
            ensureInitialized();
            sendMessageToParent('viewConfigItemPress', [id]);
        }
    }
    /**
     * @hidden
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     *
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items, handler) {
        ensureInitialized();
        navBarMenuItemPressHandler = handler;
        sendMessageToParent('setNavBarMenu', [items]);
    }
    menus.setNavBarMenu = setNavBarMenu;
    function handleNavBarMenuItemPress(id) {
        if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
            ensureInitialized();
            sendMessageToParent('handleNavBarMenuItemPress', [id]);
        }
    }
    /**
     * @hidden
     * Used to show Action Menu.
     *
     * @param params - Parameters for Menu Parameters
     * @param handler - The handler to invoke when the user selects menu item.
     */
    function showActionMenu(params, handler) {
        ensureInitialized();
        actionMenuItemPressHandler = handler;
        sendMessageToParent('showActionMenu', [params]);
    }
    menus.showActionMenu = showActionMenu;
    function handleActionMenuItemPress(id) {
        if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
            ensureInitialized();
            sendMessageToParent('handleActionMenuItemPress', [id]);
        }
    }
    function isSupported() {
        return runtime.supports.menus ? true : false;
    }
    menus.isSupported = isSupported;
})(menus || (menus = {}));

;// CONCATENATED MODULE: ./src/private/privateAPIs.ts
/* eslint-disable @typescript-eslint/no-explicit-any */





/**
 * @internal
 */
function initializePrivateApis() {
    menus.initialize();
}
/**
 * @hidden
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 *
 * @internal
 */
function uploadCustomApp(manifestBlob, onComplete) {
    ensureInitialized();
    sendMessageToParent('uploadCustomApp', [manifestBlob], onComplete ? onComplete : getGenericOnCompleteHandler());
}
/**
 * @hidden
 * Internal use only
 * Sends a custom action MessageRequest to Teams or parent window
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @param callback - Optionally specify a callback to receive response parameters from the parent
 * @returns id of sent message
 *
 * @internal
 */
function sendCustomMessage(actionName, 
// tslint:disable-next-line:no-any
args, 
// tslint:disable-next-line:no-any
callback) {
    ensureInitialized();
    sendMessageToParent(actionName, args, callback);
}
/**
 * @hidden
 * Internal use only
 * Sends a custom action MessageEvent to a child iframe/window, only if you are not using auth popup.
 * Otherwise it will go to the auth popup (which becomes the child)
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @returns id of sent message
 *
 * @internal
 */
function sendCustomEvent(actionName, 
// tslint:disable-next-line:no-any
args) {
    ensureInitialized();
    //validate childWindow
    if (!Communication.childWindow) {
        throw new Error('The child window has not yet been initialized or is not present');
    }
    sendMessageEventToChild(actionName, args);
}
/**
 * @hidden
 * Internal use only
 * Adds a handler for an action sent by a child window or parent window
 *
 * @param actionName - Specifies name of the action message to handle
 * @param customHandler - The callback to invoke when the action message is received. The return value is sent to the child
 *
 * @internal
 */
function registerCustomHandler(actionName, customHandler) {
    var _this = this;
    ensureInitialized();
    registerHandler(actionName, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return customHandler.apply(_this, args);
    });
}
/**
 * @hidden
 * register a handler to be called when a user setting changes. The changed setting type & value is provided in the callback.
 *
 * @param settingTypes - List of user setting changes to subscribe
 * @param handler - When a subscribed setting is updated this handler is called
 *
 * @internal
 */
function registerUserSettingsChangeHandler(settingTypes, handler) {
    ensureInitialized();
    registerHandler('userSettingsChange', handler, true, [settingTypes]);
}

;// CONCATENATED MODULE: ./src/public/constants.ts
var HostClientType;
(function (HostClientType) {
    HostClientType["desktop"] = "desktop";
    HostClientType["web"] = "web";
    HostClientType["android"] = "android";
    HostClientType["ios"] = "ios";
    /**
     * @deprecated Use teamsRoomsWindows instead.
     */
    HostClientType["rigel"] = "rigel";
    HostClientType["surfaceHub"] = "surfaceHub";
    HostClientType["teamsRoomsWindows"] = "teamsRoomsWindows";
    HostClientType["teamsRoomsAndroid"] = "teamsRoomsAndroid";
    HostClientType["teamsPhones"] = "teamsPhones";
    HostClientType["teamsDisplays"] = "teamsDisplays";
})(HostClientType || (HostClientType = {}));
var HostName;
(function (HostName) {
    HostName["office"] = "Office";
    HostName["outlook"] = "Outlook";
    HostName["orange"] = "Orange";
    HostName["teams"] = "Teams";
})(HostName || (HostName = {}));
// Ensure these declarations stay in sync with the framework.
var FrameContexts;
(function (FrameContexts) {
    FrameContexts["settings"] = "settings";
    FrameContexts["content"] = "content";
    FrameContexts["authentication"] = "authentication";
    FrameContexts["remove"] = "remove";
    FrameContexts["task"] = "task";
    FrameContexts["sidePanel"] = "sidePanel";
    FrameContexts["stage"] = "stage";
    FrameContexts["meetingStage"] = "meetingStage";
})(FrameContexts || (FrameContexts = {}));
/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
var TeamType;
(function (TeamType) {
    TeamType[TeamType["Standard"] = 0] = "Standard";
    TeamType[TeamType["Edu"] = 1] = "Edu";
    TeamType[TeamType["Class"] = 2] = "Class";
    TeamType[TeamType["Plc"] = 3] = "Plc";
    TeamType[TeamType["Staff"] = 4] = "Staff";
})(TeamType || (TeamType = {}));
/**
 * Indicates the various types of roles of a user in a team.
 */
var UserTeamRole;
(function (UserTeamRole) {
    UserTeamRole[UserTeamRole["Admin"] = 0] = "Admin";
    UserTeamRole[UserTeamRole["User"] = 1] = "User";
    UserTeamRole[UserTeamRole["Guest"] = 2] = "Guest";
})(UserTeamRole || (UserTeamRole = {}));
/**
 * Dialog module dimension enum
 */
var DialogDimension;
(function (DialogDimension) {
    DialogDimension["Large"] = "large";
    DialogDimension["Medium"] = "medium";
    DialogDimension["Small"] = "small";
})(DialogDimension || (DialogDimension = {}));
/**
 * @deprecated with TeamsJS v2 upgrades
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var TaskModuleDimension = DialogDimension;
/**
 * The type of the channel with which the content is associated.
 */
var ChannelType;
(function (ChannelType) {
    ChannelType["Regular"] = "Regular";
    ChannelType["Private"] = "Private";
    ChannelType["Shared"] = "Shared";
})(ChannelType || (ChannelType = {}));

;// CONCATENATED MODULE: ./src/public/authentication.ts





/**
 * Namespace to interact with the authentication-specific part of the SDK.
 *
 * This object is used for starting or completing authentication flows.
 *
 * @beta
 */
var authentication;
(function (authentication) {
    var authHandlers;
    var authWindowMonitor;
    function initialize() {
        registerHandler('authentication.authenticate.success', handleSuccess, false);
        registerHandler('authentication.authenticate.failure', handleFailure, false);
    }
    authentication.initialize = initialize;
    var authParams;
    /**
     * @deprecated with Teams JS v2 upgrades
     *
     * Registers the authentication Communication.handlers
     *
     * @param authenticateParameters - A set of values that configure the authentication pop-up.
     */
    function registerAuthenticationHandlers(authenticateParameters) {
        authParams = authenticateParameters;
    }
    authentication.registerAuthenticationHandlers = registerAuthenticationHandlers;
    function authenticate(authenticateParameters) {
        var isDifferentParamsInCall = authenticateParameters !== undefined;
        var authenticateParams = isDifferentParamsInCall ? authenticateParameters : authParams;
        if (!authenticateParams) {
            throw new Error('No parameters are provided for authentication');
        }
        ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.settings, FrameContexts.remove, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
        return authenticateHelper(authenticateParams)
            .then(function (value) {
            try {
                if (authenticateParams && authenticateParams.successCallback) {
                    authenticateParams.successCallback(value);
                    return '';
                }
                return value;
            }
            finally {
                if (!isDifferentParamsInCall) {
                    authParams = null;
                }
            }
        })
            .catch(function (err) {
            try {
                if (authenticateParams && authenticateParams.failureCallback) {
                    authenticateParams.failureCallback(err.message);
                    return '';
                }
                throw err;
            }
            finally {
                if (!isDifferentParamsInCall) {
                    authParams = null;
                }
            }
        });
    }
    authentication.authenticate = authenticate;
    function authenticateHelper(authenticateParameters) {
        return new Promise(function (resolve, reject) {
            if (GlobalVars.hostClientType === HostClientType.desktop ||
                GlobalVars.hostClientType === HostClientType.android ||
                GlobalVars.hostClientType === HostClientType.ios ||
                GlobalVars.hostClientType === HostClientType.rigel ||
                GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
                GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
                GlobalVars.hostClientType === HostClientType.teamsPhones ||
                GlobalVars.hostClientType === HostClientType.teamsDisplays) {
                // Convert any relative URLs into absolute URLs before sending them over to the parent window.
                var link = document.createElement('a');
                link.href = authenticateParameters.url;
                // Ask the parent window to open an authentication window with the parameters provided by the caller.
                resolve(sendMessageToParentAsync('authentication.authenticate', [
                    link.href,
                    authenticateParameters.width,
                    authenticateParameters.height,
                ]).then(function (_a) {
                    var success = _a[0], response = _a[1];
                    if (success) {
                        return response;
                    }
                    else {
                        throw new Error(response);
                    }
                }));
            }
            else {
                // Open an authentication window with the parameters provided by the caller.
                authHandlers = {
                    success: resolve,
                    fail: reject,
                };
                openAuthenticationWindow(authenticateParameters);
            }
        });
    }
    function getAuthToken(authTokenRequest) {
        ensureInitialized();
        return getAuthTokenHelper(authTokenRequest)
            .then(function (value) {
            if (authTokenRequest && authTokenRequest.successCallback) {
                authTokenRequest.successCallback(value);
                return '';
            }
            return value;
        })
            .catch(function (err) {
            if (authTokenRequest && authTokenRequest.failureCallback) {
                authTokenRequest.failureCallback(err.message);
                return '';
            }
            throw err;
        });
    }
    authentication.getAuthToken = getAuthToken;
    function getAuthTokenHelper(authTokenRequest) {
        return new Promise(function (resolve) {
            resolve(sendMessageToParentAsync('authentication.getAuthToken', [
                authTokenRequest.resources,
                authTokenRequest.claims,
                authTokenRequest.silent,
            ]));
        }).then(function (_a) {
            var success = _a[0], result = _a[1];
            if (success) {
                return result;
            }
            else {
                throw new Error(result);
            }
        });
    }
    function getUser(userRequest) {
        ensureInitialized();
        return getUserHelper()
            .then(function (value) {
            if (userRequest && userRequest.successCallback) {
                userRequest.successCallback(value);
                return null;
            }
            return value;
        })
            .catch(function (err) {
            if (userRequest && userRequest.failureCallback) {
                userRequest.failureCallback(err.message);
                return null;
            }
            throw err;
        });
    }
    authentication.getUser = getUser;
    function getUserHelper() {
        return new Promise(function (resolve) {
            resolve(sendMessageToParentAsync('authentication.getUser'));
        }).then(function (_a) {
            var success = _a[0], result = _a[1];
            if (success) {
                return result;
            }
            else {
                throw new Error(result);
            }
        });
    }
    function closeAuthenticationWindow() {
        // Stop monitoring the authentication window
        stopAuthenticationWindowMonitor();
        // Try to close the authentication window and clear all properties associated with it
        try {
            if (Communication.childWindow) {
                Communication.childWindow.close();
            }
        }
        finally {
            Communication.childWindow = null;
            Communication.childOrigin = null;
        }
    }
    function openAuthenticationWindow(authenticateParameters) {
        // Close the previously opened window if we have one
        closeAuthenticationWindow();
        // Start with a sensible default size
        var width = authenticateParameters.width || 600;
        var height = authenticateParameters.height || 400;
        // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
        width = Math.min(width, Communication.currentWindow.outerWidth - 400);
        height = Math.min(height, Communication.currentWindow.outerHeight - 200);
        // Convert any relative URLs into absolute URLs before sending them over to the parent window
        var link = document.createElement('a');
        link.href = authenticateParameters.url;
        // We are running in the browser, so we need to center the new window ourselves
        var left = typeof Communication.currentWindow.screenLeft !== 'undefined'
            ? Communication.currentWindow.screenLeft
            : Communication.currentWindow.screenX;
        var top = typeof Communication.currentWindow.screenTop !== 'undefined'
            ? Communication.currentWindow.screenTop
            : Communication.currentWindow.screenY;
        left += Communication.currentWindow.outerWidth / 2 - width / 2;
        top += Communication.currentWindow.outerHeight / 2 - height / 2;
        // Open a child window with a desired set of standard browser features
        Communication.childWindow = Communication.currentWindow.open(link.href, '_blank', 'toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top=' +
            top +
            ', left=' +
            left +
            ', width=' +
            width +
            ', height=' +
            height);
        if (Communication.childWindow) {
            // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
            startAuthenticationWindowMonitor();
        }
        else {
            // If we failed to open the window, fail the authentication flow
            handleFailure('FailedToOpenWindow');
        }
    }
    function stopAuthenticationWindowMonitor() {
        if (authWindowMonitor) {
            clearInterval(authWindowMonitor);
            authWindowMonitor = 0;
        }
        removeHandler('initialize');
        removeHandler('navigateCrossDomain');
    }
    function startAuthenticationWindowMonitor() {
        // Stop the previous window monitor if one is running
        stopAuthenticationWindowMonitor();
        // Create an interval loop that
        // - Notifies the caller of failure if it detects that the authentication window is closed
        // - Keeps pinging the authentication window while it is open to re-establish
        //   contact with any pages along the authentication flow that need to communicate
        //   with us
        authWindowMonitor = Communication.currentWindow.setInterval(function () {
            if (!Communication.childWindow || Communication.childWindow.closed) {
                handleFailure('CancelledByUser');
            }
            else {
                var savedChildOrigin = Communication.childOrigin;
                try {
                    Communication.childOrigin = '*';
                    sendMessageEventToChild('ping');
                }
                finally {
                    Communication.childOrigin = savedChildOrigin;
                }
            }
        }, 100);
        // Set up an initialize-message handler that gives the authentication window its frame context
        registerHandler('initialize', function () {
            return [FrameContexts.authentication, GlobalVars.hostClientType];
        });
        // Set up a navigateCrossDomain message handler that blocks cross-domain re-navigation attempts
        // in the authentication window. We could at some point choose to implement this method via a call to
        // authenticationWindow.location.href = url; however, we would first need to figure out how to
        // validate the URL against the tab's list of valid domains.
        registerHandler('navigateCrossDomain', function () {
            return false;
        });
    }
    /**
     * Notifies the frame that initiated this authentication request that the request was successful.
     *
     * @remarks
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     *
     * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl - Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifySuccess(result, callbackUrl) {
        redirectIfWin32Outlook(callbackUrl, 'result', result);
        ensureInitialized(FrameContexts.authentication);
        sendMessageToParent('authentication.authenticate.success', [result]);
        // Wait for the message to be sent before closing the window
        waitForMessageQueue(Communication.parentWindow, function () { return setTimeout(function () { return Communication.currentWindow.close(); }, 200); });
    }
    authentication.notifySuccess = notifySuccess;
    /**
     * Notifies the frame that initiated this authentication request that the request failed.
     *
     * @remarks
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     *
     * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl - Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifyFailure(reason, callbackUrl) {
        redirectIfWin32Outlook(callbackUrl, 'reason', reason);
        ensureInitialized(FrameContexts.authentication);
        sendMessageToParent('authentication.authenticate.failure', [reason]);
        // Wait for the message to be sent before closing the window
        waitForMessageQueue(Communication.parentWindow, function () { return setTimeout(function () { return Communication.currentWindow.close(); }, 200); });
    }
    authentication.notifyFailure = notifyFailure;
    function handleSuccess(result) {
        try {
            if (authHandlers) {
                authHandlers.success(result);
            }
        }
        finally {
            authHandlers = null;
            closeAuthenticationWindow();
        }
    }
    function handleFailure(reason) {
        try {
            if (authHandlers) {
                authHandlers.fail(new Error(reason));
            }
        }
        finally {
            authHandlers = null;
            closeAuthenticationWindow();
        }
    }
    /**
     * Validates that the callbackUrl param is a valid connector url, appends the result/reason and authSuccess/authFailure as URL fragments and redirects the window
     * @param callbackUrl - the connectors url to redirect to
     * @param key - "result" in case of success and "reason" in case of failure
     * @param value - the value of the passed result/reason parameter
     */
    function redirectIfWin32Outlook(callbackUrl, key, value) {
        if (callbackUrl) {
            var link = document.createElement('a');
            link.href = decodeURIComponent(callbackUrl);
            if (link.host &&
                link.host !== window.location.host &&
                link.host === 'outlook.office.com' &&
                link.search.indexOf('client_type=Win32_Outlook') > -1) {
                if (key && key === 'result') {
                    if (value) {
                        link.href = updateUrlParameter(link.href, 'result', value);
                    }
                    Communication.currentWindow.location.assign(updateUrlParameter(link.href, 'authSuccess', ''));
                }
                if (key && key === 'reason') {
                    if (value) {
                        link.href = updateUrlParameter(link.href, 'reason', value);
                    }
                    Communication.currentWindow.location.assign(updateUrlParameter(link.href, 'authFailure', ''));
                }
            }
        }
    }
    /**
     * Appends either result or reason as a fragment to the 'callbackUrl'
     * @param uri - the url to modify
     * @param key - the fragment key
     * @param value - the fragment value
     */
    function updateUrlParameter(uri, key, value) {
        var i = uri.indexOf('#');
        var hash = i === -1 ? '#' : uri.substr(i);
        hash = hash + '&' + key + (value !== '' ? '=' + value : '');
        uri = i === -1 ? uri : uri.substr(0, i);
        return uri + hash;
    }
})(authentication || (authentication = {}));

;// CONCATENATED MODULE: ./src/public/teamsAPIs.ts

 // Conflict with some names


/**
 * Namespace containing the set of APIs that support Teams-specific functionalities.
 *
 * @alpha
 */
var teamsCore;
(function (teamsCore) {
    /**
     * Enable print capability to support printing page using Ctrl+P and cmd+P
     */
    function enablePrintCapability() {
        if (!GlobalVars.printCapabilityEnabled) {
            GlobalVars.printCapabilityEnabled = true;
            ensureInitialized();
            // adding ctrl+P and cmd+P handler
            document.addEventListener('keydown', function (event) {
                if ((event.ctrlKey || event.metaKey) && event.keyCode === 80) {
                    print();
                    event.cancelBubble = true;
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
        }
    }
    teamsCore.enablePrintCapability = enablePrintCapability;
    /**
     * default print handler
     */
    function print() {
        window.print();
    }
    teamsCore.print = print;
    /**
     * @hidden
     * Registers a handler to be called when the page has been requested to load.
     *
     * @param handler - The handler to invoke when the page is loaded.
     *
     * @internal
     */
    function registerOnLoadHandler(handler) {
        ensureInitialized();
        handlers_registerOnLoadHandler(handler);
    }
    teamsCore.registerOnLoadHandler = registerOnLoadHandler;
    /**
     * @hidden
     * Registers a handler to be called before the page is unloaded.
     *
     * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
     * invoke the readyToUnload function provided to it once it's ready to be unloaded.
     *
     * @internal
     */
    function registerBeforeUnloadHandler(handler) {
        ensureInitialized();
        handlers_registerBeforeUnloadHandler(handler);
    }
    teamsCore.registerBeforeUnloadHandler = registerBeforeUnloadHandler;
    /**
     * @hidden
     * Registers a handler when focus needs to be passed from teams to the place of choice on app.
     *
     * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
     *
     * @internal
     */
    function registerFocusEnterHandler(handler) {
        ensureInitialized();
        registerHandler('focusEnter', handler);
    }
    teamsCore.registerFocusEnterHandler = registerFocusEnterHandler;
    function isSupported() {
        return runtime.supports.teamsCore ? true : false;
    }
    teamsCore.isSupported = isSupported;
})(teamsCore || (teamsCore = {}));

;// CONCATENATED MODULE: ./src/public/app.ts
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */



 // Conflict with some names









/**
 * Namespace to interact with app initialization and lifecycle.
 *
 * @beta
 */
var app_app;
(function (app) {
    // ::::::::::::::::::::::: MicrosoftTeams client SDK public API ::::::::::::::::::::
    app.Messages = {
        AppLoaded: 'appInitialization.appLoaded',
        Success: 'appInitialization.success',
        Failure: 'appInitialization.failure',
        ExpectedFailure: 'appInitialization.expectedFailure',
    };
    var FailedReason;
    (function (FailedReason) {
        FailedReason["AuthFailed"] = "AuthFailed";
        FailedReason["Timeout"] = "Timeout";
        FailedReason["Other"] = "Other";
    })(FailedReason = app.FailedReason || (app.FailedReason = {}));
    var ExpectedFailureReason;
    (function (ExpectedFailureReason) {
        ExpectedFailureReason["PermissionError"] = "PermissionError";
        ExpectedFailureReason["NotFound"] = "NotFound";
        ExpectedFailureReason["Throttling"] = "Throttling";
        ExpectedFailureReason["Offline"] = "Offline";
        ExpectedFailureReason["Other"] = "Other";
    })(ExpectedFailureReason = app.ExpectedFailureReason || (app.ExpectedFailureReason = {}));
    /**
     * Checks whether the Teams client SDK has been initialized.
     * @returns whether the Teams client SDK has been initialized.
     */
    function isInitialized() {
        return GlobalVars.initializeCalled;
    }
    app.isInitialized = isInitialized;
    /**
     * Gets the Frame Context that the App is running in. {@see FrameContexts} for the list of possible values.
     * @returns the Frame Context.
     */
    function getFrameContext() {
        return GlobalVars.frameContext;
    }
    app.getFrameContext = getFrameContext;
    /**
     * Initializes the library.
     *
     * @remarks
     * This must be called before any other SDK calls
     * but after the frame is loaded successfully.
     *
     * @param validMessageOrigins - Optionally specify a list of cross frame message origins. They must have
     * https: protocol otherwise they will be ignored. Example: https:www.example.com
     * @returns Promise that will be fulfilled when initialization has completed
     */
    function initialize(validMessageOrigins) {
        return new Promise(function (resolve) {
            // Independent components might not know whether the SDK is initialized so might call it to be safe.
            // Just no-op if that happens to make it easier to use.
            if (!GlobalVars.initializeCalled) {
                GlobalVars.initializeCalled = true;
                initializeHandlers();
                GlobalVars.initializePromise = initializeCommunication(validMessageOrigins).then(function (_a) {
                    var context = _a.context, clientType = _a.clientType, runtimeConfig = _a.runtimeConfig, _b = _a.clientSupportedSDKVersion, clientSupportedSDKVersion = _b === void 0 ? defaultSDKVersionForCompatCheck : _b;
                    GlobalVars.frameContext = context;
                    GlobalVars.hostClientType = clientType;
                    GlobalVars.clientSupportedSDKVersion = clientSupportedSDKVersion;
                    // Temporary workaround while the Host is updated with the new argument order.
                    // For now, we might receive any of these possibilities:
                    // - `runtimeConfig` in `runtimeConfig` and `clientSupportedSDKVersion` in `clientSupportedSDKVersion`.
                    // - `runtimeConfig` in `clientSupportedSDKVersion` and `clientSupportedSDKVersion` in `runtimeConfig`.
                    // - `clientSupportedSDKVersion` in `runtimeConfig` and no `clientSupportedSDKVersion`.
                    // This code supports any of these possibilities
                    // Teams AppHost won't provide this runtime config
                    // so we assume that if we don't have it, we must be running in Teams.
                    // After Teams updates its client code, we can remove this default code.
                    try {
                        var givenRuntimeConfig = JSON.parse(runtimeConfig);
                        runtimeConfig && applyRuntimeConfig(givenRuntimeConfig);
                    }
                    catch (e) {
                        if (e instanceof SyntaxError) {
                            try {
                                // if the given runtime config was actually meant to be a SDK version, store it as such.
                                // TODO: This is a temporary workaround to allow Teams to store clientSupportedSDKVersion even when
                                // it doesn't provide the runtimeConfig. After Teams updates its client code, we should
                                // remove this feature.
                                if (!isNaN(compareSDKVersions(runtimeConfig, defaultSDKVersionForCompatCheck))) {
                                    GlobalVars.clientSupportedSDKVersion = runtimeConfig;
                                }
                                var givenRuntimeConfig = JSON.parse(clientSupportedSDKVersion);
                                clientSupportedSDKVersion && applyRuntimeConfig(givenRuntimeConfig);
                            }
                            catch (e) {
                                if (e instanceof SyntaxError) {
                                    applyRuntimeConfig(teamsRuntimeConfig);
                                }
                                else {
                                    throw e;
                                }
                            }
                        }
                        else {
                            // If it's any error that's not a JSON parsing error, we want the program to fail.
                            throw e;
                        }
                    }
                    GlobalVars.initializeCompleted = true;
                });
                authentication.initialize();
                pages.config.initialize();
                initializePrivateApis();
            }
            // Handle additional valid message origins if specified
            if (Array.isArray(validMessageOrigins)) {
                processAdditionalValidOrigins(validMessageOrigins);
            }
            resolve(GlobalVars.initializePromise);
        });
    }
    app.initialize = initialize;
    /**
     * @hidden
     * Hide from docs.
     * ------
     * Undocumented function used to set a mock window for unit tests
     *
     * @internal
     */
    function _initialize(hostWindow) {
        Communication.currentWindow = hostWindow;
    }
    app._initialize = _initialize;
    /**
     * @hidden
     * Hide from docs.
     * ------
     * Undocumented function used to clear state between unit tests
     *
     * @internal
     */
    function _uninitialize() {
        if (!GlobalVars.initializeCalled) {
            return;
        }
        if (GlobalVars.frameContext) {
            registerOnThemeChangeHandler(null);
            pages.backStack.registerBackButtonHandler(null);
            pages.registerFullScreenHandler(null);
            teamsCore.registerBeforeUnloadHandler(null);
            teamsCore.registerOnLoadHandler(null);
            logs.registerGetLogHandler(null);
        }
        if (GlobalVars.frameContext === FrameContexts.settings) {
            pages.config.registerOnSaveHandler(null);
        }
        if (GlobalVars.frameContext === FrameContexts.remove) {
            pages.config.registerOnRemoveHandler(null);
        }
        GlobalVars.initializeCalled = false;
        GlobalVars.initializeCompleted = false;
        GlobalVars.initializePromise = null;
        GlobalVars.additionalValidOrigins = [];
        GlobalVars.frameContext = null;
        GlobalVars.hostClientType = null;
        GlobalVars.isFramelessWindow = false;
        uninitializeCommunication();
    }
    app._uninitialize = _uninitialize;
    /**
     * Retrieves the current context the frame is running in.
     *
     * @returns Promise that will resolve with the {@link Context} object.
     */
    function getContext() {
        return new Promise(function (resolve) {
            ensureInitialized();
            resolve(sendAndUnwrap('getContext'));
        }).then(function (legacyContext) { return transformLegacyContextToAppContext(legacyContext); }); // converts globalcontext to app.context
    }
    app.getContext = getContext;
    /**
     * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
     */
    function notifyAppLoaded() {
        ensureInitialized();
        sendMessageToParent(app.Messages.AppLoaded, [version]);
    }
    app.notifyAppLoaded = notifyAppLoaded;
    /**
     * Notifies the frame that app initialization is successful and is ready for user interaction.
     */
    function notifySuccess() {
        ensureInitialized();
        sendMessageToParent(app.Messages.Success, [version]);
    }
    app.notifySuccess = notifySuccess;
    /**
     * Notifies the frame that app initialization has failed and to show an error page in its place.
     */
    function notifyFailure(appInitializationFailedRequest) {
        ensureInitialized();
        sendMessageToParent(app.Messages.Failure, [
            appInitializationFailedRequest.reason,
            appInitializationFailedRequest.message,
        ]);
    }
    app.notifyFailure = notifyFailure;
    /**
     * Notifies the frame that app initialized with some expected errors.
     */
    function notifyExpectedFailure(expectedFailureRequest) {
        ensureInitialized();
        sendMessageToParent(app.Messages.ExpectedFailure, [expectedFailureRequest.reason, expectedFailureRequest.message]);
    }
    app.notifyExpectedFailure = notifyExpectedFailure;
    /**
     * Registers a handler for theme changes.
     *
     * @remarks
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the user changes their theme.
     */
    function registerOnThemeChangeHandler(handler) {
        ensureInitialized();
        handlers_registerOnThemeChangeHandler(handler);
    }
    app.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
})(app_app || (app_app = {}));
var core;
(function (core) {
    /**
     * Shares a deep link that a user can use to navigate back to a specific state in this page.
     *
     * @param deepLinkParameters - ID and label for the link and fallback URL.
     */
    function shareDeepLink(deepLinkParameters) {
        ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
        sendMessageToParent('shareDeepLink', [
            deepLinkParameters.subEntityId,
            deepLinkParameters.subEntityLabel,
            deepLinkParameters.subEntityWebUrl,
        ]);
    }
    core.shareDeepLink = shareDeepLink;
    /**
     * execute deep link API.
     *
     * @param deepLink - deep link.
     * @returns Promise that will be fulfilled when the operation has completed
     */
    function executeDeepLink(deepLink) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.settings, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
            resolve(sendAndHandleStatusAndReason('executeDeepLink', deepLink));
        });
    }
    core.executeDeepLink = executeDeepLink;
})(core || (core = {}));
/**
 * @hidden
 * Transforms the Legacy Context object received from Messages to the structured app.Context object
 *
 * @internal
 */
function transformLegacyContextToAppContext(legacyContext) {
    var context = {
        app: {
            locale: legacyContext.locale,
            sessionId: legacyContext.appSessionId ? legacyContext.appSessionId : '',
            theme: legacyContext.theme ? legacyContext.theme : 'default',
            iconPositionVertical: legacyContext.appIconPosition,
            osLocaleInfo: legacyContext.osLocaleInfo,
            parentMessageId: legacyContext.parentMessageId,
            userClickTime: legacyContext.userClickTime,
            userFileOpenPreference: legacyContext.userFileOpenPreference,
            host: {
                name: legacyContext.hostName ? legacyContext.hostName : HostName.teams,
                clientType: legacyContext.hostClientType ? legacyContext.hostClientType : HostClientType.web,
                sessionId: legacyContext.sessionId ? legacyContext.sessionId : '',
                ringId: legacyContext.ringId,
            },
            appLaunchId: legacyContext.appLaunchId,
        },
        page: {
            id: legacyContext.entityId,
            frameContext: legacyContext.frameContext ? legacyContext.frameContext : GlobalVars.frameContext,
            subPageId: legacyContext.subEntityId,
            isFullScreen: legacyContext.isFullScreen,
            isMultiWindow: legacyContext.isMultiWindow,
            sourceOrigin: legacyContext.sourceOrigin,
        },
        user: {
            id: legacyContext.userObjectId,
            displayName: legacyContext.userDisplayName,
            isCallingAllowed: legacyContext.isCallingAllowed,
            isPSTNCallingAllowed: legacyContext.isPSTNCallingAllowed,
            licenseType: legacyContext.userLicenseType,
            loginHint: legacyContext.loginHint,
            userPrincipalName: legacyContext.userPrincipalName,
            tenant: legacyContext.tid
                ? {
                    id: legacyContext.tid,
                    teamsSku: legacyContext.tenantSKU,
                }
                : undefined,
        },
        channel: legacyContext.channelId
            ? {
                id: legacyContext.channelId,
                displayName: legacyContext.channelName,
                relativeUrl: legacyContext.channelRelativeUrl,
                membershipType: legacyContext.channelType,
                defaultOneNoteSectionId: legacyContext.defaultOneNoteSectionId,
                ownerGroupId: legacyContext.hostTeamGroupId,
                ownerTenantId: legacyContext.hostTeamTenantId,
            }
            : undefined,
        chat: legacyContext.chatId
            ? {
                id: legacyContext.chatId,
            }
            : undefined,
        meeting: legacyContext.meetingId
            ? {
                id: legacyContext.meetingId,
            }
            : undefined,
        sharepoint: legacyContext.sharepoint,
        team: legacyContext.teamId
            ? {
                internalId: legacyContext.teamId,
                displayName: legacyContext.teamName,
                type: legacyContext.teamType,
                groupId: legacyContext.groupId,
                templateId: legacyContext.teamTemplateId,
                isArchived: legacyContext.isTeamArchived,
                userRole: legacyContext.userTeamRole,
            }
            : undefined,
        sharePointSite: legacyContext.teamSiteUrl || legacyContext.teamSiteDomain || legacyContext.teamSitePath
            ? {
                url: legacyContext.teamSiteUrl,
                domain: legacyContext.teamSiteDomain,
                path: legacyContext.teamSitePath,
                id: legacyContext.teamSiteId,
            }
            : undefined,
    };
    return context;
}

;// CONCATENATED MODULE: ./src/public/pages.ts






/**
 * Navigation specific part of the SDK.
 *
 * @beta
 */
var pages;
(function (pages) {
    /**
     * Return focus to the host. Will move focus forward or backward based on where the app container falls in
     * the F6/Tab accessiblity loop in the host.
     * @param navigateForward - Determines the direction to focus in host.
     */
    function returnFocus(navigateForward) {
        ensureInitialized(FrameContexts.content);
        sendMessageToParent('returnFocus', [navigateForward]);
    }
    pages.returnFocus = returnFocus;
    function setCurrentFrame(frameInfo) {
        ensureInitialized(FrameContexts.content);
        sendMessageToParent('setFrameContext', [frameInfo]);
    }
    pages.setCurrentFrame = setCurrentFrame;
    function initializeWithFrameContext(frameInfo, callback, validMessageOrigins) {
        app_app.initialize(validMessageOrigins).then(function () { return callback && callback(); });
        setCurrentFrame(frameInfo);
    }
    pages.initializeWithFrameContext = initializeWithFrameContext;
    /**
     * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
     * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
     * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
     * than the current one in a way that keeps the app informed of the change and allows the SDK to
     * continue working.
     * @param url - The URL to navigate the frame to.
     * @returns Promise that resolves when the navigation has completed.
     */
    function navigateCrossDomain(url) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.settings, FrameContexts.remove, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
            var errorMessage = 'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
            resolve(sendAndHandleStatusAndReasonWithDefaultError('navigateCrossDomain', errorMessage, url));
        });
    }
    pages.navigateCrossDomain = navigateCrossDomain;
    /**
     * Registers a handler for changes from or to full-screen view for a tab.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
     */
    function registerFullScreenHandler(handler) {
        ensureInitialized();
        registerHandler('fullScreenChange', handler);
    }
    pages.registerFullScreenHandler = registerFullScreenHandler;
    /**
     * Checks if page capability is supported currently
     */
    function isSupported() {
        return runtime.supports.pages ? true : false;
    }
    pages.isSupported = isSupported;
    /**
     * Namespace to interact with the teams specific part of the SDK.
     */
    var tabs;
    (function (tabs) {
        /**
         * Navigates the hosted app to the specified tab instance.
         * @param tabInstance The tab instance to navigate to.
         * @returns Promise that resolves when the navigation has completed.
         */
        function navigateToTab(tabInstance) {
            return new Promise(function (resolve) {
                ensureInitialized();
                var errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
                resolve(sendAndHandleStatusAndReasonWithDefaultError('navigateToTab', errorMessage, tabInstance));
            });
        }
        tabs.navigateToTab = navigateToTab;
        /**
         * Allows an app to retrieve for this user tabs that are owned by this app.
         * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
         * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
         * @returns Promise that resolves with the {@link TabInformation}.
         */
        function getTabInstances(tabInstanceParameters) {
            return new Promise(function (resolve) {
                ensureInitialized();
                resolve(sendAndUnwrap('getTabInstances', tabInstanceParameters));
            });
        }
        tabs.getTabInstances = getTabInstances;
        /**
         * Allows an app to retrieve the most recently used tabs for this user.
         * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
         * @returns Promise that resolves with the {@link TabInformation}.
         */
        function getMruTabInstances(tabInstanceParameters) {
            return new Promise(function (resolve) {
                ensureInitialized();
                resolve(sendAndUnwrap('getMruTabInstances', tabInstanceParameters));
            });
        }
        tabs.getMruTabInstances = getMruTabInstances;
        /**
         * Checks if pages.tabs capability is supported currently
         */
        function isSupported() {
            return runtime.supports.pages ? (runtime.supports.pages.tabs ? true : false) : false;
        }
        tabs.isSupported = isSupported;
    })(tabs = pages.tabs || (pages.tabs = {}));
    /**
     * Namespace to interact with the config-specific part of the SDK.
     * This object is usable only on the config frame.
     */
    var config;
    (function (config) {
        var saveHandler;
        var removeHandler;
        function initialize() {
            registerHandler('settings.save', handleSave, false);
            registerHandler('settings.remove', handleRemove, false);
        }
        config.initialize = initialize;
        /**
         * Sets the validity state for the config.
         * The initial value is false, so the user cannot save the config until this is called with true.
         * @param validityState Indicates whether the save or remove button is enabled for the user.
         */
        function setValidityState(validityState) {
            ensureInitialized(FrameContexts.settings, FrameContexts.remove);
            sendMessageToParent('settings.setValidityState', [validityState]);
        }
        config.setValidityState = setValidityState;
        /**
         * Gets the config for the current instance.
         * @returns Promise that resolves with the {@link Config} object.
         */
        function getConfig() {
            return new Promise(function (resolve) {
                ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.remove, FrameContexts.sidePanel);
                resolve(sendAndUnwrap('settings.getSettings'));
            });
        }
        config.getConfig = getConfig;
        /**
         * Sets the config for the current instance.
         * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
         * @param Config The desired config for this instance.
         * @returns Promise that resolves when the operation has completed.
         */
        function setConfig(instanceSettings) {
            return new Promise(function (resolve) {
                ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
                resolve(sendAndHandleStatusAndReason('settings.setSettings', instanceSettings));
            });
        }
        config.setConfig = setConfig;
        /**
         * Registers a handler for when the user attempts to save the settings. This handler should be used
         * to create or update the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the save.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler The handler to invoke when the user selects the save button.
         */
        function registerOnSaveHandler(handler) {
            ensureInitialized(FrameContexts.settings);
            saveHandler = handler;
            handler && sendMessageToParent('registerHandler', ['save']);
        }
        config.registerOnSaveHandler = registerOnSaveHandler;
        /**
         * Registers a handler for user attempts to remove content. This handler should be used
         * to remove the underlying resource powering the content.
         * The object passed to the handler must be used to indicate whether to proceed with the removal.
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the remove button.
         */
        function registerOnRemoveHandler(handler) {
            ensureInitialized(FrameContexts.remove, FrameContexts.settings);
            removeHandler = handler;
            handler && sendMessageToParent('registerHandler', ['remove']);
        }
        config.registerOnRemoveHandler = registerOnRemoveHandler;
        function handleSave(result) {
            var saveEvent = new SaveEventImpl(result);
            if (saveHandler) {
                saveHandler(saveEvent);
            }
            else {
                // If no handler is registered, we assume success.
                saveEvent.notifySuccess();
            }
        }
        /**
         * Registers a handler for when the user reconfigurated tab
         * @param handler The handler to invoke when the user click on Settings.
         */
        function registerChangeConfigHandler(handler) {
            ensureInitialized(FrameContexts.content);
            registerHandler('changeSettings', handler);
        }
        config.registerChangeConfigHandler = registerChangeConfigHandler;
        /**
         * @hidden
         * Hide from docs, since this class is not directly used.
         */
        var SaveEventImpl = /** @class */ (function () {
            function SaveEventImpl(result) {
                this.notified = false;
                this.result = result ? result : {};
            }
            SaveEventImpl.prototype.notifySuccess = function () {
                this.ensureNotNotified();
                sendMessageToParent('settings.save.success');
                this.notified = true;
            };
            SaveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                sendMessageToParent('settings.save.failure', [reason]);
                this.notified = true;
            };
            SaveEventImpl.prototype.ensureNotNotified = function () {
                if (this.notified) {
                    throw new Error('The SaveEvent may only notify success or failure once.');
                }
            };
            return SaveEventImpl;
        }());
        function handleRemove() {
            var removeEvent = new RemoveEventImpl();
            if (removeHandler) {
                removeHandler(removeEvent);
            }
            else {
                // If no handler is registered, we assume success.
                removeEvent.notifySuccess();
            }
        }
        /**
         * @hidden
         * Hide from docs, since this class is not directly used.
         */
        var RemoveEventImpl = /** @class */ (function () {
            function RemoveEventImpl() {
                this.notified = false;
            }
            RemoveEventImpl.prototype.notifySuccess = function () {
                this.ensureNotNotified();
                sendMessageToParent('settings.remove.success');
                this.notified = true;
            };
            RemoveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                sendMessageToParent('settings.remove.failure', [reason]);
                this.notified = true;
            };
            RemoveEventImpl.prototype.ensureNotNotified = function () {
                if (this.notified) {
                    throw new Error('The removeEvent may only notify success or failure once.');
                }
            };
            return RemoveEventImpl;
        }());
        /**
         * Checks if pages.config capability is supported currently
         */
        function isSupported() {
            return runtime.supports.pages ? (runtime.supports.pages.config ? true : false) : false;
        }
        config.isSupported = isSupported;
    })(config = pages.config || (pages.config = {}));
    /**
     * Namespace to interact with the back-stack part of the SDK.
     */
    var backStack;
    (function (backStack) {
        var backButtonPressHandler;
        function _initialize() {
            registerHandler('backButtonPress', handleBackButtonPress, false);
        }
        backStack._initialize = _initialize;
        /**
         * Navigates back in the hosted app. See registerBackButtonHandler for more information on when
         * it's appropriate to use this method.
         * @returns Promise that resolves when the navigation has completed.
         */
        function navigateBack() {
            return new Promise(function (resolve) {
                ensureInitialized();
                var errorMessage = 'Back navigation is not supported in the current client or context.';
                resolve(sendAndHandleStatusAndReasonWithDefaultError('navigateBack', errorMessage));
            });
        }
        backStack.navigateBack = navigateBack;
        /**
         * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
         * navigation stack should use this handler to navigate the user back within their frame. If an app finds
         * that after running its back button handler it cannot handle the event it should call the navigateBack
         * method to ask the Teams client to handle it instead.
         * @param handler The handler to invoke when the user presses their Team client's back button.
         */
        function registerBackButtonHandler(handler) {
            backButtonPressHandler = handler;
            handler && sendMessageToParent('registerHandler', ['backButton']);
        }
        backStack.registerBackButtonHandler = registerBackButtonHandler;
        function handleBackButtonPress() {
            if (!backButtonPressHandler || !backButtonPressHandler()) {
                navigateBack();
            }
        }
        /**
         * Checks if pages.backStack capability is supported currently
         */
        function isSupported() {
            return runtime.supports.pages ? (runtime.supports.pages.backStack ? true : false) : false;
        }
        backStack.isSupported = isSupported;
    })(backStack = pages.backStack || (pages.backStack = {}));
    var fullTrust;
    (function (fullTrust) {
        /**
         * @hidden
         * Hide from docs
         * ------
         * Place the tab into full-screen mode.
         */
        function enterFullscreen() {
            ensureInitialized(FrameContexts.content);
            sendMessageToParent('enterFullscreen', []);
        }
        fullTrust.enterFullscreen = enterFullscreen;
        /**
         * @hidden
         * Hide from docs
         * ------
         * Reverts the tab into normal-screen mode.
         */
        function exitFullscreen() {
            ensureInitialized(FrameContexts.content);
            sendMessageToParent('exitFullscreen', []);
        }
        fullTrust.exitFullscreen = exitFullscreen;
        /**
         * Checks if pages.fullTrust capability is supported currently
         */
        function isSupported() {
            return runtime.supports.pages ? (runtime.supports.pages.fullTrust ? true : false) : false;
        }
        fullTrust.isSupported = isSupported;
    })(fullTrust = pages.fullTrust || (pages.fullTrust = {}));
    /**
     * Namespace to interact with the app button part of the SDK.
     */
    var appButton;
    (function (appButton) {
        /**
         * Registers a handler for clicking the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
         */
        function onClick(handler) {
            ensureInitialized(FrameContexts.content);
            registerHandler('appButtonClick', handler);
        }
        appButton.onClick = onClick;
        /**
         * Registers a handler for entering hover of the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
         */
        function onHoverEnter(handler) {
            ensureInitialized(FrameContexts.content);
            registerHandler('appButtonHoverEnter', handler);
        }
        appButton.onHoverEnter = onHoverEnter;
        /**
         * Registers a handler for exiting hover of the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
         */
        function onHoverLeave(handler) {
            ensureInitialized(FrameContexts.content);
            registerHandler('appButtonHoverLeave', handler);
        }
        appButton.onHoverLeave = onHoverLeave;
        /**
         * Checks if pages.appButton capability is supported currently
         */
        function isSupported() {
            return runtime.supports.pages ? (runtime.supports.pages.appButton ? true : false) : false;
        }
        appButton.isSupported = isSupported;
    })(appButton = pages.appButton || (pages.appButton = {}));
})(pages || (pages = {}));

;// CONCATENATED MODULE: ./src/internal/handlers.ts
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};


/** @internal */
var HandlersPrivate = /** @class */ (function () {
    function HandlersPrivate() {
    }
    HandlersPrivate.handlers = {};
    return HandlersPrivate;
}());
/** @internal */
function initializeHandlers() {
    // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
    HandlersPrivate.handlers['themeChange'] = handleThemeChange;
    HandlersPrivate.handlers['load'] = handleLoad;
    HandlersPrivate.handlers['beforeUnload'] = handleBeforeUnload;
    pages.backStack._initialize();
}
/** @internal */
function callHandler(name, args) {
    var handler = HandlersPrivate.handlers[name];
    if (handler) {
        var result = handler.apply(this, args);
        return [true, result];
    }
    else {
        return [false, undefined];
    }
}
/** @internal */
function registerHandler(name, handler, sendMessage, args) {
    if (sendMessage === void 0) { sendMessage = true; }
    if (args === void 0) { args = []; }
    if (handler) {
        HandlersPrivate.handlers[name] = handler;
        sendMessage && sendMessageToParent('registerHandler', __spreadArray([name], args, true));
    }
    else {
        delete HandlersPrivate.handlers[name];
    }
}
/** @internal */
function removeHandler(name) {
    delete HandlersPrivate.handlers[name];
}
/** @internal */
function handlers_registerOnThemeChangeHandler(handler) {
    HandlersPrivate.themeChangeHandler = handler;
    handler && sendMessageToParent('registerHandler', ['themeChange']);
}
/** @internal */
function handleThemeChange(theme) {
    if (HandlersPrivate.themeChangeHandler) {
        HandlersPrivate.themeChangeHandler(theme);
    }
    if (Communication.childWindow) {
        sendMessageEventToChild('themeChange', [theme]);
    }
}
/** @internal */
function handlers_registerOnLoadHandler(handler) {
    HandlersPrivate.loadHandler = handler;
    handler && sendMessageToParent('registerHandler', ['load']);
}
/** @internal */
function handleLoad(context) {
    if (HandlersPrivate.loadHandler) {
        HandlersPrivate.loadHandler(context);
    }
    if (Communication.childWindow) {
        sendMessageEventToChild('load', [context]);
    }
}
/** @internal */
function handlers_registerBeforeUnloadHandler(handler) {
    HandlersPrivate.beforeUnloadHandler = handler;
    handler && sendMessageToParent('registerHandler', ['beforeUnload']);
}
/** @internal */
function handleBeforeUnload() {
    var readyToUnload = function () {
        sendMessageToParent('readyToUnload', []);
    };
    if (!HandlersPrivate.beforeUnloadHandler || !HandlersPrivate.beforeUnloadHandler(readyToUnload)) {
        readyToUnload();
    }
}

;// CONCATENATED MODULE: ./src/internal/communication.ts
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
var communication_spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};




/**@internal */
var Communication = /** @class */ (function () {
    function Communication() {
    }
    return Communication;
}());

/**@internal */
var CommunicationPrivate = /** @class */ (function () {
    function CommunicationPrivate() {
    }
    CommunicationPrivate.parentMessageQueue = [];
    CommunicationPrivate.childMessageQueue = [];
    CommunicationPrivate.nextMessageId = 0;
    CommunicationPrivate.callbacks = {};
    CommunicationPrivate.promiseCallbacks = {};
    return CommunicationPrivate;
}());
/**@internal */
function initializeCommunication(validMessageOrigins) {
    // Listen for messages post to our window
    CommunicationPrivate.messageListener = function (evt) { return processMessage(evt); };
    // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
    // it's the window that opened us (i.e., window.opener)
    Communication.currentWindow = Communication.currentWindow || window;
    Communication.parentWindow =
        Communication.currentWindow.parent !== Communication.currentWindow.self
            ? Communication.currentWindow.parent
            : Communication.currentWindow.opener;
    // Listen to messages from the parent or child frame.
    // Frameless windows will only receive this event from child frames and if validMessageOrigins is passed.
    if (Communication.parentWindow || validMessageOrigins) {
        Communication.currentWindow.addEventListener('message', CommunicationPrivate.messageListener, false);
    }
    if (!Communication.parentWindow) {
        GlobalVars.isFramelessWindow = true;
        /* eslint-disable  @typescript-eslint/ban-ts-comment */
        // @ts-ignore: window as ExtendedWindow
        window.onNativeMessage = handleParentMessage;
    }
    try {
        // Send the initialized message to any origin, because at this point we most likely don't know the origin
        // of the parent window, and this message contains no data that could pose a security risk.
        Communication.parentOrigin = '*';
        return sendMessageToParentAsync('initialize', [version]).then(function (_a) {
            var context = _a[0], clientType = _a[1], runtimeConfig = _a[2], clientSupportedSDKVersion = _a[3];
            return { context: context, clientType: clientType, runtimeConfig: runtimeConfig, clientSupportedSDKVersion: clientSupportedSDKVersion };
        });
    }
    finally {
        Communication.parentOrigin = null;
    }
}
/**@internal */
function uninitializeCommunication() {
    Communication.currentWindow.removeEventListener('message', CommunicationPrivate.messageListener, false);
    Communication.parentWindow = null;
    Communication.parentOrigin = null;
    Communication.childWindow = null;
    Communication.childOrigin = null;
    CommunicationPrivate.parentMessageQueue = [];
    CommunicationPrivate.childMessageQueue = [];
    CommunicationPrivate.nextMessageId = 0;
    CommunicationPrivate.callbacks = {};
}
/**@internal */
function sendAndUnwrap(actionName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var result = _a[0];
        return result;
    });
}
function sendAndHandleStatusAndReason(actionName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var status = _a[0], reason = _a[1];
        if (!status) {
            throw new Error(reason);
        }
    });
}
/**@internal */
function sendAndHandleStatusAndReasonWithDefaultError(actionName, defaultError) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var status = _a[0], reason = _a[1];
        if (!status) {
            throw new Error(reason ? reason : defaultError);
        }
    });
}
/**@internal */
function sendAndHandleSdkError(actionName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var error = _a[0], result = _a[1];
        if (error) {
            throw error;
        }
        return result;
    });
}
/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 *
 * @internal
 */
function sendMessageToParentAsync(actionName, args) {
    if (args === void 0) { args = undefined; }
    return new Promise(function (resolve) {
        var request = sendMessageToParentHelper(actionName, args);
        resolve(waitForResponse(request.id));
    });
}
/**@internal */
function waitForResponse(requestId) {
    return new Promise(function (resolve) {
        CommunicationPrivate.promiseCallbacks[requestId] = resolve;
    });
}
/**@internal */
function sendMessageToParent(actionName, argsOrCallback, callback) {
    var args;
    if (argsOrCallback instanceof Function) {
        callback = argsOrCallback;
    }
    else if (argsOrCallback instanceof Array) {
        args = argsOrCallback;
    }
    var request = sendMessageToParentHelper(actionName, args);
    if (callback) {
        CommunicationPrivate.callbacks[request.id] = callback;
    }
}
/**@internal */
function sendMessageToParentHelper(actionName, args) {
    var targetWindow = Communication.parentWindow;
    var request = createMessageRequest(actionName, args);
    if (GlobalVars.isFramelessWindow) {
        if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
            Communication.currentWindow.nativeInterface.framelessPostMessage(JSON.stringify(request));
        }
    }
    else {
        var targetOrigin = getTargetOrigin(targetWindow);
        // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
        // queue the message and send it after the origin is established
        if (targetWindow && targetOrigin) {
            targetWindow.postMessage(request, targetOrigin);
        }
        else {
            getTargetMessageQueue(targetWindow).push(request);
        }
    }
    return request;
}
/**@internal */
function processMessage(evt) {
    // Process only if we received a valid message
    if (!evt || !evt.data || typeof evt.data !== 'object') {
        return;
    }
    // Process only if the message is coming from a different window and a valid origin
    // valid origins are either a pre-known
    var messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
    var messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);
    if (!shouldProcessMessage(messageSource, messageOrigin)) {
        return;
    }
    // Update our parent and child relationships based on this message
    updateRelationships(messageSource, messageOrigin);
    // Handle the message
    if (messageSource === Communication.parentWindow) {
        handleParentMessage(evt);
    }
    else if (messageSource === Communication.childWindow) {
        handleChildMessage(evt);
    }
}
/**
 * @hidden
 * Validates the message source and origin, if it should be processed
 *
 * @internal
 */
function shouldProcessMessage(messageSource, messageOrigin) {
    // Process if message source is a different window and if origin is either in
    // Teams' pre-known whitelist or supplied as valid origin by user during initialization
    if (Communication.currentWindow && messageSource === Communication.currentWindow) {
        return false;
    }
    else if (Communication.currentWindow &&
        Communication.currentWindow.location &&
        messageOrigin &&
        messageOrigin === Communication.currentWindow.location.origin) {
        return true;
    }
    else {
        return validateOrigin(new URL(messageOrigin));
    }
}
/**@internal */
function updateRelationships(messageSource, messageOrigin) {
    // Determine whether the source of the message is our parent or child and update our
    // window and origin pointer accordingly
    // For frameless windows (i.e mobile), there is no parent frame, so the message must be from the child.
    if (!GlobalVars.isFramelessWindow &&
        (!Communication.parentWindow || Communication.parentWindow.closed || messageSource === Communication.parentWindow)) {
        Communication.parentWindow = messageSource;
        Communication.parentOrigin = messageOrigin;
    }
    else if (!Communication.childWindow ||
        Communication.childWindow.closed ||
        messageSource === Communication.childWindow) {
        Communication.childWindow = messageSource;
        Communication.childOrigin = messageOrigin;
    }
    // Clean up pointers to closed parent and child windows
    if (Communication.parentWindow && Communication.parentWindow.closed) {
        Communication.parentWindow = null;
        Communication.parentOrigin = null;
    }
    if (Communication.childWindow && Communication.childWindow.closed) {
        Communication.childWindow = null;
        Communication.childOrigin = null;
    }
    // If we have any messages in our queue, send them now
    flushMessageQueue(Communication.parentWindow);
    flushMessageQueue(Communication.childWindow);
}
/**@internal */
function handleParentMessage(evt) {
    if ('id' in evt.data && typeof evt.data.id === 'number') {
        // Call any associated Communication.callbacks
        var message = evt.data;
        var callback = CommunicationPrivate.callbacks[message.id];
        if (callback) {
            callback.apply(null, communication_spreadArray(communication_spreadArray([], message.args, true), [message.isPartialResponse], false));
            // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
            if (!isPartialResponse(evt)) {
                delete CommunicationPrivate.callbacks[message.id];
            }
        }
        var promiseCallback = CommunicationPrivate.promiseCallbacks[message.id];
        if (promiseCallback) {
            promiseCallback(message.args);
            delete CommunicationPrivate.promiseCallbacks[message.id];
        }
    }
    else if ('func' in evt.data && typeof evt.data.func === 'string') {
        // Delegate the request to the proper handler
        var message = evt.data;
        callHandler(message.func, message.args);
    }
}
/**@internal */
function isPartialResponse(evt) {
    return evt.data.isPartialResponse === true;
}
/**@internal */
function handleChildMessage(evt) {
    if ('id' in evt.data && 'func' in evt.data) {
        // Try to delegate the request to the proper handler, if defined
        var message_1 = evt.data;
        var _a = callHandler(message_1.func, message_1.args), called = _a[0], result = _a[1];
        if (called && typeof result !== 'undefined') {
            sendMessageResponseToChild(message_1.id, Array.isArray(result) ? result : [result]);
        }
        else {
            // No handler, proxy to parent
            // tslint:disable-next-line:no-any
            sendMessageToParent(message_1.func, message_1.args, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (Communication.childWindow) {
                    var isPartialResponse_1 = args.pop();
                    sendMessageResponseToChild(message_1.id, args, isPartialResponse_1);
                }
            });
        }
    }
}
/**@internal */
function getTargetMessageQueue(targetWindow) {
    return targetWindow === Communication.parentWindow
        ? CommunicationPrivate.parentMessageQueue
        : targetWindow === Communication.childWindow
            ? CommunicationPrivate.childMessageQueue
            : [];
}
/**@internal */
function getTargetOrigin(targetWindow) {
    return targetWindow === Communication.parentWindow
        ? Communication.parentOrigin
        : targetWindow === Communication.childWindow
            ? Communication.childOrigin
            : null;
}
/**@internal */
function flushMessageQueue(targetWindow) {
    var targetOrigin = getTargetOrigin(targetWindow);
    var targetMessageQueue = getTargetMessageQueue(targetWindow);
    while (targetWindow && targetOrigin && targetMessageQueue.length > 0) {
        targetWindow.postMessage(targetMessageQueue.shift(), targetOrigin);
    }
}
/**@internal */
function waitForMessageQueue(targetWindow, callback) {
    var messageQueueMonitor = Communication.currentWindow.setInterval(function () {
        if (getTargetMessageQueue(targetWindow).length === 0) {
            clearInterval(messageQueueMonitor);
            callback();
        }
    }, 100);
}
/**
 * @hidden
 * Send a response to child for a message request that was from child
 *
 * @internal
 */
function sendMessageResponseToChild(id, 
// tslint:disable-next-line:no-any
args, isPartialResponse) {
    var targetWindow = Communication.childWindow;
    var response = createMessageResponse(id, args, isPartialResponse);
    var targetOrigin = getTargetOrigin(targetWindow);
    if (targetWindow && targetOrigin) {
        targetWindow.postMessage(response, targetOrigin);
    }
}
/**
 * @hidden
 * Send a custom message object that can be sent to child window,
 * instead of a response message to a child
 *
 * @internal
 */
function sendMessageEventToChild(actionName, 
// tslint:disable-next-line: no-any
args) {
    var targetWindow = Communication.childWindow;
    var customEvent = createMessageEvent(actionName, args);
    var targetOrigin = getTargetOrigin(targetWindow);
    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
        targetWindow.postMessage(customEvent, targetOrigin);
    }
    else {
        getTargetMessageQueue(targetWindow).push(customEvent);
    }
}
/**@internal */
// tslint:disable-next-line:no-any
function createMessageRequest(func, args) {
    return {
        id: CommunicationPrivate.nextMessageId++,
        func: func,
        timestamp: Date.now(),
        args: args || [],
    };
}
/**@internal */
// tslint:disable-next-line:no-any
function createMessageResponse(id, args, isPartialResponse) {
    return {
        id: id,
        args: args || [],
        isPartialResponse: isPartialResponse,
    };
}
/**
 * @hidden
 * Creates a message object without any id, used for custom actions being sent to child frame/window
 *
 * @internal
 */
// tslint:disable-next-line:no-any
function createMessageEvent(func, args) {
    return {
        func: func,
        args: args || [],
    };
}

;// CONCATENATED MODULE: ./src/private/bot.ts
/* eslint-disable @typescript-eslint/no-explicit-any */



/**
 * @hidden
 * Namespace to interact with bots using the SDK.
 *
 * @alpha
 */
var bot;
(function (bot) {
    /**
     * @hidden
     * Hide from docs until release.
     * ------
     * Sends query to bot in order to retrieve data.
     *
     * @param botRequest - query to send to bot.
     * @param onSuccess - callback to invoke when data is retrieved from bot
     * @param onError - callback to invoke should an error occur
     */
    function sendQuery(botRequest, onSuccess, onError) {
        ensureInitialized();
        sendMessageToParent('bot.executeQuery', [botRequest], function (success, response) {
            if (success) {
                onSuccess(response);
            }
            else {
                onError(response);
            }
        });
    }
    bot.sendQuery = sendQuery;
    /**
     * @hidden
     * Hide from docs until release.
     * -----
     * Retrieves list of support commands from bot
     *
     * @param onSuccess - callback to invoke when data is retrieved from bot
     * @param onError - callback to invoke should an error occur
     */
    function getSupportedCommands(onSuccess, onError) {
        ensureInitialized();
        sendMessageToParent('bot.getSupportedCommands', function (success, response) {
            if (success) {
                onSuccess(response);
            }
            else {
                onError(response);
            }
        });
    }
    bot.getSupportedCommands = getSupportedCommands;
    /**
     * @hidden
     * Hide from docs until release.
     * -----
     * Authenticates a user for json tab
     *
     * @param authRequest - callback to invoke when data is retrieved from bot
     * @param onSuccess - callback to invoke when user is authenticated
     * @param onError - callback to invoke should an error occur
     */
    function authenticate(authRequest, onSuccess, onError) {
        ensureInitialized();
        sendMessageToParent('bot.authenticate', [authRequest], function (success, response) {
            if (success) {
                onSuccess(response);
            }
            else {
                onError(response);
            }
        });
    }
    bot.authenticate = authenticate;
    var ResponseType;
    (function (ResponseType) {
        ResponseType["Results"] = "Results";
        ResponseType["Auth"] = "Auth";
    })(ResponseType = bot.ResponseType || (bot.ResponseType = {}));
    function isSupported() {
        return runtime.supports.bot ? true : false;
    }
    bot.isSupported = isSupported;
})(bot || (bot = {}));

;// CONCATENATED MODULE: ./src/private/interfaces.ts
/**
 * @alpha
 */
var NotificationTypes;
(function (NotificationTypes) {
    NotificationTypes["fileDownloadStart"] = "fileDownloadStart";
    NotificationTypes["fileDownloadComplete"] = "fileDownloadComplete";
})(NotificationTypes || (NotificationTypes = {}));
/**
 * @hidden
 * Hide from docs.
 * ------
 * @alpha
 */
var ViewerActionTypes;
(function (ViewerActionTypes) {
    ViewerActionTypes["view"] = "view";
    ViewerActionTypes["edit"] = "edit";
    ViewerActionTypes["editNew"] = "editNew";
})(ViewerActionTypes || (ViewerActionTypes = {}));
/**
 * @hidden
 * Hide from docs.
 * ------
 * User setting changes that can be subscribed to,
 * @alpha
 */
var UserSettingTypes;
(function (UserSettingTypes) {
    /**
     * @hidden
     * Use this key to subscribe to changes in user's file open preference
     */
    UserSettingTypes["fileOpenPreference"] = "fileOpenPreference";
    /**
     * @hidden
     * Use this key to subscribe to theme changes
     */
    UserSettingTypes["theme"] = "theme";
})(UserSettingTypes || (UserSettingTypes = {}));

;// CONCATENATED MODULE: ./src/private/chat.ts





/**
 * @hidden
 * Namespace to interact with the conversational subEntities inside the tab
 *
 * @alpha
 */
var chat;
(function (chat) {
    /**
     * @hidden
     * Hide from docs
     * --------------
     * Allows the user to start or continue a conversation with each subentity inside the tab
     *
     * @returns Promise resolved upon completion
     */
    function openConversation(openConversationRequest) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            var sendPromise = sendAndHandleStatusAndReason('conversations.openConversation', {
                title: openConversationRequest.title,
                subEntityId: openConversationRequest.subEntityId,
                conversationId: openConversationRequest.conversationId,
                channelId: openConversationRequest.channelId,
                entityId: openConversationRequest.entityId,
            });
            if (openConversationRequest.onStartConversation) {
                registerHandler('startConversation', function (subEntityId, conversationId, channelId, entityId) {
                    return openConversationRequest.onStartConversation({
                        subEntityId: subEntityId,
                        conversationId: conversationId,
                        channelId: channelId,
                        entityId: entityId,
                    });
                });
            }
            if (openConversationRequest.onCloseConversation) {
                registerHandler('closeConversation', function (subEntityId, conversationId, channelId, entityId) {
                    return openConversationRequest.onCloseConversation({
                        subEntityId: subEntityId,
                        conversationId: conversationId,
                        channelId: channelId,
                        entityId: entityId,
                    });
                });
            }
            resolve(sendPromise);
        });
    }
    chat.openConversation = openConversation;
    /**
     * @hidden
     * Hide from docs
     * --------------
     * Allows the user to close the conversation in the right pane
     */
    function closeConversation() {
        ensureInitialized(FrameContexts.content);
        sendMessageToParent('conversations.closeConversation');
        removeHandler('startConversation');
        removeHandler('closeConversation');
    }
    chat.closeConversation = closeConversation;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Allows an app to retrieve information of all chat members
     * Because a malicious party run your content in a browser, this value should
     * be used only as a hint as to who the members are and never as proof of membership.
     *
     * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
     * @returns Promise resolved with information on all chat members
     *
     * @internal
     */
    function getChatMembers() {
        return new Promise(function (resolve) {
            ensureInitialized();
            resolve(sendAndUnwrap('getChatMembers'));
        });
    }
    chat.getChatMembers = getChatMembers;
    function isSupported() {
        return runtime.supports.chat ? true : false;
    }
    chat.isSupported = isSupported;
})(chat || (chat = {}));

;// CONCATENATED MODULE: ./src/public/interfaces.ts
/* eslint-disable @typescript-eslint/no-explicit-any*/
/**
 * Allowed user file open preferences
 */
var FileOpenPreference;
(function (FileOpenPreference) {
    FileOpenPreference["Inline"] = "inline";
    FileOpenPreference["Desktop"] = "desktop";
    FileOpenPreference["Web"] = "web";
})(FileOpenPreference || (FileOpenPreference = {}));
var ErrorCode;
(function (ErrorCode) {
    /**
     * API not supported in the current platform.
     */
    ErrorCode[ErrorCode["NOT_SUPPORTED_ON_PLATFORM"] = 100] = "NOT_SUPPORTED_ON_PLATFORM";
    /**
     * Internal error encountered while performing the required operation.
     */
    ErrorCode[ErrorCode["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
    /**
     * API is not supported in the current context
     */
    ErrorCode[ErrorCode["NOT_SUPPORTED_IN_CURRENT_CONTEXT"] = 501] = "NOT_SUPPORTED_IN_CURRENT_CONTEXT";
    /**
    Permissions denied by user
    */
    ErrorCode[ErrorCode["PERMISSION_DENIED"] = 1000] = "PERMISSION_DENIED";
    /**
     * Network issue
     */
    ErrorCode[ErrorCode["NETWORK_ERROR"] = 2000] = "NETWORK_ERROR";
    /**
     * Underlying hardware doesn't support the capability
     */
    ErrorCode[ErrorCode["NO_HW_SUPPORT"] = 3000] = "NO_HW_SUPPORT";
    /**
     * One or more arguments are invalid
     */
    ErrorCode[ErrorCode["INVALID_ARGUMENTS"] = 4000] = "INVALID_ARGUMENTS";
    /**
     * User is not authorized for this operation
     */
    ErrorCode[ErrorCode["UNAUTHORIZED_USER_OPERATION"] = 5000] = "UNAUTHORIZED_USER_OPERATION";
    /**
     * Could not complete the operation due to insufficient resources
     */
    ErrorCode[ErrorCode["INSUFFICIENT_RESOURCES"] = 6000] = "INSUFFICIENT_RESOURCES";
    /**
     * Platform throttled the request because of API was invoked too frequently
     */
    ErrorCode[ErrorCode["THROTTLE"] = 7000] = "THROTTLE";
    /**
     * User aborted the operation
     */
    ErrorCode[ErrorCode["USER_ABORT"] = 8000] = "USER_ABORT";
    /**
     * Could not complete the operation in the given time interval
     */
    ErrorCode[ErrorCode["OPERATION_TIMED_OUT"] = 8001] = "OPERATION_TIMED_OUT";
    /**
     * Platform code is old and doesn't implement this API
     */
    ErrorCode[ErrorCode["OLD_PLATFORM"] = 9000] = "OLD_PLATFORM";
    /**
     * The file specified was not found on the given location
     */
    ErrorCode[ErrorCode["FILE_NOT_FOUND"] = 404] = "FILE_NOT_FOUND";
    /**
     * The return value is too big and has exceeded our size boundries
     */
    ErrorCode[ErrorCode["SIZE_EXCEEDED"] = 10000] = "SIZE_EXCEEDED";
})(ErrorCode || (ErrorCode = {}));

;// CONCATENATED MODULE: ./src/public/appInstallDialog.ts




/**
 * @alpha
 */
var appInstallDialog;
(function (appInstallDialog) {
    function openAppInstallDialog(openAPPInstallDialogParams) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.settings, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
            if (!isSupported()) {
                throw 'Not supported';
            }
            sendMessageToParent('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
            resolve();
        });
    }
    appInstallDialog.openAppInstallDialog = openAppInstallDialog;
    function isSupported() {
        return runtime.supports.appInstallDialog ? true : false;
    }
    appInstallDialog.isSupported = isSupported;
})(appInstallDialog || (appInstallDialog = {}));

;// CONCATENATED MODULE: ./src/public/appWindow.ts
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */




var ChildAppWindow = /** @class */ (function () {
    function ChildAppWindow() {
    }
    ChildAppWindow.prototype.postMessage = function (message, onComplete) {
        ensureInitialized();
        return this.postMessageHelper(message)
            .then(function () {
            if (onComplete) {
                onComplete(true);
            }
        })
            .catch(function (err) {
            if (onComplete) {
                onComplete(false, err.message);
                return;
            }
            throw err;
        });
    };
    ChildAppWindow.prototype.postMessageHelper = function (message) {
        return new Promise(function (resolve) {
            resolve(sendAndHandleStatusAndReason('messageForChild', message));
        });
    };
    ChildAppWindow.prototype.addEventListener = function (type, listener) {
        if (type === 'message') {
            registerHandler('messageForParent', listener);
        }
    };
    return ChildAppWindow;
}());

var ParentAppWindow = /** @class */ (function () {
    function ParentAppWindow() {
    }
    Object.defineProperty(ParentAppWindow, "Instance", {
        get: function () {
            // Do you need arguments? Make it a regular method instead.
            return this._instance || (this._instance = new this());
        },
        enumerable: false,
        configurable: true
    });
    ParentAppWindow.prototype.postMessage = function (message, onComplete) {
        ensureInitialized(FrameContexts.task);
        return this.postMessageHelper(message)
            .then(function () {
            if (onComplete) {
                onComplete(true);
            }
        })
            .catch(function (err) {
            if (onComplete) {
                onComplete(false, err.message);
                return;
            }
            throw err;
        });
    };
    ParentAppWindow.prototype.postMessageHelper = function (message) {
        return new Promise(function (resolve) {
            resolve(sendAndHandleStatusAndReason('messageForParent', message));
        });
    };
    ParentAppWindow.prototype.addEventListener = function (type, listener) {
        if (type === 'message') {
            registerHandler('messageForChild', listener);
        }
    };
    return ParentAppWindow;
}());


;// CONCATENATED MODULE: ./src/public/dialog.ts
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};





/**
 * Namespace to interact with the dialog module-specific part of the SDK.
 *
 * @remarks
 * This object is usable only on the content frame.
 *
 * @beta
 */
var dialog;
(function (dialog) {
    /**
     * Allows an app to open the dialog module.
     *
     * @param dialogInfo - An object containing the parameters of the dialog module
     * @param submitHandler - Handler to call when the task module is completed
     */
    function open(dialogInfo, submitHandler) {
        ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
        sendMessageToParent('tasks.startTask', [dialogInfo], submitHandler);
        return new ChildAppWindow();
    }
    dialog.open = open;
    /**
     * Update height/width dialog info properties.
     *
     * @param dialogInfo - An object containing width and height properties
     */
    function resize(dialogInfo) {
        ensureInitialized(FrameContexts.task);
        var width = dialogInfo.width, height = dialogInfo.height, extra = __rest(dialogInfo, ["width", "height"]);
        if (!Object.keys(extra).length) {
            sendMessageToParent('tasks.updateTask', [dialogInfo]);
        }
        else {
            throw new Error('resize requires a dialogInfo argument containing only width and height');
        }
    }
    dialog.resize = resize;
    /**
     * Submit the dialog module.
     *
     * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submit(result, appIds) {
        ensureInitialized(FrameContexts.task);
        // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
        sendMessageToParent('tasks.completeTask', [result, Array.isArray(appIds) ? appIds : [appIds]]);
    }
    dialog.submit = submit;
    function isSupported() {
        return runtime.supports.dialog ? true : false;
    }
    dialog.isSupported = isSupported;
})(dialog || (dialog = {}));

;// CONCATENATED MODULE: ./src/internal/mediaUtil.ts

/**
 * @hidden
 * Helper function to create a blob from media chunks based on their sequence
 *
 * @internal
 */
function createFile(assembleAttachment, mimeType) {
    if (assembleAttachment == null || mimeType == null || assembleAttachment.length <= 0) {
        return null;
    }
    var file;
    var sequence = 1;
    assembleAttachment.sort(function (a, b) { return (a.sequence > b.sequence ? 1 : -1); });
    assembleAttachment.forEach(function (item) {
        if (item.sequence == sequence) {
            if (file) {
                file = new Blob([file, item.file], { type: mimeType });
            }
            else {
                file = new Blob([item.file], { type: mimeType });
            }
            sequence++;
        }
    });
    return file;
}
/**
 * @hidden
 * Helper function to convert Media chunks into another object type which can be later assemebled
 * Converts base 64 encoded string to byte array and then into an array of blobs
 *
 * @internal
 */
function decodeAttachment(attachment, mimeType) {
    if (attachment == null || mimeType == null) {
        return null;
    }
    var decoded = atob(attachment.chunk);
    var byteNumbers = new Array(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
        byteNumbers[i] = decoded.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], { type: mimeType });
    var assemble = {
        sequence: attachment.chunkSequence,
        file: blob,
    };
    return assemble;
}
/**
 * @hidden
 * Returns true if the mediaInput params are valid and false otherwise
 *
 * @internal
 */
function validateSelectMediaInputs(mediaInputs) {
    if (mediaInputs == null || mediaInputs.maxMediaCount > 10) {
        return false;
    }
    return true;
}
/**
 * @hidden
 * Returns true if the mediaInput params are called for mediatype VideoAndImage and false otherwise
 *
 * @internal
 */
function isMediaCallForVideoAndImageInputs(mediaInputs) {
    if (mediaInputs) {
        if (mediaInputs.mediaType == media.MediaType.VideoAndImage || mediaInputs.videoAndImageProps) {
            return true;
        }
    }
    return false;
}
/**
 * @hidden
 * Returns true if the get Media params are valid and false otherwise
 *
 * @internal
 */
function validateGetMediaInputs(mimeType, format, content) {
    if (mimeType == null || format == null || format != media.FileFormat.ID || content == null) {
        return false;
    }
    return true;
}
/**
 * @hidden
 * Returns true if the view images param is valid and false otherwise
 *
 * @internal
 */
function validateViewImagesInput(uriList) {
    if (uriList == null || uriList.length <= 0 || uriList.length > 10) {
        return false;
    }
    return true;
}
/**
 * @hidden
 * Returns true if the scan barcode param is valid and false otherwise
 *
 * @internal
 */
function validateScanBarCodeInput(barCodeConfig) {
    if (barCodeConfig) {
        if (barCodeConfig.timeOutIntervalInSec === null ||
            barCodeConfig.timeOutIntervalInSec <= 0 ||
            barCodeConfig.timeOutIntervalInSec > 60) {
            return false;
        }
    }
    return true;
}
/**
 * @hidden
 * Returns true if the people picker params are valid and false otherwise
 *
 * @internal
 */
function validatePeoplePickerInput(peoplePickerInputs) {
    if (peoplePickerInputs) {
        if (peoplePickerInputs.title) {
            if (typeof peoplePickerInputs.title !== 'string') {
                return false;
            }
        }
        if (peoplePickerInputs.setSelected) {
            if (typeof peoplePickerInputs.setSelected !== 'object') {
                return false;
            }
        }
        if (peoplePickerInputs.openOrgWideSearchInChatOrChannel) {
            if (typeof peoplePickerInputs.openOrgWideSearchInChatOrChannel !== 'boolean') {
                return false;
            }
        }
        if (peoplePickerInputs.singleSelect) {
            if (typeof peoplePickerInputs.singleSelect !== 'boolean') {
                return false;
            }
        }
    }
    return true;
}

;// CONCATENATED MODULE: ./src/public/media.ts
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();










/**
 * @alpha
 */
var media;
(function (media) {
    /**
     * Enum for file formats supported
     */
    var FileFormat;
    (function (FileFormat) {
        FileFormat["Base64"] = "base64";
        FileFormat["ID"] = "id";
    })(FileFormat = media.FileFormat || (media.FileFormat = {}));
    /**
     * File object that can be used to represent image or video or audio
     */
    var File = /** @class */ (function () {
        function File() {
        }
        return File;
    }());
    media.File = File;
    function captureImage(callback) {
        ensureInitialized(FrameContexts.content, FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (!GlobalVars.isFramelessWindow) {
                    throw { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
                }
                if (!isAPISupportedByPlatform(captureImageMobileSupportVersion)) {
                    throw { errorCode: ErrorCode.OLD_PLATFORM };
                }
                resolve(sendAndHandleSdkError('captureImage'));
            });
        };
        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(wrappedFunction, callback);
    }
    media.captureImage = captureImage;
    /**
     * Media object returned by the select Media API
     */
    var Media = /** @class */ (function (_super) {
        __extends(Media, _super);
        function Media(that) {
            if (that === void 0) { that = null; }
            var _this = _super.call(this) || this;
            if (that) {
                _this.content = that.content;
                _this.format = that.format;
                _this.mimeType = that.mimeType;
                _this.name = that.name;
                _this.preview = that.preview;
                _this.size = that.size;
            }
            return _this;
        }
        Media.prototype.getMedia = function (callback) {
            var _this = this;
            ensureInitialized(FrameContexts.content, FrameContexts.task);
            var wrappedFunction = function () {
                return new Promise(function (resolve) {
                    if (!isAPISupportedByPlatform(mediaAPISupportVersion)) {
                        throw { errorCode: ErrorCode.OLD_PLATFORM };
                    }
                    if (!validateGetMediaInputs(_this.mimeType, _this.format, _this.content)) {
                        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
                    }
                    // Call the new get media implementation via callbacks if the client version is greater than or equal to '2.0.0'
                    if (isAPISupportedByPlatform(getMediaCallbackSupportVersion)) {
                        resolve(_this.getMediaViaCallback());
                    }
                    else {
                        resolve(_this.getMediaViaHandler());
                    }
                });
            };
            return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(wrappedFunction, callback);
        };
        Media.prototype.getMediaViaCallback = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var helper = {
                    mediaMimeType: _this.mimeType,
                    assembleAttachment: [],
                };
                var localUriId = [_this.content];
                sendMessageToParent('getMedia', localUriId, function (mediaResult) {
                    if (mediaResult && mediaResult.error) {
                        reject(mediaResult.error);
                    }
                    else if (!mediaResult || !mediaResult.mediaChunk) {
                        reject({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
                    }
                    else if (mediaResult.mediaChunk.chunkSequence <= 0) {
                        var file = createFile(helper.assembleAttachment, helper.mediaMimeType);
                        resolve(file);
                    }
                    else {
                        // Keep pushing chunks into assemble attachment
                        var assemble = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
                        helper.assembleAttachment.push(assemble);
                    }
                });
            });
        };
        Media.prototype.getMediaViaHandler = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var actionName = generateGUID();
                var helper = {
                    mediaMimeType: _this.mimeType,
                    assembleAttachment: [],
                };
                var params = [actionName, _this.content];
                _this.content && sendMessageToParent('getMedia', params);
                registerHandler('getMedia' + actionName, function (response) {
                    try {
                        var mediaResult = JSON.parse(response);
                        if (mediaResult.error) {
                            reject(mediaResult.error);
                            removeHandler('getMedia' + actionName);
                        }
                        else if (!mediaResult || !mediaResult.mediaChunk) {
                            reject({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
                            removeHandler('getMedia' + actionName);
                        }
                        else if (mediaResult.mediaChunk.chunkSequence <= 0) {
                            // If the chunksequence number is less than equal to 0 implies EOF
                            // create file/blob when all chunks have arrived and we get 0/-1 as chunksequence number
                            var file = createFile(helper.assembleAttachment, helper.mediaMimeType);
                            resolve(file);
                            removeHandler('getMedia' + actionName);
                        }
                        else {
                            // Keep pushing chunks into assemble attachment
                            var assemble = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
                            helper.assembleAttachment.push(assemble);
                        }
                    }
                    catch (err) {
                        // catch JSON.parse() errors
                        reject({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'Error parsing the response: ' + response });
                    }
                });
            });
        };
        return Media;
    }(File));
    media.Media = Media;
    /**
     * The modes in which camera can be launched in select Media API
     */
    var CameraStartMode;
    (function (CameraStartMode) {
        CameraStartMode[CameraStartMode["Photo"] = 1] = "Photo";
        CameraStartMode[CameraStartMode["Document"] = 2] = "Document";
        CameraStartMode[CameraStartMode["Whiteboard"] = 3] = "Whiteboard";
        CameraStartMode[CameraStartMode["BusinessCard"] = 4] = "BusinessCard";
    })(CameraStartMode = media.CameraStartMode || (media.CameraStartMode = {}));
    /**
     * Specifies the image source
     */
    var Source;
    (function (Source) {
        Source[Source["Camera"] = 1] = "Camera";
        Source[Source["Gallery"] = 2] = "Gallery";
    })(Source = media.Source || (media.Source = {}));
    /**
     * Specifies the type of Media
     */
    var MediaType;
    (function (MediaType) {
        MediaType[MediaType["Image"] = 1] = "Image";
        // Video = 2, // Not implemented yet
        MediaType[MediaType["VideoAndImage"] = 3] = "VideoAndImage";
        MediaType[MediaType["Audio"] = 4] = "Audio";
    })(MediaType = media.MediaType || (media.MediaType = {}));
    /**
     * ID contains a mapping for content uri on platform's side, URL is generic
     */
    var ImageUriType;
    (function (ImageUriType) {
        ImageUriType[ImageUriType["ID"] = 1] = "ID";
        ImageUriType[ImageUriType["URL"] = 2] = "URL";
    })(ImageUriType = media.ImageUriType || (media.ImageUriType = {}));
    function selectMedia(mediaInputs, callback) {
        ensureInitialized(FrameContexts.content, FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (!isAPISupportedByPlatform(mediaAPISupportVersion)) {
                    throw { errorCode: ErrorCode.OLD_PLATFORM };
                }
                if (isMediaCallForVideoAndImageInputs(mediaInputs)) {
                    if (GlobalVars.hostClientType != HostClientType.android && GlobalVars.hostClientType != HostClientType.ios) {
                        throw { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
                    }
                    else if (!isAPISupportedByPlatform(videoAndImageMediaAPISupportVersion)) {
                        throw { errorCode: ErrorCode.OLD_PLATFORM };
                    }
                }
                if (!validateSelectMediaInputs(mediaInputs)) {
                    throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
                }
                var params = [mediaInputs];
                // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
                resolve(sendMessageToParentAsync('selectMedia', params));
            }).then(function (_a) {
                var err = _a[0], localAttachments = _a[1];
                if (!localAttachments) {
                    throw err;
                }
                var mediaArray = [];
                for (var _i = 0, localAttachments_1 = localAttachments; _i < localAttachments_1.length; _i++) {
                    var attachment = localAttachments_1[_i];
                    mediaArray.push(new Media(attachment));
                }
                return mediaArray;
            });
        };
        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(wrappedFunction, callback);
    }
    media.selectMedia = selectMedia;
    function viewImages(uriList, callback) {
        ensureInitialized(FrameContexts.content, FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (!isAPISupportedByPlatform(mediaAPISupportVersion)) {
                    throw { errorCode: ErrorCode.OLD_PLATFORM };
                }
                if (!validateViewImagesInput(uriList)) {
                    throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
                }
                resolve(sendAndHandleSdkError('viewImages', uriList));
            });
        };
        return callCallbackWithSdkErrorFromPromiseAndReturnPromise(wrappedFunction, callback);
    }
    media.viewImages = viewImages;
    function scanBarCode(callbackOrConfig, configMaybe) {
        var callback;
        var config;
        // Because the callback isn't the second parameter in the original v1 method we need to
        // do a bit of trickery to see which of the two ways were used to call into
        // the flow and if the first parameter is a callback (v1) or a config object (v2)
        if (callbackOrConfig === undefined) {
            // no first parameter - the second one might be a config, definitely no callback
            config = configMaybe;
        }
        else {
            if (typeof callbackOrConfig === 'object') {
                // the first parameter is an object - it's the config! No callback.
                config = callbackOrConfig;
            }
            else {
                // otherwise, it's a function, so a callback. The second parameter might be a callback
                callback = callbackOrConfig;
                config = configMaybe;
            }
        }
        ensureInitialized(FrameContexts.content, FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (GlobalVars.hostClientType === HostClientType.desktop ||
                    GlobalVars.hostClientType === HostClientType.web ||
                    GlobalVars.hostClientType === HostClientType.rigel ||
                    GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
                    GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
                    GlobalVars.hostClientType === HostClientType.teamsPhones ||
                    GlobalVars.hostClientType === HostClientType.teamsDisplays) {
                    throw { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
                }
                if (!isAPISupportedByPlatform(scanBarCodeAPIMobileSupportVersion)) {
                    throw { errorCode: ErrorCode.OLD_PLATFORM };
                }
                if (!validateScanBarCodeInput(config)) {
                    throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
                }
                resolve(sendAndHandleSdkError('media.scanBarCode', config));
            });
        };
        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(wrappedFunction, callback);
    }
    media.scanBarCode = scanBarCode;
    function isSupported() {
        return runtime.supports.media ? true : false;
    }
    media.isSupported = isSupported;
})(media || (media = {}));

;// CONCATENATED MODULE: ./src/public/location.ts







/**
 * @alpha
 */
var location_location;
(function (location_1) {
    function getLocation(props, callback) {
        ensureInitialized(FrameContexts.content, FrameContexts.task);
        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(getLocationHelper, callback, props);
    }
    location_1.getLocation = getLocation;
    function getLocationHelper(props) {
        return new Promise(function (resolve) {
            if (!isAPISupportedByPlatform(locationAPIsRequiredVersion)) {
                throw { errorCode: ErrorCode.OLD_PLATFORM };
            }
            if (!props) {
                throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
            }
            resolve(sendAndHandleSdkError('location.getLocation', props));
        });
    }
    function showLocation(location, callback) {
        ensureInitialized(FrameContexts.content, FrameContexts.task);
        return callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(showLocationHelper, callback, location);
    }
    location_1.showLocation = showLocation;
    function showLocationHelper(location) {
        return new Promise(function (resolve) {
            if (!isAPISupportedByPlatform(locationAPIsRequiredVersion)) {
                throw { errorCode: ErrorCode.OLD_PLATFORM };
            }
            if (!location) {
                throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
            }
            resolve(sendAndHandleSdkError('location.showLocation', location));
        });
    }
    location_1.showLocationHelper = showLocationHelper;
    function isSupported() {
        return runtime.supports.location ? true : false;
    }
    location_1.isSupported = isSupported;
})(location_location || (location_location = {}));

;// CONCATENATED MODULE: ./src/public/meeting.ts






/**
 * @alpha
 */
var meeting;
(function (meeting) {
    var MeetingType;
    (function (MeetingType) {
        MeetingType["Unknown"] = "Unknown";
        MeetingType["Adhoc"] = "Adhoc";
        MeetingType["Scheduled"] = "Scheduled";
        MeetingType["Recurring"] = "Recurring";
        MeetingType["Broadcast"] = "Broadcast";
        MeetingType["MeetNow"] = "MeetNow";
    })(MeetingType = meeting.MeetingType || (meeting.MeetingType = {}));
    function getIncomingClientAudioState(callback) {
        ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(getIncomingClientAudioStateHelper, callback);
    }
    meeting.getIncomingClientAudioState = getIncomingClientAudioState;
    function getIncomingClientAudioStateHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('getIncomingClientAudioState'));
        });
    }
    function toggleIncomingClientAudio(callback) {
        ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(toggleIncomingClientAudioHelper, callback);
    }
    meeting.toggleIncomingClientAudio = toggleIncomingClientAudio;
    function toggleIncomingClientAudioHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('toggleIncomingClientAudio'));
        });
    }
    function getMeetingDetails(callback) {
        ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.settings, FrameContexts.content);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(getMeetingDetailsHelper, callback);
    }
    meeting.getMeetingDetails = getMeetingDetails;
    function getMeetingDetailsHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.getMeetingDetails'));
        });
    }
    function getAuthenticationTokenForAnonymousUser(callback) {
        ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(getAuthenticationTokenForAnonymousUserHelper, callback);
    }
    meeting.getAuthenticationTokenForAnonymousUser = getAuthenticationTokenForAnonymousUser;
    function getAuthenticationTokenForAnonymousUserHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.getAuthenticationTokenForAnonymousUser'));
        });
    }
    function isSupported() {
        return runtime.supports.meeting ? true : false;
    }
    meeting.isSupported = isSupported;
    function getLiveStreamState(callback) {
        ensureInitialized();
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(getLiveStreamStateHelper, callback);
    }
    meeting.getLiveStreamState = getLiveStreamState;
    function getLiveStreamStateHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.getLiveStreamState'));
        });
    }
    /**
     * @hidden
     * This function is the overloaded implementation of requestStartLiveStreaming.
     * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
     * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
     * @param param1
     * @param param2
     * @param param3
     * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
     */
    function requestStartLiveStreaming(param1, param2, param3) {
        var _a, _b;
        ensureInitialized(FrameContexts.sidePanel);
        var streamUrl;
        var streamKey;
        var callback;
        if (typeof param1 === 'function') {
            // Legacy code, with callbacks.
            _a = [param1, param2, param3], callback = _a[0], streamUrl = _a[1], streamKey = _a[2];
        }
        else if (typeof param1 === 'string') {
            _b = [param1, param2], streamUrl = _b[0], streamKey = _b[1];
        }
        return callCallbackWithSdkErrorFromPromiseAndReturnPromise(requestStartLiveStreamingHelper, callback, streamUrl, streamKey);
    }
    meeting.requestStartLiveStreaming = requestStartLiveStreaming;
    function requestStartLiveStreamingHelper(streamUrl, streamKey) {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.requestStartLiveStreaming', streamUrl, streamKey));
        });
    }
    function requestStopLiveStreaming(callback) {
        ensureInitialized(FrameContexts.sidePanel);
        return callCallbackWithSdkErrorFromPromiseAndReturnPromise(requestStopLiveStreamingHelper, callback);
    }
    meeting.requestStopLiveStreaming = requestStopLiveStreaming;
    function requestStopLiveStreamingHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.requestStopLiveStreaming'));
        });
    }
    /**
     * Registers a handler for changes to the live stream.
     *
     * @remarks
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the live stream state changes
     */
    function registerLiveStreamChangedHandler(handler) {
        if (!handler) {
            throw new Error('[register live stream changed handler] Handler cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('meeting.liveStreamChanged', handler);
    }
    meeting.registerLiveStreamChangedHandler = registerLiveStreamChangedHandler;
    /**
     * @hidden
     * This function is the overloaded implementation of shareAppContentToStage.
     * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
     * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
     * @param param1
     * @param param2
     * @returns Promise resolved indicating whether or not the share was successful or rejected with SdkError value
     */
    function shareAppContentToStage(param1, param2) {
        var _a;
        ensureInitialized(FrameContexts.sidePanel);
        var appContentUrl;
        var callback;
        if (typeof param1 === 'function') {
            // Legacy callback
            _a = [param1, param2], callback = _a[0], appContentUrl = _a[1];
        }
        else {
            appContentUrl = param1;
        }
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(shareAppContentToStageHelper, callback, appContentUrl);
    }
    meeting.shareAppContentToStage = shareAppContentToStage;
    function shareAppContentToStageHelper(appContentUrl) {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.shareAppContentToStage', appContentUrl));
        });
    }
    function getAppContentStageSharingCapabilities(callback) {
        ensureInitialized(FrameContexts.sidePanel);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(getAppContentStageSharingCapabilitiesHelper, callback);
    }
    meeting.getAppContentStageSharingCapabilities = getAppContentStageSharingCapabilities;
    function getAppContentStageSharingCapabilitiesHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.getAppContentStageSharingCapabilities'));
        });
    }
    function stopSharingAppContentToStage(callback) {
        ensureInitialized(FrameContexts.sidePanel);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(stopSharingAppContentToStageHelper, callback);
    }
    meeting.stopSharingAppContentToStage = stopSharingAppContentToStage;
    function stopSharingAppContentToStageHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.stopSharingAppContentToStage'));
        });
    }
    function getAppContentStageSharingState(callback) {
        ensureInitialized(FrameContexts.sidePanel);
        return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(getAppContentStageSharingStateHelper, callback);
    }
    meeting.getAppContentStageSharingState = getAppContentStageSharingState;
    function getAppContentStageSharingStateHelper() {
        return new Promise(function (resolve) {
            resolve(sendAndHandleSdkError('meeting.getAppContentStageSharingState'));
        });
    }
})(meeting || (meeting = {}));

;// CONCATENATED MODULE: ./src/public/monetization.ts




/**
 * @alpha
 */
var monetization;
(function (monetization) {
    /**
     * @hidden
     * Hide from docs
     * Open dialog to start user's purchase experience
     *
     * @param callback Callback contains 1 parameters, error.
     * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
     * error can either contain an error of type SdkError, incase of an error, or null when get is successful
     *
     * @internal
     */
    function openPurchaseExperience(callback, planInfo) {
        if (!callback) {
            throw new Error('[open purchase experience] Callback cannot be null');
        }
        ensureInitialized(FrameContexts.content);
        sendMessageToParent('monetization.openPurchaseExperience', [planInfo], callback);
    }
    monetization.openPurchaseExperience = openPurchaseExperience;
    function isSupported() {
        return runtime.supports.monetization ? true : false;
    }
    monetization.isSupported = isSupported;
})(monetization || (monetization = {}));

;// CONCATENATED MODULE: ./src/public/calendar.ts




/**
 * @alpha
 */
var calendar;
(function (calendar) {
    function openCalendarItem(openCalendarItemParams) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!isSupported()) {
                throw 'Not Supported';
            }
            resolve(sendAndHandleStatusAndReason('calendar.openCalendarItem', openCalendarItemParams));
        });
    }
    calendar.openCalendarItem = openCalendarItem;
    function composeMeeting(composeMeetingParams) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!isSupported()) {
                throw 'Not Supported';
            }
            resolve(sendAndHandleStatusAndReason('calendar.composeMeeting', composeMeetingParams));
        });
    }
    calendar.composeMeeting = composeMeeting;
    function isSupported() {
        return runtime.supports.calendar ? true : false;
    }
    calendar.isSupported = isSupported;
})(calendar || (calendar = {}));

;// CONCATENATED MODULE: ./src/public/mail.ts




/**
 * @alpha
 */
var mail;
(function (mail) {
    function openMailItem(openMailItemParams) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!isSupported()) {
                throw 'Not Supported';
            }
            resolve(sendAndHandleStatusAndReason('mail.openMailItem', openMailItemParams));
        });
    }
    mail.openMailItem = openMailItem;
    function composeMail(composeMailParams) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!isSupported()) {
                throw 'Not Supported';
            }
            resolve(sendAndHandleStatusAndReason('mail.composeMail', composeMailParams));
        });
    }
    mail.composeMail = composeMail;
    function isSupported() {
        return runtime.supports.mail ? true : false;
    }
    mail.isSupported = isSupported;
    var ComposeMailType;
    (function (ComposeMailType) {
        ComposeMailType["New"] = "new";
        ComposeMailType["Reply"] = "reply";
        ComposeMailType["ReplyAll"] = "replyAll";
        ComposeMailType["Forward"] = "forward";
    })(ComposeMailType = mail.ComposeMailType || (mail.ComposeMailType = {}));
})(mail || (mail = {}));

;// CONCATENATED MODULE: ./src/public/people.ts








/**
 * @alpha
 */
var people;
(function (people_1) {
    /**
     * @hidden
     * This function is the overloaded implementation of selectPeople.
     * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
     * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
     * @param param1
     * @param param2
     * @returns Promise of Array of PeoplePickerResult objects.
     */
    function selectPeople(param1, param2) {
        var _a;
        ensureInitialized(FrameContexts.content, FrameContexts.task, FrameContexts.settings);
        var callback;
        var peoplePickerInputs;
        if (typeof param1 === 'function') {
            _a = [param1, param2], callback = _a[0], peoplePickerInputs = _a[1];
        }
        else {
            peoplePickerInputs = param1;
        }
        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(selectPeopleHelper, callback, peoplePickerInputs);
    }
    people_1.selectPeople = selectPeople;
    function selectPeopleHelper(peoplePickerInputs) {
        return new Promise(function (resolve) {
            if (!isAPISupportedByPlatform(peoplePickerRequiredVersion)) {
                throw { errorCode: ErrorCode.OLD_PLATFORM };
            }
            if (!validatePeoplePickerInput(peoplePickerInputs)) {
                throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
            }
            resolve(sendAndHandleSdkError('people.selectPeople', peoplePickerInputs));
        });
    }
    function isSupported() {
        return runtime.supports.people ? true : false;
    }
    people_1.isSupported = isSupported;
})(people || (people = {}));

;// CONCATENATED MODULE: ./src/public/video.ts





/**
 * Namespace to video extensibility of the SDK.
 *
 * @alpha
 *
 */
var video;
(function (video) {
    /**
     * Video frame format enum, currently only support NV12
     */
    var VideoFrameFormat;
    (function (VideoFrameFormat) {
        VideoFrameFormat[VideoFrameFormat["NV12"] = 0] = "NV12";
    })(VideoFrameFormat = video.VideoFrameFormat || (video.VideoFrameFormat = {}));
    /**
     *  Video effect change type enum
     */
    var EffectChangeType;
    (function (EffectChangeType) {
        /**
         * current video effect changed.
         */
        EffectChangeType[EffectChangeType["EffectChanged"] = 0] = "EffectChanged";
        /**
         * disable the video effect
         */
        EffectChangeType[EffectChangeType["EffectDisabled"] = 1] = "EffectDisabled";
    })(EffectChangeType = video.EffectChangeType || (video.EffectChangeType = {}));
    /**
     * register to read the video frames in Permissions section.
     */
    function registerForVideoFrame(frameCallback, config) {
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('video.newVideoFrame', function (videoFrame) {
            if (videoFrame !== undefined) {
                frameCallback(videoFrame, notifyVideoFrameProcessed, notifyError);
            }
        });
        sendMessageToParent('video.registerForVideoFrame', [config]);
    }
    video.registerForVideoFrame = registerForVideoFrame;
    /**
     * video extension should call this to notify Teams Client current selected effect parameter changed.
     * If it's pre-meeting, Teams client will call videoEffectCallback immediately then use the videoEffect.
     * in-meeting scenario, we will call videoEffectCallback when apply button clicked.
     *
     * @param effectChangeType - the effect change type.
     * @param effectId - Newly selected effect id.
     */
    function notifySelectedVideoEffectChanged(effectChangeType, effectId) {
        ensureInitialized(FrameContexts.sidePanel);
        sendMessageToParent('video.videoEffectChanged', [effectChangeType, effectId]);
    }
    video.notifySelectedVideoEffectChanged = notifySelectedVideoEffectChanged;
    /**
     * Register the video effect callback, Teams client uses this to notify the video extension the new video effect will by applied.
     */
    function registerForVideoEffect(callback) {
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('video.effectParameterChange', callback);
    }
    video.registerForVideoEffect = registerForVideoEffect;
    /**
     * sending notification to Teams client finished the video frame processing, now Teams client can render this video frame
     * or pass the video frame to next one in video pipeline.
     */
    function notifyVideoFrameProcessed() {
        sendMessageToParent('video.videoFrameProcessed');
    }
    /**
     * sending error notification to Teams client.
     */
    function notifyError(errorMessage) {
        sendMessageToParent('video.notifyError', [errorMessage]);
    }
    function isSupported() {
        return runtime.supports.video ? true : false;
    }
    video.isSupported = isSupported;
})(video || (video = {})); //end of video namespace

;// CONCATENATED MODULE: ./src/public/sharing.ts





/**
 * @alpha
 */
var sharing;
(function (sharing) {
    sharing.SharingAPIMessages = {
        shareWebContent: 'sharing.shareWebContent',
    };
    /**
     * @hidden
     * Feature is under development
     * Opens a share dialog for web content
     *
     * @param shareWebContentRequest - web content info
     * @param callback - optional callback
     *
     * @internal
     */
    function shareWebContent(shareWebContentRequest, callback) {
        if (!validateNonEmptyContent(shareWebContentRequest, callback)) {
            return;
        }
        if (!validateTypeConsistency(shareWebContentRequest, callback)) {
            return;
        }
        if (!validateContentForSupportedTypes(shareWebContentRequest, callback)) {
            return;
        }
        ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
        sendMessageToParent(sharing.SharingAPIMessages.shareWebContent, [shareWebContentRequest], callback);
    }
    sharing.shareWebContent = shareWebContent;
    /**
     * Error checks
     */
    function validateNonEmptyContent(shareRequest, callback) {
        if (!(shareRequest && shareRequest.content && shareRequest.content.length)) {
            if (callback) {
                callback({
                    errorCode: ErrorCode.INVALID_ARGUMENTS,
                    message: 'Shared content is missing',
                });
            }
            return false;
        }
        return true;
    }
    function validateTypeConsistency(shareRequest, callback) {
        if (shareRequest.content.some(function (item) { return !item.type; })) {
            if (callback) {
                callback({
                    errorCode: ErrorCode.INVALID_ARGUMENTS,
                    message: 'Shared content type cannot be undefined',
                });
            }
            return false;
        }
        if (shareRequest.content.some(function (item) { return item.type !== shareRequest.content[0].type; })) {
            if (callback) {
                callback({
                    errorCode: ErrorCode.INVALID_ARGUMENTS,
                    message: 'Shared content must be of the same type',
                });
            }
            return false;
        }
        return true;
    }
    function validateContentForSupportedTypes(shareRequest, callback) {
        if (shareRequest.content[0].type === 'URL') {
            if (shareRequest.content.some(function (item) { return !item.url; })) {
                if (callback) {
                    callback({
                        errorCode: ErrorCode.INVALID_ARGUMENTS,
                        message: 'URLs are required for URL content types',
                    });
                }
                return false;
            }
        }
        else {
            if (callback) {
                callback({
                    errorCode: ErrorCode.INVALID_ARGUMENTS,
                    message: 'Content type is unsupported',
                });
            }
            return false;
        }
        return true;
    }
    function isSupported() {
        return runtime.supports.sharing ? true : false;
    }
    sharing.isSupported = isSupported;
})(sharing || (sharing = {}));

;// CONCATENATED MODULE: ./src/public/call.ts




/**
 * @alpha
 */
var call;
(function (call) {
    var CallModalities;
    (function (CallModalities) {
        CallModalities["Unknown"] = "unknown";
        CallModalities["Audio"] = "audio";
        CallModalities["Video"] = "video";
        CallModalities["VideoBasedScreenSharing"] = "videoBasedScreenSharing";
        CallModalities["Data"] = "data";
    })(CallModalities = call.CallModalities || (call.CallModalities = {}));
    /**
     * Starts a call with other users
     *
     * @param startCallParams - Parameters for the call
     * @returns If the call is accepted
     */
    function startCall(startCallParams) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!isSupported()) {
                throw 'Not supported';
            }
            return sendMessageToParent('call.startCall', [startCallParams], resolve);
        });
    }
    call.startCall = startCall;
    function isSupported() {
        return runtime.supports.call ? true : false;
    }
    call.isSupported = isSupported;
})(call || (call = {}));

;// CONCATENATED MODULE: ./src/public/appInitialization.ts

/**
 * @deprecated with TeamsJS v2 upgrades
 */
var appInitialization;
(function (appInitialization) {
    /**
     * @deprecated with TeamsJS v2 upgrades
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appInitialization.Messages = app_app.Messages;
    /**
     * @deprecated with TeamsJS v2 upgrades
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appInitialization.FailedReason = app_app.FailedReason;
    /**
     * @deprecated with TeamsJS v2 upgrades
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appInitialization.ExpectedFailureReason = app_app.ExpectedFailureReason;
    /**
     * @deprecated with TeamsJS v2 upgrades
     * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
     */
    function notifyAppLoaded() {
        app_app.notifyAppLoaded();
    }
    appInitialization.notifyAppLoaded = notifyAppLoaded;
    /**
     * @deprecated with TeamsJS v2 upgrades
     * Notifies the frame that app initialization is successful and is ready for user interaction.
     */
    function notifySuccess() {
        app_app.notifySuccess();
    }
    appInitialization.notifySuccess = notifySuccess;
    /**
     * @deprecated with TeamsJS v2 upgrades
     * Notifies the frame that app initialization has failed and to show an error page in its place.
     */
    function notifyFailure(appInitializationFailedRequest) {
        app_app.notifyFailure(appInitializationFailedRequest);
    }
    appInitialization.notifyFailure = notifyFailure;
    /**
     * @deprecated with TeamsJS v2 upgrades
     * Notifies the frame that app initialized with some expected errors.
     */
    function notifyExpectedFailure(expectedFailureRequest) {
        app_app.notifyExpectedFailure(expectedFailureRequest);
    }
    appInitialization.notifyExpectedFailure = notifyExpectedFailure;
})(appInitialization || (appInitialization = {}));

;// CONCATENATED MODULE: ./src/public/publicAPIs.ts





/**
 * @deprecated with TeamsJS v2 upgrades
 *
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback - Optionally specify a callback to invoke when Teams SDK has successfully initialized
 * @param validMessageOrigins - Optionally specify a list of cross frame message origins. There must have
 * https: protocol otherwise they will be ignored. Example: https://www.example.com
 */
function initialize(callback, validMessageOrigins) {
    app_app.initialize(validMessageOrigins).then(function () {
        if (callback) {
            callback();
        }
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * @hidden
 * Hide from docs.
 * ------
 * Undocumented function used to set a mock window for unit tests
 *
 * @internal
 */
// eslint-disable-next-line
function _initialize(hostWindow) {
    app._initialize(hostWindow);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * @hidden
 * Hide from docs.
 * ------
 * Undocumented function used to clear state between unit tests
 *
 * @internal
 */
function _uninitialize() {
    app._uninitialize();
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
function enablePrintCapability() {
    teamsCore.enablePrintCapability();
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Default print handler
 */
function print() {
    teamsCore.print();
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Retrieves the current context the frame is running in.
 *
 * @param callback - The callback to invoke when the {@link Context} object is retrieved.
 */
function getContext(callback) {
    ensureInitialized();
    app_app.getContext().then(function (context) {
        if (callback) {
            callback(transformAppContextToLegacyContext(context));
        }
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
function registerOnThemeChangeHandler(handler) {
    app_app.registerOnThemeChangeHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
 */
function registerFullScreenHandler(handler) {
    pages.registerFullScreenHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
 */
function registerAppButtonClickHandler(handler) {
    pages.appButton.onClick(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
 */
function registerAppButtonHoverEnterHandler(handler) {
    pages.appButton.onHoverEnter(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
 *
 */
function registerAppButtonHoverLeaveHandler(handler) {
    pages.appButton.onHoverLeave(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 *
 * @param handler - The handler to invoke when the user presses their Team client's back button.
 */
function registerBackButtonHandler(handler) {
    pages.backStack.registerBackButtonHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * @hidden
 * Registers a handler to be called when the page has been requested to load.
 *
 * @param handler - The handler to invoke when the page is loaded.
 */
function registerOnLoadHandler(handler) {
    teamsCore.registerOnLoadHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * @hidden
 * Registers a handler to be called before the page is unloaded.
 *
 * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
function registerBeforeUnloadHandler(handler) {
    teamsCore.registerBeforeUnloadHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * @hidden
 * Registers a handler when focus needs to be passed from teams to the place of choice on app.
 *
 * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
 */
function registerFocusEnterHandler(handler) {
    teamsCore.registerFocusEnterHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Registers a handler for when the user reconfigurated tab.
 *
 * @param handler - The handler to invoke when the user click on Settings.
 */
function registerEnterSettingsHandler(handler) {
    pages.config.registerChangeConfigHandler(handler);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 *
 * @param callback - The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
function getTabInstances(callback, tabInstanceParameters) {
    ensureInitialized();
    pages.tabs.getTabInstances(tabInstanceParameters).then(function (tabInfo) {
        callback(tabInfo);
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Allows an app to retrieve the most recently used tabs for this user.
 *
 * @param callback - The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Ignored, kept for future use
 */
function getMruTabInstances(callback, tabInstanceParameters) {
    ensureInitialized();
    pages.tabs.getMruTabInstances(tabInstanceParameters).then(function (tabInfo) {
        callback(tabInfo);
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 *
 * @param deepLinkParameters - ID and label for the link and fallback URL.
 */
function shareDeepLink(deepLinkParameters) {
    core.shareDeepLink(deepLinkParameters);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Execute deep link API.
 *
 * @param deepLink - deep link.
 */
function executeDeepLink(deepLink, onComplete) {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.settings, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
    core.executeDeepLink(deepLink)
        .then(function () {
        if (onComplete) {
            onComplete(true);
        }
    })
        .catch(function (err) {
        if (onComplete) {
            onComplete(false, err.message);
        }
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Set the current Frame Context
 *
 * @param frameContext - FrameContext information to be set
 */
function setFrameContext(frameContext) {
    pages.setCurrentFrame(frameContext);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Initilize with FrameContext
 *
 * @param frameContext - FrameContext information to be set
 * @param callback - The optional callback to be invoked be invoked after initilizing the frame context
 * @param validMessageOrigins -  Optionally specify a list of cross frame message origins.
 * They must have https: protocol otherwise they will be ignored. Example: https:www.example.com
 */
function initializeWithFrameContext(frameContext, callback, validMessageOrigins) {
    pages.initializeWithFrameContext(frameContext, callback, validMessageOrigins);
}
/**
 * Transforms the app.Context object received to TeamsJS Context
 */
function transformAppContextToLegacyContext(appContext) {
    var context = {
        // app
        locale: appContext.app.locale,
        appSessionId: appContext.app.sessionId,
        theme: appContext.app.theme,
        appIconPosition: appContext.app.iconPositionVertical,
        osLocaleInfo: appContext.app.osLocaleInfo,
        parentMessageId: appContext.app.parentMessageId,
        userClickTime: appContext.app.userClickTime,
        userFileOpenPreference: appContext.app.userFileOpenPreference,
        appLaunchId: appContext.app.appLaunchId,
        // app.host
        hostClientType: appContext.app.host.clientType,
        sessionId: appContext.app.host.sessionId,
        ringId: appContext.app.host.ringId,
        // page
        entityId: appContext.page.id,
        frameContext: appContext.page.frameContext,
        subEntityId: appContext.page.subPageId,
        isFullScreen: appContext.page.isFullScreen,
        isMultiWindow: appContext.page.isMultiWindow,
        sourceOrigin: appContext.page.sourceOrigin,
        // user
        userObjectId: appContext.user !== undefined ? appContext.user.id : undefined,
        isCallingAllowed: appContext.user !== undefined ? appContext.user.isCallingAllowed : undefined,
        isPSTNCallingAllowed: appContext.user !== undefined ? appContext.user.isPSTNCallingAllowed : undefined,
        userLicenseType: appContext.user !== undefined ? appContext.user.licenseType : undefined,
        loginHint: appContext.user !== undefined ? appContext.user.loginHint : undefined,
        userPrincipalName: appContext.user !== undefined ? appContext.user.userPrincipalName : undefined,
        // user.tenant
        tid: appContext.user !== undefined
            ? appContext.user.tenant !== undefined
                ? appContext.user.tenant.id
                : undefined
            : undefined,
        tenantSKU: appContext.user !== undefined
            ? appContext.user.tenant !== undefined
                ? appContext.user.tenant.teamsSku
                : undefined
            : undefined,
        // channel
        channelId: appContext.channel !== undefined ? appContext.channel.id : undefined,
        channelName: appContext.channel !== undefined ? appContext.channel.displayName : undefined,
        channelRelativeUrl: appContext.channel !== undefined ? appContext.channel.relativeUrl : undefined,
        channelType: appContext.channel !== undefined ? appContext.channel.membershipType : undefined,
        defaultOneNoteSectionId: appContext.channel !== undefined ? appContext.channel.defaultOneNoteSectionId : undefined,
        hostTeamGroupId: appContext.channel !== undefined ? appContext.channel.ownerGroupId : undefined,
        hostTeamTenantId: appContext.channel !== undefined ? appContext.channel.ownerTenantId : undefined,
        // chat
        chatId: appContext.chat !== undefined ? appContext.chat.id : undefined,
        // meeting
        meetingId: appContext.meeting !== undefined ? appContext.meeting.id : undefined,
        // sharepoint
        sharepoint: appContext.sharepoint,
        // team
        teamId: appContext.team !== undefined ? appContext.team.internalId : undefined,
        teamName: appContext.team !== undefined ? appContext.team.displayName : undefined,
        teamType: appContext.team !== undefined ? appContext.team.type : undefined,
        groupId: appContext.team !== undefined ? appContext.team.groupId : undefined,
        teamTemplateId: appContext.team !== undefined ? appContext.team.templateId : undefined,
        isTeamArchived: appContext.team !== undefined ? appContext.team.isArchived : undefined,
        userTeamRole: appContext.team !== undefined ? appContext.team.userRole : undefined,
        // sharepointSite
        teamSiteUrl: appContext.sharePointSite !== undefined ? appContext.sharePointSite.url : undefined,
        teamSiteDomain: appContext.sharePointSite !== undefined ? appContext.sharePointSite.domain : undefined,
        teamSitePath: appContext.sharePointSite !== undefined ? appContext.sharePointSite.path : undefined,
        teamSiteId: appContext.sharePointSite !== undefined ? appContext.sharePointSite.id : undefined,
    };
    return context;
}

;// CONCATENATED MODULE: ./src/public/navigation.ts



/**
 * Navigation specific part of the SDK.
 */
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Return focus to the main Teams app. Will focus search bar if navigating foward and app bar if navigating back.
 *
 * @param navigateForward - Determines the direction to focus in teams app.
 */
function returnFocus(navigateForward) {
    pages.returnFocus(navigateForward);
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Navigates the Microsoft Teams app to the specified tab instance.
 *
 * @param tabInstance - The tab instance to navigate to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
function navigateToTab(tabInstance, onComplete) {
    ensureInitialized();
    pages.tabs.navigateToTab(tabInstance)
        .then(function () {
        if (onComplete) {
            onComplete(true);
        }
    })
        .catch(function (error) {
        if (onComplete) {
            onComplete(false, error.message);
        }
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 *
 * @param url - The URL to navigate the frame to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
function navigateCrossDomain(url, onComplete) {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.settings, FrameContexts.remove, FrameContexts.task, FrameContexts.stage, FrameContexts.meetingStage);
    pages.navigateCrossDomain(url)
        .then(function () {
        if (onComplete) {
            onComplete(true);
        }
    })
        .catch(function (error) {
        if (onComplete) {
            onComplete(false, error.message);
        }
    });
}
/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Navigates back in the Teams client.
 * See registerBackButtonHandler for more information on when it's appropriate to use this method.
 *
 * @param onComplete - The callback to invoke when the action is complete.
 */
function navigateBack(onComplete) {
    ensureInitialized();
    pages.backStack.navigateBack()
        .then(function () {
        if (onComplete) {
            onComplete(true);
        }
    })
        .catch(function (error) {
        if (onComplete) {
            onComplete(false, error.message);
        }
    });
}

;// CONCATENATED MODULE: ./src/public/settings.ts



/**
 * @deprecated with Teams JS v2 upgrades
 *
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
var settings;
(function (settings) {
    /**
     * @deprecated with Teams JS v2 upgrades
     *
     * Sets the validity state for the settings.
     * The initial value is false, so the user cannot save the settings until this is called with true.
     *
     * @param validityState - Indicates whether the save or remove button is enabled for the user.
     */
    function setValidityState(validityState) {
        pages.config.setValidityState(validityState);
    }
    settings.setValidityState = setValidityState;
    /**
     * @deprecated with Teams JS v2 upgrades
     *
     * Gets the settings for the current instance.
     *
     * @param callback - The callback to invoke when the {@link Settings} object is retrieved.
     */
    function getSettings(callback) {
        ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.remove, FrameContexts.sidePanel);
        pages.config.getConfig().then(function (config) {
            callback(config);
        });
    }
    settings.getSettings = getSettings;
    /**
     * @deprecated with Teams JS v2 upgrades
     *
     * Sets the settings for the current instance.
     * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
     *
     * @param - Set the desired settings for this instance.
     */
    function setSettings(instanceSettings, onComplete) {
        ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
        pages.config.setConfig(instanceSettings)
            .then(function () {
            if (onComplete) {
                onComplete(true);
            }
        })
            .catch(function (error) {
            if (onComplete) {
                onComplete(false, error.message);
            }
        });
    }
    settings.setSettings = setSettings;
    /**
     * @deprecated with Teams JS v2 upgrades
     *
     * Registers a handler for when the user attempts to save the settings. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the user selects the save button.
     */
    function registerOnSaveHandler(handler) {
        pages.config.registerOnSaveHandler(handler);
    }
    settings.registerOnSaveHandler = registerOnSaveHandler;
    /**
     * @deprecated with Teams JS v2 upgrades
     *
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     *
     * @param handler - The handler to invoke when the user selects the remove button.
     */
    function registerOnRemoveHandler(handler) {
        pages.config.registerOnRemoveHandler(handler);
    }
    settings.registerOnRemoveHandler = registerOnRemoveHandler;
})(settings || (settings = {}));

;// CONCATENATED MODULE: ./src/public/tasks.ts


/**
 * @deprecated with TeamsJS v2 upgrades
 *
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 * The tasks namespace will be deprecated. Please use dialog for future developments.
 */
var tasks;
(function (tasks) {
    /**
     * @deprecated with TeamsJS v2 upgrades
     *
     * Allows an app to open the task module.
     *
     * @param taskInfo - An object containing the parameters of the task module
     * @param submitHandler - Handler to call when the task module is completed
     */
    function startTask(taskInfo, submitHandler) {
        return dialog.open(getDialogInfoFromTaskInfo(taskInfo), submitHandler);
    }
    tasks.startTask = startTask;
    /**
     * @deprecated with TeamsJS v2 upgrades
     *
     * Update height/width task info properties.
     *
     * @param taskInfo - An object containing width and height properties
     */
    function updateTask(taskInfo) {
        dialog.resize(taskInfo);
    }
    tasks.updateTask = updateTask;
    /**
     * @deprecated with TeamsJS v2 upgrades
     *
     * Submit the task module.
     *
     * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    // eslint-disable-next-line
    function submitTask(result, appIds) {
        dialog.submit(result, appIds);
    }
    tasks.submitTask = submitTask;
    function getDialogInfoFromTaskInfo(taskInfo) {
        var dialogHeight = taskInfo.height && typeof taskInfo.height !== 'number'
            ? getDialogDimensionFromTaskModuleDimension(taskInfo.height)
            : taskInfo.height;
        var dialogWidth = taskInfo.width && typeof taskInfo.width !== 'number'
            ? getDialogDimensionFromTaskModuleDimension(taskInfo.width)
            : taskInfo.width;
        var dialogInfo = {
            url: taskInfo.url,
            card: taskInfo.card,
            height: dialogHeight,
            width: dialogWidth,
            title: taskInfo.title,
            fallbackUrl: taskInfo.fallbackUrl,
            completionBotId: taskInfo.completionBotId,
        };
        return dialogInfo;
    }
    function getDialogDimensionFromTaskModuleDimension(taskModuleDimension) {
        if (taskModuleDimension === TaskModuleDimension.Large) {
            return TaskModuleDimension.Large;
        }
        else if (taskModuleDimension === TaskModuleDimension.Medium) {
            return TaskModuleDimension.Medium;
        }
        else {
            return TaskModuleDimension.Small;
        }
    }
})(tasks || (tasks = {}));

;// CONCATENATED MODULE: ./src/public/index.ts



















/**
 * @deprecated with TeamsJS v2 upgrades
 */

/**
 * @deprecated with TeamsJS v2 upgrades
 */

/**
 * @deprecated with TeamsJS v2 upgrades
 */

/**
 * @deprecated with TeamsJS v2 upgrades
 */

/**
 * @deprecated with TeamsJS v2 upgrades
 */


;// CONCATENATED MODULE: ./src/private/files.ts




/**
 * @hidden
 * Hide from docs
 * ------
 * Namespace to interact with the files specific part of the SDK.
 *
 * @alpha
 */
var files;
(function (files) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Cloud storage providers registered with Microsoft Teams
     */
    var CloudStorageProvider;
    (function (CloudStorageProvider) {
        CloudStorageProvider["Dropbox"] = "DROPBOX";
        CloudStorageProvider["Box"] = "BOX";
        CloudStorageProvider["Sharefile"] = "SHAREFILE";
        CloudStorageProvider["GoogleDrive"] = "GOOGLEDRIVE";
        CloudStorageProvider["Egnyte"] = "EGNYTE";
    })(CloudStorageProvider = files.CloudStorageProvider || (files.CloudStorageProvider = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Cloud storage provider integration type
     */
    var CloudStorageProviderType;
    (function (CloudStorageProviderType) {
        CloudStorageProviderType[CloudStorageProviderType["Sharepoint"] = 0] = "Sharepoint";
        CloudStorageProviderType[CloudStorageProviderType["WopiIntegration"] = 1] = "WopiIntegration";
        CloudStorageProviderType[CloudStorageProviderType["Google"] = 2] = "Google";
    })(CloudStorageProviderType = files.CloudStorageProviderType || (files.CloudStorageProviderType = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Gets a list of cloud storage folders added to the channel
     *
     * @param channelId - ID of the channel whose cloud storage folders should be retrieved
     */
    function getCloudStorageFolders(channelId) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!channelId || channelId.length == 0) {
                throw new Error('[files.getCloudStorageFolders] channelId name cannot be null or empty');
            }
            resolve(sendAndHandleSdkError('files.getCloudStorageFolders', channelId));
        });
    }
    files.getCloudStorageFolders = getCloudStorageFolders;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Initiates the add cloud storage folder flow
     * @param channelId - ID of the channel to add cloud storage folder
     */
    function addCloudStorageFolder(channelId) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!channelId || channelId.length == 0) {
                throw new Error('[files.addCloudStorageFolder] channelId name cannot be null or empty');
            }
            resolve(sendMessageToParentAsync('files.addCloudStorageFolder', [channelId]));
        }).then(function (_a) {
            var error = _a[0], isFolderAdded = _a[1], folders = _a[2];
            if (error) {
                throw error;
            }
            var result = [isFolderAdded, folders];
            return result;
        });
    }
    files.addCloudStorageFolder = addCloudStorageFolder;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Deletes a cloud storage folder from channel
     *
     * @param channelId - ID of the channel where folder is to be deleted
     * @param folderToDelete - cloud storage folder to be deleted
     */
    function deleteCloudStorageFolder(channelId, folderToDelete) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!channelId) {
                throw new Error('[files.deleteCloudStorageFolder] channelId name cannot be null or empty');
            }
            if (!folderToDelete) {
                throw new Error('[files.deleteCloudStorageFolder] folderToDelete cannot be null or empty');
            }
            resolve(sendAndHandleSdkError('files.deleteCloudStorageFolder', channelId, folderToDelete));
        });
    }
    files.deleteCloudStorageFolder = deleteCloudStorageFolder;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Fetches the contents of a Cloud storage folder (CloudStorageFolder) / sub directory
     *
     * @param folder - Cloud storage folder (CloudStorageFolder) / sub directory (CloudStorageFolderItem)
     * @param providerCode - Code of the cloud storage folder provider
     * @param callback - Callback that will be triggered post contents are loaded
     */
    function getCloudStorageFolderContents(folder, providerCode) {
        return new Promise(function (resolve) {
            ensureInitialized(FrameContexts.content);
            if (!folder || !providerCode) {
                throw new Error('[files.getCloudStorageFolderContents] folder/providerCode name cannot be null or empty');
            }
            if ('isSubdirectory' in folder && !folder.isSubdirectory) {
                throw new Error('[files.getCloudStorageFolderContents] provided folder is not a subDirectory');
            }
            resolve(sendAndHandleSdkError('files.getCloudStorageFolderContents', folder, providerCode));
        });
    }
    files.getCloudStorageFolderContents = getCloudStorageFolderContents;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Open a cloud storage file in teams
     *
     * @param file - cloud storage file that should be opened
     * @param providerCode - Code of the cloud storage folder provider
     * @param fileOpenPreference - Whether file should be opened in web/inline
     */
    function openCloudStorageFile(file, providerCode, fileOpenPreference) {
        ensureInitialized(FrameContexts.content);
        if (!file || !providerCode) {
            throw new Error('[files.openCloudStorageFile] file/providerCode cannot be null or empty');
        }
        if (file.isSubdirectory) {
            throw new Error('[files.openCloudStorageFile] provided file is a subDirectory');
        }
        sendMessageToParent('files.openCloudStorageFile', [file, providerCode, fileOpenPreference]);
    }
    files.openCloudStorageFile = openCloudStorageFile;
    /**
     * @hidden
     * Hide from docs.
     * ------
     * Opens a client-friendly preview of the specified file.
     *
     * @param file - The file to preview.
     */
    function openFilePreview(filePreviewParameters) {
        ensureInitialized(FrameContexts.content);
        var params = [
            filePreviewParameters.entityId,
            filePreviewParameters.title,
            filePreviewParameters.description,
            filePreviewParameters.type,
            filePreviewParameters.objectUrl,
            filePreviewParameters.downloadUrl,
            filePreviewParameters.webPreviewUrl,
            filePreviewParameters.webEditUrl,
            filePreviewParameters.baseUrl,
            filePreviewParameters.editFile,
            filePreviewParameters.subEntityId,
            filePreviewParameters.viewerAction,
            filePreviewParameters.fileOpenPreference,
            filePreviewParameters.conversationId,
        ];
        sendMessageToParent('openFilePreview', params);
    }
    files.openFilePreview = openFilePreview;
    function isSupported() {
        return runtime.supports.files ? true : false;
    }
    files.isSupported = isSupported;
})(files || (files = {}));

;// CONCATENATED MODULE: ./src/private/legacy.ts







/**
 * @internal
 */
var legacy;
(function (legacy) {
    var fullTrust;
    (function (fullTrust) {
        /**
         * @hidden
         * Hide from docs
         * ------
         * Allows an app to retrieve information of all user joined teams
         *
         * @param teamInstanceParameters - OPTIONAL Flags that specify whether to scope call to favorite teams
         * @returns Promise resolved containing information about the user joined teams or rejected with error
         */
        function getUserJoinedTeams(teamInstanceParameters) {
            return new Promise(function (resolve) {
                ensureInitialized();
                if ((GlobalVars.hostClientType === HostClientType.android ||
                    GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
                    GlobalVars.hostClientType === HostClientType.teamsPhones ||
                    GlobalVars.hostClientType === HostClientType.teamsDisplays) &&
                    !isAPISupportedByPlatform(getUserJoinedTeamsSupportedAndroidClientVersion)) {
                    var oldPlatformError = { errorCode: ErrorCode.OLD_PLATFORM };
                    throw new Error(JSON.stringify(oldPlatformError));
                }
                resolve(sendAndUnwrap('getUserJoinedTeams', teamInstanceParameters));
            });
        }
        fullTrust.getUserJoinedTeams = getUserJoinedTeams;
        /**
         * @hidden
         * Hide from docs
         * ------
         * Allows an app to get the configuration setting value
         *
         * @param key - The key for the config setting
         * @returns Promise resolved containing the value for the provided config setting or rejected with error
         */
        function getConfigSetting(key) {
            return new Promise(function (resolve) {
                ensureInitialized();
                resolve(sendAndUnwrap('getConfigSetting', key));
            });
        }
        fullTrust.getConfigSetting = getConfigSetting;
        /**
         * Checks if teams.fullTrust capability is supported currently
         */
        function isSupported() {
            return runtime.supports.teams ? (runtime.supports.teams.fullTrust ? true : false) : false;
        }
        fullTrust.isSupported = isSupported;
    })(fullTrust = legacy.fullTrust || (legacy.fullTrust = {}));
})(legacy || (legacy = {}));

;// CONCATENATED MODULE: ./src/private/meetingRoom.ts




/**
 * @alpha
 */
var meetingRoom;
(function (meetingRoom) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Fetch the meeting room info that paired with current client.
     *
     * @returns Promise resolved with meeting room info or rejected with SdkError value
     */
    function getPairedMeetingRoomInfo() {
        return new Promise(function (resolve) {
            ensureInitialized();
            resolve(sendAndHandleSdkError('meetingRoom.getPairedMeetingRoomInfo'));
        });
    }
    meetingRoom.getPairedMeetingRoomInfo = getPairedMeetingRoomInfo;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Send a command to paired meeting room.
     *
     * @param commandName The command name.
     * @returns Promise resolved upon completion or rejected with SdkError value
     */
    function sendCommandToPairedMeetingRoom(commandName) {
        return new Promise(function (resolve) {
            if (!commandName || commandName.length == 0) {
                throw new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty');
            }
            ensureInitialized();
            resolve(sendAndHandleSdkError('meetingRoom.sendCommandToPairedMeetingRoom', commandName));
        });
    }
    meetingRoom.sendCommandToPairedMeetingRoom = sendCommandToPairedMeetingRoom;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Registers a handler for meeting room capabilities update.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the capabilities of meeting room update.
     */
    function registerMeetingRoomCapabilitiesUpdateHandler(handler) {
        if (!handler) {
            throw new Error('[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null');
        }
        ensureInitialized();
        registerHandler('meetingRoom.meetingRoomCapabilitiesUpdate', function (capabilities) {
            ensureInitialized();
            handler(capabilities);
        });
    }
    meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler = registerMeetingRoomCapabilitiesUpdateHandler;
    /**
     * @hidden
     * Hide from docs
     * Registers a handler for meeting room states update.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the states of meeting room update.
     */
    function registerMeetingRoomStatesUpdateHandler(handler) {
        if (!handler) {
            throw new Error('[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null');
        }
        ensureInitialized();
        registerHandler('meetingRoom.meetingRoomStatesUpdate', function (states) {
            ensureInitialized();
            handler(states);
        });
    }
    meetingRoom.registerMeetingRoomStatesUpdateHandler = registerMeetingRoomStatesUpdateHandler;
    function isSupported() {
        return runtime.supports.meetingRoom ? true : false;
    }
    meetingRoom.isSupported = isSupported;
})(meetingRoom || (meetingRoom = {}));

;// CONCATENATED MODULE: ./src/private/notifications.ts




var notifications;
(function (notifications) {
    /**
     * @hidden
     * Hide from docs.
     * ------
     * display notification API.
     *
     * @param message - Notification message.
     * @param notificationType - Notification type
     *
     * @internal
     */
    function showNotification(showNotificationParameters) {
        ensureInitialized(FrameContexts.content);
        sendMessageToParent('notifications.showNotification', [showNotificationParameters]);
    }
    notifications.showNotification = showNotification;
    function isSupported() {
        return runtime.supports.notifications ? true : false;
    }
    notifications.isSupported = isSupported;
})(notifications || (notifications = {}));

;// CONCATENATED MODULE: ./src/private/remoteCamera.ts





/**
 * @alpha
 */
var remoteCamera;
(function (remoteCamera) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Enum used to indicate possible camera control commands.
     */
    var ControlCommand;
    (function (ControlCommand) {
        ControlCommand["Reset"] = "Reset";
        ControlCommand["ZoomIn"] = "ZoomIn";
        ControlCommand["ZoomOut"] = "ZoomOut";
        ControlCommand["PanLeft"] = "PanLeft";
        ControlCommand["PanRight"] = "PanRight";
        ControlCommand["TiltUp"] = "TiltUp";
        ControlCommand["TiltDown"] = "TiltDown";
    })(ControlCommand = remoteCamera.ControlCommand || (remoteCamera.ControlCommand = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Enum used to indicate the reason for the error.
     */
    var ErrorReason;
    (function (ErrorReason) {
        ErrorReason[ErrorReason["CommandResetError"] = 0] = "CommandResetError";
        ErrorReason[ErrorReason["CommandZoomInError"] = 1] = "CommandZoomInError";
        ErrorReason[ErrorReason["CommandZoomOutError"] = 2] = "CommandZoomOutError";
        ErrorReason[ErrorReason["CommandPanLeftError"] = 3] = "CommandPanLeftError";
        ErrorReason[ErrorReason["CommandPanRightError"] = 4] = "CommandPanRightError";
        ErrorReason[ErrorReason["CommandTiltUpError"] = 5] = "CommandTiltUpError";
        ErrorReason[ErrorReason["CommandTiltDownError"] = 6] = "CommandTiltDownError";
        ErrorReason[ErrorReason["SendDataError"] = 7] = "SendDataError";
    })(ErrorReason = remoteCamera.ErrorReason || (remoteCamera.ErrorReason = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Enum used to indicate the reason the session was terminated.
     */
    var SessionTerminatedReason;
    (function (SessionTerminatedReason) {
        SessionTerminatedReason[SessionTerminatedReason["None"] = 0] = "None";
        SessionTerminatedReason[SessionTerminatedReason["ControlDenied"] = 1] = "ControlDenied";
        SessionTerminatedReason[SessionTerminatedReason["ControlNoResponse"] = 2] = "ControlNoResponse";
        SessionTerminatedReason[SessionTerminatedReason["ControlBusy"] = 3] = "ControlBusy";
        SessionTerminatedReason[SessionTerminatedReason["AckTimeout"] = 4] = "AckTimeout";
        SessionTerminatedReason[SessionTerminatedReason["ControlTerminated"] = 5] = "ControlTerminated";
        SessionTerminatedReason[SessionTerminatedReason["ControllerTerminated"] = 6] = "ControllerTerminated";
        SessionTerminatedReason[SessionTerminatedReason["DataChannelError"] = 7] = "DataChannelError";
        SessionTerminatedReason[SessionTerminatedReason["ControllerCancelled"] = 8] = "ControllerCancelled";
        SessionTerminatedReason[SessionTerminatedReason["ControlDisabled"] = 9] = "ControlDisabled";
        SessionTerminatedReason[SessionTerminatedReason["ControlTerminatedToAllowOtherController"] = 10] = "ControlTerminatedToAllowOtherController";
    })(SessionTerminatedReason = remoteCamera.SessionTerminatedReason || (remoteCamera.SessionTerminatedReason = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Fetch a list of the participants with controllable-cameras in a meeting.
     *
     * @param callback - Callback contains 2 parameters, error and participants.
     * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
     * participants can either contain an array of Participant objects, incase of a successful fetch or null when it fails
     * participants: object that contains an array of participants with controllable-cameras
     */
    function getCapableParticipants(callback) {
        if (!callback) {
            throw new Error('[remoteCamera.getCapableParticipants] Callback cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        sendMessageToParent('remoteCamera.getCapableParticipants', callback);
    }
    remoteCamera.getCapableParticipants = getCapableParticipants;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Request control of a participant's camera.
     *
     * @param participant - Participant specifies the participant to send the request for camera control.
     * @param callback - Callback contains 2 parameters, error and requestResponse.
     * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
     * requestResponse can either contain the true/false value, incase of a successful request or null when it fails
     * requestResponse: True means request was accepted and false means request was denied
     */
    function requestControl(participant, callback) {
        if (!participant) {
            throw new Error('[remoteCamera.requestControl] Participant cannot be null');
        }
        if (!callback) {
            throw new Error('[remoteCamera.requestControl] Callback cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        sendMessageToParent('remoteCamera.requestControl', [participant], callback);
    }
    remoteCamera.requestControl = requestControl;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Send control command to the participant's camera.
     *
     * @param ControlCommand - ControlCommand specifies the command for controling the camera.
     * @param callback - Callback to invoke when the command response returns.
     */
    function sendControlCommand(ControlCommand, callback) {
        if (!ControlCommand) {
            throw new Error('[remoteCamera.sendControlCommand] ControlCommand cannot be null');
        }
        if (!callback) {
            throw new Error('[remoteCamera.sendControlCommand] Callback cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        sendMessageToParent('remoteCamera.sendControlCommand', [ControlCommand], callback);
    }
    remoteCamera.sendControlCommand = sendControlCommand;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Terminate the remote  session
     *
     * @param callback - Callback to invoke when the command response returns.
     */
    function terminateSession(callback) {
        if (!callback) {
            throw new Error('[remoteCamera.terminateSession] Callback cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        sendMessageToParent('remoteCamera.terminateSession', callback);
    }
    remoteCamera.terminateSession = terminateSession;
    /**
     * @hidden
     * Registers a handler for change in participants with controllable-cameras.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the list of participants with controllable-cameras changes.
     */
    function registerOnCapableParticipantsChangeHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('remoteCamera.capableParticipantsChange', handler);
    }
    remoteCamera.registerOnCapableParticipantsChangeHandler = registerOnCapableParticipantsChangeHandler;
    /**
     * @hidden
     * Registers a handler for error.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when there is an error from the camera handler.
     */
    function registerOnErrorHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnErrorHandler] Handler cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('remoteCamera.handlerError', handler);
    }
    remoteCamera.registerOnErrorHandler = registerOnErrorHandler;
    /**
     * @hidden
     * Registers a handler for device state change.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the controlled device changes state.
     */
    function registerOnDeviceStateChangeHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('remoteCamera.deviceStateChange', handler);
    }
    remoteCamera.registerOnDeviceStateChangeHandler = registerOnDeviceStateChangeHandler;
    /**
     * @hidden
     * Registers a handler for session status change.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the current session status changes.
     */
    function registerOnSessionStatusChangeHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null');
        }
        ensureInitialized(FrameContexts.sidePanel);
        registerHandler('remoteCamera.sessionStatusChange', handler);
    }
    remoteCamera.registerOnSessionStatusChangeHandler = registerOnSessionStatusChangeHandler;
    function isSupported() {
        return runtime.supports.remoteCamera ? true : false;
    }
    remoteCamera.isSupported = isSupported;
})(remoteCamera || (remoteCamera = {}));

;// CONCATENATED MODULE: ./src/private/appEntity.ts




/**
 * @hidden
 * Namespace to interact with the application entities specific part of the SDK.
 *
 * @alpha
 */
var appEntity;
(function (appEntity_1) {
    /**
     * @hidden
     * Hide from docs
     * --------
     * Open the Tab Gallery and retrieve the app entity
     * @param threadId ID of the thread where the app entity will be created
     * @param categories A list of app categories that will be displayed in the opened tab gallery
     * @param subEntityId An object that will be made available to the application being configured
     *                      through the Teams Context's subEntityId field.
     * @param callback Callback that will be triggered once the app entity information is available.
     *                 The callback takes two arguments: an SdkError in case something happened (i.e.
     *                 no permissions to execute the API) and the app entity configuration, if available
     *
     * @alpha
     */
    function selectAppEntity(threadId, categories, subEntityId, callback) {
        ensureInitialized(FrameContexts.content);
        if (!threadId || threadId.length == 0) {
            throw new Error('[appEntity.selectAppEntity] threadId name cannot be null or empty');
        }
        if (!callback) {
            throw new Error('[appEntity.selectAppEntity] Callback cannot be null');
        }
        sendMessageToParent('appEntity.selectAppEntity', [threadId, categories, subEntityId], callback);
    }
    appEntity_1.selectAppEntity = selectAppEntity;
    function isSupported() {
        return runtime.supports.appEntity ? true : false;
    }
    appEntity_1.isSupported = isSupported;
})(appEntity || (appEntity = {}));

;// CONCATENATED MODULE: ./src/private/teams.ts




/**
 * @hidden
 * Namespace to interact with the `teams` specific part of the SDK.
 * ------
 * Hide from docs
 *
 * @internal
 */
var teams;
(function (teams) {
    var ChannelType;
    (function (ChannelType) {
        ChannelType[ChannelType["Regular"] = 0] = "Regular";
        ChannelType[ChannelType["Private"] = 1] = "Private";
        ChannelType[ChannelType["Shared"] = 2] = "Shared";
    })(ChannelType = teams.ChannelType || (teams.ChannelType = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Get a list of channels belong to a Team
     *
     * @param groupId - a team's objectId
     */
    function getTeamChannels(groupId, callback) {
        ensureInitialized(FrameContexts.content);
        if (!groupId) {
            throw new Error('[teams.getTeamChannels] groupId cannot be null or empty');
        }
        if (!callback) {
            throw new Error('[teams.getTeamChannels] Callback cannot be null');
        }
        sendMessageToParent('teams.getTeamChannels', [groupId], callback);
    }
    teams.getTeamChannels = getTeamChannels;
    /**
     * @hidden
     * Allow 1st party apps to call this function when they receive migrated errors to inform the Hub/Host to refresh the siteurl
     * when site admin renames siteurl.
     *
     * @param threadId - ID of the thread where the app entity will be created; if threadId is not
     * provided, the threadId from route params will be used.
     */
    function refreshSiteUrl(threadId, callback) {
        ensureInitialized();
        if (!threadId) {
            throw new Error('[teams.refreshSiteUrl] threadId cannot be null or empty');
        }
        if (!callback) {
            throw new Error('[teams.refreshSiteUrl] Callback cannot be null');
        }
        sendMessageToParent('teams.refreshSiteUrl', [threadId], callback);
    }
    teams.refreshSiteUrl = refreshSiteUrl;
    function isSupported() {
        return runtime.supports.teams ? true : false;
    }
    teams.isSupported = isSupported;
})(teams || (teams = {}));

;// CONCATENATED MODULE: ./src/private/index.ts














;// CONCATENATED MODULE: ./src/index.ts

(0,external_es6_promise_namespaceObject.polyfill)();



})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=MicrosoftTeams.js.map