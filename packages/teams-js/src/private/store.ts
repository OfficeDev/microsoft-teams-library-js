import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { app, DialogDimension, DialogInfo, FrameContexts, UrlDialogInfo } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { dialog } from '../public/dialog';
import { runtime } from '../public/runtime';
/**
 * @beta
 * @hidden
 * Namespace to open app store
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace store {
  /**
   * @beta
   * @hidden
   * Interface to input open store function parameter
   *
   * @param dialogType - the store dialog type
   * @param appId - if you'd like to open an app detail, make sure append an appId
   * @param collectionId - if you'd like to open a full store with navigation to a specific collection, make sure append an collectionId
   * @param userHasCopilotLicense - If you'd like to open a full store specific to copilot, put it's true
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface OpenStoreParams {
    dialogType: StoreDialogTypeEnum;
    appId?: string;
    collectionId?: string;
    userHasCopilotLicense?: boolean;
  }
  /**
   * @beta
   * @hidden
   * Enum of store dialog type
   *
   * @enum fullStore - open a fullStore, if a collectionId is specified, it will navigate to the specified one, otherwise no navigation
   * @enum ICS - open in-context-store
   * @enum appDetail - open detail dialog (DD), make sure an appId appended, otherwise throw error
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum StoreDialogTypeEnum {
    fullStore = 'fullstore',
    ICS = 'ics',
    appDetail = 'appdetail',
  }
  /**
   * @beta
   * @hidden
   * different url for each type of store
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export const StoreUrl = {
    fullStore:
      'https://teams.microsoft.com/extensibility-apps/store/view?language={locale}&metaoshost=office&host=metaos&clienttype=web',
    ICS: 'https://teams.microsoft.com/extensibility-apps/hostedincontextstore/create?language={locale}&metaoshost=office&host=metaos&clienttype=web',
    appDetail:
      'https://teams.microsoft.com/extensibility-apps/appdetails/{appId}/create?language={locale}&metaoshost=office&host=metaos&clienttype=web',
    collectionStore:
      'https://teams.microsoft.com/extensibility-apps/store/app:co:{collectionId}?language={locale}&metaoshost=office&host=metaos&clienttype=web',
  };
  /**
   * @beta
   * @hidden
   * error message when trying to open app detail dialog but missing app id
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export const errorMissingAppId = 'Missing App Id';
  const StoreVersionTagNum = ApiVersionNumber.V_2;
  function getStoreUrl(openStoreParams: OpenStoreParams): string {
    const { dialogType, appId, userHasCopilotLicense, collectionId } = openStoreParams;
    if (dialogType === StoreDialogTypeEnum.fullStore) {
      if (userHasCopilotLicense) {
        return StoreUrl.collectionStore.replace('{collectionId}', 'copilotplugins');
      }
      if (collectionId !== undefined) {
        return StoreUrl.collectionStore.replace('{collectionId}', collectionId);
      }
      return StoreUrl.fullStore;
    }

    if (dialogType === StoreDialogTypeEnum.ICS) {
      return StoreUrl.ICS;
    }

    if (dialogType === StoreDialogTypeEnum.appDetail) {
      if (appId === undefined) {
        throw new Error(errorMissingAppId);
      }
      return StoreUrl.appDetail.replace('appId', appId);
    }

    return StoreUrl.fullStore;
  }
  /**
   * @beta
   * @hidden
   * Api to open a store
   *
   * @param openStoreParams - params to call openStoreExperience
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export async function openStoreExperience(openStoreParams: OpenStoreParams): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!this.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const context = await app.getContext();
    const url: string = getStoreUrl(openStoreParams).replace('{locale}', context.app.locale);
    const storeDialogInfo: UrlDialogInfo = {
      url,
      size: {
        height: DialogDimension.Medium,
        width: DialogDimension.Medium,
      },
    };
    const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromUrlDialogInfo(storeDialogInfo);
    sendMessageToParent(getApiVersionTag(StoreVersionTagNum, ApiName.Store_Open), 'store.open', [dialogInfo]);
  }
  /**
   * Checks if the store capability is supported by the host
   * @returns boolean to represent whether the store capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime);
  }
}
