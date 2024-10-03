interface AuthBridge {
  addEventListener: (eventName: string, callback: (response: string) => void) => void;
  postMessage: (message: string) => void;
  removeEventListener: (eventName: string, callback: (response: string) => void) => void;
}

declare global {
  interface Window {
    nestedAppAuthBridge: AuthBridge;
  }
}

export class NaaMock {
  public addEventListener(callback: (response: string) => void): void {
    console.log(window.nestedAppAuthBridge);
    window.nestedAppAuthBridge.addEventListener('message', callback);
  }

  public postMessage(message: string): void {
    window.nestedAppAuthBridge.postMessage(message);
  }

  public removeEventListener(callback: (response: string) => void): void {
    window.nestedAppAuthBridge.removeEventListener('message', callback);
  }
}
