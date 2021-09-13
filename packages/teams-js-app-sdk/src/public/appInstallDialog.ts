import { FrameContexts } from '@microsoft/teamsjs-app-sdk/public/constants';
import { sendMessageToParent, sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

export interface OpenAPPInstallDialogParams {
  appId: string;
}

export namespace appInstallDialog {
  export async function openAppInstallDialog(openAPPInstallDialogParams: OpenAPPInstallDialogParams): Promise<void> {
    if (!isSupported()) throw 'Not supported';
    ensureInitialized(FrameContexts.content);
    await sendMessageToParentAsync<void>('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
  }

  export function isSupported(): boolean {
    return runtime.supports.appInstall ? true : false;
  }
}
