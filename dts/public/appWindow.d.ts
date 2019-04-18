export interface IAppWindow {
    postMessage(message: any): void;
    addEventListener(type: string, listener: Function): void;
}
export declare class ChildAppWindow implements IAppWindow {
    postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void;
    addEventListener(type: string, listener: (message: any) => void): void;
}
export declare class ParentAppWindow implements IAppWindow {
    private static _instance;
    static readonly Instance: IAppWindow;
    postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void;
    addEventListener(type: string, listener: (message: any) => void): void;
}
