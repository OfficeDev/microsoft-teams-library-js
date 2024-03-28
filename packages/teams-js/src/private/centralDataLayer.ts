import { requestPortFromParentWithVersion } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to request message ports from the host application.
 *
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace centralDataLayer {
  let centralDataLayerPort: MessagePort | undefined;

  const centralDataLayerVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

  const logger = getLogger('cantralDataLayer');

  /**
   * @hidden
   *
   * @beta
   *
   * Checks if the dataLayer capability is supported by the host
   * @returns boolean to represent whether the dataLayer capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.centralDataLayer ? true : false;
  }

  /**
   * @hidden
   * @beta
   *
   * Fetches a MessagePort to let Apps leverage data layer in Host.
   * The port is cached once received, so subsequent calls return the same port.
   * @returns MessagePort.
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed,
   * if the host does not support the feature, or if the port request is rejected.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export async function getCentralDataLayerPort(): Promise<MessagePort> {
    // If the port has already been initialized, return it.
    if (centralDataLayerPort) {
      logger('Returning datalayer port from cache');
      return centralDataLayerPort;
    }

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    // Send request for dataLayer port, will throw if the request is rejected
    centralDataLayerPort = await requestPortFromParentWithVersion(
      getApiVersionTag(centralDataLayerVersionNumber, ApiName.PrivateAPIs_GetCentralDataLayerPort),
      'getCentralDataLayerPort',
    );
    return centralDataLayerPort;
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
  export function _clearCentralDataLayerPort(): void {
    centralDataLayerPort = undefined;
  }
}
