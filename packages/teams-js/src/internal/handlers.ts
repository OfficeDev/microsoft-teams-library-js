/* eslint-disable @typescript-eslint/ban-types */

import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { Context } from '../public/app/app';
import { FrameContexts } from '../public/constants';
import { HostToAppPerformanceMetrics, LoadContext, ResumeContext } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { sendMessageEventToChild, shouldEventBeRelayedToChild } from './childCommunication';
import { sendMessageToParent } from './communication';
import { ensureInitialized } from './internalAPIs';
import { initializeBackStackHelper } from './pagesHelpers';
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
  public static promptHandler: null | ((prompt: string) => void) = null;
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
  public static contextChangeHandler: null | ((context: Context) => void) = null;

  /**
   * @internal
   * Limited to Microsoft-internal use
   * Initializes the handlers.
   */
  public static initializeHandlers(): void {
    // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
    HandlersPrivate.handlers['themeChange'] = handleThemeChange;
    HandlersPrivate.handlers['contextChange'] = handleContextChange;
    HandlersPrivate.handlers['load'] = handleLoad;
    HandlersPrivate.handlers['beforeUnload'] = handleBeforeUnload;
    HandlersPrivate.handlers['catalyst.triggerPrompt'] = handlePrompt;
    initializeBackStackHelper();
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   * Uninitialize the handlers.
   */
  public static uninitializeHandlers(): void {
    HandlersPrivate.handlers = {};
    HandlersPrivate.themeChangeHandler = null;
    HandlersPrivate.beforeUnloadHandler = null;
    HandlersPrivate.beforeSuspendOrTerminateHandler = null;
    HandlersPrivate.resumeHandler = null;
    HandlersPrivate.contextChangeHandler = null;
    HandlersPrivate.promptHandler = null;
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
  } else if (shouldEventBeRelayedToChild()) {
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
 * Adds a plugin handler that chains onto an existing handler for the given event name.
 *
 * @remarks
 * This function is the mechanism by which plugins receive messages from the Teams host
 * without modifying the core `callHandler` dispatch logic.
 *
 * **Chaining behavior:**
 * - If a handler already exists for `name`, it is wrapped in a new function that calls
 *   the original handler first, then the plugin handler. The original handler's return
 *   value is preserved as the overall return value.
 * - If no handler exists for `name`, the plugin handler is set as the sole handler.
 * - Multiple plugin handlers can be chained for the same name by calling this function
 *   repeatedly. Each call wraps the previous (already-chained) handler.
 *
 * **Restore behavior:**
 * When a plugin is unregistered, {@link restoreHandlers} is called to replace the chained
 * handler with the original handler that was in place before the plugin was registered.
 *
 * @param name - The handler/event name (e.g., `'themeChange'`, `'load'`).
 * @param pluginHandler - The plugin's handler function to chain. Will be called with
 *                        the same arguments as the original handler.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function addPluginHandler(name: string, pluginHandler: Function): void {
  const existing = HandlersPrivate.handlers[name];
  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, strict-null-checks/all
    HandlersPrivate.handlers[name] = function (this: unknown, ...handlerArgs: unknown[]) {
      const result = existing.apply(this, handlerArgs);
      pluginHandler.apply(this, handlerArgs);
      return result;
    };
  } else {
    HandlersPrivate.handlers[name] = pluginHandler;
  }
}

/**
 * Restores handlers to their original state before plugin chaining.
 *
 * @remarks
 * Called during plugin unregistration ({@link pluginService.unregister}) to undo the
 * chaining performed by {@link addPluginHandler}. For each event name:
 * - If the original handler was defined, it replaces the current (chained) handler.
 * - If the original handler was `undefined` (i.e., no handler existed before the plugin
 *   registered), the handler is removed entirely.
 *
 * @param names - The event/handler names to restore (e.g., `['themeChange', 'contextChange']`).
 * @param originalHandlers - A map of event name → the original handler function (or `undefined`)
 *                           that was in place before plugin chaining.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function restoreHandlers(names: string[], originalHandlers: Map<string, Function | undefined>): void {
  for (const name of names) {
    const original = originalHandlers.get(name);
    if (original) {
      HandlersPrivate.handlers[name] = original;
    } else {
      delete HandlersPrivate.handlers[name];
    }
  }
}

/**
 * Returns the current handler registered for the given event name.
 *
 * @remarks
 * Used by the plugin service to snapshot the current handler before chaining a
 * plugin handler onto it, so that the original can be restored on unregistration.
 *
 * @param name - The event/handler name to look up (e.g., `'themeChange'`).
 * @returns The currently registered handler function, or `undefined` if no handler
 *          is registered for the given name.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getHandler(name: string): Function | undefined {
  return HandlersPrivate.handlers[name];
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

export function registerOnPromptHandler(apiVersionTag: string, handler: (prompt: string) => void): void {
  HandlersPrivate.promptHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['catalyst.triggerPrompt']);
}

export function handlePrompt(prompt: string): void {
  if (HandlersPrivate.promptHandler) {
    HandlersPrivate.promptHandler(prompt);
  }

  if (shouldEventBeRelayedToChild()) {
    sendMessageEventToChild('catalyst.triggerPrompt', [prompt]);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnContextChangeHandler(apiVersionTag: string, handler: (context: Context) => void): void {
  HandlersPrivate.contextChangeHandler = handler;
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['contextChange']);
}
/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function handleThemeChange(theme: string): void {
  if (HandlersPrivate.themeChangeHandler) {
    HandlersPrivate.themeChangeHandler(theme);
  }

  if (shouldEventBeRelayedToChild()) {
    sendMessageEventToChild('themeChange', [theme]);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function handleContextChange(context: Context): void {
  if (HandlersPrivate.contextChangeHandler) {
    HandlersPrivate.contextChangeHandler(context);
  }

  if (shouldEventBeRelayedToChild()) {
    sendMessageEventToChild('contextChange', [context]);
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
    if (shouldEventBeRelayedToChild()) {
      sendMessageEventToChild('load', [resumeContext]);
    }
  } else if (HandlersPrivate.loadHandler) {
    HandlersPrivate.loadHandler(loadContext);
    if (shouldEventBeRelayedToChild()) {
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
    if (shouldEventBeRelayedToChild()) {
      sendMessageEventToChild('beforeUnload');
    } else {
      readyToUnload();
    }
  } else if (!HandlersPrivate.beforeUnloadHandler || !HandlersPrivate.beforeUnloadHandler(readyToUnload)) {
    if (shouldEventBeRelayedToChild()) {
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
