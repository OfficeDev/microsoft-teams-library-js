import { Debugger } from 'debug';

import { handleHostToAppPerformanceMetrics } from './handlers';
import { CallbackInformation } from './interfaces';
import { MessageResponse } from './messageObjects';
import { getCurrentTimestamp } from './utils';
import { UUID as MessageUUID } from './uuidObject';

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export default class HostToAppMessageDelayTelemetry {
  private static callbackInformation: Map<MessageUUID, CallbackInformation> = new Map();

  /**
   * @internal
   * Limited to Microsoft-internal use
   *
   * Store information about a particular message.
   * @param messageUUID The message id for the request.
   * @param callbackInformation The information of the callback.
   */
  public static storeCallbackInformation(messageUUID: MessageUUID, callbackInformation: CallbackInformation): void {
    HostToAppMessageDelayTelemetry.callbackInformation.set(messageUUID, callbackInformation);
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   */
  public static clearMessages(): void {
    HostToAppMessageDelayTelemetry.callbackInformation.clear();
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   */
  public static deleteMessageInformation(callbackId: MessageUUID): void {
    HostToAppMessageDelayTelemetry.callbackInformation.delete(callbackId);
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   *
   * Executes telemetry actions related to host to app performance metrics.
   * @param callbackId The message id for the request.
   * @param message The response from the host.
   * @param logger The logger in case an error occurs.
   */
  public static handlePerformanceMetrics(callbackID: MessageUUID, message: MessageResponse, logger: Debugger): void {
    const callbackInformation = HostToAppMessageDelayTelemetry.callbackInformation.get(callbackID);
    if (callbackInformation && message.timestamp) {
      handleHostToAppPerformanceMetrics({
        actionName: callbackInformation.name,
        messageDelay: getCurrentTimestamp() - message.timestamp,
        messageWasCreatedAt: callbackInformation.calledAt,
      });
      HostToAppMessageDelayTelemetry.deleteMessageInformation(callbackID);
    } else {
      logger('Unable to send performance metrics for callback %i with arguments %o', callbackID, message.args);
    }
  }
}
