/**
 * @private
 * Hide from docs
 * Shim in definitions used for browser-compat
 */
export interface MessageEvent {
    origin?: any;
    source?: any;
    data?: any;
    originalEvent: MessageEvent;
}
/**
 * @private
 * Hide from docs
 */
export interface TeamsNativeClient {
    framelessPostMessage(msg: string): void;
}
/**
 * @private
 * Hide from docs
 */
export interface ExtendedWindow extends Window {
    nativeInterface: TeamsNativeClient;
    onNativeMessage(evt: MessageEvent): void;
}
export interface MessageRequest {
    id: number;
    func: string;
    args?: any[];
}
export interface MessageResponse {
    id: number;
    args?: any[];
}
