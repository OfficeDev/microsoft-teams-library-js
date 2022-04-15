"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
var debug_1 = require("debug");
var topLevelLogger = (0, debug_1.debug)('teamsJs');
/**
 * @internal
 *
 * Returns a logger for a given namespace, within the pre-defined top-level teamsJs namespace
 */
function getLogger(namespace) {
    return topLevelLogger.extend(namespace);
}
exports.getLogger = getLogger;
//# sourceMappingURL=telemetry.js.map