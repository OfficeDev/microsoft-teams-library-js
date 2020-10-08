import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from '../public/interfaces';

export namespace meeting {
  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent a meeting room.
   */
  export interface MeetingRoomInfo {
    /**
     * Endpoint id of the meeting room.
     */
    endpointId: string;
    /**
     * Device name of the meeting room.
     */
    deviceName: string;
    /**
     * Client type of the meeting room.
     */
    clientType: string;
    /**
     * Client version of the meeting room.
     */
    clientVersion: string;
  }
  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent capabilities of a meeting room.
   */
  export interface MeetingRoomCapability {
    /**
     * Media control capabilities, value can be "toggleMute", "toggleCamera", "toggleCaptions", "volume".
     */
    mediaControls: string[];
    /**
     * Main stage layout control capabilities, value can be "showVideoGallery", "showContent", "showVideoGalleryAndContent", "showLargeGallery", "showTogether".
     */
    stageLayoutControls: string[];
    /**
     * Meeting control capabilities, value can be "leaveMeeting".
     */
    meetingControls: string[];
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent states of a meeting room.
   */
  export interface MeetingRoomState {
    /**
     * Current mute state, true: mute, false: unmute.
     */
    toggleMute: boolean;
    /**
     * Current camera state, true: camera on, false: camera off.
     */
    toggleCamera: boolean;
    /**
     * Current captions state, true: captions on, false: captions off.
     */
    toggleCaptions: boolean;
    /**
     * Current main stage layout state, value can be one of "Gallery", "Content + gallery", "Content", "Large gallery" and "Together mode".
     */
    stageLayout: string;
    /**
     * Current leaveMeeting state, true: leave, false: no-op.
     */
    leaveMeeting: boolean;
  }

  let meetingRoomCapabilitiesUpdateHandler: (capabilities: MeetingRoomCapability) => void;
  GlobalVars.handlers['meeting.meetingRoomCapabilitiesUpdate'] = handleMeetingRoomCapabilitiesUpdate;
  let meetingRoomStatesUpdateHandler: (states: MeetingRoomState) => void;
  GlobalVars.handlers['meeting.meetingRoomStatesUpdate'] = handleMeetingRoomStatesUpdate;

  /**
   * @private
   * Hide from docs
   *
   * Fetch the meeting room info that paired with current client.
   * @param callback Callback to invoke when the meeting room info is fetched.
   */
  export function getPairedMeetingRoomInfo(
    callback: (sdkError: SdkError, meetingRoomInfo: MeetingRoomInfo) => void,
  ): void {
    ensureInitialized();
    const messageId = sendMessageRequestToParent('meeting.getPairedMeetingRoomInfo');
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Send a command to paired meeting room.
   * @param commandName The command name.
   * @param callback Callback to invoke when the command response returns.
   */
  export function sendCommandToPairedMeetingRoom(commandName: string, callback: (sdkError: SdkError) => void): void {
    if (!commandName || commandName.length == 0) {
      throw new Error('[meeting.sendCommandToPairedMeetingRoom] Command name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[meeting.sendCommandToPairedMeetingRoom] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('meeting.sendCommandToPairedMeetingRoom', [commandName]);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Registers a handler for meeting room capabilities update.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the capabilities of meeting room update.
   */
  export function registerMeetingRoomCapabilitiesUpdateHandler(
    handler: (capabilities: MeetingRoomCapability) => void,
  ): void {
    if (!handler) {
      throw new Error('[meeting.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized();
    meetingRoomCapabilitiesUpdateHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['meeting.meetingRoomCapabilitiesUpdate']);
  }

  /**
   * @private
   * Hide from docs
   * Registers a handler for meeting room states update.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the states of meeting room update.
   */
  export function registerMeetingRoomStatesUpdateHandler(handler: (states: MeetingRoomState) => void): void {
    if (!handler) {
      throw new Error('[meeting.registerMeetingRoomStatesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized();
    meetingRoomStatesUpdateHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['meeting.meetingRoomStatesUpdate']);
  }

  function handleMeetingRoomCapabilitiesUpdate(capabilities: MeetingRoomCapability): void {
    if (meetingRoomCapabilitiesUpdateHandler != null) {
      ensureInitialized();
      meetingRoomCapabilitiesUpdateHandler(capabilities);
    }
  }

  function handleMeetingRoomStatesUpdate(states: MeetingRoomState): void {
    if (meetingRoomStatesUpdateHandler != null) {
      ensureInitialized();
      meetingRoomStatesUpdateHandler(states);
    }
  }
}
