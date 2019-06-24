import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";

/**
 * Namespace to interact with the files part of the SDK.
 * This object is used to handle logs
 *
 * @private
 * Hide from docs
 */
export namespace files {

  GlobalVars.handlers["log.request"] = handleGetLogRequest;

  export function handleGetLogRequest(): void {
    if (GlobalVars.getLogHandler) {
      const log: string = GlobalVars.getLogHandler();
      sendMessageRequest(GlobalVars.parentWindow, "log.receive", [log]);
    }
  }

  /**
   * @private
   * Hide from docs
   * ------
   * Registers a handler for getting app log
   * @param handler The handler to invoke to get the app log
   */
  export function registerGetLogHandler(handler: () => string): void {
    ensureInitialized();

    GlobalVars.getLogHandler = handler;
    handler && sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["log.request"]);
  }
}
