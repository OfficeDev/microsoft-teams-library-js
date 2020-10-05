import { Utils } from '../utils';
import { FramelessPostMocks } from '../framelessPostMocks';
import { meeting } from '../../src/private/meeting'
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { MeetingRoomCapability, MeetingRoomInfo, MeetingRoomState } from '../../src/private/interfaces';

describe('meetings', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils()
  const meetingRoomInfo: MeetingRoomInfo = {endpointId: "123-456", deviceName: "conference room 001",clientType: "norden", clientVersion: "v-2020-09-28"};
  const meetingRoomCapability: MeetingRoomCapability = {mediaControls: ["toggleMute", "toggleCamera"], stageLayoutControls: ["showVideoGallery", "showContent"], meetingControls: []};
  const meetingRoomState: MeetingRoomState = {toggleMute: true, toggleCamera: false, toggleCaptions: false, stageLayout: "Gallery", leaveMeeting: false};

  beforeEach(() => {
    mobilePlatformMock.messages = [];
    desktopPlatformMock.messages = [];

    // Set a mock window for testing
    _initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  let emptyCallback = () => {};

  describe('getPairedMeetingRoomInfo', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        meeting.getPairedMeetingRoomInfo((meetingRoomInfo: MeetingRoomInfo) => {}),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get meeting room info on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedMeetingRoomInfo: MeetingRoomInfo = null;
      meeting.getPairedMeetingRoomInfo((meetingRoomInfo: MeetingRoomInfo) => {
        handlerInvoked = true;
        returnedMeetingRoomInfo = meetingRoomInfo;
      });

      let message = mobilePlatformMock.findMessageByFunc('meeting.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);

      let callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [meetingRoomInfo]
        }
      } as DOMMessageEvent)

      expect(handlerInvoked).toBeTruthy();
      expect(returnedMeetingRoomInfo.endpointId).toBe(meetingRoomInfo.endpointId);
      expect(returnedMeetingRoomInfo.deviceName).toBe(meetingRoomInfo.deviceName);
      expect(returnedMeetingRoomInfo.clientType).toBe(meetingRoomInfo.clientType);
      expect(returnedMeetingRoomInfo.clientVersion).toBe(meetingRoomInfo.clientVersion);
    });

    it('should allow getPairedMeetingRoomInfo calls on desktop', () => {
      desktopPlatformMock.initializeWithContext('content');

      meeting.getPairedMeetingRoomInfo(emptyCallback);

      let message = desktopPlatformMock.findMessageByFunc('meeting.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });
  });

  describe('sendCommandToPairedMeetingRoom', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meeting.sendCommandToPairedMeetingRoom("mute", emptyCallback)).toThrowError(
        'The library has not yet been initialized'
      )
    });

    it('should not allow calls with null command name', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meeting.sendCommandToPairedMeetingRoom(null, emptyCallback)).toThrowError(
        '[meeting.sendCommandToPairedMeetingRoom] Command name cannot be null or empty'
      )
    });

    it('should not allow calls with empty command name', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meeting.sendCommandToPairedMeetingRoom("", emptyCallback)).toThrowError(
        '[meeting.sendCommandToPairedMeetingRoom] Command name cannot be null or empty'
      )
    });

    it('should not allow calls with null callback', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meeting.sendCommandToPairedMeetingRoom("mute", null)).toThrowError(
        '[meeting.sendCommandToPairedMeetingRoom] Callback cannot be null'
      )
    });

    it('should successfully send commands on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let error, msg;
      meeting.sendCommandToPairedMeetingRoom("mute", (errorCode: number, message?: string) => {
        handlerInvoked = true;
        error = errorCode;
        msg = message;
      });

      let message = mobilePlatformMock.findMessageByFunc('meeting.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');

      let callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [1, "command failed"]
        }
      } as DOMMessageEvent)

      expect(handlerInvoked).toBeTruthy();
      expect(error).toBe(1);
      expect(msg).toBe("command failed");
    });

    it('should successfully send commands on desktop', () => {
      desktopPlatformMock.initializeWithContext('content');

      meeting.sendCommandToPairedMeetingRoom("mute", emptyCallback);

      let message = desktopPlatformMock.findMessageByFunc('meeting.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');
    });
  });

  describe('registerMeetingRoomCapabilitiesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meeting.registerMeetingRoomCapabilitiesUpdateHandler(null)).toThrowError(
        '[meeting.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null'
      )
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meeting.registerMeetingRoomCapabilitiesUpdateHandler(emptyCallback)).toThrowError(
        'The library has not yet been initialized'
      )
    });

    it('should successful register capabilities update handler on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedCapabilities;
      meeting.registerMeetingRoomCapabilitiesUpdateHandler((capabilities: MeetingRoomCapability) => {
        handlerInvoked = true;
        returnedCapabilities = capabilities;
      });

      let messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meeting.meetingRoomCapabilitiesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: "meeting.meetingRoomCapabilitiesUpdate",
          args: [meetingRoomCapability]
        }
      } as DOMMessageEvent)

    
      expect(handlerInvoked).toBeTruthy();
      expect(returnedCapabilities.mediaControls).toBe(meetingRoomCapability.mediaControls);
      expect(returnedCapabilities.stageLayoutControls).toBe(meetingRoomCapability.stageLayoutControls);
      expect(returnedCapabilities.meetingControls).toBe(meetingRoomCapability.meetingControls);

      let messageForHandlerCallback = mobilePlatformMock.findMessageByFunc('meeting.handleMeetingRoomCapabilitiesUpdate');
      expect(messageForHandlerCallback).not.toBeNull();
      expect(messageForHandlerCallback.args.length).toBe(1);
      expect(messageForHandlerCallback.args[0]).toEqual(meetingRoomCapability);
    });

    it('should successful register capabilities update handler on desktop', () => {
      desktopPlatformMock.initializeWithContext('content');


      meeting.registerMeetingRoomCapabilitiesUpdateHandler(emptyCallback);

      let messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meeting.meetingRoomCapabilitiesUpdate');
    });
  });

  describe('registerMeetingRoomStatesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meeting.registerMeetingRoomStatesUpdateHandler(null)).toThrowError(
        '[meeting.registerMeetingRoomStatesUpdateHandler] Handler cannot be null'
      )
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meeting.registerMeetingRoomStatesUpdateHandler(emptyCallback)).toThrowError(
        'The library has not yet been initialized'
      )
    });

    it('should successful register states update handler on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedStates;
      meeting.registerMeetingRoomStatesUpdateHandler((states: MeetingRoomState) => {
        handlerInvoked = true;
        returnedStates = states;
      });

      let messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meeting.meetingRoomStatesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: "meeting.meetingRoomStatesUpdate",
          args: [meetingRoomState]
        }
      } as DOMMessageEvent)

    
      expect(handlerInvoked).toBeTruthy();
      expect(returnedStates.toggleMute).toBe(meetingRoomState.toggleMute);
      expect(returnedStates.toggleCamera).toBe(meetingRoomState.toggleCamera);
      expect(returnedStates.toggleCaptions).toBe(meetingRoomState.toggleCaptions);
      expect(returnedStates.stageLayout).toBe(meetingRoomState.stageLayout);
      expect(returnedStates.leaveMeeting).toBe(meetingRoomState.leaveMeeting);

      let messageForHandlerCallback = mobilePlatformMock.findMessageByFunc('meeting.handleMeetingRoomStatesUpdate');
      expect(messageForHandlerCallback).not.toBeNull();
      expect(messageForHandlerCallback.args.length).toBe(1);
      expect(messageForHandlerCallback.args[0]).toEqual(meetingRoomState);
    });

    it('should successful register states update handler on desktop', () => {
      desktopPlatformMock.initializeWithContext('content');

      meeting.registerMeetingRoomStatesUpdateHandler(emptyCallback);

      let messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meeting.meetingRoomStatesUpdate');
    });
  });
});