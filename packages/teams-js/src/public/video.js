"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.video = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * Namespace to video extensibility of the SDK.
 *
 * @alpha
 *
 */
var video;
(function (video) {
    /**
     * Video frame format enum, currently only support NV12
     */
    var VideoFrameFormat;
    (function (VideoFrameFormat) {
        VideoFrameFormat[VideoFrameFormat["NV12"] = 0] = "NV12";
    })(VideoFrameFormat = video.VideoFrameFormat || (video.VideoFrameFormat = {}));
    /**
     *  Video effect change type enum
     */
    var EffectChangeType;
    (function (EffectChangeType) {
        /**
         * current video effect changed.
         */
        EffectChangeType[EffectChangeType["EffectChanged"] = 0] = "EffectChanged";
        /**
         * disable the video effect
         */
        EffectChangeType[EffectChangeType["EffectDisabled"] = 1] = "EffectDisabled";
    })(EffectChangeType = video.EffectChangeType || (video.EffectChangeType = {}));
    /**
     * register to read the video frames in Permissions section.
     */
    function registerForVideoFrame(frameCallback, config) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('video.newVideoFrame', function (videoFrame) {
            if (videoFrame !== undefined) {
                frameCallback(videoFrame, notifyVideoFrameProcessed, notifyError);
            }
        });
        (0, communication_1.sendMessageToParent)('video.registerForVideoFrame', [config]);
    }
    video.registerForVideoFrame = registerForVideoFrame;
    /**
     * video extension should call this to notify Teams Client current selected effect parameter changed.
     * If it's pre-meeting, Teams client will call videoEffectCallback immediately then use the videoEffect.
     * in-meeting scenario, we will call videoEffectCallback when apply button clicked.
     *
     * @param effectChangeType - the effect change type.
     * @param effectId - Newly selected effect id.
     */
    function notifySelectedVideoEffectChanged(effectChangeType, effectId) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, communication_1.sendMessageToParent)('video.videoEffectChanged', [effectChangeType, effectId]);
    }
    video.notifySelectedVideoEffectChanged = notifySelectedVideoEffectChanged;
    /**
     * Register the video effect callback, Teams client uses this to notify the video extension the new video effect will by applied.
     */
    function registerForVideoEffect(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('video.effectParameterChange', callback);
    }
    video.registerForVideoEffect = registerForVideoEffect;
    /**
     * sending notification to Teams client finished the video frame processing, now Teams client can render this video frame
     * or pass the video frame to next one in video pipeline.
     */
    function notifyVideoFrameProcessed() {
        (0, communication_1.sendMessageToParent)('video.videoFrameProcessed');
    }
    /**
     * sending error notification to Teams client.
     */
    function notifyError(errorMessage) {
        (0, communication_1.sendMessageToParent)('video.notifyError', [errorMessage]);
    }
    function isSupported() {
        return runtime_1.runtime.supports.video ? true : false;
    }
    video.isSupported = isSupported;
})(video = exports.video || (exports.video = {})); //end of video namespace
//# sourceMappingURL=video.js.map