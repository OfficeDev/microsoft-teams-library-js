/**
 * @hidden
 * Module to delegate adaptive card action execution to the host
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHost } from '../internal/communication';
import { validateAppIdInstance, validateStringIdInstance } from '../internal/idValidation';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { DialogSize } from '../public';
import { AppId } from '../public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ISerializable } from '../public/serializable.interface';
import { ValidatedStringId } from '../public/validatedStringId';
import { isExternalAppError } from './externalAppErrorHandling';

/**
 * All of APIs in this capability file should send out API version v2 ONLY
 */
const externalAppCardActionsForDATelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @beta
 * @hidden
 * Base interface for Dialog Information.
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param title The title of the dialog.
 * @param size The size of the dialog.
 */
export interface IDialogActionBase {
  title: string;
  size: DialogSize;
}

/**
 * @beta
 * @hidden
 * Interface to define the Dialog info for Adaptive Card Action.OpenUrlDialog request.
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param url The URL to open in the dialog.
 */
export interface IActionOpenUrlDialogInfo extends IDialogActionBase {
  url: URL;
}

/**
 * @beta
 * @hidden
 * Delegates an Adaptive Card Action.OpenUrlDialog request to the host for the application with the provided app ID
 * @internal
 * Limited to Microsoft-internal use
 * @param appId ID of the application the request is intended for. This must be a UUID
 * @param actionOpenUrlDialogInfo Information required to open the URL dialog
 * @param traceId The trace identifier used for monitoring and live site investigations
 * @returns Promise that resolves when the request is completed and rejects with ExternalAppError if the request fails
 */
export async function processActionOpenUrlDialog(
  appId: AppId,
  actionOpenUrlDialogInfo: IActionOpenUrlDialogInfo,
  traceId: ValidatedStringId,
): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  validateInput(appId, traceId);

  return callFunctionInHost(
    ApiName.ExternalAppCardActionsForDA_ProcessActionOpenUrlDialog,
    [appId, new SerializableActionOpenUrlDialogInfo(actionOpenUrlDialogInfo), traceId],
    getApiVersionTag(
      externalAppCardActionsForDATelemetryVersionNumber,
      ApiName.ExternalAppCardActionsForDA_ProcessActionOpenUrlDialog,
    ),
    isExternalAppError,
  );
}

/**
 * @hidden
 * Checks if the externalAppCardActions capability is supported by the host
 * @returns boolean to represent whether externalAppCardActions capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.externalAppCardActionsForDA ? true : false;
}

/**
 * @hidden
 * Checks if the externalAppCardActions capability is supported by the host
 * @returns boolean to represent whether externalAppCardActions capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validateInput(appId: AppId, traceId: ValidatedStringId): void {
  validateAppIdInstance(appId);
  validateStringIdInstance(traceId);
}

export class SerializableActionOpenUrlDialogInfo implements ISerializable {
  public constructor(private info: IActionOpenUrlDialogInfo) {}

  public serialize(): object {
    const { url, title, size } = this.info;
    return {
      url: url.href,
      title,
      size,
    };
  }
}
