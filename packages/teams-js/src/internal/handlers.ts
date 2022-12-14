/* eslint-disable @typescript-eslint/ban-types */

import { FrameContexts, LoadContext } from '../public';
import { pages } from '../public/pages';
import { runtime } from '../public/runtime';
import { Communication, sendMessageEventToChild, sendMessageToParent } from './communication';
import { ensureInitialized } from './internalAPIs';
import { getLogger } from './telemetry';

const handlersLogger = getLogger('handlers');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
class HandlersPrivate {
  public static handlers: {
    [func: string]: Function;
  } = {};
  public static themeChangeHandler: (theme: string) => void;
  public static loadHandler: (context: LoadContext) => void;
  public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function initializeHandlers(): void {
  // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
  HandlersPrivate.handlers['themeChange'] = handleThemeChange;
  HandlersPrivate.handlers['load'] = handleLoad;
  HandlersPrivate.handlers['beforeUnload'] = handleBeforeUnload;
  pages.backStack._initialize();
}

const callHandlerLogger = handlersLogger.extend('callHandler');
/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function callHandler(name: string, args?: unknown[]): [true, unknown] | [false, undefined] {
  const handler = HandlersPrivate.handlers[name];
  if (handler) {
    callHandlerLogger('Invoking the registered handler for message %s with arguments %o', name, args);
    const result = handler.apply(this, args);
    return [true, result];
  } else if (Communication.childWindow) {
    sendMessageEventToChild(name, [args]);
    return [false, undefined];
  } else {
    callHandlerLogger('Handler for action message %s not found.', name);
    return [false, undefined];
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerHandler(name: string, handler: Function, sendMessage = true, args: unknown[] = []): void {
  if (handler) {
    HandlersPrivate.handlers[name] = handler;
    sendMessage && sendMessageToParent('registerHandler', [name, ...args]);
  } else {
    delete HandlersPrivate.handlers[name];
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function removeHandler(name: string): void {
  delete HandlersPrivate.handlers[name];
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function doesHandlerExist(name: string): boolean {
  return HandlersPrivate.handlers[name] != null;
}

/**
 * @hidden
 * Undocumented helper function with shared code between deprecated version and current version of register*Handler APIs
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param name - The name of the handler to register.
 * @param handler - The handler to invoke.
 * @param contexts - The context within which it is valid to register this handler.
 * @param registrationHelper - The helper function containing logic pertaining to a specific version of the API.
 */
export function registerHandlerHelper(
  name: string,
  handler: Function,
  contexts: FrameContexts[],
  registrationHelper?: () => void,
): void {
  // allow for registration cleanup even when not finished initializing
  handler && ensureInitialized(runtime, ...contexts);
  if (registrationHelper) {
    registrationHelper();
  }

  registerHandler(name, handler);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
  HandlersPrivate.themeChangeHandler = handler;
  handler && sendMessageToParent('registerHandler', ['themeChange']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function handleThemeChange(theme: string): void {
  if (HandlersPrivate.themeChangeHandler) {
    HandlersPrivate.themeChangeHandler(theme);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('themeChange', [theme]);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  HandlersPrivate.loadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['load']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleLoad(context: LoadContext): void {
  if (HandlersPrivate.loadHandler) {
    HandlersPrivate.loadHandler(context);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('load', [context]);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  HandlersPrivate.beforeUnloadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['beforeUnload']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleBeforeUnload(): void {
  const readyToUnload = (): void => {
    sendMessageToParent('readyToUnload', []);
  };

  if (!HandlersPrivate.beforeUnloadHandler || !HandlersPrivate.beforeUnloadHandler(readyToUnload)) {
    if (Communication.childWindow) {
      sendMessageEventToChild('beforeUnload');
    } else {
      readyToUnload();
    }
  }
}
