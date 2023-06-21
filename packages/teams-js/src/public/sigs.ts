/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendAndHandleSdkError } from '../internal/communication';

/**
 * Namespace for all SIGS integration API
 */
export namespace sigs {
  /** Represent user send signal to hub */
  export interface ISignalInput {
    /**
     * Required signalType
     */
    signalType: string;
    /**
     * Optional appName
     */
    appName?: string;
    /**
     * optional custom properties
     */
    customProperties?: {
      [key: string]: any;
    };
  }
  /**
   * Feature is under development
   * sends a substrate signal via hubsdk.
   *
   * @param signalInput - object representing signal parameters
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function sendSignal(signalInput: ISignalInput): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve(sendAndHandleSdkError('sigs.sendSignal', signalInput));
    });
  }
}
