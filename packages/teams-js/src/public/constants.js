"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelType = exports.TaskModuleDimension = exports.DialogDimension = exports.UserTeamRole = exports.TeamType = exports.FrameContexts = exports.HostName = exports.HostClientType = void 0;
var HostClientType;
(function (HostClientType) {
    HostClientType["desktop"] = "desktop";
    HostClientType["web"] = "web";
    HostClientType["android"] = "android";
    HostClientType["ios"] = "ios";
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link teamsRoomsWindows} instead.
     */
    HostClientType["rigel"] = "rigel";
    HostClientType["surfaceHub"] = "surfaceHub";
    HostClientType["teamsRoomsWindows"] = "teamsRoomsWindows";
    HostClientType["teamsRoomsAndroid"] = "teamsRoomsAndroid";
    HostClientType["teamsPhones"] = "teamsPhones";
    HostClientType["teamsDisplays"] = "teamsDisplays";
})(HostClientType = exports.HostClientType || (exports.HostClientType = {}));
var HostName;
(function (HostName) {
    HostName["office"] = "Office";
    HostName["outlook"] = "Outlook";
    HostName["orange"] = "Orange";
    HostName["teams"] = "Teams";
})(HostName = exports.HostName || (exports.HostName = {}));
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
})(FrameContexts = exports.FrameContexts || (exports.FrameContexts = {}));
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
})(TeamType = exports.TeamType || (exports.TeamType = {}));
/**
 * Indicates the various types of roles of a user in a team.
 */
var UserTeamRole;
(function (UserTeamRole) {
    UserTeamRole[UserTeamRole["Admin"] = 0] = "Admin";
    UserTeamRole[UserTeamRole["User"] = 1] = "User";
    UserTeamRole[UserTeamRole["Guest"] = 2] = "Guest";
})(UserTeamRole = exports.UserTeamRole || (exports.UserTeamRole = {}));
/**
 * Dialog module dimension enum
 */
var DialogDimension;
(function (DialogDimension) {
    DialogDimension["Large"] = "large";
    DialogDimension["Medium"] = "medium";
    DialogDimension["Small"] = "small";
})(DialogDimension = exports.DialogDimension || (exports.DialogDimension = {}));
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link DialogDimension} instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.TaskModuleDimension = DialogDimension;
/**
 * The type of the channel with which the content is associated.
 */
var ChannelType;
(function (ChannelType) {
    ChannelType["Regular"] = "Regular";
    ChannelType["Private"] = "Private";
    ChannelType["Shared"] = "Shared";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
//# sourceMappingURL=constants.js.map