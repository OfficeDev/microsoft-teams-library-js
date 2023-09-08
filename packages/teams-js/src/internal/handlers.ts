/* eslint-disable @typescript-eslint/ban-types */

import { FrameContexts, LoadContext } from '../public';
import { ResumeContext } from '../public/interfaces';
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
  /**
   * @deprecated
   */
  public static loadHandler: (context: LoadContext) => void;
  /**
   * @deprecated
   */
  public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
  public static beforeSuspendOrTerminateHandler: () => void;
  public static resumeHandler: (context: ResumeContext) => void;

  /**
   * @internal
   * Limited to Microsoft-internal use
   * Initializes the handlers.
   */
  public static initializeHandlers(): void {
    // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
    HandlersPrivate.handlers['themeChange'] = handleThemeChange;
    HandlersPrivate.handlers['load'] = handleLoad;
    HandlersPrivate.handlers['beforeUnload'] = handleBeforeUnload;
    HandlersPrivate.handlers['beforeSuspendOrTerminate'] = handleBeforeSuspendOrTerminate;
    HandlersPrivate.handlers['resume'] = handleResume;
    pages.backStack._initialize();
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   * Uninitializes the handlers.
   */
  public static uninitializeHandlers(): void {
    HandlersPrivate.handlers = {};
    HandlersPrivate.themeChangeHandler = null;
    HandlersPrivate.loadHandler = null;
    HandlersPrivate.beforeUnloadHandler = null;
    HandlersPrivate.beforeSuspendOrTerminateHandler = null;
    HandlersPrivate.resumeHandler = null;
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function initializeHandlers(): void {
  HandlersPrivate.initializeHandlers();
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function uninitializeHandlers(): void {
  HandlersPrivate.uninitializeHandlers();
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
    sendMessageEventToChild(name, args);
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
 *
 * @deprecated
 */
export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  HandlersPrivate.loadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['load']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * @deprecated
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
 *
 * @deprecated
 */
export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  HandlersPrivate.beforeUnloadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['beforeUnload']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * @deprecated
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

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerBeforeSuspendOrTerminateHandler(handler: () => void): void {
  HandlersPrivate.beforeSuspendOrTerminateHandler = handler;
  handler && sendMessageToParent('registerHandler', ['beforeSuspendOrTerminate']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleBeforeSuspendOrTerminate(): void {
  const readyToSuspendOrTerminate = (): void => {
    sendMessageToParent('readyToSuspendOrTerminate', []);
  };

  if (HandlersPrivate.beforeSuspendOrTerminateHandler) {
    HandlersPrivate.beforeSuspendOrTerminateHandler();
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('beforeSuspendOrTerminate');
  } else {
    readyToSuspendOrTerminate();
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnResumeHandler(handler: (context: LoadContext) => void): void {
  HandlersPrivate.loadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['resume']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleResume(context: LoadContext): void {
  if (HandlersPrivate.loadHandler) {
    HandlersPrivate.loadHandler(context);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('resume', [context]);
  }
}
