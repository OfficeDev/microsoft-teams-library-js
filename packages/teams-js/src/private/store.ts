import { callFunctionInHost } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { DialogSize } from '../public';
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
 * Interface of store dialog size
 * @internal
 * Limited to Microsoft-internal use
 */
export interface StoreSizeInfo {
  /**
   * the store dialog size, defined by {@link DialogSize}, if not present, the host will choose an appropriate size
   */
  size?: DialogSize;
}

/**
 * @beta
 * @hidden
 * Interface for opening the full store function parameters
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenFullStoreParams extends StoreSizeInfo {
  /**
   * The store dialog type, specifically the full store, defined by {@link StoreDialogType}
   */
  dialogType: StoreDialogType.FullStore;
}

/**
 * @beta
 * @hidden
 * Interface for opening the in-context store function parameters
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenInContextStoreParams extends StoreSizeInfo {
  /**
   * The store dialog type, specifically the in-context store, defined by {@link StoreDialogType}
   */
  dialogType: StoreDialogType.InContextStore;

  /**
   * The application capability (e.g., "Tab", "Bot", "Messaging", "Connector", "CUSTOMBOT").
   * Defaults to "Bot".
   */
  appCapability?: string;

  /**
   * The application meta capabilities (e.g., ["copilotPlugins", "copilotExtensions"]).
   * Reference:
   * https://domoreexp.visualstudio.com/Teamspace/_git/teams-modular-packages?path=/packages/data/data-schema/src/module.graphql&version=GBmaster&line=9463&lineEnd=9463&lineStartColumn=6&lineEndColumn=25&lineStyle=plain&_a=contents
   */
  appMetaCapabilities?: string[];

  /**
   * The installation scope (e.g., "Personal" | "Team").
   * Defaults to "Personal".
   */
  installationScope?: string;

  /**
   * A list of app IDs to be filtered out.
   */
  filteredOutAppIds?: string[];
}

/**
 * @beta
 * @hidden
 * Interface of open app detail dialog function parameter, make sure app id is appended
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenAppDetailParams extends StoreSizeInfo {
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
export interface OpenSpecificStoreParams extends StoreSizeInfo {
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
 * Interface of open store function parameters, including:
 * - `OpenAppDetailParams`
 * - `OpenFullStoreParams`
 * - `OpenInContextStoreParams`
 * - `OpenSpecificStoreParams`
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type OpenStoreParams =
  | OpenAppDetailParams
  | OpenFullStoreParams
  | OpenInContextStoreParams
  | OpenSpecificStoreParams;

/**
 * @beta
 * @hidden
 * error message when getting illegal store dialog size
 * @internal
 * Limited to Microsoft-internal use
 */
export const errorInvalidDialogSize = 'Invalid store dialog size';

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
  const { dialogType, size } = openStoreParams;
  if (openStoreParams === undefined || !Object.values(StoreDialogType).includes(dialogType)) {
    throw new Error(errorInvalidDialogType);
  }
  if (dialogType === StoreDialogType.AppDetail && !(openStoreParams.appId instanceof AppId)) {
    throw new Error(errorMissingAppId);
  }
  if (dialogType === StoreDialogType.SpecificStore && !openStoreParams.collectionId) {
    throw new Error(errorMissingCollectionId);
  }
  if (size !== undefined) {
    const { width, height } = size;
    if (width !== undefined && typeof width === 'number' && width < 0) {
      throw new Error(errorInvalidDialogSize);
    }
    if (height !== undefined && typeof height === 'number' && height < 0) {
      throw new Error(errorInvalidDialogSize);
    }
  }

  const inContextStoreFilters =
    dialogType === StoreDialogType.InContextStore
      ? JSON.stringify({
          appCapability: openStoreParams.appCapability,
          appMetaCapabilities: openStoreParams.appMetaCapabilities,
          installationScope: openStoreParams.installationScope,
          filteredOutAppIds: openStoreParams.filteredOutAppIds,
        })
      : undefined;

  return callFunctionInHost(
    ApiName.Store_Open,
    [
      openStoreParams.dialogType,
      (openStoreParams as OpenAppDetailParams).appId,
      (openStoreParams as OpenSpecificStoreParams).collectionId,
      JSON.stringify(openStoreParams.size),
      inContextStoreFilters,
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
