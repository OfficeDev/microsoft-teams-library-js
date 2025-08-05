/**
 * Allows host shortcuts to function in your application by forwarding keyboard shortcuts to the host.
 *
 * This functionality is in Beta.
 * @beta
 * @module
 */

import { callFunctionInHost, callFunctionInHostAndHandleResponse } from '../internal/communication';
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

export type OverridableShortcutHandlerData = {
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

function isMatchingShortcut(
  shortcuts: Shortcuts,
  e: KeyboardEvent,
): {
  matchedShortcut: string | undefined;
  isOverridable: boolean;
} {
  const pressedShortcut = eventToCanonicalShortcut(e);
  const isMatching = shortcuts.has(pressedShortcut);
  if (isMatching) {
    return {
      matchedShortcut: pressedShortcut,
      isOverridable: overridableShortcuts.has(pressedShortcut),
    };
  }
  return {
    matchedShortcut: undefined,
    isOverridable: false,
  };
}

class HostShortcutsResponseHandler extends ResponseHandler<HostShortcutsResponse, HostShortcutsResponse> {
  public validate(response: HostShortcutsResponse): boolean {
    return response && Array.isArray(response.shortcuts) && Array.isArray(response.overridableShortcuts);
  }

  public deserialize(response: HostShortcutsResponse): HostShortcutsResponse {
    this.onSuccess(response);
    return response;
  }

  /** Persist the received shortcuts in memory */
  private onSuccess(response: HostShortcutsResponse): void {
    hostShortcuts.clear();
    response.shortcuts.forEach((shortcut: string) => {
      hostShortcuts.add(normalizeShortcut(shortcut));
    });
    overridableShortcuts.clear();
    response.overridableShortcuts.forEach((shortcut: string) => {
      overridableShortcuts.add(normalizeShortcut(shortcut));
    });
  }
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
  const previous = overridableShortcutHandler;
  overridableShortcutHandler = handler;
  return previous;
}

/**
 * Enable capability to support host shortcuts.
 *
 * @beta
 */
export function enableShortcutRelayCapability(): void {
  ensureInitialized(runtime);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  /* 1. Ask host for the list of enabled shortcuts */
  callFunctionInHostAndHandleResponse(
    ApiName.ShortcutRelay_RequestHostShortcuts,
    [],
    new HostShortcutsResponseHandler(),
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.ShortcutRelay_RequestHostShortcuts),
  );

  /* 2. Global key-down handler */
  document.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
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
    },
    { capture: true },
  );
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
