import { Debugger } from 'debug';

import { handleHostToAppPerformanceMetrics } from './handlers';
import { CallbackInformation } from './interfaces';
import { MessageRequest, MessageResponse } from './messageObjects';
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
   * Executes telemetry actions related to host to app performance metrics where event is raised in the host.
   * @param message The request from the host.
   * @param logger The logger in case an error occurs.
   */
  public static handleOneWayPerformanceMetrics(message: MessageRequest, logger: Debugger): void {
    const timestamp = message.monotonicTimestamp;
    if (!timestamp) {
      logger('Unable to send performance metrics for event %s', message.func);
      return;
    }
    handleHostToAppPerformanceMetrics({
      actionName: message.func,
      messageDelay: getCurrentTimestamp() - timestamp,
      messageWasCreatedAt: timestamp,
    });
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
    if (!callbackInformation || !message.monotonicTimestamp) {
      logger(
        'Unable to send performance metrics for callback %s with arguments %o',
        callbackID.toString(),
        message.args,
      );
      return;
    }
    handleHostToAppPerformanceMetrics({
      actionName: callbackInformation.name,
      messageDelay: getCurrentTimestamp() - message.monotonicTimestamp,
      messageWasCreatedAt: callbackInformation.calledAt,
    });
    HostToAppMessageDelayTelemetry.deleteMessageInformation(callbackID);
  }
}
