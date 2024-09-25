import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { AppId } from '../public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ExternalAppErrorCode } from './constants';
import { externalAppAuthentication } from './externalAppAuthentication';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const externalAppCommandsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * Namespace to delegate the ActionCommand to the host
 * @internal
 * Limited to Microsoft-internal use
 *
 * @beta
 */
export namespace externalAppCommands {
  /**
   * @hidden
   * The payload of IActionCommandResponse
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export type IActionCommandResponse = ITextActionCommandResponse | ICardActionCommandResponse;

  /**
   * @hidden
   * The payload of IBaseActionCommandResponse
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface IBaseActionCommandResponse {
    taskModuleClosedReason: TaskModuleClosedReason;
  }

  /**
   * @hidden
   * The text result type
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface ITextActionCommandResponse extends IBaseActionCommandResponse {
    resultType: 'text';
    text: string | undefined;
  }

  /**
   * @hidden
   * The card result type
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface ICardActionCommandResponse extends IBaseActionCommandResponse {
    resultType: 'card';
    attachmentLayout: externalAppAuthentication.AttachmentLayout;
    attachments: externalAppAuthentication.QueryMessageExtensionAttachment[];
  }

  /**
   * @hidden
   * The result type for the ActionCommandResultType
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export type ActionCommandResultType = 'card' | 'text';

  /**
   * @hidden
   * The reason for the TaskModuleClosedReason
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export type TaskModuleClosedReason = 'Done' | 'CancelledByUser';

  /**
   *
   * @hidden
   * Error that can be thrown from IExternalAppCommandsService.processActionCommand
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface ActionCommandError {
    errorCode: ExternalAppErrorCode;
    message?: string;
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   * @hidden
   * This API delegates an ActionCommand request to the host for the application with the provided following parameters:
   *
   * @param appId ID of the application the request is intended for. This must be a UUID
   * @param commandId extensibilityProvider use this ID to look up the command declared by ActionME
   * @param extractedParameters are the key-value pairs that the dialog will be prepopulated with
   *
   * @returns Promise that resolves with the {@link IActionCommandResponse} when the request is completed and rejects with {@link ActionCommandError} if the request fails
   *
   * @beta
   */
  export async function processActionCommand(
    appId: string,
    commandId: string,
    extractedParameters: Record<string, string>,
  ): Promise<IActionCommandResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const typeSafeAppId: AppId = new AppId(appId);

    const [error, response] = await sendMessageToParentAsync<[ActionCommandError, IActionCommandResponse]>(
      getApiVersionTag(externalAppCommandsTelemetryVersionNumber, ApiName.ExternalAppCommands_ProcessActionCommands),
      ApiName.ExternalAppCommands_ProcessActionCommands,
      [typeSafeAppId.toString(), commandId, extractedParameters],
    );
    if (error) {
      throw error;
    } else {
      return response;
    }
  }

  /**
   * @hidden
   * Checks if the externalAppCommands capability is supported by the host
   * @returns boolean to represent whether externalAppCommands capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppCommands ? true : false;
  }
}
