/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { sendMessageToParent } from '../internal/communication';
import { registerHandlerWithVersion } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/** onComplete function type */
export type onCompleteFunctionType = (status: boolean, reason?: string) => void;
/** addEventListner function type */
export type addEventListnerFunctionType = (message: any) => void;

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const appWindowTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/** Represents a window or frame within the host app. */
export interface IAppWindow {
  /**
   * Send a message to the AppWindow.
   *
   * @param message - The message to send
   * @param onComplete - The callback to know if the postMessage has been success/failed.
   */
  postMessage(message: any, onComplete?: onCompleteFunctionType): void;

  /**
   * Add a listener that will be called when an event is received from this AppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  addEventListener(type: string, listener: Function): void;
}

/**
 * An object that application can utilize to establish communication
 * with the child window it opened, which contains the corresponding task.
 */
export class ChildAppWindow implements IAppWindow {
  /**
   * Send a message to the ChildAppWindow.
   *
   * @param message - The message to send
   * @param onComplete - The callback to know if the postMessage has been success/failed.
   */
  public postMessage(message: any, onComplete?: onCompleteFunctionType): void {
    ensureInitialized(runtime);
    sendMessageToParent(
      getApiVersionTag(appWindowTelemetryVersionNumber, ApiName.AppWindow_ChildAppWindow_PostMessage),
      'messageForChild',
      [message],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }
  /**
   * Add a listener that will be called when an event is received from the ChildAppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  public addEventListener(type: string, listener: addEventListnerFunctionType): void {
    ensureInitialized(runtime);
    if (type === 'message') {
      registerHandlerWithVersion(
        getApiVersionTag(appWindowTelemetryVersionNumber, ApiName.AppWindow_ChildAppWindow_AddEventListener),
        'messageForParent',
        listener,
      );
    }
  }
}

/**
 * An object that is utilized to facilitate communication with a parent window
 * that initiated the opening of current window. For instance, a dialog or task
 * module would utilize it to transmit messages to the application that launched it.
 */
export class ParentAppWindow implements IAppWindow {
  /** Represents a parent window or frame. */
  private static _instance: ParentAppWindow;
  /** Get the parent window instance. */
  public static get Instance(): IAppWindow {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  /**
   * Send a message to the ParentAppWindow.
   *
   * @param message - The message to send
   * @param onComplete - The callback to know if the postMessage has been success/failed.
   */
  public postMessage(message: any, onComplete?: onCompleteFunctionType): void {
    ensureInitialized(runtime, FrameContexts.task);
    sendMessageToParent(
      getApiVersionTag(appWindowTelemetryVersionNumber, ApiName.AppWindow_ParentAppWindow_PostMessage),
      'messageForParent',
      [message],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }

  /**
   * Add a listener that will be called when an event is received from the ParentAppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  public addEventListener(type: string, listener: addEventListnerFunctionType): void {
    ensureInitialized(runtime, FrameContexts.task);
    if (type === 'message') {
      registerHandlerWithVersion(
        getApiVersionTag(appWindowTelemetryVersionNumber, ApiName.AppWindow_ParentAppWindow_AddEventListener),
        'messageForChild',
        listener,
      );
    }
  }
}
