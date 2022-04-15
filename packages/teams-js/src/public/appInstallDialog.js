"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appInstallDialog = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var appInstallDialog;
(function (appInstallDialog) {
    function openAppInstallDialog(openAPPInstallDialogParams) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.settings, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
            if (!isSupported()) {
                throw new Error('Not supported');
            }
            (0, communication_1.sendMessageToParent)('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
            resolve();
        });
    }
    appInstallDialog.openAppInstallDialog = openAppInstallDialog;
    function isSupported() {
        return runtime_1.runtime.supports.appInstallDialog ? true : false;
    }
    appInstallDialog.isSupported = isSupported;
})(appInstallDialog = exports.appInstallDialog || (exports.appInstallDialog = {}));
//# sourceMappingURL=appInstallDialog.js.map