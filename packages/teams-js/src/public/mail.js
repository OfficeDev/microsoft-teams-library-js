"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mail = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var mail;
(function (mail) {
    function openMailItem(openMailItemParams) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            if (!isSupported()) {
                throw new Error('Not supported');
            }
            if (!openMailItemParams.itemId || !openMailItemParams.itemId.trim()) {
                throw new Error('Must supply an itemId to openMailItem');
            }
            resolve((0, communication_1.sendAndHandleStatusAndReason)('mail.openMailItem', openMailItemParams));
        });
    }
    mail.openMailItem = openMailItem;
    function composeMail(composeMailParams) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            if (!isSupported()) {
                throw new Error('Not supported');
            }
            resolve((0, communication_1.sendAndHandleStatusAndReason)('mail.composeMail', composeMailParams));
        });
    }
    mail.composeMail = composeMail;
    function isSupported() {
        return runtime_1.runtime.supports.mail ? true : false;
    }
    mail.isSupported = isSupported;
    var ComposeMailType;
    (function (ComposeMailType) {
        ComposeMailType["New"] = "new";
        ComposeMailType["Reply"] = "reply";
        ComposeMailType["ReplyAll"] = "replyAll";
        ComposeMailType["Forward"] = "forward";
    })(ComposeMailType = mail.ComposeMailType || (mail.ComposeMailType = {}));
})(mail = exports.mail || (exports.mail = {}));
//# sourceMappingURL=mail.js.map