import { callFunctionInHost } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../internal/telemetry';
import { AppId } from '../public/appId';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
/**
 * @beta
 * @hidden
 * Namespace to open app store
 * @internal
 * Limited to Microsoft-internal use
 */
const StoreVersionTagNum = ApiVersionNumber.V_2;
const storeLogger = getLogger('store');
export namespace store {
  /**
   * @beta
   * @hidden
   * Enum of store dialog type
   *
   * @enum fullStore - open a fullStore without navigation
   * @enum ICS - open in-context-store
   * @enum appDetail - open detail dialog (DD), make sure an appId appended, otherwise throw error
   * @enum copilotStore - open a full store with navigation to copilot section
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum StoreDialogType {
    fullStore = 'fullstore',
    ICS = 'ics',
    appDetail = 'appdetail',
    copilotStore = 'copilotstore',
  }
  /**
   * @beta
   * @hidden
   * Interface of open full store, copilot store and in-context-store function parameter
   *
   * @param dialogType - the store dialog type, defined by {@link StoreDialogType}
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface OpenStoreParams {
    dialogType: StoreDialogType.fullStore | StoreDialogType.copilotStore | StoreDialogType.ICS;
  }
  /**
   * @beta
   * @hidden
   * Interface of open app detail dialog function parameter, make sure app id is appended, otherwise error thrown
   *
   * @param dialogType - need to be app detail type, defined by {@link StoreDialogType}
   * @param appId - app id of the dialog to open
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface OpenAppDetailParams {
    dialogType: StoreDialogType.appDetail;
    appId: AppId;
  }
  /**
   * @beta
   * @hidden
   * error message when trying to open app detail dialog but missing app id
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export const errorMissingAppId = 'No App Id present, but AppId needed to open AppDetail store';
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
  export async function openStoreExperience(openStoreParams: OpenStoreParams | OpenAppDetailParams): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (openStoreParams.dialogType === StoreDialogType.appDetail && !(openStoreParams.appId instanceof AppId)) {
      throw new Error(errorMissingAppId);
    }
    return callFunctionInHost(
      ApiName.Store_Open,
      [openStoreParams.dialogType, (openStoreParams as OpenAppDetailParams).appId],
      getApiVersionTag(StoreVersionTagNum, ApiName.Store_Open),
    ).catch((e) => {
      storeLogger(e);
    });
  }
  /**
   * Checks if the store capability is supported by the host
   * @returns boolean to represent whether the store capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && !!runtime.supports.dialog?.url;
  }
}
