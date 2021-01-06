import { navigateBack } from '../../src/public/navigation';
import { LoadContext } from '../public/interfaces';
import { Communication } from './communication';
import { validOriginRegExp, userOriginUrlValidationRegExp, defaultSDKVersionForCompatCheck } from './constants';
import { GlobalVars } from './globalVars';
import { MessageResponse, MessageRequest, ExtendedWindow, DOMMessageEvent } from './interfaces';
import { generateRegExpFromUrls, compareSDKVersions } from './utils';

// ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
Communication.handlers['themeChange'] = handleThemeChange;
Communication.handlers['fullScreenChange'] = handleFullScreenChange;
Communication.handlers['backButtonPress'] = handleBackButtonPress;
Communication.handlers['load'] = handleLoad;
Communication.handlers['beforeUnload'] = handleBeforeUnload;
Communication.handlers['changeSettings'] = handleChangeSettings;
Communication.handlers['startConversation'] = handleStartConversation;
Communication.handlers['closeConversation'] = handleCloseConversation;
Communication.handlers['appButtonClick'] = handleAppButtonClick;
Communication.handlers['appButtonHoverEnter'] = handleAppButtonHoverEnter;
Communication.handlers['appButtonHoverLeave'] = handleAppButtonHoverLeave;

function handleStartConversation(
  subEntityId: string,
  conversationId: string,
  channelId: string,
  entityId: string,
): void {
  if (GlobalVars.onStartConversationHandler) {
    GlobalVars.onStartConversationHandler({
      subEntityId: subEntityId,
      conversationId: conversationId,
      channelId: channelId,
      entityId: entityId,
    });
  }
}

function handleCloseConversation(
  subEntityId: string,
  conversationId?: string,
  channelId?: string,
  entityId?: string,
): void {
  if (GlobalVars.onCloseConversationHandler) {
    GlobalVars.onCloseConversationHandler({
      subEntityId: subEntityId,
      conversationId: conversationId,
      channelId: channelId,
      entityId: entityId,
    });
  }
}

function handleThemeChange(theme: string): void {
  if (GlobalVars.themeChangeHandler) {
    GlobalVars.themeChangeHandler(theme);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('themeChange', [theme]);
  }
}

function handleFullScreenChange(isFullScreen: boolean): void {
  if (GlobalVars.fullScreenChangeHandler) {
    GlobalVars.fullScreenChangeHandler(isFullScreen);
  }
}

function handleBackButtonPress(): void {
  if (!GlobalVars.backButtonPressHandler || !GlobalVars.backButtonPressHandler()) {
    navigateBack();
  }
}

function handleLoad(context: LoadContext): void {
  if (GlobalVars.loadHandler) {
    GlobalVars.loadHandler(context);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('load', [context]);
  }
}

function handleBeforeUnload(): void {
  const readyToUnload = (): void => {
    sendMessageRequestToParent('readyToUnload', []);
  };

  if (!GlobalVars.beforeUnloadHandler || !GlobalVars.beforeUnloadHandler(readyToUnload)) {
    readyToUnload();
  }
}

function handleChangeSettings(): void {
  if (GlobalVars.changeSettingsHandler) {
    GlobalVars.changeSettingsHandler();
  }
}

function handleAppButtonClick(): void {
  if (GlobalVars.appButtonClickHandler) {
    GlobalVars.appButtonClickHandler();
  }
}

function handleAppButtonHoverEnter(): void {
  if (GlobalVars.appButtonHoverEnterHandler) {
    GlobalVars.appButtonHoverEnterHandler();
  }
}

function handleAppButtonHoverLeave(): void {
  if (GlobalVars.appButtonHoverLeaveHandler) {
    GlobalVars.appButtonHoverLeaveHandler();
  }
}

export function ensureInitialized(...expectedFrameContexts: string[]): void {
  if (!GlobalVars.initializeCalled) {
    throw new Error('The library has not yet been initialized');
  }

  if (GlobalVars.frameContext && expectedFrameContexts && expectedFrameContexts.length > 0) {
    let found = false;
    for (let i = 0; i < expectedFrameContexts.length; i++) {
      if (expectedFrameContexts[i] === GlobalVars.frameContext) {
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error("This call is not allowed in the '" + GlobalVars.frameContext + "' context");
    }
  }
}

/**
 * Checks whether the platform has knowledge of this API by doing a comparison
 * on API required version and platform supported version of the SDK
 * @param requiredVersion SDK version required by the API
 */
export function isAPISupportedByPlatform(requiredVersion: string = defaultSDKVersionForCompatCheck): boolean {
  const value = compareSDKVersions(GlobalVars.clientSupportedSDKVersion, requiredVersion);
  if (isNaN(value)) {
    return false;
  }
  return value >= 0;
}

export function processMessage(evt: DOMMessageEvent): void {
  // Process only if we received a valid message
  if (!evt || !evt.data || typeof evt.data !== 'object') {
    return;
  }

  // Process only if the message is coming from a different window and a valid origin
  // valid origins are either a pre-known
  const messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
  const messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);
  if (!shouldProcessMessage(messageSource, messageOrigin)) {
    return;
  }

  // Update our parent and child relationships based on this message
  updateRelationships(messageSource, messageOrigin);

  // Handle the message
  if (messageSource === Communication.parentWindow) {
    handleParentMessage(evt);
  } else if (messageSource === Communication.childWindow) {
    handleChildMessage(evt);
  }
}

