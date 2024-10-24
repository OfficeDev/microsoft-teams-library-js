import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ErrorCode } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const storeTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * In context store.
 *
 * This functionality is in Beta.
 * @beta
 */
export namespace store {
  /** Represents set of parameters needed to open the appInstallDialog. */
  export interface OpenStoreParams {
    /** A unique identifier for the app being installed. */
    appId: string;
    dialogType: dialogType;
    supportedApps: string[];
    userHasCopilotLicense: boolean;
  }

  export enum dialogType {
    fullStore = 'fullStore',
    ICS = 'ICS',
    appDetails = 'appDetails',
  }

  /**
   * Displays different forms of Store or App Install Dialogs based on the dialogType.
   * Promise is returned once Store App initialization is completed.
   */
  export function openStoreExperience(openStoreParams: OpenStoreParams): void {
    console.log({ openStoreExperience: openStoreParams });
    if (!isSupported()) {
      throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
    }

    console.log('send message');
    sendMessageToParent(
      getApiVersionTag(storeTelemetryVersionNumber, ApiName.Store_OpenStoreExperience),
      ApiName.Store_OpenStoreExperience,
      [openStoreParams],
    );
  }

  /**
   * Checks if the store capability is supported by the host.
   * @returns boolean to represent whether the store capability is supported.
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && !!runtime.supports.store;
  }
}
