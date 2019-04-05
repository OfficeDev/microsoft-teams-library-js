import { navigateBack } from "../public/publicAPIs";
import { validOriginRegExp } from "./constants";
import { GlobalVars } from "./globalVars";
import { MessageResponse, MessageRequest, ExtendedWindow, MessageEvent } from "./interfaces";

// ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
GlobalVars.handlers["themeChange"] = handleThemeChange;
GlobalVars.handlers["fullScreenChange"] = handleFullScreenChange;
GlobalVars.handlers["backButtonPress"] = handleBackButtonPress;
GlobalVars.handlers["beforeUnload"] = handleBeforeUnload;
GlobalVars.handlers["changeSettings"] = handleChangeSettings;
GlobalVars.handlers["startConversation"] = handleStartConversation;
GlobalVars.handlers["closeConversation"] = handleCloseConversation;

function handleStartConversation(subEntityId: string, conversationId: string): void {
  if (GlobalVars.onStartConversationHandler) {
    GlobalVars.onStartConversationHandler(subEntityId, conversationId);
  }
}

function handleCloseConversation(subEntityId: string, conversationId?: string): void {
  if (GlobalVars.onCloseConversationHandler) {
    GlobalVars.onCloseConversationHandler(subEntityId, conversationId);
  }
}

function handleThemeChange(theme: string): void {
  if (GlobalVars.themeChangeHandler) {
    GlobalVars.themeChangeHandler(theme);
  }

  if (GlobalVars.childWindow) {
    sendMessageRequest(GlobalVars.childWindow, "themeChange", [theme]);
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

function handleBeforeUnload(): void {
  const readyToUnload = () => {
    sendMessageRequest(GlobalVars.parentWindow, "readyToUnload", []);
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

export function ensureInitialized(...expectedFrameContexts: string[]): void {
  if (!GlobalVars.initializeCalled) {
    throw new Error("The library has not yet been initialized");
  }

  if (
    GlobalVars.frameContext &&
    expectedFrameContexts &&
    expectedFrameContexts.length > 0
  ) {
    let found = false;
    for (let i = 0; i < expectedFrameContexts.length; i++) {
      if (expectedFrameContexts[i] === GlobalVars.frameContext) {
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(
        "This call is not allowed in the '" + GlobalVars.frameContext + "' context"
      );
    }
  }
}

export function processMessage(evt: MessageEvent): void {
  // Process only if we received a valid message
  if (!evt || !evt.data || typeof evt.data !== "object") {
    return;
  }

  // Process only if the message is coming from a different window and a valid origin
  const messageSource = evt.source || evt.originalEvent.source;
  const messageOrigin = evt.origin || evt.originalEvent.origin;
  if (
    messageSource === GlobalVars.currentWindow ||
    (messageOrigin !== GlobalVars.currentWindow.location.origin &&
      !validOriginRegExp.test(messageOrigin.toLowerCase()))
  ) {
    return;
  }

  // Update our parent and child relationships based on this message
  updateRelationships(messageSource, messageOrigin);

  // Handle the message
  if (messageSource === GlobalVars.parentWindow) {
    handleParentMessage(evt);
  } else if (messageSource === GlobalVars.childWindow) {
    handleChildMessage(evt);
  }
}

function updateRelationships(
  messageSource: Window,
  messageOrigin: string
): void {
  // Determine whether the source of the message is our parent or child and update our
  // window and origin pointer accordingly
  if (!GlobalVars.parentWindow || messageSource === GlobalVars.parentWindow) {
    GlobalVars.parentWindow = messageSource;
    GlobalVars.parentOrigin = messageOrigin;
  } else if (!GlobalVars.childWindow || messageSource === GlobalVars.childWindow) {
    GlobalVars.childWindow = messageSource;
    GlobalVars.childOrigin = messageOrigin;
  }

  // Clean up pointers to closed parent and child windows
  if (GlobalVars.parentWindow && GlobalVars.parentWindow.closed) {
    GlobalVars.parentWindow = null;
    GlobalVars.parentOrigin = null;
  }
  if (GlobalVars.childWindow && GlobalVars.childWindow.closed) {
    GlobalVars.childWindow = null;
    GlobalVars.childOrigin = null;
  }

  // If we have any messages in our queue, send them now
  flushMessageQueue(GlobalVars.parentWindow);
  flushMessageQueue(GlobalVars.childWindow);
}

export function handleParentMessage(evt: MessageEvent): void {
  if ("id" in evt.data) {
    // Call any associated GlobalVars.callbacks
    const message = evt.data as MessageResponse;
    const callback = GlobalVars.callbacks[message.id];
    if (callback) {
      callback.apply(null, message.args);

      // Remove the callback to ensure that the callback is called only once and to free up memory.
      delete GlobalVars.callbacks[message.id];
    }
  } else if ("func" in evt.data) {
    // Delegate the request to the proper handler
    const message = evt.data as MessageRequest;
    const handler = GlobalVars.handlers[message.func];
    if (handler) {
      // We don't expect any handler to respond at this point
      handler.apply(this, message.args);
    }
  }
}

function handleChildMessage(evt: MessageEvent): void {
  if ("id" in evt.data && "func" in evt.data) {
    // Try to delegate the request to the proper handler
    const message = evt.data as MessageRequest;
    const handler = GlobalVars.handlers[message.func];
    if (handler) {
      const result = handler.apply(this, message.args);
      if (result) {
        sendMessageResponse(
          GlobalVars.childWindow,
          message.id,
          Array.isArray(result) ? result : [result]
        );
      }
    } else {
      // Proxy to parent
      const messageId = sendMessageRequest(
        GlobalVars.parentWindow,
        message.func,
        message.args
      );

      // tslint:disable-next-line:no-any
      GlobalVars.callbacks[messageId] = (...args: any[]) => {
        if (GlobalVars.childWindow) {
          sendMessageResponse(GlobalVars.childWindow, message.id, args);
        }
      };
    }
  }
}

function getTargetMessageQueue(targetWindow: Window): MessageRequest[] {
  return targetWindow === GlobalVars.parentWindow
    ? GlobalVars.parentMessageQueue
    : targetWindow === GlobalVars.childWindow
      ? GlobalVars.childMessageQueue
      : [];
}

function getTargetOrigin(targetWindow: Window): string {
  return targetWindow === GlobalVars.parentWindow
    ? GlobalVars.parentOrigin
    : targetWindow === GlobalVars.childWindow
      ? GlobalVars.childOrigin
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

export function sendMessageRequest(
  targetWindow: Window | any,
  actionName: string,
  // tslint:disable-next-line: no-any
  args?: any[]
): number {
  const request = createMessageRequest(actionName, args);
  if (GlobalVars.isFramelessWindow) {
    if (GlobalVars.currentWindow && GlobalVars.currentWindow.nativeInterface) {
      (GlobalVars.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(
        JSON.stringify(request)
      );
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

function sendMessageResponse(
  targetWindow: Window | any,
  id: number,
  // tslint:disable-next-line:no-any
  args?: any[]
): void {
  const response = createMessageResponse(id, args);
  const targetOrigin = getTargetOrigin(targetWindow);
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(response, targetOrigin);
  }
}

// tslint:disable-next-line:no-any
function createMessageRequest(func: string, args: any[]): MessageRequest {
  return {
    id: GlobalVars.nextMessageId++,
    func: func,
    args: args || []
  };
}

// tslint:disable-next-line:no-any
function createMessageResponse(id: number, args: any[]): MessageResponse {
  return {
    id: id,
    args: args || []
  };
}