import { sendMessageToParent } from '../internal/communication';
import { sendAndHandleStatusAndReason as sendAndHandleError } from '../internal/communication';
import { createTeamsDeepLinkForAppInstallDialog } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

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
      if (runtime.isLegacyTeams) {
        resolve(
          sendAndHandleError(
            'executeDeepLink',
            createTeamsDeepLinkForAppInstallDialog(openAPPInstallDialogParams.appId),
          ),
        );
      } else {
        sendMessageToParent('appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
        resolve();
      }
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.appInstallDialog ? true : false;
  }
}
