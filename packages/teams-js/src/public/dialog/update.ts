/**
 * Module to update the dialog
 *
 * @module
 */

import { dialogTelemetryVersionNumber, updateResizeHelper } from '../../internal/dialogHelpers';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { DialogSize } from '../interfaces';
import { runtime } from '../runtime';

/**
 * Update dimensions - height/width of a dialog.
 *
 * @param dimensions - An object containing width and height properties.
 */
export function resize(dimensions: DialogSize): void {
  updateResizeHelper(getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Update_Resize), dimensions);
}

/**
 * Checks if dialog.update capability is supported by the host
 * @returns boolean to represent whether dialog.update capabilty is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.dialog
    ? runtime.supports.dialog.update
      ? true
      : false
    : false;
}
