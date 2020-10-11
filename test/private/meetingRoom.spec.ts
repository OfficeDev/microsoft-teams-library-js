import { Utils } from '../utils';
import { FramelessPostMocks } from '../framelessPostMocks';
import { meetingRoom } from '../../src/private/meetingRoom';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { ErrorCode, SdkError } from '../../src/public/interfaces';

describe('meetingRoom', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const desktopPlatformMock = new Utils();
  const meetingRoomInfo: meetingRoom.MeetingRoomInfo = {
    endpointId: '123-456',
    deviceName: 'conference room 001',
    clientType: 'norden',
    clientVersion: 'v-2020-09-28',
  };
  const meetingRoomCapability: meetingRoom.MeetingRoomCapability = {
    mediaControls: ['toggleMute', 'toggleCamera'],
    stageLayoutControls: ['showVideoGallery', 'showContent'],
    meetingControls: [],
  };
  const meetingRoomState: meetingRoom.MeetingRoomState = {
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
      expect(() => meetingRoom.getPairedMeetingRoomInfo(() => {})).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get meeting room info on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedMeetingRoomInfo: meetingRoom.MeetingRoomInfo = null;
      let returnedSdkError: SdkError;
      meetingRoom.getPairedMeetingRoomInfo((sdkError: SdkError, meetingRoomInfo: meetingRoom.MeetingRoomInfo) => {
        handlerInvoked = true;
        returnedMeetingRoomInfo = meetingRoomInfo;
        returnedSdkError = sdkError;
      });

      let message = mobilePlatformMock.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
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
      let returnedMeetingRoomInfo: meetingRoom.MeetingRoomInfo = null;
      let returnedSdkError: SdkError;
      meetingRoom.getPairedMeetingRoomInfo((sdkError: SdkError, meetingRoomInfo: meetingRoom.MeetingRoomInfo) => {
        handlerInvoked = true;
        returnedMeetingRoomInfo = meetingRoomInfo;
        returnedSdkError = sdkError;
      });

      let message = mobilePlatformMock.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
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

      meetingRoom.getPairedMeetingRoomInfo(emptyCallback);

      let message = desktopPlatformMock.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(0);
    });
  });

  describe('sendCommandToPairedMeetingRoom', () => {
    it('should not allow calls before initialization', () => {
      expect(() => meetingRoom.sendCommandToPairedMeetingRoom('mute', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with null command name', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meetingRoom.sendCommandToPairedMeetingRoom(null, emptyCallback)).toThrowError(
        '[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty',
      );
    });

    it('should not allow calls with empty command name', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meetingRoom.sendCommandToPairedMeetingRoom('', emptyCallback)).toThrowError(
        '[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty',
      );
    });

    it('should not allow calls with null callback', () => {
      mobilePlatformMock.initializeWithContext('content');
      expect(() => meetingRoom.sendCommandToPairedMeetingRoom('mute', null)).toThrowError(
        '[meetingRoom.sendCommandToPairedMeetingRoom] Callback cannot be null',
      );
    });

    it('should successfully send commands on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedSdkError: SdkError;
      meetingRoom.sendCommandToPairedMeetingRoom('mute', (sdkError: SdkError) => {
        handlerInvoked = true;
        returnedSdkError = sdkError;
      });

      let message = mobilePlatformMock.findMessageByFunc('meetingRoom.sendCommandToPairedMeetingRoom');
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

      meetingRoom.sendCommandToPairedMeetingRoom('mute', emptyCallback);

      let message = desktopPlatformMock.findMessageByFunc('meetingRoom.sendCommandToPairedMeetingRoom');
      expect(message).not.toBeNull();
      expect(message.args.length).toBe(1);
      expect(message.args[0]).toBe('mute');
    });
  });

  describe('registerMeetingRoomCapabilitiesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(null)).toThrowError(
        '[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null',
      );
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successful register capabilities update handler on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedCapabilities;
      meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler((capabilities: meetingRoom.MeetingRoomCapability) => {
        handlerInvoked = true;
        returnedCapabilities = capabilities;
      });

      let messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomCapabilitiesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: 'meetingRoom.meetingRoomCapabilitiesUpdate',
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

      meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyCallback);

      let messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomCapabilitiesUpdate');
    });
  });

  describe('registerMeetingRoomStatesUpdateHandler', () => {
    it('should not allow calls with null callback ', () => {
      expect(() => meetingRoom.registerMeetingRoomStatesUpdateHandler(null)).toThrowError(
        '[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null',
      );
    });

    it('should not allow calls before initialization ', () => {
      expect(() => meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should successful register states update handler on mobile', () => {
      mobilePlatformMock.initializeWithContext('content');

      let handlerInvoked = false;
      let returnedStates;
      meetingRoom.registerMeetingRoomStatesUpdateHandler((states: meetingRoom.MeetingRoomState) => {
        handlerInvoked = true;
        returnedStates = states;
      });

      let messageForRegister = mobilePlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');

      mobilePlatformMock.respondToMessage({
        data: {
          func: 'meetingRoom.meetingRoomStatesUpdate',
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

      meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyCallback);

      let messageForRegister = desktopPlatformMock.findMessageByFunc('registerHandler');
      expect(messageForRegister).not.toBeNull();
      expect(messageForRegister.args.length).toBe(1);
      expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');
    });
  });
});
