/**
 * Allows host shortcuts to function in your application by forwarding keyboard shortcuts to the host.
 *
 * This functionality is in Beta.
 * @beta
 * @module
 */

import { callFunctionInHost, callFunctionInHostAndHandleResponse } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ResponseHandler } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';
import { ISerializable } from './serializable.interface';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Shortcuts = Set<string>; // stores shortcut key combinations, for example: ["ctrl+/", "ctrl+shift+/"]

type HostShortcutsResponse = {
  shortcuts: Shortcuts;
  overridableShortcuts: Shortcuts;
};

/**
 * Data passed to the overridable shortcut handler.
 */
export type OverridableShortcutHandlerData = {
  /**
   * The matched shortcut that triggered the handler.
   * This is a canonical form of the shortcut, e.g. "ctrl+shift+x".
   */
  matchedShortcut: string;
};

/**
 * A handler must return `true` when it wants to **consume** the shortcut
 * (i.e. prevent forwarding to host). Any other return value forwards it.
 */
export type OverridableShortcutHandler = (event: KeyboardEvent, data: OverridableShortcutHandlerData) => boolean;

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

class SerializableKeyboardEvent implements ISerializable {
  public constructor(private event: KeyboardEvent) {}
  public serialize(): object | string {
    return {
      altKey: this.event.altKey,
      bubbles: this.event.bubbles,
      cancelBubble: this.event.cancelBubble,
      charCode: this.event.charCode,
      code: this.event.code,
      composed: this.event.composed,
      ctrlKey: this.event.ctrlKey,
      // currentTarget: skipped
      defaultPrevented: this.event.defaultPrevented,
      detail: this.event.detail,
      eventPhase: this.event.eventPhase,
      isComposing: this.event.isComposing,
      isTrusted: this.event.isTrusted,
      key: this.event.key,
      keyCode: this.event.keyCode,
      location: this.event.location,
      metaKey: this.event.metaKey,
      // path - skipped,
      repeat: this.event.repeat,
      returnValue: this.event.returnValue,
      shiftKey: this.event.shiftKey,
      // sourceCapabilities - skipped,
      // srcElement - slipped.
      // target - skipped.
      timeStamp: this.event.timeStamp,
      type: this.event.type,
      // view - skipped
      which: this.event.which,
    };
  }
}

/**
 * Normalizes a shortcut string to a canonical form.
 */
function normalizeShortcut(shortcut: string): string {
  return shortcut.toLowerCase().split('+').sort().join('+');
}

/**
 * Build a canonical, lower-case “ctrl+shift+x” representation of the
 * currently pressed keys.  The array is sorted so the order in which
 * modifiers are pressed does not matter.
 */
function eventToCanonicalShortcut(e: KeyboardEvent): string {
  return [e.ctrlKey && 'ctrl', e.shiftKey && 'shift', e.altKey && 'alt', e.metaKey && 'meta', e.key.toLowerCase()]
    .filter(Boolean)
    .sort()
    .join('+');
}

/**
 * Checks if the event is a valid shortcut event.
 * A valid shortcut event is one that has at least one modifier key pressed
 * (ctrl, shift, alt, meta) or the Escape key.
 */
function isValidShortcutEvent(e: KeyboardEvent): boolean {
  return e.ctrlKey || e.shiftKey || e.altKey || e.metaKey || (!!e.key && e.key.toLowerCase() === 'escape');
}

function isMatchingShortcut(
  shortcuts: Shortcuts,
  e: KeyboardEvent,
): {
  matchedShortcut: string | undefined;
  isOverridable: boolean;
} {
  if (isValidShortcutEvent(e)) {
    const pressedShortcut = eventToCanonicalShortcut(e);
    const isMatching = shortcuts.has(pressedShortcut);
    if (isMatching) {
      return {
        matchedShortcut: pressedShortcut,
        isOverridable: overridableShortcuts.has(pressedShortcut),
      };
    }
  }

  return {
    matchedShortcut: undefined,
    isOverridable: false,
  };
}

function updateHostShortcuts(data: HostShortcutsResponse): void {
  hostShortcuts.clear();
  data.shortcuts.forEach((shortcut: string) => {
    hostShortcuts.add(normalizeShortcut(shortcut));
  });

  overridableShortcuts.clear();
  data.overridableShortcuts.forEach((shortcut: string) => {
    overridableShortcuts.add(normalizeShortcut(shortcut));
  });
}

class HostShortcutsResponseHandler extends ResponseHandler<HostShortcutsResponse, HostShortcutsResponse> {
  public validate(response: HostShortcutsResponse): boolean {
    return response && Array.isArray(response.shortcuts) && Array.isArray(response.overridableShortcuts);
  }

