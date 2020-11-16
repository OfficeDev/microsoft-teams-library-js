import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from '../public/interfaces';

export namespace meetingRoom {
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
   * Enum used to indicate meeting room capabilities.
   */
  export enum Capability {
    /**
     * Media control capability: toggle mute.
     */
    toggleMute = 'toggleMute',
    /**
     * Media control capability: toggle camera.
     */
    toggleCamera = 'toggleCamera',
    /**
     * Media control capability: toggle captions.
     */
    toggleCaptions = 'toggleCaptions',
    /**
     * Media control capability: volume ajustion.
     */
    volume = 'volume',
    /**
     * Stage layout control capability: show gallery mode.
     */
    showVideoGallery = 'showVideoGallery',
    /**
     * Stage layout control capability: show content mode.
     */
    showContent = 'showContent',
    /**
     * Stage layout control capability: show content + gallery mode.
     */
    showVideoGalleryAndContent = 'showVideoGalleryAndContent',
    /**
     * Stage layout control capability: show laryge gallery mode.
     */
    showLargeGallery = 'showLargeGallery',
    /**
     * Stage layout control capability: show together mode.
     */
    showTogether = 'showTogether',
    /**
     * Meeting control capability: leave meeting.
     */
    leaveMeeting = 'leaveMeeting',
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

  GlobalVars.handlers['meetingRoom.meetingRoomCapabilitiesUpdate'] = handleMeetingRoomCapabilitiesUpdate;
  GlobalVars.handlers['meetingRoom.meetingRoomStatesUpdate'] = handleMeetingRoomStatesUpdate;

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
    const messageId = sendMessageRequestToParent('meetingRoom.getPairedMeetingRoomInfo');
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
      throw new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('meetingRoom.sendCommandToPairedMeetingRoom', [commandName]);
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
      throw new Error('[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.meetingRoomCapabilitiesUpdateHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['meetingRoom.meetingRoomCapabilitiesUpdate']);
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
      throw new Error('[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.meetingRoomStatesUpdateHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['meetingRoom.meetingRoomStatesUpdate']);
  }

  function handleMeetingRoomCapabilitiesUpdate(capabilities: MeetingRoomCapability): void {
    if (GlobalVars.meetingRoomCapabilitiesUpdateHandler != null) {
      ensureInitialized();
      GlobalVars.meetingRoomCapabilitiesUpdateHandler(capabilities);
    }
  }

  function handleMeetingRoomStatesUpdate(states: MeetingRoomState): void {
    if (GlobalVars.meetingRoomStatesUpdateHandler != null) {
      ensureInitialized();
      GlobalVars.meetingRoomStatesUpdateHandler(states);
    }
  }
}
