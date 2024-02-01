import { requestPortFromParentWithVersion } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../internal/telemetry';
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
export namespace messageChannels {
  let telemetryPort: MessagePort | undefined;

  const messageChannelsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

  const logger = getLogger('messageChannels');
  /**
   * @hidden
   * @beta
   *
   * Fetches a MessagePort to batch telemetry through the host's telemetry worker.
   * The port is cached once received, so subsequent calls return the same port.
   * @returns MessagePort.
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed,
   * if the host does not support the feature, or if the port request is rejected.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export async function getTelemetryPort(): Promise<MessagePort> {
    // If the port has already been initialized, return it.
    if (telemetryPort) {
      logger('Returning telemetry port from cache');
      return telemetryPort;
    }

    isSupported();

    // Send request for telemetry port, will throw if the request is rejected
    telemetryPort = await requestPortFromParentWithVersion(
      getApiVersionTag(messageChannelsTelemetryVersionNumber, ApiName.MessageChannels_GetTelemetryPort),
      'messageChannels.getTelemetryPort',
    );
    return telemetryPort;
  }

  /**
   * @hidden
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

  /**
   * @hidden
   * Undocumented function used to clear state between unit tests
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function _clearTelemetryPort(): void {
    telemetryPort = undefined;
  }
}
