import { FrameContexts } from './constants';
import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

export namespace appInstallDialog {
  export interface OpenAppInstallDialogParams {
    appId: string;
  }

  export function openAppInstallDialog(openAPPInstallDialogParams: OpenAppInstallDialogParams): Promise<void> {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) throw 'Not supported';
    sendMessageToParent('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
    return Promise.resolve();
  }

  export function isSupported(): boolean {
    return runtime.supports.appInstallDialog ? true : false;
  }
}
