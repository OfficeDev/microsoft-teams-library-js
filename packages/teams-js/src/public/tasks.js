"use strict";
/* eslint-disable @typescript-eslint/ban-types */
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var appWindow_1 = require("./appWindow");
var constants_1 = require("./constants");
var dialog_1 = require("./dialog");
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link dialog} namespace instead.
 *
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 * The tasks namespace will be deprecated. Please use dialog for future developments.
 */
var tasks;
(function (tasks) {
    /**
     * @deprecated
     * As of 2.0.0-beta.4, please use {@link dialog.open(urlDialogInfo: UrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): PostMessageChannel} for url based dialogs
     * and {@link dialog.bot.open(botUrlDialogInfo: BotUrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): PostMessageChannel} for bot based dialogs.
     *
     * Allows an app to open the task module.
     *
     * @param taskInfo - An object containing the parameters of the task module
     * @param submitHandler - Handler to call when the task module is completed
     */
    function startTask(taskInfo, submitHandler) {
        taskInfo = getDefaultSizeIfNotProvided(taskInfo);
        if (taskInfo.card !== undefined || taskInfo.url === undefined) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
            (0, communication_1.sendMessageToParent)('tasks.startTask', [taskInfo], submitHandler);
        }
        else if (taskInfo.completionBotId !== undefined) {
            dialog_1.dialog.bot.open(getBotUrlDialogInfoFromTaskInfo(taskInfo), function (sdkResponse) {
                return submitHandler(sdkResponse.err, sdkResponse.result);
            });
        }
        else {
            dialog_1.dialog.open(getUrlDialogInfoFromTaskInfo(taskInfo), function (sdkResponse) {
                return submitHandler(sdkResponse.err, sdkResponse.result);
            });
        }
        return new appWindow_1.ChildAppWindow();
    }
    tasks.startTask = startTask;
    /**
     * @deprecated
     * As of 2.0.0-beta.4, please use {@link dialog.update.resize dialog.update.resize(dimensions: DialogSize): void} instead.
     *
     * Update height/width task info properties.
     *
     * @param taskInfo - An object containing width and height properties
     */
    function updateTask(taskInfo) {
        taskInfo = getDefaultSizeIfNotProvided(taskInfo);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        var width = taskInfo.width, height = taskInfo.height, extra = __rest(taskInfo, ["width", "height"]);
        if (Object.keys(extra).length) {
            throw new Error('resize requires a TaskInfo argument containing only width and height');
        }
        dialog_1.dialog.update.resize(taskInfo);
    }
    tasks.updateTask = updateTask;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link dialog.submit dialog.submit(result?: string | object, appIds?: string | string[]): void} instead.
     *
     * Submit the task module.
     *
     * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submitTask(result, appIds) {
        dialog_1.dialog.submit(result, appIds);
    }
    tasks.submitTask = submitTask;
    function getUrlDialogInfoFromTaskInfo(taskInfo) {
        var urldialogInfo = {
            url: taskInfo.url,
            size: {
                height: taskInfo.height,
                width: taskInfo.width,
            },
            title: taskInfo.title,
            fallbackUrl: taskInfo.fallbackUrl,
        };
        return urldialogInfo;
    }
    tasks.getUrlDialogInfoFromTaskInfo = getUrlDialogInfoFromTaskInfo;
    function getBotUrlDialogInfoFromTaskInfo(taskInfo) {
        var botUrldialogInfo = {
            url: taskInfo.url,
            size: {
                height: taskInfo.height,
                width: taskInfo.width,
            },
            title: taskInfo.title,
            fallbackUrl: taskInfo.fallbackUrl,
            completionBotId: taskInfo.completionBotId,
        };
        return botUrldialogInfo;
    }
    tasks.getBotUrlDialogInfoFromTaskInfo = getBotUrlDialogInfoFromTaskInfo;
    function getDefaultSizeIfNotProvided(taskInfo) {
        taskInfo.height = taskInfo.height ? taskInfo.height : constants_1.TaskModuleDimension.Small;
        taskInfo.width = taskInfo.width ? taskInfo.width : constants_1.TaskModuleDimension.Small;
        return taskInfo;
    }
    tasks.getDefaultSizeIfNotProvided = getDefaultSizeIfNotProvided;
})(tasks = exports.tasks || (exports.tasks = {}));
//# sourceMappingURL=tasks.js.map