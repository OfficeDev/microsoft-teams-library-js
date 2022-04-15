"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePeoplePickerInput = exports.validateScanBarCodeInput = exports.validateViewImagesInput = exports.validateGetMediaInputs = exports.isMediaCallForNonFullScreenVideoMode = exports.isMediaCallForVideoAndImageInputs = exports.isMediaCallForImageOutputFormats = exports.validateSelectMediaInputs = exports.isVideoControllerRegistered = exports.throwExceptionIfMediaCallIsNotSupportedOnMobile = exports.decodeAttachment = exports.createFile = void 0;
var media_1 = require("../public/media");
var constants_1 = require("./constants");
var internalAPIs_1 = require("./internalAPIs");
/**
 * @hidden
 * Helper function to create a blob from media chunks based on their sequence
 *
 * @internal
 */
function createFile(assembleAttachment, mimeType) {
    if (assembleAttachment == null || mimeType == null || assembleAttachment.length <= 0) {
        return null;
    }
    var file;
    var sequence = 1;
    assembleAttachment.sort(function (a, b) { return (a.sequence > b.sequence ? 1 : -1); });
    assembleAttachment.forEach(function (item) {
        if (item.sequence == sequence) {
            if (file) {
                file = new Blob([file, item.file], { type: mimeType });
            }
            else {
                file = new Blob([item.file], { type: mimeType });
            }
            sequence++;
        }
    });
    return file;
}
exports.createFile = createFile;
/**
 * @hidden
 * Helper function to convert Media chunks into another object type which can be later assemebled
 * Converts base 64 encoded string to byte array and then into an array of blobs
 *
 * @internal
 */
function decodeAttachment(attachment, mimeType) {
    if (attachment == null || mimeType == null) {
        return null;
    }
    var decoded = atob(attachment.chunk);
    var byteNumbers = new Array(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
        byteNumbers[i] = decoded.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], { type: mimeType });
    var assemble = {
        sequence: attachment.chunkSequence,
        file: blob,
    };
    return assemble;
}
exports.decodeAttachment = decodeAttachment;
/**
 * @hidden
 * Function throws an SdkError if the media call is not supported on current mobile version, else undefined.
 * @throws an SdkError if the media call is not supported
 * @internal
 */
function throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs) {
    if (isMediaCallForVideoAndImageInputs(mediaInputs)) {
        (0, internalAPIs_1.throwExceptionIfMobileApiIsNotSupported)(constants_1.videoAndImageMediaAPISupportVersion);
    }
    else if (isMediaCallForNonFullScreenVideoMode(mediaInputs)) {
        (0, internalAPIs_1.throwExceptionIfMobileApiIsNotSupported)(constants_1.nonFullScreenVideoModeAPISupportVersion);
    }
    else if (isMediaCallForImageOutputFormats(mediaInputs)) {
        (0, internalAPIs_1.throwExceptionIfMobileApiIsNotSupported)(constants_1.imageOutputFormatsAPISupportVersion);
    }
}
exports.throwExceptionIfMediaCallIsNotSupportedOnMobile = throwExceptionIfMediaCallIsNotSupportedOnMobile;
/**
 * @hidden
 * Function returns true if the app has registered to listen to video controller events, else false.
 *
 * @internal
 */
function isVideoControllerRegistered(mediaInputs) {
    if (mediaInputs.mediaType == media_1.media.MediaType.Video &&
        mediaInputs.videoProps &&
        mediaInputs.videoProps.videoController) {
        return true;
    }
    return false;
}
exports.isVideoControllerRegistered = isVideoControllerRegistered;
/**
 * @hidden
 * Returns true if the mediaInput params are valid and false otherwise
 *
 * @internal
 */
function validateSelectMediaInputs(mediaInputs) {
    if (mediaInputs == null || mediaInputs.maxMediaCount > 10) {
        return false;
    }
    return true;
}
exports.validateSelectMediaInputs = validateSelectMediaInputs;
/**
 * Returns true if the mediaInput params are called for mediatype Image and contains Image outputs formats, false otherwise
 */
