import { LoadContext, navigateBack } from '../public';
import { Communication } from './communication';

export class Handlers {
  private static handlers: {
    [func: string]: Function;
  } = {};
  private static themeChangeHandler: (theme: string) => void;
  private static backButtonPressHandler: () => boolean;
  private static loadHandler: (context: LoadContext) => void;
  private static beforeUnloadHandler: (readyToUnload: () => void) => boolean;

  public static initialize(): void {
    // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
    Handlers.handlers['themeChange'] = Handlers.handleThemeChange;
    Handlers.handlers['backButtonPress'] = Handlers.handleBackButtonPress;
    Handlers.handlers['load'] = Handlers.handleLoad;
    Handlers.handlers['beforeUnload'] = Handlers.handleBeforeUnload;
  }

  public static callHandler(name: string, args?: any[]): [true, any] | [false, undefined] {
    const handler = Handlers.handlers[name];
    if (handler) {
      const result = handler.apply(this, args);
      return [true, result];
    } else {
      return [false, undefined];
    }
  }

  public static registerHandler(name: string, handler: Function, sendMessage: boolean = true): void {
    if (handler) {
      Handlers.handlers[name] = handler;
      sendMessage && Communication.sendMessageToParent('registerHandler', [name]);
    } else {
      delete Handlers.handlers[name];
    }
  }

  public static removeHandler(name: string): void {
    delete Handlers.handlers[name];
  }

  public static registerOnThemeChangeHandler(handler: (theme: string) => void): void {
    Handlers.themeChangeHandler = handler;
    handler && Communication.sendMessageToParent('registerHandler', ['themeChange']);
  }

  private static handleThemeChange(theme: string): void {
    if (Handlers.themeChangeHandler) {
      Handlers.themeChangeHandler(theme);
    }

    if (Communication.childWindow) {
      Communication.sendMessageEventToChild('themeChange', [theme]);
    }
  }

  public static registerBackButtonHandler(handler: () => boolean): void {
    Handlers.backButtonPressHandler = handler;
    handler && Communication.sendMessageToParent('registerHandler', ['backButton']);
  }

  private static handleBackButtonPress(): void {
    if (!Handlers.backButtonPressHandler || !Handlers.backButtonPressHandler()) {
      navigateBack();
    }
  }

  public static registerOnLoadHandler(handler: (context: LoadContext) => void): void {
    Handlers.loadHandler = handler;
    handler && Communication.sendMessageToParent('registerHandler', ['load']);
  }

  private static handleLoad(context: LoadContext): void {
    if (Handlers.loadHandler) {
      Handlers.loadHandler(context);
    }

    if (Communication.childWindow) {
      Communication.sendMessageEventToChild('load', [context]);
    }
  }

  public static registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
    Handlers.beforeUnloadHandler = handler;
    handler && Communication.sendMessageToParent('registerHandler', ['beforeUnload']);
  }

  private static handleBeforeUnload(): void {
    const readyToUnload = (): void => {
      Communication.sendMessageToParent('readyToUnload', []);
    };

    if (!Handlers.beforeUnloadHandler || !Handlers.beforeUnloadHandler(readyToUnload)) {
      readyToUnload();
    }
  }
}
