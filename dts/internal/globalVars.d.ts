import { MessageRequest } from "./interfaces";
export declare class GlobalVars {
    static initializeCalled: boolean;
    static currentWindow: Window | any;
    static parentWindow: Window | any;
    static isFramelessWindow: boolean;
    static parentOrigin: string;
    static frameContext: string;
    static childWindow: Window;
    static childOrigin: string;
    static parentMessageQueue: MessageRequest[];
    static childMessageQueue: MessageRequest[];
    static nextMessageId: number;
    static handlers: {
        [func: string]: Function;
    };
    static callbacks: {
        [id: number]: Function;
    };
    static hostClientType: string;
    static printCapabilityEnabled: boolean;
    static themeChangeHandler: (theme: string) => void;
    static fullScreenChangeHandler: (isFullScreen: boolean) => void;
    static backButtonPressHandler: () => boolean;
    static beforeUnloadHandler: (readyToUnload: () => void) => boolean;
    static changeSettingsHandler: () => void;
    static onStartConversationHandler: (sunEntityId: string, conversationId: string) => void;
    static onCloseConversationHandler: (sunEntityId: string, conversationId?: string) => void;
}
