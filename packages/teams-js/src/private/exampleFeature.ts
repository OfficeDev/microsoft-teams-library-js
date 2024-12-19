import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { ErrorCode } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ExampleResponse {
  /**
   * Status message returned from the call
   */
  status: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ExampleInput {
  /**
   * Input string to send with the call
   */
  input: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ExampleEventData {
  /**
   * Data payload for the event
   */
  data: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.exampleFeature?.basicCall ? true : false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function basicCall(input: ExampleInput): Promise<ExampleResponse> {
  if (!isSupported()) {
    throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: ${errorNotSupportedOnPlatform}`);
  }
  return new Promise((resolve) => {
    resolve({ status: `test successful - received: ${input.input}` });
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function isEventSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.exampleFeature?.events ? true : false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerEventHandler(handler: (data: ExampleEventData) => void): void {
  if (!isEventSupported()) {
    throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: ${errorNotSupportedOnPlatform}`);
  }
  window.addEventListener('exampleEvent', ((event: CustomEvent<ExampleEventData>) => {
    handler(event.detail);
  }) as EventListener);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function raiseEvent(eventData: string): void {
  if (!isEventSupported()) {
    throw new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: ${errorNotSupportedOnPlatform}`);
  }
  window.dispatchEvent(new CustomEvent('exampleDirectEvent', { detail: eventData }));
}
