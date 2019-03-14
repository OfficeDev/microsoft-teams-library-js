import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { frameContexts } from "../internal/constants";

export interface IWindowObject {
  postMessage(message): void;
  addEventListener(type: string, listener: Function): void;
}

export class ChildWindowObject implements IWindowObject {
  public postMessage(
    message: any
  ): void {
    ensureInitialized();
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "messageForChild", [
      message
    ]);

    GlobalVars.callbacks[messageId] = (success: boolean, result: string) => {
      if (!success) {
        throw new Error(result);
      }
    };
  }

  public addEventListener(type, listener) {
    if (type == "message") {
      GlobalVars.handlers["messageForParent"] = listener;
    }
  }
}

export class ParentWindowObject implements IWindowObject {
  private static _instance: ParentWindowObject;
  public static get Instance() {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  public postMessage(
    message: any
  ): void {
    ensureInitialized(frameContexts.task);
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "messageForParent", [
      message
    ]);

    GlobalVars.callbacks[messageId] = (success: boolean, result: string) => {
      if (!success) {
        throw new Error(result);
      }
    };
  }

  public addEventListener(type, listener) {
    if (type == "message") {
      GlobalVars.handlers["messageForChild"] = listener;
    }
  }
}