import { Utils } from '../utils';
import { ptzExtension } from '../../src/private/ptzExtension';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { SdkError } from '../../src/public/interfaces';

describe('ptzExtension', () => {
  const utils = new Utils();
  const ptzCapableParticipantsMock: ptzExtension.PtzCapableParticipants = {
    participants: [
      {
        id: '1',
        displayName: 'Nicole',
        isPtzCapable: true,
      },
      {
        id: '2',
        displayName: 'Mrudula',
        isPtzCapable: true,
      },
    ],
  };
  const participantInputMock: ptzExtension.PtzParticipantInput = { id: '1' };
  const ptzControlCommandMock: ptzExtension.PtzControlCommand = ptzExtension.PtzControlCommand.PanRight;
  const ptzHandlerFailedMock: ptzExtension.PtzHandlerFailed = {
    ptzHandlerError: ptzExtension.PtzErrorReason.CommandPanRightError,
  };
  const ptzDeviceStateChangedMock: ptzExtension.PtzRemoteControlDeviceStateChanged = {
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
  const ptzSessionStatusChangedMock: ptzExtension.PtzSessionStatusChanged = {
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
      expect(() => ptzExtension.getCapableParticipants(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => ptzExtension.getCapableParticipants(null)).toThrowError(
        '[ptzExtension.getCapableParticipants] Callback cannot be null',
      );
    });
    it('should successfully get PTZ-capable participants', () => {
      utils.initializeWithContext('content');
      let returnedResult: ptzExtension.PtzCapableParticipants = null;
      let returnedSdkError: SdkError;
      const callback = (sdkError: SdkError, result: ptzExtension.PtzCapableParticipants): void => {
        returnedResult = result;
        returnedSdkError = sdkError;
      };
      ptzExtension.getCapableParticipants(callback);
      let message = utils.findMessageByFunc('ptzExtension.getCapableParticipants');
      expect(message).not.toBeUndefined();

      // simulate response
      const data = {
        error: null,
        result: ptzCapableParticipantsMock,
      };
      utils.respondToMessage(message, data.error, data.result);

      // check data is returned properly
      expect(returnedResult).toEqual(ptzCapableParticipantsMock);
      expect(returnedSdkError).toBeNull();
    });
    it('should return an error object if response has error', () => {
      utils.initializeWithContext('content');
      let returnedResult: ptzExtension.PtzCapableParticipants = null;
      let returnedSdkError: SdkError;
      const sdkErrorMock: SdkError = {
        errorCode: 500,
        message: 'Test error message.',
      };
      const callback = (sdkError: SdkError, result: ptzExtension.PtzCapableParticipants): void => {
        returnedResult = result;
        returnedSdkError = sdkError;
      };
      ptzExtension.getCapableParticipants(callback);
      let message = utils.findMessageByFunc('ptzExtension.getCapableParticipants');
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

  describe('requestRemoteCameraControl', () => {
    it('should not allow calls before initialization', () => {
      expect(() => ptzExtension.requestRemoteCameraControl(participantInputMock, () => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the participant is null', () => {
      expect(() => ptzExtension.requestRemoteCameraControl(null, () => {})).toThrowError(
        '[ptzExtension.requestRemoteCameraControl] Participant cannot be null',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => ptzExtension.requestRemoteCameraControl(participantInputMock, null)).toThrowError(
        '[ptzExtension.requestRemoteCameraControl] Callback cannot be null',
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
      ptzExtension.requestRemoteCameraControl(participantInputMock, callbackMock);
      let message = utils.findMessageByFunc('ptzExtension.requestRemoteCameraControl');
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
      ptzExtension.requestRemoteCameraControl(participantInputMock, callbackMock);
      let message = utils.findMessageByFunc('ptzExtension.requestRemoteCameraControl');
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

  describe('sendRemoteCustomCommand', () => {
    it('should not allow calls before initialization', () => {
      expect(() => ptzExtension.sendRemoteCustomCommand(ptzControlCommandMock, () => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the ptzControlCommand is null', () => {
      expect(() => ptzExtension.sendRemoteCustomCommand(null, () => {})).toThrowError(
        '[ptzExtension.sendRemoteCustomCommand] PtzControlCommand cannot be null',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => ptzExtension.sendRemoteCustomCommand(ptzControlCommandMock, null)).toThrowError(
        '[ptzExtension.sendRemoteCustomCommand] Callback cannot be null',
      );
    });
    it('should send control command to the remote camera', () => {
      utils.initializeWithContext('content');
      let returnedSdkError: SdkError;
      const callbackMock = (sdkError: SdkError): void => {
        returnedSdkError = sdkError;
      };
      ptzExtension.sendRemoteCustomCommand(ptzControlCommandMock, callbackMock);
      let message = utils.findMessageByFunc('ptzExtension.sendRemoteCustomCommand');
      expect(message).not.toBeUndefined();
      expect(message.args).toContain(ptzControlCommandMock);

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
      ptzExtension.sendRemoteCustomCommand(ptzControlCommandMock, callbackMock);
      let message = utils.findMessageByFunc('ptzExtension.sendRemoteCustomCommand');
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

  describe('terminateRemoteSession', () => {
    it('should not allow calls before initialization', () => {
      expect(() => ptzExtension.terminateRemoteSession(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should throw an error if the callback function is null', () => {
      expect(() => ptzExtension.terminateRemoteSession(null)).toThrowError(
        '[ptzExtension.terminateRemoteSession] Callback cannot be null',
      );
    });
    it('should terminate remote camera control session', () => {
      utils.initializeWithContext('content');
      let returnedSdkError: SdkError;
      const callback = (sdkError: SdkError): void => {
        returnedSdkError = sdkError;
      };
      ptzExtension.terminateRemoteSession(callback);
      let message = utils.findMessageByFunc('ptzExtension.terminateRemoteSession');
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
      ptzExtension.terminateRemoteSession(callback);
      let message = utils.findMessageByFunc('ptzExtension.terminateRemoteSession');
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
      expect(() => ptzExtension.registerOnCapableParticipantsChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('content');
      expect(() => ptzExtension.registerOnCapableParticipantsChangeHandler(null)).toThrowError(
        '[ptzExtension.registerOnCapableParticipantsChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the capable participants change', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let ptzCapableParticipants: ptzExtension.PtzCapableParticipants;
      const handlerMock = (participantChange: ptzExtension.PtzCapableParticipants): void => {
        handlerInvoked = true;
        ptzCapableParticipants = participantChange;
      };
      ptzExtension.registerOnCapableParticipantsChangeHandler(handlerMock);

      utils.sendMessage('ptzCapableParticipantsChange', ptzCapableParticipantsMock);

      expect(handlerInvoked).toEqual(true);
      expect(ptzCapableParticipants).toEqual(ptzCapableParticipantsMock);
    });
  });

  describe('registerOnPtzErrorHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => ptzExtension.registerOnPtzErrorHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('content');
      expect(() => ptzExtension.registerOnPtzErrorHandler(null)).toThrowError(
        '[ptzExtension.registerOnPtzErrorHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the PTZ handler encounters an error', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let handlerError: ptzExtension.PtzHandlerFailed;
      const handlerMock = (error: ptzExtension.PtzHandlerFailed): void => {
        handlerInvoked = true;
        handlerError = error;
      };
      ptzExtension.registerOnPtzErrorHandler(handlerMock);

      utils.sendMessage('ptzHandlerError', ptzHandlerFailedMock);

      expect(handlerInvoked).toEqual(true);
      expect(handlerError).toEqual(ptzHandlerFailedMock);
    });
  });

  describe('registerOnControlDeviceStateChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => ptzExtension.registerOnControlDeviceStateChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('content');
      expect(() => ptzExtension.registerOnControlDeviceStateChangeHandler(null)).toThrowError(
        '[ptzExtension.registerOnControlDeviceStateChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the PTZ device state changes', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let deviceState: ptzExtension.PtzRemoteControlDeviceStateChanged;
      const handlerMock = (deviceStateChange: ptzExtension.PtzRemoteControlDeviceStateChanged): void => {
        handlerInvoked = true;
        deviceState = deviceStateChange;
      };
      ptzExtension.registerOnControlDeviceStateChangeHandler(handlerMock);

      utils.sendMessage('ptzControlDeviceStateChange', ptzDeviceStateChangedMock);

      expect(handlerInvoked).toEqual(true);
      expect(deviceState).toEqual(ptzDeviceStateChangedMock);
    });
  });

  describe('registerOnSessionStatusChangeHandler', () => {
    it('should not allow calls before initialization ', () => {
      expect(() => ptzExtension.registerOnSessionStatusChangeHandler(() => {})).toThrowError(
        'The library has not yet been initialized',
      );
    });
    it('should not allow calls with null handler ', () => {
      utils.initializeWithContext('content');
      expect(() => ptzExtension.registerOnSessionStatusChangeHandler(null)).toThrowError(
        '[ptzExtension.registerOnSessionStatusChangeHandler] Handler cannot be null',
      );
    });
    it('should successfully register a handler for when the PTZ session status changes', () => {
      utils.initializeWithContext('content');

      let handlerInvoked = false;
      let sessionStatus: ptzExtension.PtzSessionStatusChanged;
      const handlerMock = (sessionStatusChange: ptzExtension.PtzSessionStatusChanged): void => {
        handlerInvoked = true;
        sessionStatus = sessionStatusChange;
      };
      ptzExtension.registerOnSessionStatusChangeHandler(handlerMock);

      utils.sendMessage('ptzSessionStatusChange', ptzSessionStatusChangedMock);

      expect(handlerInvoked).toEqual(true);
      expect(sessionStatus).toEqual(ptzSessionStatusChangedMock);
    });
  });
});
