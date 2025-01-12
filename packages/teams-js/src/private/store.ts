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

/**
 * @beta
 * @hidden
 * Interface for opening the full store function parameters
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenFullStoreParams {
  /**
   * the store dialog size, defined by {@link DialogSize}, if not present, the host will choose an appropriate size
   */
  size?: DialogSize;
}

/**
 * @beta
 * @hidden
 * Interface for opening the in-context store function parameters
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenInContextStoreParams {
  /**
   * the store dialog size, defined by {@link DialogSize}, if not present, the host will choose an appropriate size
   */
  size?: DialogSize;

  /**
   * The application capability (e.g., "Tab", "Bot", "Messaging", "Connector", "CUSTOMBOT").
   * Defaults to "Tab".
   */
  appCapability?: string;

  /**
   * The application meta capabilities (e.g., ["copilotPlugins", "copilotExtensions"]).
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
  filteredOutAppIds?: AppId[];
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
   * app id of the dialog to open
   */
  appId: AppId;

  /**
   * the store dialog size, defined by {@link DialogSize}, if not present, the host will choose an appropriate size
   */
  size?: DialogSize;
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
   * collection id of the plugin store to open
   */
  collectionId: string;

  /**
   * the store dialog size, defined by {@link DialogSize}, if not present, the host will choose an appropriate size
   */
  size?: DialogSize;
}

const StoreVersionTagNum = ApiVersionNumber.V_2;
const errorInvalidDialogSize = 'Invalid store dialog size';
const errorMissingAppId = 'No App Id present, but AppId needed to open AppDetail store';
const errorMissingCollectionId =
  'No Collection Id present, but CollectionId needed to open a store specific to a collection';

/**
 * @beta
 * @hidden
 * Api to open a full store without navigation
 * @internal
 * Limited to Microsoft-internal use
 */
export async function openFullStore(params: OpenFullStoreParams): Promise<void> {
  ensureStoreReady();
  const { size } = params;
  return callFunctionInHost(
    ApiName.Store_OpenFullStore,
    [parseValidSize(size)],
    getApiVersionTag(StoreVersionTagNum, ApiName.Store_OpenFullStore),
  );
}

/**
 * @beta
 * @hidden
 * Api to open an app detail dialog
 * @internal
 * Limited to Microsoft-internal use
 */
export async function openAppDetail(params: OpenAppDetailParams): Promise<void> {
  ensureStoreReady();
  const { size, appId } = params;
  if (!(appId instanceof AppId)) {
    throw new Error(errorMissingAppId);
  }
  return callFunctionInHost(
    ApiName.Store_OpenAppDetail,
    [parseValidSize(size), appId],
    getApiVersionTag(StoreVersionTagNum, ApiName.Store_OpenAppDetail),
  );
}

/**
 * @beta
 * @hidden
 * Api to open an in-context-store dialog
 * @internal
 * Limited to Microsoft-internal use
 */
export async function openInContextStore(params: OpenInContextStoreParams): Promise<void> {
  ensureStoreReady();
  const { size, appCapability, appMetaCapabilities, installationScope, filteredOutAppIds } = params;
  return callFunctionInHost(
    ApiName.Store_OpenInContextStore,
    [
      parseValidSize(size),
      appCapability,
      appMetaCapabilities,
      installationScope,
      filteredOutAppIds?.map((id) => id.toString()),
    ],
    getApiVersionTag(StoreVersionTagNum, ApiName.Store_OpenInContextStore),
  );
}

/**
 * @beta
 * @hidden
 * Api to open an store with navigation to a specific collection
 * @internal
 * Limited to Microsoft-internal use
 */
export async function openSpecificStore(params: OpenSpecificStoreParams): Promise<void> {
  ensureStoreReady();
  const { size, collectionId } = params;
  if (collectionId === undefined) {
    throw new Error(errorMissingCollectionId);
  }
  return callFunctionInHost(
    ApiName.Store_OpenSpecificStore,
    [parseValidSize(size), collectionId],
    getApiVersionTag(StoreVersionTagNum, ApiName.Store_OpenSpecificStore),
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

function ensureStoreReady(): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
}

function parseValidSize(size: DialogSize | undefined): string | undefined {
  if (size === undefined) {
    return undefined;
  }
  const { width, height } = size;
  if (width !== undefined && typeof width === 'number' && width < 0) {
    throw new Error(errorInvalidDialogSize);
  }
  if (height !== undefined && typeof height === 'number' && height < 0) {
    throw new Error(errorInvalidDialogSize);
  }

  return JSON.stringify(size);
}
