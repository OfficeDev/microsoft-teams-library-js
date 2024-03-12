import { sendAndHandleStatusAndReason, sendMessageToParent } from '../internal/communication';
import { createTeamsDeepLinkForAppInstallDialog } from '../internal/deepLinkUtilities';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const appInstallDialogTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * Represents a basic TeamsJS capability
 * If this was real it would live in its own file
 */
export interface Capability<TCapability> {
  /**
   * Checks if a capability is supported by the host
   * @returns boolean to represent whether the capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  isSupported(): this is TCapability;
}

export namespace appInstallDialog {
  /** Represents set of parameters needed to open the appInstallDialog. */
  export interface OpenAppInstallDialogParams {
    /** A unique identifier for the app being installed. */
    appId: string;
  }

  class AppInstallDialog implements Capability<appInstallDialog.IAppInstallDialog> {
    public openAppInstallDialog(
      openAPPInstallDialogParams: appInstallDialog.OpenAppInstallDialogParams,
    ): Promise<void> {
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
        if (!this.isSupported()) {
          throw new Error('Not supported');
        }
        const apiVersionTag = getApiVersionTag(
          appInstallDialogTelemetryVersionNumber,
          ApiName.AppInstallDialog_OpenAppInstallDialog,
        );
        if (runtime.isLegacyTeams) {
          resolve(
            sendAndHandleStatusAndReason(
              apiVersionTag,
              'executeDeepLink',
              createTeamsDeepLinkForAppInstallDialog(openAPPInstallDialogParams.appId),
            ),
          );
        } else {
          sendMessageToParent(apiVersionTag, 'appInstallDialog.openAppInstallDialog', [openAPPInstallDialogParams]);
          resolve();
        }
      });
    }

    public isSupported(): this is appInstallDialog.IAppInstallDialog {
      return ensureInitialized(runtime) && runtime.supports.appInstallDialog ? true : false;
    }
  }

  /**
   * Retrieve an object representing all appDialog API calls that are supported on the current host.
   *
   * @returns @type {Capability<appInstallDialog.IAppInstallDialog>}
   */
  export function getFunctions(): Capability<appInstallDialog.IAppInstallDialog> {
    return new AppInstallDialog();
  }

  /**
   * @private
   * Hide from docs
   * ------
   * Registers a handler for app install dialog events.
   * @param handler The handler to invoke when the event is fired
   */
  export interface IAppInstallDialog {
    /**
     * Displays a dialog box that allows users to install a specific app within the host environment.
     *
     * @param openAPPInstallDialogParams - See {@link OpenAppInstallDialogParams | OpenAppInstallDialogParams} for more information.
     */
    openAppInstallDialog(openAPPInstallDialogParams: OpenAppInstallDialogParams): Promise<void>;
  }
}
