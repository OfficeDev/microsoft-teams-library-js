import { LoadContext, navigateBack, UserSettingKeys } from '../public';
import { Communication, sendMessageEventToChild, sendMessageToParent } from './communication';

class HandlersPrivate {
  public static handlers: {
    [func: string]: Function;
  } = {};
  public static themeChangeHandler: (theme: string) => void;
  public static backButtonPressHandler: () => boolean;
  public static loadHandler: (context: LoadContext) => void;
  public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
  public static userSettingsChangeHandler: (settingKey: UserSettingKeys, value: any) => void;
}

export function initializeHandlers(): void {
  // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
  HandlersPrivate.handlers['themeChange'] = handleThemeChange;
  HandlersPrivate.handlers['backButtonPress'] = handleBackButtonPress;
  HandlersPrivate.handlers['load'] = handleLoad;
  HandlersPrivate.handlers['beforeUnload'] = handleBeforeUnload;
  HandlersPrivate.handlers['userSettingsChange'] = handleUserSettingsChange;
}

export function callHandler(name: string, args?: any[]): [true, any] | [false, undefined] {
  const handler = HandlersPrivate.handlers[name];
  if (handler) {
    const result = handler.apply(this, args);
    return [true, result];
  } else {
    return [false, undefined];
  }
}

export function registerHandler(name: string, handler: Function, sendMessage: boolean = true): void {
  if (handler) {
    HandlersPrivate.handlers[name] = handler;
    sendMessage && sendMessageToParent('registerHandler', [name]);
  } else {
    delete HandlersPrivate.handlers[name];
  }
}

export function removeHandler(name: string): void {
  delete HandlersPrivate.handlers[name];
}

export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
  HandlersPrivate.themeChangeHandler = handler;
  handler && sendMessageToParent('registerHandler', ['themeChange']);
}

export function handleThemeChange(theme: string): void {
  if (HandlersPrivate.themeChangeHandler) {
    HandlersPrivate.themeChangeHandler(theme);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('themeChange', [theme]);
  }
}

export function registerBackButtonHandler(handler: () => boolean): void {
  HandlersPrivate.backButtonPressHandler = handler;
  handler && sendMessageToParent('registerHandler', ['backButton']);
}

function handleBackButtonPress(): void {
  if (!HandlersPrivate.backButtonPressHandler || !HandlersPrivate.backButtonPressHandler()) {
    navigateBack();
  }
}

export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  HandlersPrivate.loadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['load']);
}

function handleLoad(context: LoadContext): void {
  if (HandlersPrivate.loadHandler) {
    HandlersPrivate.loadHandler(context);
  }

  if (Communication.childWindow) {
    sendMessageEventToChild('load', [context]);
  }
}

export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  HandlersPrivate.beforeUnloadHandler = handler;
  handler && sendMessageToParent('registerHandler', ['beforeUnload']);
}

export function registerUserSettingsChangeHandler(
  settingKeys: UserSettingKeys[],
  handler: (settingKey: UserSettingKeys, value: any) => void,
): void {
  HandlersPrivate.userSettingsChangeHandler = handler;
  handler && sendMessageToParent('registerHandler', ['userSettingsChange', settingKeys]);
}

function handleBeforeUnload(): void {
  const readyToUnload = (): void => {
    sendMessageToParent('readyToUnload', []);
  };

  if (!HandlersPrivate.beforeUnloadHandler || !HandlersPrivate.beforeUnloadHandler(readyToUnload)) {
    readyToUnload();
  }
}

function handleUserSettingsChange(settingKey, value): void {
  if (HandlersPrivate.userSettingsChangeHandler) {
    HandlersPrivate.userSettingsChangeHandler(settingKey, value);
  }
}
