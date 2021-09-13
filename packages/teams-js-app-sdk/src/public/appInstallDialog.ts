import { FrameContexts } from './constants';
import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

export namespace appInstallDialog {
  export interface OpenAppInstallDialogParams {
    appId: string;
  }

  export async function openAppInstallDialog(openAPPInstallDialogParams: OpenAppInstallDialogParams): Promise<void> {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) throw 'Not supported';
    await sendMessageToParentAsync<void>('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
  }

  export function isSupported(): boolean {
    return runtime.supports.appInstall ? true : false;
  }
}
