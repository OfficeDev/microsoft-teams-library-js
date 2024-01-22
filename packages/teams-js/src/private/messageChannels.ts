import { requestPortFromParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to request message ports from the host application.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace messageChannels {
  let telemetryPort: MessagePort | undefined;
  /**
   * @hidden
   *
   * Fetches a MessagePort to batch telemetry through the host's telemetry worker.
   * @returns MessagePort.
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed,
   * if the host does not support the feature, or if an error is thrown in message handling.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export async function getTelemetryPort(): Promise<MessagePort> {
    // If the port has already been initialized, return it.
    if (telemetryPort) {
      return telemetryPort;
    }

    ensureInitialized(runtime);

    // Send request for telemetry port
    let response: MessagePort | undefined;
    try {
      response = await requestPortFromParent('messageChannels.getTelemetryPort');
    } catch (e) {
      throw new Error('MessageChannels.getTelemetryPort: Error thrown from message promise.');
    }
    if (response instanceof MessagePort) {
      telemetryPort = response;
      return telemetryPort;
    } else {
      throw new Error('MessageChannels.getTelemetryPort: Host did not return a MessagePort.');
    }
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
