import { requestPortFromParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';

let telemetryPort: MessagePort | undefined;

/**
 * @hidden
 * Namespace to request message ports from the host application.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace messageChannels {
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
    // TODO is there a pattern for holding things like this?
    if (telemetryPort) {
      return telemetryPort;
    }

    if (ensureInitialized(runtime)) {
      // Send request for port
      try {
        const response = await requestPortFromParent('messageChannels.getTelemetryPort');
        if (response instanceof MessagePort) {
          telemetryPort = response;
          return telemetryPort;
        } else {
          throw new Error('MessageChannels.getTelemetryPort: Host did not return a MessagePort.');
        }
      } catch (e) {
        throw new Error('MessageChannels.getTelemetryPort: Error thrown from message promise.');
      }
    }

    throw new Error('MessageChannels.getTelemetryPort: SDK not initialized.');
  }
}
