import { Utils } from '../utils';
import { remoteCamera } from '../../src/private/remoteCamera';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { SdkError } from '../../src/public/interfaces';

describe('remoteCamera', () => {
  const utils = new Utils();
  const capableParticipantsMock: remoteCamera.CapableParticipants = {
    participants: [
      {
        id: '1',
        displayName: 'Nicole',
        isCapable: true,
      },
      {
        id: '2',
        displayName: 'Mrudula',
        isCapable: true,
      },
    ],
  };
  const participantInputMock: remoteCamera.ParticipantInput = { id: '1' };
  const controlCommandMock: remoteCamera.ControlCommand = remoteCamera.ControlCommand.PanRight;
  const handlerFailedMock: remoteCamera.HandlerFailed = {
    handlerError: remoteCamera.ErrorReason.CommandPanRightError,
  };
  const deviceStateChangedMock: remoteCamera.DeviceStateChanged = {
    deviceState: {
      available: false,
      error: false,
      reset: false,
      zoomIn: false,
      zoomOut: false,
      panLeft: false,
      panRight: false,
      tiltUp: false,
      tiltDown: false,
    },
  };
  const sessionStatusChangedMock: remoteCamera.SessionStatusChanged = {
    sessionStatus: {
      inControl: true,
      id: '1',
    },
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
      utils.initializeWithContext('content');
      let returnedResult: remoteCamera.CapableParticipants = null;
      let returnedSdkError: SdkError;
      const callback = (sdkError: SdkError, result: remoteCamera.CapableParticipants): void => {
        returnedResult = result;
        returnedSdkError = sdkError;
      };
      remoteCamera.getCapableParticipants(callback);
      let message = utils.findMessageByFunc('remoteCamera.getCapableParticipants');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: null,
        result: capableParticipantsMock,
      };
      utils.respondToMessage(message, data.error, data.result);

      // check data is returned properly
      expect(returnedResult).toEqual(capableParticipantsMock);
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('content');
      let returnedResult: remoteCamera.CapableParticipants = null;
      let returnedSdkError: SdkError;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callback = (sdkError: SdkError, result: remoteCamera.CapableParticipants): void => {
        returnedResult = result;
        returnedSdkError = sdkError;
      };
      remoteCamera.getCapableParticipants(callback);
      let message = utils.findMessageByFunc('remoteCamera.getCapableParticipants');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: sdkErrorMock,
        result: null,
      };
      utils.respondToMessage(message, data.error, data.result);

      // check data is returned properly
      expect(returnedResult).toBeNull();
      expect(returnedSdkError).toEqual(sdkErrorMock);
    });
  });

  describe('requestControl', () => {
    it('should not allow calls before initialization', () => {
      expect(() => remoteCamera.requestControl(participantInputMock, () => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the participant is null', () => {
      expect(() => remoteCamera.requestControl(null, () => {})).toThrowError(
        '[remoteCamera.requestControl] Participant cannot be null',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.requestControl(participantInputMock, null)).toThrowError(
        '[remoteCamera.requestControl] Callback cannot be null',
      );
    });
    it('should request control of remote camera', () => {
      utils.initializeWithContext('content');
      let returnedResult = false;
      let returnedSdkError: SdkError;
      const callbackMock = (sdkError: SdkError, result: boolean): void => {
        returnedResult = result;
        returnedSdkError = sdkError;
      };
      remoteCamera.requestControl(participantInputMock, callbackMock);
      let message = utils.findMessageByFunc('remoteCamera.requestControl');
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(participantInputMock);

      // simulate response
      const data = {
        error: null,
        result: true,
      };
      utils.respondToMessage(message, data.error, data.result);

      // check data is returned properly
      expect(returnedResult).toEqual(true);
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('content');
      let returnedResult = false;
      let returnedSdkError: SdkError;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callbackMock = (sdkError: SdkError, result: boolean): void => {
        returnedResult = result;
        returnedSdkError = sdkError;
      };
      remoteCamera.requestControl(participantInputMock, callbackMock);
      let message = utils.findMessageByFunc('remoteCamera.requestControl');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: sdkErrorMock,
        result: null,
      };
      utils.respondToMessage(message, data.error, data.result);

      // check data is returned properly
      expect(returnedResult).toBeNull();
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
      utils.initializeWithContext('content');
      let returnedSdkError: SdkError;
      const callbackMock = (sdkError: SdkError): void => {
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
      utils.initializeWithContext('content');
      let returnedSdkError: SdkError;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callbackMock = (sdkError: SdkError): void => {
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
      utils.initializeWithContext('content');
      let returnedSdkError: SdkError;
      const callback = (sdkError: SdkError): void => {
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
      utils.initializeWithContext('content');
      let returnedSdkError: SdkError;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callback = (sdkError: SdkError): void => {
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
      utils.initializeWithContext('content');
      expect(() => remoteCamera.registerOnCapableParticipantsChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the capable participants change', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let CapableParticipants: remoteCamera.CapableParticipants;
      const handlerMock = (participantChange: remoteCamera.CapableParticipants): void => {
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
      utils.initializeWithContext('content');
      expect(() => remoteCamera.registerOnErrorHandler(null)).toThrowError(
        '[remoteCamera.registerOnErrorHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the handler encounters an error', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let handlerError: remoteCamera.HandlerFailed;
      const handlerMock = (error: remoteCamera.HandlerFailed): void => {
        handlerInvoked = true;
        handlerError = error;
      };
      remoteCamera.registerOnErrorHandler(handlerMock);

      utils.sendMessage('remoteCamera.handlerError', handlerFailedMock);

      expect(handlerInvoked).toEqual(true);
      expect(handlerError).toEqual(handlerFailedMock);
    });
  });

  describe('registerOnDeviceStateChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnDeviceStateChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('content');
      expect(() => remoteCamera.registerOnDeviceStateChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the device state changes', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let deviceState: remoteCamera.DeviceStateChanged;
      const handlerMock = (deviceStateChange: remoteCamera.DeviceStateChanged): void => {
        handlerInvoked = true;
        deviceState = deviceStateChange;
      };
      remoteCamera.registerOnDeviceStateChangeHandler(handlerMock);

      utils.sendMessage('remoteCamera.deviceStateChange', deviceStateChangedMock);

      expect(handlerInvoked).toEqual(true);
      expect(deviceState).toEqual(deviceStateChangedMock);
    });
  });

  describe('registerOnSessionStatusChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnSessionStatusChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('content');
      expect(() => remoteCamera.registerOnSessionStatusChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the session status changes', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let sessionStatus: remoteCamera.SessionStatusChanged;
      const handlerMock = (sessionStatusChange: remoteCamera.SessionStatusChanged): void => {
        handlerInvoked = true;
        sessionStatus = sessionStatusChange;
      };
      remoteCamera.registerOnSessionStatusChangeHandler(handlerMock);

      utils.sendMessage('remoteCamera.sessionStatusChange', sessionStatusChangedMock);

      expect(handlerInvoked).toEqual(true);
      expect(sessionStatus).toEqual(sessionStatusChangedMock);
    });
  });
});
