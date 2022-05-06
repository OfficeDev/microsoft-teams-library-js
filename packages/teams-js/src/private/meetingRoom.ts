import { sendAndHandleSdkError } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

export namespace meetingRoom {
  /**
   * @hidden
   * Hide from docs
   * ------
   * Data structure to represent a meeting room.
   */
  export interface MeetingRoomInfo {
    /**
     * @hidden
     * Endpoint id of the meeting room.
     */
    endpointId: string;
    /**
     * @hidden
     * Device name of the meeting room.
     */
    deviceName: string;
    /**
     * @hidden
     * Client type of the meeting room.
     */
    clientType: string;
    /**
     * @hidden
     * Client version of the meeting room.
     */
    clientVersion: string;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Type of Media control capabilities of a meeting room.
   */
  type MediaControls = 'toggleMute' | 'toggleCamera' | 'toggleCaptions' | 'volume';

  /**
   * @hidden
   * Hide from docs
   * ------
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
   * Hide from docs
   * ------
   * Types of Meeting Control capabilities of a meeting room.
   */

  type MeetingControls = 'leaveMeeting';

  /**
   * @hidden
   * Hide from docs
   * ------
   * Types of Stage Layout State of a meeting room.
   */

  type StageLayoutStates = 'Gallery' | 'Content + gallery' | 'Content' | 'Large gallery' | 'Together mode';

  /**
   * @hidden
   * Hide from docs
   * ------
   * Data structure to represent capabilities of a meeting room.
   */
  export interface MeetingRoomCapability {
    /**
     * @hidden
     * Media control capabilities, value can be "toggleMute", "toggleCamera", "toggleCaptions", "volume".
     */
    mediaControls: MediaControls[];
    /**
     * @hidden
     * Main stage layout control capabilities, value can be "showVideoGallery", "showContent", "showVideoGalleryAndContent", "showLargeGallery", "showTogether".
     */
    stageLayoutControls: StageLayoutControls[];
    /**
     * @hidden
     * Meeting control capabilities, value can be "leaveMeeting".
     */
    meetingControls: MeetingControls[];
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Data structure to represent states of a meeting room.
   */
  export interface MeetingRoomState {
    /**
     * @hidden
     * Current mute state, true: mute, false: unmute.
     */
    toggleMute: boolean;
    /**
     * @hidden
     * Current camera state, true: camera on, false: camera off.
     */
    toggleCamera: boolean;
    /**
     * @hidden
     * Current captions state, true: captions on, false: captions off.
     */
    toggleCaptions: boolean;
    /**
     * @hidden
     * Current main stage layout state, value can be one of "Gallery", "Content + gallery", "Content", "Large gallery" and "Together mode".
     */
    stageLayout: StageLayoutStates;
    /**
     * @hidden
     * Current leaveMeeting state, true: leave, false: no-op.
     */
    leaveMeeting: boolean;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Fetch the meeting room info that paired with current client.
   *
   * @returns Promise resolved with meeting room info or rejected with SdkError value
   */
  export function getPairedMeetingRoomInfo(): Promise<MeetingRoomInfo> {
    return new Promise<MeetingRoomInfo>(resolve => {
      ensureInitialized();
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('meetingRoom.getPairedMeetingRoomInfo'));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Send a command to paired meeting room.
   *
   * @param commandName The command name.
   * @returns Promise resolved upon completion or rejected with SdkError value
   */
  export function sendCommandToPairedMeetingRoom(commandName: string): Promise<void> {
    return new Promise<void>(resolve => {
      if (!commandName || commandName.length == 0) {
        throw new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty');
      }
      ensureInitialized();
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('meetingRoom.sendCommandToPairedMeetingRoom', commandName));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Registers a handler for meeting room capabilities update.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the capabilities of meeting room update.
   */
  export function registerMeetingRoomCapabilitiesUpdateHandler(
    handler: (capabilities: MeetingRoomCapability) => void,
  ): void {
    if (!handler) {
      throw new Error('[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('meetingRoom.meetingRoomCapabilitiesUpdate', (capabilities: MeetingRoomCapability) => {
      ensureInitialized();
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
   */
  export function registerMeetingRoomStatesUpdateHandler(handler: (states: MeetingRoomState) => void): void {
    if (!handler) {
      throw new Error('[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('meetingRoom.meetingRoomStatesUpdate', (states: MeetingRoomState) => {
      ensureInitialized();
      handler(states);
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.meetingRoom ? true : false;
  }
}
