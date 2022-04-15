"use strict";
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.media = void 0;
var communication_1 = require("../internal/communication");
var constants_1 = require("../internal/constants");
var globalVars_1 = require("../internal/globalVars");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var mediaUtil_1 = require("../internal/mediaUtil");
var utils_1 = require("../internal/utils");
var constants_2 = require("./constants");
var interfaces_1 = require("./interfaces");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var media;
(function (media) {
    /**
     * Enum for file formats supported
     */
    var FileFormat;
    (function (FileFormat) {
        FileFormat["Base64"] = "base64";
        FileFormat["ID"] = "id";
    })(FileFormat = media.FileFormat || (media.FileFormat = {}));
    /**
     * File object that can be used to represent image or video or audio
     */
    var File = /** @class */ (function () {
        function File() {
        }
        return File;
    }());
    media.File = File;
    function captureImage(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (!globalVars_1.GlobalVars.isFramelessWindow) {
                    throw { errorCode: interfaces_1.ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
                }
                if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.captureImageMobileSupportVersion)) {
                    throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
                }
                resolve((0, communication_1.sendAndHandleSdkError)('captureImage'));
            });
        };
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    media.captureImage = captureImage;
    /**
     * Media object returned by the select Media API
     */
    var Media = /** @class */ (function (_super) {
        __extends(Media, _super);
        function Media(that) {
            if (that === void 0) { that = null; }
            var _this = _super.call(this) || this;
            if (that) {
                _this.content = that.content;
                _this.format = that.format;
                _this.mimeType = that.mimeType;
                _this.name = that.name;
                _this.preview = that.preview;
                _this.size = that.size;
            }
            return _this;
        }
        Media.prototype.getMedia = function (callback) {
            var _this = this;
            (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
            var wrappedFunction = function () {
                return new Promise(function (resolve) {
                    if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.mediaAPISupportVersion)) {
                        throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
                    }
                    if (!(0, mediaUtil_1.validateGetMediaInputs)(_this.mimeType, _this.format, _this.content)) {
                        throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
                    }
                    // Call the new get media implementation via callbacks if the client version is greater than or equal to '2.0.0'
                    if ((0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.getMediaCallbackSupportVersion)) {
                        resolve(_this.getMediaViaCallback());
                    }
                    else {
                        resolve(_this.getMediaViaHandler());
                    }
                });
            };
            return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(wrappedFunction, callback);
        };
        Media.prototype.getMediaViaCallback = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var helper = {
                    mediaMimeType: _this.mimeType,
                    assembleAttachment: [],
                };
                var localUriId = [_this.content];
                (0, communication_1.sendMessageToParent)('getMedia', localUriId, function (mediaResult) {
                    if (mediaResult && mediaResult.error) {
                        reject(mediaResult.error);
                    }
                    else if (!mediaResult || !mediaResult.mediaChunk) {
                        reject({ errorCode: interfaces_1.ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
                    }
                    else if (mediaResult.mediaChunk.chunkSequence <= 0) {
                        var file = (0, mediaUtil_1.createFile)(helper.assembleAttachment, helper.mediaMimeType);
                        resolve(file);
                    }
                    else {
                        // Keep pushing chunks into assemble attachment
                        var assemble = (0, mediaUtil_1.decodeAttachment)(mediaResult.mediaChunk, helper.mediaMimeType);
                        helper.assembleAttachment.push(assemble);
                    }
                });
            });
        };
        Media.prototype.getMediaViaHandler = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var actionName = (0, utils_1.generateGUID)();
                var helper = {
                    mediaMimeType: _this.mimeType,
                    assembleAttachment: [],
                };
                var params = [actionName, _this.content];
                _this.content && (0, communication_1.sendMessageToParent)('getMedia', params);
                (0, handlers_1.registerHandler)('getMedia' + actionName, function (response) {
                    try {
                        var mediaResult = JSON.parse(response);
                        if (mediaResult.error) {
                            reject(mediaResult.error);
                            (0, handlers_1.removeHandler)('getMedia' + actionName);
                        }
                        else if (!mediaResult || !mediaResult.mediaChunk) {
                            reject({ errorCode: interfaces_1.ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
                            (0, handlers_1.removeHandler)('getMedia' + actionName);
                        }
                        else if (mediaResult.mediaChunk.chunkSequence <= 0) {
                            // If the chunksequence number is less than equal to 0 implies EOF
                            // create file/blob when all chunks have arrived and we get 0/-1 as chunksequence number
                            var file = (0, mediaUtil_1.createFile)(helper.assembleAttachment, helper.mediaMimeType);
                            resolve(file);
                            (0, handlers_1.removeHandler)('getMedia' + actionName);
                        }
                        else {
                            // Keep pushing chunks into assemble attachment
                            var assemble = (0, mediaUtil_1.decodeAttachment)(mediaResult.mediaChunk, helper.mediaMimeType);
                            helper.assembleAttachment.push(assemble);
                        }
                    }
                    catch (err) {
                        // catch JSON.parse() errors
                        reject({ errorCode: interfaces_1.ErrorCode.INTERNAL_ERROR, message: 'Error parsing the response: ' + response });
                    }
                });
            });
        };
        return Media;
    }(File));
    media.Media = Media;
    /**
     * @hidden
     * Hide from docs
     * --------
     * Base class which holds the callback and notifies events to the host client
     */
    var MediaController = /** @class */ (function () {
        function MediaController(controllerCallback) {
            this.controllerCallback = controllerCallback;
        }
        MediaController.prototype.notifyEventToHost = function (mediaEvent, callback) {
            (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
            try {
                (0, internalAPIs_1.throwExceptionIfMobileApiIsNotSupported)(constants_1.nonFullScreenVideoModeAPISupportVersion);
            }
            catch (err) {
                var wrappedRejectedErrorFn = function () { return Promise.reject(err); };
                return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(wrappedRejectedErrorFn, callback);
            }
            var params = {
                mediaType: this.getMediaType(),
                mediaControllerEvent: mediaEvent,
            };
            var wrappedFunction = function () {
                return new Promise(function (resolve) { return resolve((0, communication_1.sendAndHandleSdkError)('media.controller', [params])); });
            };
            return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(wrappedFunction, callback);
        };
        MediaController.prototype.stop = function (callback) {
            return Promise.resolve(this.notifyEventToHost(MediaControllerEvent.StopRecording, callback));
        };
        return MediaController;
    }());
    /**
     * VideoController class is used to communicate between the app and the host client during the video capture flow
     */
    var VideoController = /** @class */ (function (_super) {
        __extends(VideoController, _super);
        function VideoController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        VideoController.prototype.getMediaType = function () {
            return MediaType.Video;
        };
        VideoController.prototype.notifyEventToApp = function (mediaEvent) {
            switch (mediaEvent) {
                case MediaControllerEvent.StartRecording:
                    this.controllerCallback.onRecordingStarted();
                    break;
                // TODO - Should discuss whether this function should be required
                case MediaControllerEvent.StopRecording:
                    this.controllerCallback.onRecordingStopped && this.controllerCallback.onRecordingStopped();
                    break;
            }
        };
        return VideoController;
    }(MediaController));
    media.VideoController = VideoController;
    /**
     * @hidden
     * Hide from docs
     * --------
     * Events which are used to communicate between the app and the host client during the media recording flow
     */
    var MediaControllerEvent;
    (function (MediaControllerEvent) {
        MediaControllerEvent[MediaControllerEvent["StartRecording"] = 1] = "StartRecording";
        MediaControllerEvent[MediaControllerEvent["StopRecording"] = 2] = "StopRecording";
    })(MediaControllerEvent = media.MediaControllerEvent || (media.MediaControllerEvent = {}));
    /**
     * The modes in which camera can be launched in select Media API
     */
    var CameraStartMode;
    (function (CameraStartMode) {
        CameraStartMode[CameraStartMode["Photo"] = 1] = "Photo";
        CameraStartMode[CameraStartMode["Document"] = 2] = "Document";
        CameraStartMode[CameraStartMode["Whiteboard"] = 3] = "Whiteboard";
        CameraStartMode[CameraStartMode["BusinessCard"] = 4] = "BusinessCard";
    })(CameraStartMode = media.CameraStartMode || (media.CameraStartMode = {}));
    /**
     * Specifies the image source
     */
    var Source;
    (function (Source) {
        Source[Source["Camera"] = 1] = "Camera";
        Source[Source["Gallery"] = 2] = "Gallery";
    })(Source = media.Source || (media.Source = {}));
    /**
     * Specifies the type of Media
     */
    var MediaType;
    (function (MediaType) {
        MediaType[MediaType["Image"] = 1] = "Image";
        MediaType[MediaType["Video"] = 2] = "Video";
        MediaType[MediaType["VideoAndImage"] = 3] = "VideoAndImage";
        MediaType[MediaType["Audio"] = 4] = "Audio";
    })(MediaType = media.MediaType || (media.MediaType = {}));
    /**
     * ID contains a mapping for content uri on platform's side, URL is generic
     */
    var ImageUriType;
    (function (ImageUriType) {
        ImageUriType[ImageUriType["ID"] = 1] = "ID";
        ImageUriType[ImageUriType["URL"] = 2] = "URL";
    })(ImageUriType = media.ImageUriType || (media.ImageUriType = {}));
    /**
     * Specifies the image output formats.
     */
    var ImageOutputFormats;
    (function (ImageOutputFormats) {
        ImageOutputFormats[ImageOutputFormats["IMAGE"] = 1] = "IMAGE";
        ImageOutputFormats[ImageOutputFormats["PDF"] = 2] = "PDF";
    })(ImageOutputFormats = media.ImageOutputFormats || (media.ImageOutputFormats = {}));
    function selectMedia(mediaInputs, callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.mediaAPISupportVersion)) {
                    throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
                }
                (0, mediaUtil_1.throwExceptionIfMediaCallIsNotSupportedOnMobile)(mediaInputs);
                if (!(0, mediaUtil_1.validateSelectMediaInputs)(mediaInputs)) {
                    throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
                }
                var params = [mediaInputs];
                // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
                resolve((0, communication_1.sendMessageToParentAsync)('selectMedia', params));
            }).then(function (_a) {
                var err = _a[0], localAttachments = _a[1], mediaEvent = _a[2];
                // MediaControllerEvent response is used to notify the app about events and is a partial response to selectMedia
                if (mediaEvent) {
                    if ((0, mediaUtil_1.isVideoControllerRegistered)(mediaInputs)) {
                        mediaInputs.videoProps.videoController.notifyEventToApp(mediaEvent);
                    }
                    return [];
                }
                // Media Attachments are final response to selectMedia
                if (!localAttachments) {
                    throw err;
                }
                var mediaArray = [];
                for (var _i = 0, localAttachments_1 = localAttachments; _i < localAttachments_1.length; _i++) {
                    var attachment = localAttachments_1[_i];
                    mediaArray.push(new Media(attachment));
                }
                return mediaArray;
            });
        };
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    media.selectMedia = selectMedia;
    function viewImages(uriList, callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.mediaAPISupportVersion)) {
                    throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
                }
                if (!(0, mediaUtil_1.validateViewImagesInput)(uriList)) {
                    throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
                }
                resolve((0, communication_1.sendAndHandleSdkError)('viewImages', uriList));
            });
        };
        return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    media.viewImages = viewImages;
    function scanBarCode(callbackOrConfig, configMaybe) {
        var callback;
        var config;
        // Because the callback isn't the second parameter in the original v1 method we need to
        // do a bit of trickery to see which of the two ways were used to call into
        // the flow and if the first parameter is a callback (v1) or a config object (v2)
        if (callbackOrConfig === undefined) {
            // no first parameter - the second one might be a config, definitely no callback
            config = configMaybe;
        }
        else {
            if (typeof callbackOrConfig === 'object') {
                // the first parameter is an object - it's the config! No callback.
                config = callbackOrConfig;
            }
            else {
                // otherwise, it's a function, so a callback. The second parameter might be a callback
                callback = callbackOrConfig;
                config = configMaybe;
            }
        }
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                if (globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.desktop ||
                    globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.web ||
                    globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.rigel ||
                    globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsRoomsWindows ||
                    globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsRoomsAndroid ||
                    globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsPhones ||
                    globalVars_1.GlobalVars.hostClientType === constants_2.HostClientType.teamsDisplays) {
                    throw { errorCode: interfaces_1.ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
                }
                if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.scanBarCodeAPIMobileSupportVersion)) {
                    throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
                }
                if (!(0, mediaUtil_1.validateScanBarCodeInput)(config)) {
                    throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
                }
                resolve((0, communication_1.sendAndHandleSdkError)('media.scanBarCode', config));
            });
        };
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    media.scanBarCode = scanBarCode;
    function isSupported() {
        return runtime_1.runtime.supports.media ? true : false;
    }
    media.isSupported = isSupported;
})(media = exports.media || (exports.media = {}));
//# sourceMappingURL=media.js.map