/**
 * Validates the message source and origin, if it should be processed
 */
function shouldProcessMessage(messageSource: Window, messageOrigin: string): boolean {
  // Process if message source is a different window and if origin is either in
  // Teams' pre-known whitelist or supplied as valid origin by user during initialization
  if (GlobalVars.currentWindow && messageSource === GlobalVars.currentWindow) {
    return false;
  } else if (
    GlobalVars.currentWindow &&
    GlobalVars.currentWindow.location &&
    messageOrigin &&
    messageOrigin === GlobalVars.currentWindow.location.origin
  ) {
    return true;
  } else if (
    validOriginRegExp.test(messageOrigin.toLowerCase()) ||
    (GlobalVars.additionalValidOriginsRegexp &&
      GlobalVars.additionalValidOriginsRegexp.test(messageOrigin.toLowerCase()))
  ) {
    return true;
  }
  return false;
}

function updateRelationships(messageSource: Window, messageOrigin: string): void {
  // Determine whether the source of the message is our parent or child and update our
  // window and origin pointer accordingly
  // For frameless windows (i.e mobile), there is no parent frame, so the message must be from the child.
  if (
    !GlobalVars.isFramelessWindow &&
    (!Communication.parentWindow || Communication.parentWindow.closed || messageSource === Communication.parentWindow)
  ) {
    Communication.parentWindow = messageSource;
    Communication.parentOrigin = messageOrigin;
  } else if (
    !Communication.childWindow ||
    Communication.childWindow.closed ||
    messageSource === Communication.childWindow
  ) {
    Communication.childWindow = messageSource;
    Communication.childOrigin = messageOrigin;
  }

  // Clean up pointers to closed parent and child windows
  if (Communication.parentWindow && Communication.parentWindow.closed) {
    Communication.parentWindow = null;
    Communication.parentOrigin = null;
  }
  if (Communication.childWindow && Communication.childWindow.closed) {
    Communication.childWindow = null;
    Communication.childOrigin = null;
  }

  // If we have any messages in our queue, send them now
  flushMessageQueue(Communication.parentWindow);
  flushMessageQueue(Communication.childWindow);
}

export function handleParentMessage(evt: DOMMessageEvent): void {
  if ('id' in evt.data && typeof evt.data.id === 'number') {
    // Call any associated Communication.callbacks
    const message = evt.data as MessageResponse;
    const callback = Communication.callbacks[message.id];
    if (callback) {
      callback.apply(null, message.args);

      // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
      if (!isPartialResponse(evt)) {
        delete Communication.callbacks[message.id];
      }
    }
  } else if ('func' in evt.data && typeof evt.data.func === 'string') {
    // Delegate the request to the proper handler
    const message = evt.data as MessageRequest;
    const handler = Communication.handlers[message.func];
    if (handler) {
      // We don't expect any handler to respond at this point
      handler.apply(this, message.args);
    }
  }
}

function isPartialResponse(evt: DOMMessageEvent): boolean {
  return evt.data.isPartialResponse === true;
}

function handleChildMessage(evt: DOMMessageEvent): void {
  if ('id' in evt.data && 'func' in evt.data) {
    // Try to delegate the request to the proper handler, if defined
    const message = evt.data as MessageRequest;
    const handler = message.func ? Communication.handlers[message.func] : null;
    if (handler) {
      const result = handler.apply(this, message.args);
      if (typeof result !== 'undefined') {
        sendMessageResponseToChild(message.id, Array.isArray(result) ? result : [result]);
      }
    } else {
      // No handler, proxy to parent
      const messageId = sendMessageRequestToParent(message.func, message.args);
      // tslint:disable-next-line:no-any
      Communication.callbacks[messageId] = (...args: any[]): void => {
        if (Communication.childWindow) {
          sendMessageResponseToChild(message.id, args);
        }
      };
    }
  }
}

