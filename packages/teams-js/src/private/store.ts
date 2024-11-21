import { callFunctionInHost } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { AppId } from '../public/appId';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
/**
 * @beta
 * @hidden
 * @module
 * Namespace to open app store
 * @internal
 * Limited to Microsoft-internal use
 */
const StoreVersionTagNum = ApiVersionNumber.V_2;
/**
 * @beta
 * @hidden
 * Enum of store dialog type
 * @internal
 * Limited to Microsoft-internal use
 */
export enum StoreDialogType {
  /**
   * open a store without navigation
   */
  FullStore = 'fullstore',
  /**
   * open a store with navigation to a specific collection
   */
  SpecificStore = 'specificstore',
  /**
   * open in-context-store
   */
  InContextStore = 'ics',
  /**
   * open detail dialog (DD)
   */
  AppDetail = 'appdetail',
}

/**
 * @beta
 * @hidden
 * Interface of open full store, copilot store and in-context-store function parameter
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenFullStoreAndICSParams {
  /**
   * the store dialog type, defined by {@link StoreDialogType}
   */
  dialogType: StoreDialogType.FullStore | StoreDialogType.InContextStore;
}
/**
 * @beta
 * @hidden
 * Interface of open app detail dialog function parameter, make sure app id is appended
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenAppDetailParams {
  /**
   * need to be app detail type, defined by {@link StoreDialogType}
   */
  dialogType: StoreDialogType.AppDetail;
  /**
   * app id of the dialog to open
   */
  appId: AppId;
}
/**
 * @beta
 * @hidden
 * Interface of open store specific to a collection function parameter, make sure collection id is appended
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenSpecificStoreParams {
  /**
   * need to be specific store type, defined by {@link StoreDialogType}
   */
  dialogType: StoreDialogType.SpecificStore;
  /**
   * collection id of the plugin store to open
   */
  collectionId: string;
}
/**
 * @beta
 * @hidden
 * Interface of open store function parameters, including OpenFullStoreAndICSParams, OpenAppDetailParams, OpenSpecificStoreParams
 * @internal
 * Limited to Microsoft-internal use
 */
export type OpenStoreParams = OpenFullStoreAndICSParams | OpenAppDetailParams | OpenSpecificStoreParams;

/**
 * @beta
 * @hidden
 * error message when getting invalid store dialog type
 * @internal
 * Limited to Microsoft-internal use
 */
export const errorInvalidDialogType = 'Invalid store dialog type, but type needed to specify store to open';
/**
 * @beta
 * @hidden
 * error message when getting wrong app id or missing app id
 * @internal
 * Limited to Microsoft-internal use
 */
export const errorMissingAppId = 'No App Id present, but AppId needed to open AppDetail store';
/**
 * @beta
 * @hidden
 * error message when getting wrong collection id or missing collection id
 * @internal
 * Limited to Microsoft-internal use
 */
export const errorMissingCollectionId =
  'No Collection Id present, but CollectionId needed to open a store specific to a collection';
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
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  if (openStoreParams === undefined || !Object.values(StoreDialogType).includes(openStoreParams.dialogType)) {
    throw new Error(errorInvalidDialogType);
  }
  if (openStoreParams.dialogType === StoreDialogType.AppDetail && !(openStoreParams.appId instanceof AppId)) {
    throw new Error(errorMissingAppId);
  }
  if (openStoreParams.dialogType === StoreDialogType.SpecificStore && !openStoreParams.collectionId) {
    throw new Error(errorMissingCollectionId);
  }
  return callFunctionInHost(
    ApiName.Store_Open,
    [
      openStoreParams.dialogType,
      (openStoreParams as OpenAppDetailParams).appId,
      (openStoreParams as OpenSpecificStoreParams).collectionId,
    ],
    getApiVersionTag(StoreVersionTagNum, ApiName.Store_Open),
  );
}
/**
 * Checks if the store capability is supported by the host
 * @returns boolean to represent whether the store capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.store;
}
