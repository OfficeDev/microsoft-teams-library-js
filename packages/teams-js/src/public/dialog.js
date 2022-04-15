"use strict";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
Object.defineProperty(exports, "__esModule", { value: true });
exports.dialog = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * Namespace to interact with the dialog module-specific part of the SDK.
 *
 * @beta
 */
var dialog;
(function (dialog) {
    /**
     * Allows app to open a url based dialog.
     *
     * @remarks
     * This function cannot be called from inside of a dialog
     *
     * @param urlDialogInfo - An object containing the parameters of the dialog module.
     * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode submit} function or when the user closes the dialog.
     * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
     *
     * @returns a function that can be used to send messages to the dialog.
     */
    function open(urlDialogInfo, submitHandler, messageFromChildHandler) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        if (messageFromChildHandler) {
            (0, handlers_1.registerHandler)('messageForParent', messageFromChildHandler);
        }
        (0, communication_1.sendMessageToParent)('tasks.startTask', [urlDialogInfo], function (err, result) {
            submitHandler({ err: err, result: result });
            (0, handlers_1.removeHandler)('messageForParent');
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var sendMessageToDialog = function (message) {
            (0, communication_1.sendMessageToParent)('messageForChild', [message]);
        };
        return sendMessageToDialog;
    }
    dialog.open = open;
    /**
     * Submit the dialog module.
     *
     * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submit(result, appIds) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.task, constants_1.FrameContexts.meetingStage);
        // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
        (0, communication_1.sendMessageToParent)('tasks.completeTask', [result, Array.isArray(appIds) ? appIds : [appIds]]);
    }
    dialog.submit = submit;
    /**
     *  Send message to the parent from dialog
     *
     *  @remarks
     * This function is only called from inside of a dialog
     *
     * @param message - The message to send to the parent
     */
    function sendMessageToParentFromDialog(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.task);
        (0, communication_1.sendMessageToParent)('messageForParent', [message]);
    }
    dialog.sendMessageToParentFromDialog = sendMessageToParentFromDialog;
    /**
     * Register a listener that will be triggered when a message is received from the app that opened the dialog.
     *
     * @remarks
     * This function is only called from inside of a dialog.
     *
     * @param listener - The listener that will be triggered.
     */
    function registerOnMessageFromParent(listener) {
        (0, internalAPIs_1.ensureInitialized)();
        (0, handlers_1.registerHandler)('messageForChild', listener);
    }
    dialog.registerOnMessageFromParent = registerOnMessageFromParent;
    /**
     * Checks if dialog module is supported by the host
     *
     * @returns boolean to represent whether dialog module is supported
     */
    function isSupported() {
        return runtime_1.runtime.supports.dialog ? true : false;
    }
    dialog.isSupported = isSupported;
    /**
     * Namespace to update the dialog
     */
    var update;
    (function (update) {
        /**
         * Update dimensions - height/width of a dialog.
         *
         * @param dimensions - An object containing width and height properties.
         */
        function resize(dimensions) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.task, constants_1.FrameContexts.meetingStage);
            (0, communication_1.sendMessageToParent)('tasks.updateTask', [dimensions]);
        }
        update.resize = resize;
        /**
         * Checks if dialog.update capability is supported by the host
         *
         * @returns boolean to represent whether dialog.update is supported
         */
        function isSupported() {
            return runtime_1.runtime.supports.dialog ? (runtime_1.runtime.supports.dialog.update ? true : false) : false;
        }
        update.isSupported = isSupported;
    })(update = dialog.update || (dialog.update = {}));
    /**
     * Namespace to open a dialog that sends results to the bot framework
     */
    var bot;
    (function (bot) {
        /**
         * Allows an app to open the dialog module using bot.
         *
         * @param botUrlDialogInfo - An object containing the parameters of the dialog module including completionBotId.
         * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
         * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
         *
         * @returns a function that can be used to send messages to the dialog.
         */
        function open(botUrlDialogInfo, submitHandler, messageFromChildHandler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
            if (messageFromChildHandler) {
                (0, handlers_1.registerHandler)('messageForParent', messageFromChildHandler);
            }
            (0, communication_1.sendMessageToParent)('tasks.startTask', [botUrlDialogInfo], function (err, result) {
                submitHandler({ err: err, result: result });
                (0, handlers_1.removeHandler)('messageForParent');
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            var sendMessageToDialog = function (message) {
                (0, communication_1.sendMessageToParent)('messageForChild', [message]);
            };
            return sendMessageToDialog;
        }
        bot.open = open;
        /**
         * Checks if dialog.bot capability is supported by the host
         *
         * @returns boolean to represent whether dialog.bot is supported
         */
        function isSupported() {
            return runtime_1.runtime.supports.dialog ? (runtime_1.runtime.supports.dialog.bot ? true : false) : false;
        }
        bot.isSupported = isSupported;
    })(bot = dialog.bot || (dialog.bot = {}));
})(dialog = exports.dialog || (exports.dialog = {}));
//# sourceMappingURL=dialog.js.map