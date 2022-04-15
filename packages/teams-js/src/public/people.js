"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.people = void 0;
var communication_1 = require("../internal/communication");
var constants_1 = require("../internal/constants");
var internalAPIs_1 = require("../internal/internalAPIs");
var mediaUtil_1 = require("../internal/mediaUtil");
var utils_1 = require("../internal/utils");
var constants_2 = require("./constants");
var interfaces_1 = require("./interfaces");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var people;
(function (people_1) {
    /**
     * @hidden
     * This function is the overloaded implementation of selectPeople.
     * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
     * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
     * @param param1
     * @param param2
     * @returns Promise of Array of PeoplePickerResult objects.
     */
    function selectPeople(param1, param2) {
        var _a;
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task, constants_2.FrameContexts.settings);
        var callback;
        var peoplePickerInputs;
        if (typeof param1 === 'function') {
            _a = [param1, param2], callback = _a[0], peoplePickerInputs = _a[1];
        }
        else {
            peoplePickerInputs = param1;
        }
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(selectPeopleHelper, callback, peoplePickerInputs);
    }
    people_1.selectPeople = selectPeople;
    function selectPeopleHelper(peoplePickerInputs) {
        return new Promise(function (resolve) {
            if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.peoplePickerRequiredVersion)) {
                throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
            }
            if (!(0, mediaUtil_1.validatePeoplePickerInput)(peoplePickerInputs)) {
                throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
            }
            resolve((0, communication_1.sendAndHandleSdkError)('people.selectPeople', peoplePickerInputs));
        });
    }
    function isSupported() {
        return runtime_1.runtime.supports.people ? true : false;
    }
    people_1.isSupported = isSupported;
})(people = exports.people || (exports.people = {}));
//# sourceMappingURL=people.js.map