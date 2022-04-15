"use strict";
/* eslint-disable @typescript-eslint/ban-types */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRuntimeConfig = exports.generateBackCompatRuntimeConfig = exports.versionConstants = exports.teamsRuntimeConfig = exports.runtime = void 0;
var globalVars_1 = require("../internal/globalVars");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
exports.runtime = {
    apiVersion: 1,
    supports: {
        appInstallDialog: undefined,
        calendar: undefined,
        call: undefined,
        chat: {
            conversation: undefined,
        },
        dialog: {
            bot: undefined,
            update: undefined,
        },
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
            fullTrust: {
                joinedTeams: undefined,
            },
        },
        teamsCore: undefined,
        video: undefined,
    },
};
exports.teamsRuntimeConfig = {
    apiVersion: 1,
    isLegacyTeams: true,
    supports: {
        appInstallDialog: {},
        appEntity: {},
        call: {},
        chat: {
            conversation: {},
        },
        dialog: {
            bot: {},
            update: {},
        },
        files: {},
        logs: {},
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
        remoteCamera: {},
        sharing: {},
        teams: {
            fullTrust: {},
        },
        teamsCore: {},
        video: {},
    },
};
var v1HostClientTypes = [
    constants_1.HostClientType.desktop,
    constants_1.HostClientType.web,
    constants_1.HostClientType.android,
    constants_1.HostClientType.ios,
    constants_1.HostClientType.rigel,
    constants_1.HostClientType.surfaceHub,
    constants_1.HostClientType.teamsRoomsWindows,
    constants_1.HostClientType.teamsRoomsAndroid,
    constants_1.HostClientType.teamsPhones,
    constants_1.HostClientType.teamsDisplays,
];
exports.versionConstants = {
    '1.9.0': [
        {
            capability: { location: {} },
            hostClientTypes: v1HostClientTypes,
        },
    ],
    '2.0.0': [
        {
            capability: { people: {} },
            hostClientTypes: v1HostClientTypes,
        },
    ],
    '2.0.1': [
        {
            capability: { teams: { fullTrust: { joinedTeams: {} } } },
            hostClientTypes: [
                constants_1.HostClientType.android,
                constants_1.HostClientType.teamsRoomsAndroid,
                constants_1.HostClientType.teamsPhones,
                constants_1.HostClientType.teamsDisplays,
            ],
        },
    ],
};
/**
 * @internal
 *
 * Generates and returns a runtime configuration for host clients which are not on the latest host SDK version
 * and do not provide their own runtime config. Their supported capabilities are based on the highest
 * client SDK version that they can support.
 *
 * @param highestSupportedVersion - The highest client SDK version that the host client can support.
 * @returns runtime which describes the APIs supported by the legacy host client.
 */
function generateBackCompatRuntimeConfig(highestSupportedVersion) {
    var newSupports = __assign({}, exports.teamsRuntimeConfig.supports);
    Object.keys(exports.versionConstants).forEach(function (versionNumber) {
        if ((0, utils_1.compareSDKVersions)(highestSupportedVersion, versionNumber) >= 0) {
            exports.versionConstants[versionNumber].forEach(function (capabilityReqs) {
                if (capabilityReqs.hostClientTypes.includes(globalVars_1.GlobalVars.hostClientType)) {
                    newSupports = __assign(__assign({}, newSupports), capabilityReqs.capability);
                }
            });
        }
    });
    var backCompatRuntimeConfig = {
        apiVersion: 1,
        isLegacyTeams: true,
        supports: newSupports,
    };
    return backCompatRuntimeConfig;
}
exports.generateBackCompatRuntimeConfig = generateBackCompatRuntimeConfig;
function applyRuntimeConfig(runtimeConfig) {
    exports.runtime = (0, utils_1.deepFreeze)(runtimeConfig);
}
exports.applyRuntimeConfig = applyRuntimeConfig;
//# sourceMappingURL=runtime.js.map