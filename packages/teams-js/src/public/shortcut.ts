import { callFunctionInHost, callFunctionInHostAndHandleResponse } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { ResponseHandler } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type TeamsShortcuts = Map<string, string[]>;

type TeamsShortcutResponse = {
  shortcuts: TeamsShortcuts;
  overridableShortcuts: string[];
};

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.teamsCore ? true : false;
}

function getMatchingShortcut(
  shortcuts: TeamsShortcuts,
  e: KeyboardEvent,
): { id: string; segments: string[] } | undefined {
  for (const [id, keyCombinations] of shortcuts.entries()) {
    for (const keyCombination of keyCombinations) {
      const segments = keyCombination.toLowerCase().split('+');
      if (
        // TODO update the matching logic to also verify segments length against event
        segments.every((key) => {
          switch (key) {
            case 'ctrl':
              return e.ctrlKey;
            case 'shift':
              return e.shiftKey;
            case 'alt':
            case 'option':
              return e.altKey;
            case 'meta':
            case 'cmd':
              return e.metaKey;
            default:
              return e.key.toLowerCase() === key;
          }
        })
      ) {
        return { id, segments };
      }
    }
  }
  return undefined;
}

const overridableShortcuts: Set<string> = new Set();
/**
 * A map of shortcut command id and the list of key combinations that trigger it.
 * The key combinations are stored in lower-case, sorted order.
 * For example, "SlashCommands" shortcut will be stored as ["ctrl+/", "ctrl+shift+/"].
 */
const teamsShortcuts: TeamsShortcuts = new Map();

class GetTeamsShortcutResponseHandler extends ResponseHandler<TeamsShortcutResponse, TeamsShortcutResponse> {
  public validate(response: TeamsShortcutResponse): boolean {
    return response && response.shortcuts instanceof Map && Array.isArray(response.overridableShortcuts);
  }

  public deserialize(response: TeamsShortcutResponse): TeamsShortcutResponse {
    this.onSuccess(response);
    return response;
  }

  /** Persist the received shortcuts in memory */
  private onSuccess(response: TeamsShortcutResponse): void {
    teamsShortcuts.clear();
    response.shortcuts.forEach((value: string[], key: string) => {
      teamsShortcuts.set(key, value);
    });
    overridableShortcuts.clear();
    response.overridableShortcuts.forEach((shortcut: string) => {
      overridableShortcuts.add(shortcut);
    });
  }
}

/* ------------------------------------------------------------------ */
/* API                                                                */
/* ------------------------------------------------------------------ */

type OverrideTeamsShortcutFunctionType = (shortcut: { id: string; segments: string[] }) => boolean;

/**
 * Enable capability to support Teams shortcuts.
 */
export function enableTeamsShortcutCapability(onOverridableShortcut?: OverrideTeamsShortcutFunctionType): void {
  if (!GlobalVars.teamsShortcutCapabilityEnabled) {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    GlobalVars.teamsShortcutCapabilityEnabled = true;

    /* 1. Ask host for the list of enabled shortcuts */
    callFunctionInHostAndHandleResponse(
      ApiName.App_RequestTeamsShortcut,
      [],
      new GetTeamsShortcutResponseHandler(),
      getApiVersionTag(ApiVersionNumber.V_2, ApiName.App_RequestTeamsShortcut),
    );

    /* 2. Global key-down handler */
    document.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        const matchingShortcut = getMatchingShortcut(teamsShortcuts, event);

        if (!matchingShortcut) {
          return; // ignore unrelated events
        }

        if (onOverridableShortcut && overridableShortcuts.has(matchingShortcut?.id)) {
          const shouldOverride = onOverridableShortcut({
            id: matchingShortcut.id,
            segments: matchingShortcut.segments,
          });
          if (shouldOverride) {
            return; // Do not forward shortcut to host
          }
        }

        /* Forward shortcut to host */
        const payload = JSON.stringify({
          type: event.type,
          matchingShortcut: matchingShortcut,
          key: event.key,
          code: event.code,
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
          repeat: event.repeat,
          timeStamp: event.timeStamp,
        });

        callFunctionInHost(
          ApiName.App_ProcessShortcutKeydown,
          [payload],
          getApiVersionTag(ApiVersionNumber.V_2, ApiName.App_ProcessShortcutKeydown),
        );

        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      { capture: true },
    );
  }
}
