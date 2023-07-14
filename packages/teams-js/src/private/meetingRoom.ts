import { sendAndHandleSdkError } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace meetingRoom {
  /**
   * @hidden
   *
   * Data structure to represent a meeting room.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface MeetingRoomInfo {
    /**
     * @hidden
     * Endpoint id of the meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    endpointId: string;
    /**
     * @hidden
     * Device name of the meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    deviceName: string;
    /**
     * @hidden
     * Client type of the meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    clientType: string;
    /**
     * @hidden
     * Client version of the meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    clientVersion: string;
  }

  /**
   * @hidden
   * Type of Media control capabilities of a meeting room.
   */
  type MediaControls = 'toggleMute' | 'toggleCamera' | 'toggleCaptions' | 'volume';

  /**
   * @hidden
   * Types of Stage Layout control capabilities of a meeting room.
   */

  type StageLayoutControls =
    | 'showVideoGallery'
    | 'showContent'
    | 'showVideoGalleryAndContent'
    | 'showLargeGallery'
    | 'showTogether';

  /**
   * @hidden
   * Types of Meeting Control capabilities of a meeting room.
   */

  type MeetingControls = 'leaveMeeting';

  /**
   * @hidden
   * Types of Stage Layout State of a meeting room.
   */

  type StageLayoutStates = 'Gallery' | 'Content + gallery' | 'Content' | 'Large gallery' | 'Together mode';

  /**
   * @hidden
   * Data structure to represent capabilities of a meeting room.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface MeetingRoomCapability {
    /**
     * @hidden
     * Media control capabilities, value can be "toggleMute", "toggleCamera", "toggleCaptions", "volume".
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    mediaControls: MediaControls[];
    /**
     * @hidden
     * Main stage layout control capabilities, value can be "showVideoGallery", "showContent", "showVideoGalleryAndContent", "showLargeGallery", "showTogether".
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    stageLayoutControls: StageLayoutControls[];
    /**
     * @hidden
     * Meeting control capabilities, value can be "leaveMeeting".
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    meetingControls: MeetingControls[];
  }

  /**
   * @hidden
   * Data structure to represent states of a meeting room.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface MeetingRoomState {
    /**
     * @hidden
     * Current mute state, true: mute, false: unmute.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    toggleMute: boolean;
    /**
     * @hidden
     * Current camera state, true: camera on, false: camera off.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    toggleCamera: boolean;
    /**
     * @hidden
     * Current captions state, true: captions on, false: captions off.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    toggleCaptions: boolean;
    /**
     * @hidden
     * Current main stage layout state, value can be one of "Gallery", "Content + gallery", "Content", "Large gallery" and "Together mode".
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    stageLayout: StageLayoutStates;
    /**
     * @hidden
     * Current leaveMeeting state, true: leave, false: no-op.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    leaveMeeting: boolean;
  }

  /**
   * @hidden
   * Fetch the meeting room info that paired with current client.
   *
   * @returns Promise resolved with meeting room info or rejected with SdkError value
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function getPairedMeetingRoomInfo(): Promise<MeetingRoomInfo> {
    return new Promise<MeetingRoomInfo>((resolve) => {
      ensureInitialized(runtime);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('meetingRoom.getPairedMeetingRoomInfo'));
    });
  }

  /**
   * @hidden
   * Send a command to paired meeting room.
   *
   * @param commandName The command name.
   * @returns Promise resolved upon completion or rejected with SdkError value
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function sendCommandToPairedMeetingRoom(commandName: string): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!commandName || commandName.length == 0) {
        throw new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty');
      }
      ensureInitialized(runtime);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('meetingRoom.sendCommandToPairedMeetingRoom', commandName));
    });
  }

  /**
   * @hidden
   * Registers a handler for meeting room capabilities update.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the capabilities of meeting room update.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerMeetingRoomCapabilitiesUpdateHandler(
    handler: (capabilities: MeetingRoomCapability) => void,
  ): void {
    if (!handler) {
      throw new Error('[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('meetingRoom.meetingRoomCapabilitiesUpdate', (capabilities: MeetingRoomCapability) => {
      ensureInitialized(runtime);
      handler(capabilities);
    });
  }

  /**
   * @hidden
   * Hide from docs
   * Registers a handler for meeting room states update.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the states of meeting room update.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerMeetingRoomStatesUpdateHandler(handler: (states: MeetingRoomState) => void): void {
    if (!handler) {
      throw new Error('[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('meetingRoom.meetingRoomStatesUpdate', (states: MeetingRoomState) => {
      ensureInitialized(runtime);
      handler(states);
    });
  }

  /**
   * @hidden
   *
   * Checks if the meetingRoom capability is supported by the host
   * @returns boolean to represent whether the meetingRoom capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.meetingRoom ? true : false;
  }
}
