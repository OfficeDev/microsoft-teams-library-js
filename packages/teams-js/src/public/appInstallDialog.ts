import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @alpha
 */
export namespace appInstallDialog {
  export interface OpenAppInstallDialogParams {
    appId: string;
  }

  export function openAppInstallDialog(openAPPInstallDialogParams: OpenAppInstallDialogParams): Promise<void> {
    return new Promise(resolve => {
      ensureInitialized(
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      );
      if (!isSupported()) {
        throw new Error('Not supported');
      }
      sendMessageToParent('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
      resolve();
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.appInstallDialog ? true : false;
  }
}
