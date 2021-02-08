import { Utils } from '../utils';
import { remoteCamera } from '../../src/private/remoteCamera';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { SdkError } from '../../src/public/interfaces';

describe('remoteCamera', () => {
  const utils = new Utils();
  const capableParticipantsMock: remoteCamera.Participant[] = [
    {
      id: '1',
      displayName: 'Nicole',
    },
    {
      id: '2',
      displayName: 'Mrudula',
    },
  ];
  const participantMock: remoteCamera.Participant = { id: '1' };
  const controlCommandMock: remoteCamera.ControlCommand = remoteCamera.ControlCommand.PanRight;
  const errorReasonMock: remoteCamera.ErrorReason = remoteCamera.ErrorReason.CommandPanRightError;
  const deviceStateChangeMock: remoteCamera.DeviceState = {
    available: false,
    error: false,
    reset: false,
    zoomIn: false,
    zoomOut: false,
    panLeft: false,
    panRight: false,
    tiltUp: false,
    tiltDown: false,
  };
  const sessionStatusChangeMock: remoteCamera.SessionStatus = {
    inControl: true,
  };
  beforeEach(() => {
    utils.messages = [];
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    if (_uninitialize) {
      _uninitialize();
    }
  });
  describe('getCapableParticipants', () => {
    it('should not allow calls before initialization', () => {
      expect(() => remoteCamera.getCapableParticipants(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.getCapableParticipants(null)).toThrowError(
        '[remoteCamera.getCapableParticipants] Callback cannot be null',
      );
    });
    it('should successfully get list of participants with controllable cameras', () => {
      utils.initializeWithContext('sidePanel');
      let returnedParticipant: remoteCamera.Participant[] | null = null;
      let returnedSdkError: SdkError | null = null;
      const callback = (sdkError: SdkError | null, participants: remoteCamera.Participant[] | null): void => {
        returnedParticipant = participants;
        returnedSdkError = sdkError;
      };
      remoteCamera.getCapableParticipants(callback);
      let message = utils.findMessageByFunc('remoteCamera.getCapableParticipants');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: null,
        participants: capableParticipantsMock,
      };
      utils.respondToMessage(message, data.error, data.participants);

      // check data is returned properly
      expect(returnedParticipant).toEqual(capableParticipantsMock);
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('sidePanel');
      let returnedParticipant: remoteCamera.Participant[] | null = null;
      let returnedSdkError: SdkError | null = null;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callback = (sdkError: SdkError | null, participants: remoteCamera.Participant[] | null): void => {
        returnedParticipant = participants;
        returnedSdkError = sdkError;
      };
      remoteCamera.getCapableParticipants(callback);
      let message = utils.findMessageByFunc('remoteCamera.getCapableParticipants');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: sdkErrorMock,
        participants: null,
      };
      utils.respondToMessage(message, data.error, data.participants);

      // check data is returned properly
      expect(returnedParticipant).toBeNull();
      expect(returnedSdkError).toEqual(sdkErrorMock);
    });
  });

  describe('requestControl', () => {
    it('should not allow calls before initialization', () => {
      expect(() => remoteCamera.requestControl(participantMock, () => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the participant is null', () => {
      expect(() => remoteCamera.requestControl(null, () => {})).toThrowError(
        '[remoteCamera.requestControl] Participant cannot be null',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.requestControl(participantMock, null)).toThrowError(
        '[remoteCamera.requestControl] Callback cannot be null',
      );
    });
    it('should request control of remote camera', () => {
      utils.initializeWithContext('sidePanel');
      let returnedRequestResponse: boolean | null = null;
      let returnedSdkError: SdkError | null = null;
      const callbackMock = (sdkError: SdkError | null, requestResult: boolean | null): void => {
        returnedRequestResponse = requestResult;
        returnedSdkError = sdkError;
      };
      remoteCamera.requestControl(participantMock, callbackMock);
      let message = utils.findMessageByFunc('remoteCamera.requestControl');
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(participantMock);

      // simulate response
      const data = {
        error: null,
        requestResult: true,
      };
      utils.respondToMessage(message, data.error, data.requestResult);

      // check data is returned properly
      expect(returnedRequestResponse).toEqual(true);
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('sidePanel');
      let returnedRequestResponse: boolean | null = null;
      let returnedSdkError: SdkError | null = null;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callbackMock = (sdkError: SdkError | null, requestResult: boolean | null): void => {
        returnedRequestResponse = requestResult;
        returnedSdkError = sdkError;
      };
      remoteCamera.requestControl(participantMock, callbackMock);
      let message = utils.findMessageByFunc('remoteCamera.requestControl');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: sdkErrorMock,
        requestResult: null,
      };
      utils.respondToMessage(message, data.error, data.requestResult);

      // check data is returned properly
      expect(returnedRequestResponse).toBeNull();
      expect(returnedSdkError).toEqual(sdkErrorMock);
    });
  });

  describe('sendControlCommand', () => {
    it('should not allow calls before initialization', () => {
      expect(() => remoteCamera.sendControlCommand(controlCommandMock, () => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the ControlCommand is null', () => {
      expect(() => remoteCamera.sendControlCommand(null, () => {})).toThrowError(
        '[remoteCamera.sendControlCommand] ControlCommand cannot be null',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.sendControlCommand(controlCommandMock, null)).toThrowError(
        '[remoteCamera.sendControlCommand] Callback cannot be null',
      );
    });
    it('should send control command to the remote camera', () => {
      utils.initializeWithContext('sidePanel');
      let returnedSdkError: SdkError | null;
      const callbackMock = (sdkError: SdkError | null): void => {
        returnedSdkError = sdkError;
      };
      remoteCamera.sendControlCommand(controlCommandMock, callbackMock);
      let message = utils.findMessageByFunc('remoteCamera.sendControlCommand');
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(controlCommandMock);

      // simulate response
      const data = {
        error: null,
      };
      utils.respondToMessage(message, data.error);

      // check data is returned properly
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('sidePanel');
      let returnedSdkError: SdkError | null;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callbackMock = (sdkError: SdkError | null): void => {
        returnedSdkError = sdkError;
      };
      remoteCamera.sendControlCommand(controlCommandMock, callbackMock);
      let message = utils.findMessageByFunc('remoteCamera.sendControlCommand');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: sdkErrorMock,
      };
      utils.respondToMessage(message, data.error);

      // check data is returned properly
      expect(returnedSdkError).toEqual(sdkErrorMock);
    });
  });

  describe('terminateSession', () => {
    it('should not allow calls before initialization', () => {
      expect(() => remoteCamera.terminateSession(() => {})).toThrowError('The library has not yet been initialized');
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.terminateSession(null)).toThrowError(
        '[remoteCamera.terminateSession] Callback cannot be null',
      );
    });
    it('should terminate remote camera control session', () => {
      utils.initializeWithContext('sidePanel');
      let returnedSdkError: SdkError | null;
      const callback = (sdkError: SdkError | null): void => {
        returnedSdkError = sdkError;
      };
      remoteCamera.terminateSession(callback);
      let message = utils.findMessageByFunc('remoteCamera.terminateSession');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: null,
      };
      utils.respondToMessage(message, data.error);

      // check data is returned properly
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('sidePanel');
      let returnedSdkError: SdkError | null;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callback = (sdkError: SdkError | null): void => {
        returnedSdkError = sdkError;
      };
      remoteCamera.terminateSession(callback);
      let message = utils.findMessageByFunc('remoteCamera.terminateSession');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: sdkErrorMock,
      };
      utils.respondToMessage(message, data.error);

      // check data is returned properly
      expect(returnedSdkError).toEqual(sdkErrorMock);
    });
  });

  describe('registerOnCapableParticipantsChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnCapableParticipantsChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('sidePanel');
      expect(() => remoteCamera.registerOnCapableParticipantsChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the capable participants change', () => {
      utils.initializeWithContext('sidePanel');

      let handlerInvoked = false;
      let CapableParticipants: remoteCamera.Participant[];
      const handlerMock = (participantChange: remoteCamera.Participant[]): void => {
        handlerInvoked = true;
        CapableParticipants = participantChange;
      };
      remoteCamera.registerOnCapableParticipantsChangeHandler(handlerMock);

      utils.sendMessage('remoteCamera.capableParticipantsChange', capableParticipantsMock);

      expect(handlerInvoked).toEqual(true);
      expect(CapableParticipants).toEqual(capableParticipantsMock);
    });
  });

  describe('registerOnErrorHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnErrorHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('sidePanel');
      expect(() => remoteCamera.registerOnErrorHandler(null)).toThrowError(
        '[remoteCamera.registerOnErrorHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the handler encounters an error', () => {
      utils.initializeWithContext('sidePanel');

      let handlerInvoked = false;
      let handlerError: remoteCamera.ErrorReason;
      const handlerMock = (error: remoteCamera.ErrorReason): void => {
        handlerInvoked = true;
        handlerError = error;
      };
      remoteCamera.registerOnErrorHandler(handlerMock);

      utils.sendMessage('remoteCamera.handlerError', errorReasonMock);

      expect(handlerInvoked).toEqual(true);
      expect(handlerError).toEqual(errorReasonMock);
    });
  });

  describe('registerOnDeviceStateChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnDeviceStateChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('sidePanel');
      expect(() => remoteCamera.registerOnDeviceStateChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the device state changes', () => {
      utils.initializeWithContext('sidePanel');

      let handlerInvoked = false;
      let deviceState: remoteCamera.DeviceState;
      const handlerMock = (deviceStateChange: remoteCamera.DeviceState): void => {
        handlerInvoked = true;
        deviceState = deviceStateChange;
      };
      remoteCamera.registerOnDeviceStateChangeHandler(handlerMock);

      utils.sendMessage('remoteCamera.deviceStateChange', deviceStateChangeMock);

      expect(handlerInvoked).toEqual(true);
      expect(deviceState).toEqual(deviceStateChangeMock);
    });
  });

  describe('registerOnSessionStatusChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnSessionStatusChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('sidePanel');
      expect(() => remoteCamera.registerOnSessionStatusChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the session status changes', () => {
      utils.initializeWithContext('sidePanel');

      let handlerInvoked = false;
      let sessionStatus: remoteCamera.SessionStatus;
      const handlerMock = (sessionStatusChange: remoteCamera.SessionStatus): void => {
        handlerInvoked = true;
        sessionStatus = sessionStatusChange;
      };
      remoteCamera.registerOnSessionStatusChangeHandler(handlerMock);

      utils.sendMessage('remoteCamera.sessionStatusChange', sessionStatusChangeMock);

      expect(handlerInvoked).toEqual(true);
      expect(sessionStatus).toEqual(sessionStatusChangeMock);
    });
  });
});
