import { sendMessageToParentWithVersion } from '../internal/communication';
import { sendAndHandleStatusAndReasonWithVersion } from '../internal/communication';
import { createTeamsDeepLinkForAppInstallDialog } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const appInstallDialogTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

export namespace appInstallDialog {
  /** Represents set of parameters needed to open the appInstallDialog. */
  export interface OpenAppInstallDialogParams {
    /** A unique identifier for the app being installed. */
    appId: string;
  }

  /**
   * Displays a dialog box that allows users to install a specific app within the host environment.
   *
   * @param openAPPInstallDialogParams - See {@link OpenAppInstallDialogParams | OpenAppInstallDialogParams} for more information.
   */
  export function openAppInstallDialog(openAPPInstallDialogParams: OpenAppInstallDialogParams): Promise<void> {
    return new Promise((resolve) => {
      ensureInitialized(
        runtime,
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
      const apiVersionTag = getApiVersionTag(
        appInstallDialogTelemetryVersionNumber,
        ApiName.AppInstallDialog_OpenAppInstallDialog,
      );
      if (runtime.isLegacyTeams) {
        resolve(
          sendAndHandleStatusAndReasonWithVersion(
            apiVersionTag,
            'executeDeepLink',
            createTeamsDeepLinkForAppInstallDialog(openAPPInstallDialogParams.appId),
          ),
        );
      } else {
        sendMessageToParentWithVersion(apiVersionTag, 'appInstallDialog.openAppInstallDialog', [
          openAPPInstallDialogParams,
        ]);
        resolve();
      }
    });
  }

  /**
   * Checks if the appInstallDialog capability is supported by the host
   * @returns boolean to represent whether the appInstallDialog capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.appInstallDialog ? true : false;
  }
}
