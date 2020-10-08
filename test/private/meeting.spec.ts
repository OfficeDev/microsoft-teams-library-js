import { Utils } from '../utils';
import { FramelessPostMocks } from '../framelessPostMocks';
import { meeting } from '../../src/private/meeting';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { ErrorCode, SdkError } from '../../src/public/interfaces';

describe('meetings', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();
  const meetingRoomInfo: meeting.MeetingRoomInfo = {
    endpointId: '123-456',
    deviceName: 'conference room 001',
    clientType: 'norden',
    clientVersion: 'v-2020-09-28',
  };
  const meetingRoomCapability: meeting.MeetingRoomCapability = {
    mediaControls: ['toggleMute', 'toggleCamera'],
    stageLayoutControls: ['showVideoGallery', 'showContent'],
    meetingControls: [],
  };
  const meetingRoomState: meeting.MeetingRoomState = {
    toggleMute: true,
    toggleCamera: false,
    toggleCaptions: false,
    stageLayout: 'Gallery',
    leaveMeeting: false,
  };
  const errorMessage = 'error occurs';

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
      expect(() => meeting.getPairedMeetingRoomInfo(() => {})).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get meeting room info on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedMeetingRoomInfo: meeting.MeetingRoomInfo = null;
      let returnedSdkError: SdkError;
      meeting.getPairedMeetingRoomInfo((sdkError: SdkError, meetingRoomInfo: meeting.MeetingRoomInfo) => {
        handlerInvoked = true;
        returnedMeetingRoomInfo = meetingRoomInfo;
        returnedSdkError = sdkError;
      });

      let message = mobilePlatformMock.findMessageByFunc('meeting.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);

      let callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, meetingRoomInfo],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedMeetingRoomInfo.endpointId).toBe(meetingRoomInfo.endpointId);
      expect(returnedMeetingRoomInfo.deviceName).toBe(meetingRoomInfo.deviceName);
      expect(returnedMeetingRoomInfo.clientType).toBe(meetingRoomInfo.clientType);
      expect(returnedMeetingRoomInfo.clientVersion).toBe(meetingRoomInfo.clientVersion);
      expect(returnedSdkError).toBeNull();
    });

    it('pass sdkError while get meeting room info on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedMeetingRoomInfo: meeting.MeetingRoomInfo = null;
      let returnedSdkError: SdkError;
      meeting.getPairedMeetingRoomInfo((sdkError: SdkError, meetingRoomInfo: meeting.MeetingRoomInfo) => {
        handlerInvoked = true;
        returnedMeetingRoomInfo = meetingRoomInfo;
        returnedSdkError = sdkError;
      });

      let message = mobilePlatformMock.findMessageByFunc('meeting.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);

      let callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: 500, message: errorMessage }],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedMeetingRoomInfo).toBeFalsy();
      expect(returnedSdkError.errorCode).toEqual(500);
      expect(returnedSdkError.message).toBe(errorMessage);
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
      expect(() => meeting.sendCommandToPairedMeetingRoom('mute', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with null command name', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meeting.sendCommandToPairedMeetingRoom(null, emptyCallback)).toThrowError(
        '[meeting.sendCommandToPairedMeetingRoom] Command name cannot be null or empty',
      );
    });

    it('should not allow calls with empty command name', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meeting.sendCommandToPairedMeetingRoom('', emptyCallback)).toThrowError(
        '[meeting.sendCommandToPairedMeetingRoom] Command name cannot be null or empty',
      );
    });

    it('should not allow calls with null callback', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meeting.sendCommandToPairedMeetingRoom('mute', null)).toThrowError(
        '[meeting.sendCommandToPairedMeetingRoom] Callback cannot be null',
      );
    });

    it('should successfully send commands on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedSdkError: SdkError;
      meeting.sendCommandToPairedMeetingRoom('mute', (sdkError: SdkError) => {
        handlerInvoked = true;
        returnedSdkError = sdkError;
      });

      let message = mobilePlatformMock.findMessageByFunc('meeting.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');

      let callbackId = message.id;
      mobilePlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [{ errorCode: 1, message: 'command failed' }],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedSdkError.errorCode).toBe(1);
      expect(returnedSdkError.message).toBe('command failed');
    });

    it('should successfully send commands on desktop', () => {
      desktopPlatformMock.initializeWithContext('content');

      meeting.sendCommandToPairedMeetingRoom('mute', emptyCallback);

      let message = desktopPlatformMock.findMessageByFunc('meeting.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');
    });
  });

  describe('registerMeetingRoomCapabilitiesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meeting.registerMeetingRoomCapabilitiesUpdateHandler(null)).toThrowError(
        '[meeting.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null',
      );
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meeting.registerMeetingRoomCapabilitiesUpdateHandler(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successful register capabilities update handler on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedCapabilities;
      meeting.registerMeetingRoomCapabilitiesUpdateHandler((capabilities: meeting.MeetingRoomCapability) => {
        handlerInvoked = true;
        returnedCapabilities = capabilities;
      });

      let messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meeting.meetingRoomCapabilitiesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: 'meeting.meetingRoomCapabilitiesUpdate',
          args: [meetingRoomCapability],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedCapabilities.mediaControls).toBe(meetingRoomCapability.mediaControls);
      expect(returnedCapabilities.stageLayoutControls).toBe(meetingRoomCapability.stageLayoutControls);
      expect(returnedCapabilities.meetingControls).toBe(meetingRoomCapability.meetingControls);
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
        '[meeting.registerMeetingRoomStatesUpdateHandler] Handler cannot be null',
      );
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meeting.registerMeetingRoomStatesUpdateHandler(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successful register states update handler on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedStates;
      meeting.registerMeetingRoomStatesUpdateHandler((states: meeting.MeetingRoomState) => {
        handlerInvoked = true;
        returnedStates = states;
      });

      let messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meeting.meetingRoomStatesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: 'meeting.meetingRoomStatesUpdate',
          args: [meetingRoomState],
        },
      } as DOMMessageEvent);

      expect(handlerInvoked).toBeTruthy();
      expect(returnedStates.toggleMute).toBe(meetingRoomState.toggleMute);
      expect(returnedStates.toggleCamera).toBe(meetingRoomState.toggleCamera);
      expect(returnedStates.toggleCaptions).toBe(meetingRoomState.toggleCaptions);
      expect(returnedStates.stageLayout).toBe(meetingRoomState.stageLayout);
      expect(returnedStates.leaveMeeting).toBe(meetingRoomState.leaveMeeting);
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
