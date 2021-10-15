import { sendAndHandleSdkError } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';

/**
 * @alpha
 */
export namespace meetingRoom {
  /**
   * @privateRemarks
   * Hide from docs
   * ------
   * Data structure to represent a meeting room.
   */
  export interface MeetingRoomInfo {
    /**
     * @privateRemarks
     * Endpoint id of the meeting room.
     */
    endpointId: string;
    /**
     * @privateRemarks
     * Device name of the meeting room.
     */
    deviceName: string;
    /**
     * @privateRemarks
     * Client type of the meeting room.
     */
    clientType: string;
    /**
     * @privateRemarks
     * Client version of the meeting room.
     */
    clientVersion: string;
  }

  /**
   * @privateRemarks
   * Hide from docs
   * ------
   * Enum used to indicate meeting room capabilities.
   */
  export enum Capability {
    /**
     * @privateRemarks
     * Media control capability: toggle mute.
     */
    toggleMute = 'toggleMute',
    /**
     * @privateRemarks
     * Media control capability: toggle camera.
     */
    toggleCamera = 'toggleCamera',
    /**
     * @privateRemarks
     * Media control capability: toggle captions.
     */
    toggleCaptions = 'toggleCaptions',
    /**
     * @privateRemarks
     * Media control capability: volume ajustion.
     */
    volume = 'volume',
    /**
     * @privateRemarks
     * Stage layout control capability: show gallery mode.
     */
    showVideoGallery = 'showVideoGallery',
    /**
     * @privateRemarks
     * Stage layout control capability: show content mode.
     */
    showContent = 'showContent',
    /**
     * @privateRemarks
     * Stage layout control capability: show content + gallery mode.
     */
    showVideoGalleryAndContent = 'showVideoGalleryAndContent',
    /**
     * @privateRemarks
     * Stage layout control capability: show laryge gallery mode.
     */
    showLargeGallery = 'showLargeGallery',
    /**
     * @privateRemarks
     * Stage layout control capability: show together mode.
     */
    showTogether = 'showTogether',
    /**
     * @privateRemarks
     * Meeting control capability: leave meeting.
     */
    leaveMeeting = 'leaveMeeting',
  }

  /**
   * @privateRemarks
   * Hide from docs
   * ------
   * Data structure to represent capabilities of a meeting room.
   */
  export interface MeetingRoomCapability {
    /**
     * @privateRemarks
     * Media control capabilities, value can be "toggleMute", "toggleCamera", "toggleCaptions", "volume".
     */
    mediaControls: string[];
    /**
     * @privateRemarks
     * Main stage layout control capabilities, value can be "showVideoGallery", "showContent", "showVideoGalleryAndContent", "showLargeGallery", "showTogether".
     */
    stageLayoutControls: string[];
    /**
     * @privateRemarks
     * Meeting control capabilities, value can be "leaveMeeting".
     */
    meetingControls: string[];
  }

  /**
   * @privateRemarks
   * Hide from docs
   * ------
   * Data structure to represent states of a meeting room.
   */
  export interface MeetingRoomState {
    /**
     * @privateRemarks
     * Current mute state, true: mute, false: unmute.
     */
    toggleMute: boolean;
    /**
     * @privateRemarks
     * Current camera state, true: camera on, false: camera off.
     */
    toggleCamera: boolean;
    /**
     * @privateRemarks
     * Current captions state, true: captions on, false: captions off.
     */
    toggleCaptions: boolean;
    /**
     * @privateRemarks
     * Current main stage layout state, value can be one of "Gallery", "Content + gallery", "Content", "Large gallery" and "Together mode".
     */
    stageLayout: string;
    /**
     * @privateRemarks
     * Current leaveMeeting state, true: leave, false: no-op.
     */
    leaveMeeting: boolean;
  }
  /**
   * @privateRemarks
   * Hide from docs
   * ------
   * Fetch the meeting room info that paired with current client.
   *
   * @returns Promise resolved with meeting room info or rejected with SdkError value
   */
  export function getPairedMeetingRoomInfo(): Promise<MeetingRoomInfo> {
    return new Promise<MeetingRoomInfo>(resolve => {
      ensureInitialized();
      resolve(sendAndHandleSdkError('meetingRoom.getPairedMeetingRoomInfo'));
    });
  }

  /**
   * @privateRemarks
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
      resolve(sendAndHandleSdkError('meetingRoom.sendCommandToPairedMeetingRoom', commandName));
    });
  }

  /**
   * @privateRemarks
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
    registerHandler('meetingRoom.meetingRoomCapabilitiesUpdate', (capabilities: MeetingRoomCapability) => {
      ensureInitialized();
      handler(capabilities);
    });
  }

  /**
   * @privateRemarks
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
    registerHandler('meetingRoom.meetingRoomStatesUpdate', (states: MeetingRoomState) => {
      ensureInitialized();
      handler(states);
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.meetingRoom ? true : false;
  }
}