function isMediaCallForImageOutputFormats(mediaInputs) {
    var _a;
    if ((mediaInputs === null || mediaInputs === void 0 ? void 0 : mediaInputs.mediaType) == media_1.media.MediaType.Image && ((_a = mediaInputs === null || mediaInputs === void 0 ? void 0 : mediaInputs.imageProps) === null || _a === void 0 ? void 0 : _a.imageOutputFormats)) {
        return true;
    }
    return false;
}
exports.isMediaCallForImageOutputFormats = isMediaCallForImageOutputFormats;
/**
 * @hidden
 * Returns true if the mediaInput params are called for mediatype VideoAndImage and false otherwise
 *
 * @internal
 */
function isMediaCallForVideoAndImageInputs(mediaInputs) {
    if (mediaInputs && (mediaInputs.mediaType == media_1.media.MediaType.VideoAndImage || mediaInputs.videoAndImageProps)) {
        return true;
    }
    return false;
}
exports.isMediaCallForVideoAndImageInputs = isMediaCallForVideoAndImageInputs;
/**
 * @hidden
 * Returns true if the mediaInput params are called for non-full screen video mode and false otherwise
 *
 * @internal
 */
function isMediaCallForNonFullScreenVideoMode(mediaInputs) {
    if (mediaInputs &&
        mediaInputs.mediaType == media_1.media.MediaType.Video &&
        mediaInputs.videoProps &&
        !mediaInputs.videoProps.isFullScreenMode) {
        return true;
    }
    return false;
}
exports.isMediaCallForNonFullScreenVideoMode = isMediaCallForNonFullScreenVideoMode;
/**
 * @hidden
 * Returns true if the get Media params are valid and false otherwise
 *
 * @internal
 */
function validateGetMediaInputs(mimeType, format, content) {
    if (mimeType == null || format == null || format != media_1.media.FileFormat.ID || content == null) {
        return false;
    }
    return true;
}
exports.validateGetMediaInputs = validateGetMediaInputs;
/**
 * @hidden
 * Returns true if the view images param is valid and false otherwise
 *
 * @internal
 */
function validateViewImagesInput(uriList) {
    if (uriList == null || uriList.length <= 0 || uriList.length > 10) {
        return false;
    }
    return true;
}
exports.validateViewImagesInput = validateViewImagesInput;
/**
 * @hidden
 * Returns true if the scan barcode param is valid and false otherwise
 *
 * @internal
 */
function validateScanBarCodeInput(barCodeConfig) {
    if (barCodeConfig) {
        if (barCodeConfig.timeOutIntervalInSec === null ||
            barCodeConfig.timeOutIntervalInSec <= 0 ||
            barCodeConfig.timeOutIntervalInSec > 60) {
            return false;
        }
    }
    return true;
}
exports.validateScanBarCodeInput = validateScanBarCodeInput;
/**
 * @hidden
 * Returns true if the people picker params are valid and false otherwise
 *
 * @internal
 */
function validatePeoplePickerInput(peoplePickerInputs) {
    if (peoplePickerInputs) {
        if (peoplePickerInputs.title) {
            if (typeof peoplePickerInputs.title !== 'string') {
                return false;
            }
        }
        if (peoplePickerInputs.setSelected) {
            if (typeof peoplePickerInputs.setSelected !== 'object') {
                return false;
            }
        }
        if (peoplePickerInputs.openOrgWideSearchInChatOrChannel) {
            if (typeof peoplePickerInputs.openOrgWideSearchInChatOrChannel !== 'boolean') {
                return false;
            }
        }
        if (peoplePickerInputs.singleSelect) {
            if (typeof peoplePickerInputs.singleSelect !== 'boolean') {
                return false;
            }
        }
    }
    return true;
}
exports.validatePeoplePickerInput = validatePeoplePickerInput;
//# sourceMappingURL=mediaUtil.js.map