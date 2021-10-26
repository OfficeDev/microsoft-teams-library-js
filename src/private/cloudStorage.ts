import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from '../public';

/**
 * Namespace to interact with the `cloudStorage` specific part of the SDK.
 *
 * @private
 * Hide from docs
 */
export namespace cloudStorage {
  export type ExternalFilesProviderCode = 'DROPBOX' | 'BOX' | 'SHAREFILE' | 'GOOGLEDRIVE' | 'EGNYTE';

  export enum FilesNavigationServiceType {
    Recent,
    Aggregate,
    Personal,
    Teams,
    Channels,
    Downloads,
    PersonalWopi,
    PersonalGoogle,
    CustomSpo,
    SharedWithMe,
    Chats,
  }

  export enum FilesProviderType {
    Sharepoint = 0,
    WOPI,
    Google,
    OneDrive,
    Recent,
    Aggregate,
    FileSystem, // Used for Downloaded files on Desktop
    Search, // Used by P2P files with OSearch
    AllFiles, // Used by P2P files with AllFiles API
    SharedWithMe,
  }

  interface IWopiThumbnail {
    size: number;
    url: string;
  }

  interface IWopiService {
    name: string;
    description: string;
    thumbnails: IWopiThumbnail[];
  }

  export interface ICommonExternalDto extends ICoreExternalItemlDto {
    id: string;
    lastModifiedTime: string;
    size: number;
    objectUrl: string; // TODO: (TASK 123357) DELETE THIS
    accessToken?: string;
  }

  /**
   * Contains the minimal properties for an item
   */
  export interface ICoreExternalItemlDto {
    title: string;
    isSubdirectory: boolean;
    type: string;
  }

  export interface IExternalProvider extends IWopiService {
    navigationType: FilesNavigationServiceType;
    providerType: FilesProviderType;
    providerCode: ExternalFilesProviderCode;
  }

  /**
   * @private
   * Allow 1st party apps to call this function to get the external
   * third party cloud storage accounts that the tenant supports
   * @param excludeAddedProviders: return a list of support third party
   * cloud storages that hasn't been added yet.
   */
  export function getExternalProviders(
    excludeAddedProviders = false,
    callback: (error: SdkError, providers: IExternalProvider[]) => void,
  ): void {
    ensureInitialized();

    if (!callback) {
      throw new Error('[cloudStorage.getExternalProviders] Callback cannot be null');
    }

    sendMessageToParent('cloudStorage.getExternalProviders', [excludeAddedProviders], callback);
  }

  /**
   * @private
   * Allow 1st party apps to call this function to move files
   * among SharePoint and third party cloud storages.
   */
  export function copyMoveFiles(
    selectedFiles: ICommonExternalDto[],
    providerCode: ExternalFilesProviderCode,
    destinationFolder: ICommonExternalDto,
    destinationProviderCode: ExternalFilesProviderCode,
    isMove = false,
    callback: (error: SdkError) => void,
  ): void {
    ensureInitialized();
    if (isMove === undefined) {
      throw new Error('[cloudStorage.copyMoveFiles] isMove cannot be null or empty');
    }
    if (!selectedFiles || selectedFiles.length === 0) {
      throw new Error('[cloudStorage.copyMoveFiles] selectedFiles cannot be null or empty');
    }
    if (!providerCode) {
      throw new Error('[cloudStorage.copyMoveFiles] providerCode cannot be null or empty');
    }
    if (!destinationFolder) {
      throw new Error('[cloudStorage.copyMoveFiles] destinationFolder cannot be null or empty');
    }
    if (!destinationProviderCode) {
      throw new Error('[cloudStorage.copyMoveFiles] destinationProviderCode cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[cloudStorage.copyMoveFiles] callback cannot be null');
    }
    sendMessageToParent(
      'cloudStorage.copyMoveFiles',
      [selectedFiles, providerCode, destinationFolder, destinationProviderCode, isMove],
      callback,
    );
  }
}
