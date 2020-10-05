import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { MeetingRoomCapability, MeetingRoomInfo, MeetingRoomState } from './interfaces';

export namespace meeting {
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
  export function getPairedMeetingRoomInfo(callback: (meetingRoomInfo: MeetingRoomInfo) => void): void {
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
  export function sendCommandToPairedMeetingRoom(
    commandName: string,
    callback: (errorCode: number, message?: string) => void,
  ): void {
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
      sendMessageRequestToParent('meeting.handleMeetingRoomCapabilitiesUpdate', [capabilities]);
    }
  }

  function handleMeetingRoomStatesUpdate(states: MeetingRoomState): void {
    if (meetingRoomStatesUpdateHandler != null) {
      ensureInitialized();
      meetingRoomStatesUpdateHandler(states);
      sendMessageRequestToParent('meeting.handleMeetingRoomStatesUpdate', [states]);
    }
  }
}
