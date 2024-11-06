import { ensureInitialized } from '../../internal/internalAPIs';
import { runtime } from '../../public/runtime';
import * as dataLayer from './dataLayer';
import * as telemetry from './telemetry';

/**
 * @hidden
 * Module to request message ports from the host application.
 *
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @module
 */

/**
 * @hidden
 *
 * @beta
 *
 * Checks if the messageChannels capability is supported by the host
 * @returns boolean to represent whether the messageChannels capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.messageChannels ? true : false;
}

export { dataLayer, telemetry };
