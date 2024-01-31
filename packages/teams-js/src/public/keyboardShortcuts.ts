import { sendAndHandleSdkErrorWithVersion } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const keyboardShortcutTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Namespace to interact with the geoLocation module-specific part of the SDK. This is the newer version of location module.
 *
 * @beta
 */
export namespace keyboardShortcuts {
  /**
   * Enum for keyboard shortcut modifiers
   */
  export enum KeyboardShortcutModifier {
    /**
     * Alt key held
     */
    Alt = 'alt',
    /**
     * Control key held
     */
    Control = 'control',
    /**
     * Shift key held
     */
    Shift = 'shift',
    /**
     * Windows key held
     */
    Windows = 'windows',
  }

  /**
   * Enum for keyboard shortcut event types
   */
  export enum KeyboardShortcutEventType {
    /**
     * Key down event
     */
    KeyDown = 'keydown',
    /**
     * Key up event
     */
    KeyUp = 'keyup',
    /**
     * Key press event
     */
    KeyPress = 'keypress',
  }

  /**
   * Data struture to represent the location information
   *
   * @beta
   */
  export interface HostKeyboardShortcut {
    /**
     * String representing which key was pressed. Should match the strings in the KeyboardEvent.key property
     */
    key: string;
    /**
     * Event type
     */
    eventType: KeyboardShortcutEventType;
    /**
     * Modifier key(s) held
     */
    modifier?: KeyboardShortcutModifier; // this should be an array since multiple modifiers could be held at the same time
  }

  /**
   * Fetches current user coordinates
   * @returns Promise that will resolve with {@link geoLocation.Location} object or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
   *
   * @beta
   */
  export function getKeyboardEventsHostCanHandle(): Promise<HostKeyboardShortcut[]> {
    // should probably be "wants to handle"
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    return sendAndHandleSdkErrorWithVersion(
      getApiVersionTag(
        keyboardShortcutTelemetryVersionNumber,
        ApiName.KeyboardShortcuts_GetKeyboardEventsHostCanHandle,
      ),
      'keyboardShortcuts.getKeyboardEventsHostCanHandle',
    );
  }

  /**
   *
   * @param shortcut
   * @returns
   */
  export function sendKeyboardShortcutToHost(shortcut: HostKeyboardShortcut): Promise<void> {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    return sendAndHandleSdkErrorWithVersion(
      getApiVersionTag(keyboardShortcutTelemetryVersionNumber, ApiName.KeyboardShortcuts_SendKeyboardShortcutToHost),
      'keyboardShortcuts.sendKeyboardShortcutToHost',
      { shortcut: shortcut },
    );
  }

  /**
   * Checks if keyboardShortcuts capability is supported by the host
   * @returns boolean to represent whether keyboardShortcuts is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.keyboardShortcuts ? true : false;
  }
}