  public deserialize(response: HostShortcutsResponse): HostShortcutsResponse {
    return response;
  }
}
/**
 * register a handler to be called when shortcuts are updated in the host.
 */
function registerOnHostShortcutChangedHandler(handler: (hostShortcuts: HostShortcutsResponse) => void): void {
  registerHandler(
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.ShortcutRelay_HostShortcutChanged),
    ApiName.ShortcutRelay_HostShortcutChanged,
    handler,
  );
}

function keydownHandler(event: KeyboardEvent): void {
  // Skip if the event target is within an element that has the `data-disable-shortcuts-forwarding` attribute
  if ((event.target as HTMLElement).closest(`[${DISABLE_SHORTCUT_FORWARDING_ATTRIBUTE}]`)) {
    return;
  }

  const { matchedShortcut, isOverridable } = isMatchingShortcut(hostShortcuts, event);

  if (!matchedShortcut) {
    return; // ignore unrelated events
  }

  if (isOverridable && overridableShortcutHandler) {
    const shouldOverride = overridableShortcutHandler(event, { matchedShortcut });
    if (shouldOverride) {
      return; // Do not forward shortcut to host
    }
  }

  /* Forward shortcut to host */
  const payload = new SerializableKeyboardEvent(event);

  callFunctionInHost(
    ApiName.ShortcutRelay_ForwardShortcutEvent,
    [payload],
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.ShortcutRelay_ForwardShortcutEvent),
  );

  event.preventDefault();
  event.stopImmediatePropagation();
}

/* ------------------------------------------------------------------ */
/* In-memory                                                          */
/* ------------------------------------------------------------------ */
/**
 * @hidden
 * @internal
 * Stores the shortcuts that can be overridden by the app.
 */
const overridableShortcuts: Set<string> = new Set();

/**
 * @hidden
 * @internal
 * Stores the shortcuts that are enabled in host.
 * This set is populated when the host sends the list of enabled shortcuts.
 */
const hostShortcuts: Set<string> = new Set();

/**
 * @hidden
 * @internal
 * Stores the handler for overridable shortcuts.
 */
let overridableShortcutHandler: OverridableShortcutHandler | undefined = undefined;

/**
 * @hidden
 * @internal
 * Flag to indicate if the shortcut relay capability has been enabled, so that we do not register the event listener multiple times.
 */
let isShortcutRelayCapabilityEnabled = false;

/* ------------------------------------------------------------------ */
/* API                                                                */
/* ------------------------------------------------------------------ */

/**
 * Replace the current overridable-shortcut handler.
 *
 * • Pass `undefined` to remove an existing handler.
 * • Returns the previous handler so callers can restore it if needed.
 *
 * @beta
 */
export function setOverridableShortcutHandler(
  handler: OverridableShortcutHandler | undefined,
): OverridableShortcutHandler | undefined {
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  const previous = overridableShortcutHandler;
  overridableShortcutHandler = handler;
  return previous;
}

/**
 * Reset the state of the shortcut relay capability.
 * This is useful for tests to ensure a clean state.
 *
 * @beta
 */
export function resetIsShortcutRelayCapabilityEnabled(): void {
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  isShortcutRelayCapabilityEnabled = false;
  hostShortcuts.clear();
  overridableShortcuts.clear();
  overridableShortcutHandler = undefined;
  document.removeEventListener('keydown', keydownHandler, { capture: true });
}

/**
 * Enable capability to support host shortcuts.
 *
 * @beta
 */
export async function enableShortcutRelayCapability(): Promise<void> {
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  /* 1. Ask host for the list of enabled shortcuts */
  const response = await callFunctionInHostAndHandleResponse(
    ApiName.ShortcutRelay_GetHostShortcuts,
    [],
    new HostShortcutsResponseHandler(),
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.ShortcutRelay_GetHostShortcuts),
  );
  updateHostShortcuts(response);

  /* 2. Global key-down handler */
  if (!isShortcutRelayCapabilityEnabled) {
    document.addEventListener('keydown', keydownHandler, { capture: true });
  }
  isShortcutRelayCapabilityEnabled = true;

  /* 3. Register handler for host shortcut updates */
  registerOnHostShortcutChangedHandler((hostShortcuts: HostShortcutsResponse) => {
    updateHostShortcuts(hostShortcuts);
  });
}

/**
 * Checks if shortcutRelay capability is supported by the host
 * @returns boolean to represent whether the shortcutRelay capability is supported
 *
 * @throws Error if {@link app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.shortcutRelay ? true : false;
}

/**
 * Allow apps to define zones where shortcuts should not be forwarded to the host.
 * This is useful for input fields for password where shortcuts should not trigger host actions.
 *
 * @beta
 */
export const DISABLE_SHORTCUT_FORWARDING_ATTRIBUTE = 'data-disable-shortcuts-forwarding';
