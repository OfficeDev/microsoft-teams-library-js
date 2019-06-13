import { MessageRequest } from './interfaces';
import { ConversationResponse } from '../public/interfaces';
export class GlobalVars {
    public static initializeCalled = false;
    public static currentWindow: Window | any;
    public static parentWindow: Window | any;
    public static isFramelessWindow = false;
    public static parentOrigin: string;
    public static frameContext: string;
    public static childWindow: Window;
    public static childOrigin: string;
    public static parentMessageQueue: MessageRequest[] = [];
    public static childMessageQueue: MessageRequest[] = [];
    public static nextMessageId = 0;
    public static handlers: {
        [func: string]: Function;
    } = {};
    public static callbacks: {
        [id: number]: Function;
    } = {};
    public static hostClientType: string;
    public static printCapabilityEnabled: boolean = false;
    public static themeChangeHandler: (theme: string) => void;
    public static fullScreenChangeHandler: (isFullScreen: boolean) => void;
    public static backButtonPressHandler: () => boolean;
    public static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
    public static changeSettingsHandler: () => void;
    public static onStartConversationHandler: (conversationResponse: ConversationResponse) => void;
    public static onCloseConversationHandler: (conversationResponse: ConversationResponse) => void;
}
