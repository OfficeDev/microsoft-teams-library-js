import { requestPortFromParentWithVersion } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform } from '../../public/constants';
import { runtime } from '../../public/runtime';

let dataLayerPort: MessagePort | undefined;

const messageChannelsDataLayerVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

const logger = getLogger('messageChannels.dataLayer');
/**
 * @hidden
 * @beta
 *
 * Fetches a MessagePort to allow access to the host's data layer worker.
 * The port is cached once received, so subsequent calls return the same port.
 * @returns MessagePort.
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed,
 * if the host does not support the feature, or if the port request is rejected.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function getDataLayerPort(): Promise<MessagePort> {
  // If the port has already been initialized, return it.
  if (dataLayerPort) {
    logger('Returning dataLayer port from cache');
    return dataLayerPort;
  }

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  // Send request for telemetry port, will throw if the request is rejected
  dataLayerPort = await requestPortFromParentWithVersion(
    getApiVersionTag(messageChannelsDataLayerVersionNumber, ApiName.MessageChannels_DataLayer_GetDataLayerPort),
    ApiName.MessageChannels_DataLayer_GetDataLayerPort,
  );
  return dataLayerPort;
}

/**
 * @hidden
 *
 * @beta
 *
 * Checks if the messageChannels.dataLayer capability is supported by the host
 * @returns boolean to represent whether the messageChannels.dataLayer capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.messageChannels?.dataLayer ? true : false;
}

/**
 * @hidden
 * Undocumented function used to clear state between unit tests
 *
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function _clearDataLayerPort(): void {
  dataLayerPort = undefined;
}
