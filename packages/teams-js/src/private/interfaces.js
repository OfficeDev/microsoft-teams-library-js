"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingTypes = exports.ViewerActionTypes = exports.NotificationTypes = void 0;
/**
 * @alpha
 */
var NotificationTypes;
(function (NotificationTypes) {
    NotificationTypes["fileDownloadStart"] = "fileDownloadStart";
    NotificationTypes["fileDownloadComplete"] = "fileDownloadComplete";
})(NotificationTypes = exports.NotificationTypes || (exports.NotificationTypes = {}));
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
})(ViewerActionTypes = exports.ViewerActionTypes || (exports.ViewerActionTypes = {}));
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
})(UserSettingTypes = exports.UserSettingTypes || (exports.UserSettingTypes = {}));
//# sourceMappingURL=interfaces.js.map