/**
 * Lets an app inside a Teams iframe relay the mouse back (X1) / forward (X2)
 * buttons to the host so they drive Teams history navigation.
 *
 * @module
 */

import { callFunctionInHost } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';
import { ISerializable } from './serializable.interface';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * The direction of a relayed history-navigation intent.
 */
export type NavigationDirection = 'back' | 'forward';

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

/** `MouseEvent.button` value for the back (X1) button. */
const MOUSE_BUTTON_BACK = 3;

/** `MouseEvent.button` value for the forward (X2) button. */
const MOUSE_BUTTON_FORWARD = 4;

class SerializableNavigationIntent implements ISerializable {
  public constructor(private direction: NavigationDirection) {}
  public serialize(): object {
    return { direction: this.direction };
  }
}

/**
 * Maps a `MouseEvent.button` value to a navigation direction, or `undefined`
 * for any button other than the back (X1) / forward (X2) buttons.
 */
function directionForButton(button: number): NavigationDirection | undefined {
  if (button === MOUSE_BUTTON_BACK) {
    return 'back';
  }
  if (button === MOUSE_BUTTON_FORWARD) {
    return 'forward';
  }
  return undefined;
}

/**
 * Suppress the iframe's own native X1/X2 history navigation (and the synthetic
 * `click`). Attached to `mousedown` (earliest, most reliable) and `auxclick`;
 * never relays.
 */
function suppressX1X2(event: MouseEvent): void {
  if (directionForButton(event.button) !== undefined) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}

/**
 * Relay the back/forward intent to the host on `mouseup` (release), matching
 * the browser's native timing so press-and-hold does nothing until release.
 */
function mouseupHandler(event: MouseEvent): void {
  const direction = directionForButton(event.button);
  if (!direction) {
    return; // not the back/forward button
  }

  event.preventDefault();
  event.stopImmediatePropagation();

  callFunctionInHost(
    ApiName.MouseRelay_NavigateHistory,
    [new SerializableNavigationIntent(direction)],
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.MouseRelay_NavigateHistory),
  );
}

/* ------------------------------------------------------------------ */
/* In-memory                                                          */
/* ------------------------------------------------------------------ */

/**
 * @hidden
 * @internal
 * Flag to indicate the mouse relay capability has been enabled, so that we do
 * not register the event listeners multiple times.
 */
let isMouseRelayCapabilityEnabled = false;

/* ------------------------------------------------------------------ */
/* API                                                                */
/* ------------------------------------------------------------------ */

/**
 * Enable the capability so the mouse back (X1) / forward (X2) buttons pressed
 * inside this iframe drive Teams history navigation in the host.
 *
 * @throws Error if {@link app.initialize} has not successfully completed or the
 * host does not support the mouseRelay capability.
 */
export async function enableMouseRelayCapability(): Promise<void> {
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  if (!isMouseRelayCapabilityEnabled) {
    document.addEventListener('mousedown', suppressX1X2, { capture: true });
    document.addEventListener('mouseup', mouseupHandler, { capture: true });
    document.addEventListener('auxclick', suppressX1X2, { capture: true });
  }
  isMouseRelayCapabilityEnabled = true;
}

/**
 * Reset the state of the mouse relay capability, detaching its listeners.
 * This is useful for tests to ensure a clean state.
 *
 * @throws Error if {@link app.initialize} has not successfully completed or the
 * host does not support the mouseRelay capability.
 */
export function resetIsMouseRelayCapabilityEnabled(): void {
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  isMouseRelayCapabilityEnabled = false;
  document.removeEventListener('mousedown', suppressX1X2, { capture: true });
  document.removeEventListener('mouseup', mouseupHandler, { capture: true });
  document.removeEventListener('auxclick', suppressX1X2, { capture: true });
}

/**
 * Checks if the mouseRelay capability is supported by the host.
 * @returns boolean to represent whether the mouseRelay capability is supported.
 *
 * @throws Error if {@link app.initialize} has not successfully completed.
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.mouseRelay ? true : false;
}
