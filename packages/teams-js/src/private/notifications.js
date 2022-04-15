"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("../public/constants");
var runtime_1 = require("../public/runtime");
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
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
        (0, communication_1.sendMessageToParent)('notifications.showNotification', [showNotificationParameters]);
    }
    notifications.showNotification = showNotification;
    function isSupported() {
        return runtime_1.runtime.supports.notifications ? true : false;
    }
    notifications.isSupported = isSupported;
})(notifications = exports.notifications || (exports.notifications = {}));
//# sourceMappingURL=notifications.js.map