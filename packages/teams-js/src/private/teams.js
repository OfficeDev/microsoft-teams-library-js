"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teams = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("../public/constants");
var runtime_1 = require("../public/runtime");
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
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
        if (!groupId) {
            throw new Error('[teams.getTeamChannels] groupId cannot be null or empty');
        }
        if (!callback) {
            throw new Error('[teams.getTeamChannels] Callback cannot be null');
        }
        (0, communication_1.sendMessageToParent)('teams.getTeamChannels', [groupId], callback);
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
        (0, internalAPIs_1.ensureInitialized)();
        if (!threadId) {
            throw new Error('[teams.refreshSiteUrl] threadId cannot be null or empty');
        }
        if (!callback) {
            throw new Error('[teams.refreshSiteUrl] Callback cannot be null');
        }
        (0, communication_1.sendMessageToParent)('teams.refreshSiteUrl', [threadId], callback);
    }
    teams.refreshSiteUrl = refreshSiteUrl;
    function isSupported() {
        return runtime_1.runtime.supports.teams ? true : false;
    }
    teams.isSupported = isSupported;
})(teams = exports.teams || (exports.teams = {}));
//# sourceMappingURL=teams.js.map