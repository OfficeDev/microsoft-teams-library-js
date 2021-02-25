import { LoadContext, navigateBack } from '../public';
import { Communication, sendMessageEventToChild, sendMessageToParent } from './communication';

class Handlers {
  public static handlers: {
    [func: string]: Function;
  } = {};
  public static themeChangeHandler: (theme: string) => void;
  public static backButtonPressHandler: () => boolean;
  public static loadHandler: (context: LoadContext) => void;
  public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
}

export function initializeHandlers(): void {
  // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
  Handlers.handlers['themeChange'] = handleThemeChange;
  Handlers.handlers['backButtonPress'] = handleBackButtonPress;
  Handlers.handlers['load'] = handleLoad;
  Handlers.handlers['beforeUnload'] = handleBeforeUnload;
}

export function callHandler(name: string, args?: any[]): [true, any] | [false, undefined] {
  const handler = Handlers.handlers[name];
  if (handler) {
    const result = handler.apply(this, args);
    return [true, result];
  } else {
    return [false, undefined];
  }
}

export function registerHandler(name: string, handler: Function, sendMessage: boolean = true): void {
  if (handler) {
    Handlers.handlers[name] = handler;
    sendMessage && sendMessageToParent('registerHandler', [name]);
  } else {
    delete Handlers.handlers[name];
  }
}

export function removeHandler(name: string): void {
  delete Handlers.handlers[name];
}

export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
  Handlers.themeChangeHandler = handler;
  handler && sendMessageToParent('registerHandler', ['themeChange']);
}

export function handleThemeChange(theme: string): void {
  if (Handlers.themeChangeHandler) {
    Handlers.themeChangeHandler(theme);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('themeChange', [theme]);
  }
}

export function registerBackButtonHandler(handler: () => boolean): void {
  Handlers.backButtonPressHandler = handler;
  handler && sendMessageToParent('registerHandler', ['backButton']);
}

function handleBackButtonPress(): void {
  if (!Handlers.backButtonPressHandler || !Handlers.backButtonPressHandler()) {
    navigateBack();
  }
}

export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  Handlers.loadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['load']);
}

function handleLoad(context: LoadContext): void {
  if (Handlers.loadHandler) {
    Handlers.loadHandler(context);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('load', [context]);
  }
}

export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  Handlers.beforeUnloadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['beforeUnload']);
}

function handleBeforeUnload(): void {
  const readyToUnload = (): void => {
    sendMessageToParent('readyToUnload', []);
  };

  if (!Handlers.beforeUnloadHandler || !Handlers.beforeUnloadHandler(readyToUnload)) {
    readyToUnload();
  }
}
