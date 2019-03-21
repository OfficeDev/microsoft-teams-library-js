import { MessageEvent } from "./interfaces";
export declare function ensureInitialized(...expectedFrameContexts: string[]): void;
export declare function processMessage(evt: MessageEvent): void;
export declare function handleParentMessage(evt: MessageEvent): void;
export declare function waitForMessageQueue(targetWindow: Window, callback: () => void): void;
export declare function sendMessageRequest(targetWindow: Window | any, actionName: string, args?: any[]): number;
