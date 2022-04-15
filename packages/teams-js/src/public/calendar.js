"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendar = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var calendar;
(function (calendar) {
    function openCalendarItem(openCalendarItemParams) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            if (!isSupported()) {
                throw new Error('Not supported');
            }
            if (!openCalendarItemParams.itemId || !openCalendarItemParams.itemId.trim()) {
                throw new Error('Must supply an itemId to openCalendarItem');
            }
            resolve((0, communication_1.sendAndHandleStatusAndReason)('calendar.openCalendarItem', openCalendarItemParams));
        });
    }
    calendar.openCalendarItem = openCalendarItem;
    function composeMeeting(composeMeetingParams) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            if (!isSupported()) {
                throw new Error('Not supported');
            }
            resolve((0, communication_1.sendAndHandleStatusAndReason)('calendar.composeMeeting', composeMeetingParams));
        });
    }
    calendar.composeMeeting = composeMeeting;
    function isSupported() {
        return runtime_1.runtime.supports.calendar ? true : false;
    }
    calendar.isSupported = isSupported;
})(calendar = exports.calendar || (exports.calendar = {}));
//# sourceMappingURL=calendar.js.map