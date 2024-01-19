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
   * @returns MessagePort, or undefined if feature not supported by host.
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
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
      const response = await requestPortFromParent('messageChannels.getTelemetryPort');
      console.log('getTelemetryPort response', response);
    }

    throw new Error('Unable to get telemetry port');
  }
}
