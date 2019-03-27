import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { frameContexts } from "../internal/constants";
import { registerGenericCallback } from "../internal/utils";

export interface IAppWindow {
  postMessage(message): void;
  addEventListener(type: string, listener: Function): void;
}

export class ChildAppWindow implements IAppWindow {
  public postMessage(
    message: any
  ): void {
    ensureInitialized();
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "messageForChild", [
      message
    ]);

    registerGenericCallback(messageId);
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === "message") {
      GlobalVars.handlers["messageForParent"] = listener;
    }
  }
}

export class ParentAppWindow implements IAppWindow {
  private static _instance: ParentAppWindow;
  public static get Instance(): IAppWindow {
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

    registerGenericCallback(messageId);
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === "message") {
      GlobalVars.handlers["messageForChild"] = listener;
    }
  }
}