/**
 * Processes the valid origins specifuied by the user, de-duplicates and converts them into a regexp
 * which is used later for message source/origin validation
 */
export function processAdditionalValidOrigins(validMessageOrigins: string[]): void {
  let combinedOriginUrls = GlobalVars.additionalValidOrigins.concat(
    validMessageOrigins.filter((_origin: string) => {
      return typeof _origin === 'string' && userOriginUrlValidationRegExp.test(_origin);
    }),
  );
  let dedupUrls: { [url: string]: boolean } = {};
  combinedOriginUrls = combinedOriginUrls.filter(_originUrl => {
    if (dedupUrls[_originUrl]) {
      return false;
    }
    dedupUrls[_originUrl] = true;
    return true;
  });
  GlobalVars.additionalValidOrigins = combinedOriginUrls;
  if (GlobalVars.additionalValidOrigins.length > 0) {
    GlobalVars.additionalValidOriginsRegexp = generateRegExpFromUrls(GlobalVars.additionalValidOrigins);
  } else {
    GlobalVars.additionalValidOriginsRegexp = null;
  }
}

function getTargetMessageQueue(targetWindow: Window): MessageRequest[] {
  return targetWindow === Communication.parentWindow
    ? Communication.parentMessageQueue
    : targetWindow === Communication.childWindow
    ? Communication.childMessageQueue
    : [];
}

function getTargetOrigin(targetWindow: Window): string {
  return targetWindow === Communication.parentWindow
    ? Communication.parentOrigin
    : targetWindow === Communication.childWindow
    ? Communication.childOrigin
    : null;
}

function flushMessageQueue(targetWindow: Window | any): void {
  const targetOrigin = getTargetOrigin(targetWindow);
  const targetMessageQueue = getTargetMessageQueue(targetWindow);
  while (targetWindow && targetOrigin && targetMessageQueue.length > 0) {
    targetWindow.postMessage(targetMessageQueue.shift(), targetOrigin);
  }
}

export function waitForMessageQueue(targetWindow: Window, callback: () => void): void {
  const messageQueueMonitor = GlobalVars.currentWindow.setInterval(() => {
    if (getTargetMessageQueue(targetWindow).length === 0) {
      clearInterval(messageQueueMonitor);
      callback();
    }
  }, 100);
}

/**
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 */
export function sendMessageRequestToParent(
  actionName: string,
  // tslint:disable-next-line: no-any
  args?: any[],
): number {
  const targetWindow = Communication.parentWindow;
  const request = createMessageRequest(actionName, args);
  if (GlobalVars.isFramelessWindow) {
    if (GlobalVars.currentWindow && GlobalVars.currentWindow.nativeInterface) {
      (GlobalVars.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(JSON.stringify(request));
    }
  } else {
    const targetOrigin = getTargetOrigin(targetWindow);

    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
      targetWindow.postMessage(request, targetOrigin);
    } else {
      getTargetMessageQueue(targetWindow).push(request);
    }
  }
  return request.id;
}

/**
 * Send a response to child for a message request that was from child
 */
function sendMessageResponseToChild(
  id: number,
  // tslint:disable-next-line:no-any
  args?: any[],
): void {
  const targetWindow = Communication.childWindow;
  const response = createMessageResponse(id, args);
  const targetOrigin = getTargetOrigin(targetWindow);
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(response, targetOrigin);
  }
}

/**
 * Send a custom message object that can be sent to child window,
 * instead of a response message to a child
 */
export function sendMessageEventToChild(
  actionName: string,
  // tslint:disable-next-line: no-any
  args?: any[],
): void {
  const targetWindow = Communication.childWindow;
  const customEvent = createMessageEvent(actionName, args);
  const targetOrigin = getTargetOrigin(targetWindow);

  // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
  // queue the message and send it after the origin is established
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(customEvent, targetOrigin);
  } else {
    getTargetMessageQueue(targetWindow).push(customEvent);
  }
}

// tslint:disable-next-line:no-any
function createMessageRequest(func: string, args: any[]): MessageRequest {
  return {
    id: Communication.nextMessageId++,
    func: func,
    args: args || [],
  };
}

// tslint:disable-next-line:no-any
function createMessageResponse(id: number, args: any[]): MessageResponse {
  return {
    id: id,
    args: args || [],
  };
}

/**
 * Creates a message object without any id, used for custom actions being sent to child frame/window
 */
// tslint:disable-next-line:no-any
function createMessageEvent(func: string, args: any[]): MessageRequest {
  return {
    func: func,
    args: args || [],
  };
}
