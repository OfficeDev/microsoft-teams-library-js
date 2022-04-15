"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacy = void 0;
var communication_1 = require("../internal/communication");
var constants_1 = require("../internal/constants");
var globalVars_1 = require("../internal/globalVars");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_2 = require("../public/constants");
var interfaces_1 = require("../public/interfaces");
var runtime_1 = require("../public/runtime");
/**
 * @internal
 */
var legacy;
(function (legacy) {
    var fullTrust;
    (function (fullTrust) {
        var joinedTeams;
        (function (joinedTeams) {
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
                    (0, internalAPIs_1.ensureInitialized)();
                    if ((globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.android ||
                        globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsRoomsAndroid ||
                        globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsPhones ||
                        globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsDisplays) &&
                        !(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.getUserJoinedTeamsSupportedAndroidClientVersion)) {
                        var oldPlatformError = { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
                        throw new Error(JSON.stringify(oldPlatformError));
                    }
                    resolve((0, communication_1.sendAndUnwrap)('getUserJoinedTeams', teamInstanceParameters));
                });
            }
            joinedTeams.getUserJoinedTeams = getUserJoinedTeams;
            function isSupported() {
                return runtime_1.runtime.supports.teams
                    ? runtime_1.runtime.supports.teams.fullTrust
                        ? runtime_1.runtime.supports.teams.fullTrust.joinedTeams
                            ? true
                            : false
                        : false
                    : false;
            }
            joinedTeams.isSupported = isSupported;
        })(joinedTeams = fullTrust.joinedTeams || (fullTrust.joinedTeams = {}));
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
                (0, internalAPIs_1.ensureInitialized)();
                resolve((0, communication_1.sendAndUnwrap)('getConfigSetting', key));
            });
        }
        fullTrust.getConfigSetting = getConfigSetting;
        /**
         * Checks if teams.fullTrust capability is supported currently
         */
        function isSupported() {
            return runtime_1.runtime.supports.teams ? (runtime_1.runtime.supports.teams.fullTrust ? true : false) : false;
        }
        fullTrust.isSupported = isSupported;
    })(fullTrust = legacy.fullTrust || (legacy.fullTrust = {}));
})(legacy = exports.legacy || (exports.legacy = {}));
//# sourceMappingURL=legacy.js.map