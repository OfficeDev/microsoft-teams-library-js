/* eslint-disable @typescript-eslint/ban-types */

import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from '../public/constants';
import { HostToAppPerformanceMetrics, LoadContext, ResumeContext } from '../public/interfaces';
import { pages } from '../public/pages';
import { runtime } from '../public/runtime';
import { Communication, sendMessageEventToChild, sendMessageToParent } from './communication';
import { ensureInitialized } from './internalAPIs';
import { getLogger } from './telemetry';
import { isNullOrUndefined } from './typeCheckUtilities';

const handlersLogger = getLogger('handlers');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
class HandlersPrivate {
  public static handlers: {
    [func: string]: Function;
  } = {};
  public static themeChangeHandler: null | ((theme: string) => void) = null;
  /**
   * @deprecated
   */
  public static loadHandler: null | ((context: LoadContext) => void) = null;
  /**
   * @deprecated
   */
  public static beforeUnloadHandler: null | ((readyToUnload: () => void) => boolean) = null;
  public static beforeSuspendOrTerminateHandler: null | (() => Promise<void>) = null;
  public static resumeHandler: null | ((context: ResumeContext) => void) = null;
  public static hostToAppPerformanceMetricsHandler: null | ((metrics: HostToAppPerformanceMetrics) => void) = null;

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
export function registerHandler(
  apiVersionTag: string,
  name: string,
  handler: Function,
  sendMessage = true,
  args: unknown[] = [],
): void {
  if (handler) {
    HandlersPrivate.handlers[name] = handler;
    sendMessage && sendMessageToParent(apiVersionTag, 'registerHandler', [name, ...args]);
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
 * @param apiVersionTag - The tag of the api version and name
 * @param name - The name of the handler to register.
 * @param handler - The handler to invoke.
 * @param contexts - The context within which it is valid to register this handler.
 * @param registrationHelper - The helper function containing logic pertaining to a specific version of the API.
 */
export function registerHandlerHelper(
  apiVersionTag: string,
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

  registerHandler(apiVersionTag, name, handler);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnThemeChangeHandler(apiVersionTag: string, handler: (theme: string) => void): void {
  HandlersPrivate.themeChangeHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['themeChange']);
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
export function registerHostToAppPerformanceMetricsHandler(
  handler: (metrics: HostToAppPerformanceMetrics) => void,
): void {
  HandlersPrivate.hostToAppPerformanceMetricsHandler = handler;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function handleHostToAppPerformanceMetrics(metrics: HostToAppPerformanceMetrics): void {
  if (!HandlersPrivate.hostToAppPerformanceMetricsHandler) {
    return;
  }
  HandlersPrivate.hostToAppPerformanceMetricsHandler(metrics);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * @deprecated
 */
export function registerOnLoadHandler(apiVersionTag: string, handler: (context: LoadContext) => void): void {
  HandlersPrivate.loadHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['load']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleLoad(loadContext: LoadContext): void {
  const resumeContext = convertToResumeContext(loadContext);
  if (HandlersPrivate.resumeHandler) {
    HandlersPrivate.resumeHandler(resumeContext);
    if (Communication.childWindow) {
      sendMessageEventToChild('load', [resumeContext]);
    }
  } else if (HandlersPrivate.loadHandler) {
    HandlersPrivate.loadHandler(loadContext);
    if (Communication.childWindow) {
      sendMessageEventToChild('load', [loadContext]);
    }
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function convertToResumeContext(context: LoadContext): ResumeContext {
  return {
    entityId: context.entityId,
    contentUrl: new URL(context.contentUrl),
  };
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * @deprecated
 */
export function registerBeforeUnloadHandler(
  apiVersionTag: string,
  handler: (readyToUnload: () => void) => boolean,
): void {
  HandlersPrivate.beforeUnloadHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['beforeUnload']);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
async function handleBeforeUnload(): Promise<void> {
  const readyToUnload = (): void => {
    sendMessageToParent(getApiVersionTag(ApiVersionNumber.V_2, ApiName.HandleBeforeUnload), 'readyToUnload', []);
  };

  if (HandlersPrivate.beforeSuspendOrTerminateHandler) {
    await HandlersPrivate.beforeSuspendOrTerminateHandler();
    if (Communication.childWindow) {
      sendMessageEventToChild('beforeUnload');
    } else {
      readyToUnload();
    }
  } else if (!HandlersPrivate.beforeUnloadHandler || !HandlersPrivate.beforeUnloadHandler(readyToUnload)) {
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
export function registerBeforeSuspendOrTerminateHandler(handler: () => Promise<void>): void {
  HandlersPrivate.beforeSuspendOrTerminateHandler = handler;
  !isNullOrUndefined(handler) &&
    sendMessageToParent(
      getApiVersionTag(ApiVersionNumber.V_2, ApiName.RegisterBeforeSuspendOrTerminateHandler),
      'registerHandler',
      ['beforeUnload'],
    );
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnResumeHandler(handler: (context: ResumeContext) => void): void {
  HandlersPrivate.resumeHandler = handler;
  !isNullOrUndefined(handler) &&
    sendMessageToParent(getApiVersionTag(ApiVersionNumber.V_2, ApiName.RegisterOnResumeHandler), 'registerHandler', [
      'load',
    ]);
}
