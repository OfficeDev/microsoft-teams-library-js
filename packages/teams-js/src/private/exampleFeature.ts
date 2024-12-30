import { ensureInitialized } from '../internal/internalAPIs';
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
  return ensureInitialized(runtime) && runtime.supports.exampleFeature ? true : false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function basicCall(input: ExampleInput): Promise<ExampleResponse> {
  ensureInitialized(runtime);
  if (!input.input) {
    throw new Error('Input is required');
  }
  return new Promise((resolve) => {
    resolve({ status: `test successful - received: ${input.input}` });
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerEventHandler(handler: (data: ExampleEventData) => void): void {
  ensureInitialized(runtime);
  window.addEventListener('exampleEvent', ((event: CustomEvent<ExampleEventData>) => {
    handler(event.detail);
  }) as EventListener);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function raiseEvent(eventData: string): void {
  ensureInitialized(runtime);
  window.dispatchEvent(new CustomEvent('exampleDirectEvent', { detail: eventData }));
}
