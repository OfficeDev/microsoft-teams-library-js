/**
 * In context store.
 *
 * This functionality is in Beta.
 * @beta
 */
export namespace store {
  /** Represents set of parameters needed to open the appInstallDialog. */
  interface OpenStoreParams {
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
   * Promise is returned once Store App intalization is completed.
   */
  export function openStoreExperience(openStoreParams: OpenStoreParams): Promise<void> {
    throw new Error(`not implemented ${JSON.stringify(openStoreParams)}`);
  }

  /**
   * Checks if the store capability is supported by the host
   * @returns boolean to represent whether the store capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return true;
  }
}
