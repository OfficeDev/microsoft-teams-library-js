import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { remoteCamera } from '../../src/private/remoteCamera';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { SdkError } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('remoteCamera', () => {
  const utils = new Utils();
  const allowedContexts = [FrameContexts.sidePanel];
  const emptyCallback = () => {};
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
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });
  describe('Testing remoteCamera.getCapableParticipants function', () => {
    it('remoteCamera.getCapableParticipants should not allow calls before initialization', () => {
      expect(() => remoteCamera.getCapableParticipants(emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('remoteCamera.getCapableParticipants should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.getCapableParticipants(null)).toThrowError(
        '[remoteCamera.getCapableParticipants] Callback cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.getCapableParticipants should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let returnedParticipant: remoteCamera.Participant[] | null = null;
          let returnedSdkError: SdkError | null = null;
          const callback = (sdkError: SdkError | null, participants: remoteCamera.Participant[] | null): void => {
            returnedParticipant = participants;
            returnedSdkError = sdkError;
          };
          expect.assertions(1);
          try {
            remoteCamera.getCapableParticipants(callback);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.getCapableParticipants should successfully get list of participants with controllable cameras when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let returnedParticipant: remoteCamera.Participant[] | null = null;
          let returnedSdkError: SdkError | null = null;
          const callback = (sdkError: SdkError | null, participants: remoteCamera.Participant[] | null): void => {
            returnedParticipant = participants;
            returnedSdkError = sdkError;
          };
          remoteCamera.getCapableParticipants(callback);
          const message = utils.findMessageByFunc('remoteCamera.getCapableParticipants');
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

        it(`remoteCamera.getCapableParticipants should return an error object if response has error when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
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
          const message = utils.findMessageByFunc('remoteCamera.getCapableParticipants');
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
      } else {
        it(`remoteCamera.getCapableParticipants should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.getCapableParticipants(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.requestControl function', () => {
    it('remoteCamera.requestControl should not allow calls before initialization', () => {
      expect(() => remoteCamera.requestControl(participantMock, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('remoteCamera.requestControl should throw an error if the participant is null', () => {
      expect(() => remoteCamera.requestControl(null, emptyCallback)).toThrowError(
        '[remoteCamera.requestControl] Participant cannot be null',
      );
    });

    it('remoteCamera.requestControl should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.requestControl(participantMock, null)).toThrowError(
        '[remoteCamera.requestControl] Callback cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.requestControl should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let returnedRequestResponse: boolean | null = null;
          let returnedSdkError: SdkError | null = null;
          const callbackMock = (sdkError: SdkError | null, requestResult: boolean | null): void => {
            returnedRequestResponse = requestResult;
            returnedSdkError = sdkError;
          };
          expect.assertions(1);
          try {
            remoteCamera.requestControl(participantMock, callbackMock);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.requestControl should request control of remote camera when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let returnedRequestResponse: boolean | null = null;
          let returnedSdkError: SdkError | null = null;
          const callbackMock = (sdkError: SdkError | null, requestResult: boolean | null): void => {
            returnedRequestResponse = requestResult;
            returnedSdkError = sdkError;
          };
          remoteCamera.requestControl(participantMock, callbackMock);
          const message = utils.findMessageByFunc('remoteCamera.requestControl');
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

        it(`remoteCamera.requestControl should return an error object if response has error when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
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
          const message = utils.findMessageByFunc('remoteCamera.requestControl');
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
      } else {
        it(`remoteCamera.requestControl should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.requestControl(participantMock, emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.sendControlCommand function', () => {
    it('remoteCamera.sendControlCommand should not allow calls before initialization', () => {
      expect(() => remoteCamera.sendControlCommand(controlCommandMock, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('remoteCamera.sendControlCommand should throw an error if the ControlCommand is null', () => {
      expect(() => remoteCamera.sendControlCommand(null, emptyCallback)).toThrowError(
        '[remoteCamera.sendControlCommand] ControlCommand cannot be null',
      );
    });

    it('remoteCamera.sendControlCommand should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.sendControlCommand(controlCommandMock, null)).toThrowError(
        '[remoteCamera.sendControlCommand] Callback cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.sendControlCommand should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let returnedSdkError: SdkError | null;
          const callbackMock = (sdkError: SdkError | null): void => {
            returnedSdkError = sdkError;
          };
          expect.assertions(1);
          try {
            remoteCamera.sendControlCommand(controlCommandMock, callbackMock);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.sendControlCommand should send control command to the remote camera when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let returnedSdkError: SdkError | null;
          const callbackMock = (sdkError: SdkError | null): void => {
            returnedSdkError = sdkError;
          };
          remoteCamera.sendControlCommand(controlCommandMock, callbackMock);
          const message = utils.findMessageByFunc('remoteCamera.sendControlCommand');
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

        it(`remoteCamera.sendControlCommand should return an error object if response has error when initialized with ${context} context`, async () => {
          await utils.initializeWithContext('sidePanel');
          let returnedSdkError: SdkError | null;
          const sdkErrorMock: SdkError = {
            errorCode: 500,
            message: 'Test error message.',
          };
          const callbackMock = (sdkError: SdkError | null): void => {
            returnedSdkError = sdkError;
          };
          remoteCamera.sendControlCommand(controlCommandMock, callbackMock);
          const message = utils.findMessageByFunc('remoteCamera.sendControlCommand');
          expect(message).not.toBeUndefined();

          // simulate response
          const data = {
            error: sdkErrorMock,
          };
          utils.respondToMessage(message, data.error);

          // check data is returned properly
          expect(returnedSdkError).toEqual(sdkErrorMock);
        });
      } else {
        it(`remoteCamera.sendControlCommand should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.sendControlCommand(controlCommandMock, emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.terminateSession function', () => {
    it('remoteCamera.terminateSession should not allow calls before initialization', () => {
      expect(() => remoteCamera.terminateSession(emptyCallback)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('remoteCamera.terminateSession should throw an error if the callback function is null', () => {
      expect(() => remoteCamera.terminateSession(null)).toThrowError(
        '[remoteCamera.terminateSession] Callback cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.terminateSession should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let returnedSdkError: SdkError | null;
          const callback = (sdkError: SdkError | null): void => {
            returnedSdkError = sdkError;
          };
          expect.assertions(1);
          try {
            remoteCamera.terminateSession(callback);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.terminateSession should terminate remote camera control session  when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let returnedSdkError: SdkError | null;
          const callback = (sdkError: SdkError | null): void => {
            returnedSdkError = sdkError;
          };
          remoteCamera.terminateSession(callback);
          const message = utils.findMessageByFunc('remoteCamera.terminateSession');
          expect(message).not.toBeUndefined();

          // simulate response
          const data = {
            error: null,
          };
          utils.respondToMessage(message, data.error);

          // check data is returned properly
          expect(returnedSdkError).toBeNull();
        });

        it(`remoteCamera.terminateSession should return an error object if response has error when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          let returnedSdkError: SdkError | null;
          const sdkErrorMock: SdkError = {
            errorCode: 500,
            message: 'Test error message.',
          };
          const callback = (sdkError: SdkError | null): void => {
            returnedSdkError = sdkError;
          };
          remoteCamera.terminateSession(callback);
          const message = utils.findMessageByFunc('remoteCamera.terminateSession');
          expect(message).not.toBeUndefined();

          // simulate response
          const data = {
            error: sdkErrorMock,
          };
          utils.respondToMessage(message, data.error);

          // check data is returned properly
          expect(returnedSdkError).toEqual(sdkErrorMock);
        });
      } else {
        it(`remoteCamera.terminateSession should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.terminateSession(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.registerOnCapableParticipantsChangeHandler function', () => {
    it('remoteCamera.registerOnCapableParticipantsChangeHandler should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnCapableParticipantsChangeHandler(emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('remoteCamera.registerOnCapableParticipantsChangeHandler should not allow calls with null handler ', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);
      expect(() => remoteCamera.registerOnCapableParticipantsChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.registerOnCapableParticipantsChangeHandler should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let capableParticipants: remoteCamera.Participant[];
          const handlerMock = (participantChange: remoteCamera.Participant[]): void => {
            capableParticipants = participantChange;
          };
          expect.assertions(1);
          try {
            remoteCamera.registerOnCapableParticipantsChangeHandler(handlerMock);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.registerOnCapableParticipantsChangeHandler should successfully register a handler for when the capable participants change when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = false;
          let capableParticipants: remoteCamera.Participant[];
          const handlerMock = (participantChange: remoteCamera.Participant[]): void => {
            handlerInvoked = true;
            capableParticipants = participantChange;
          };
          remoteCamera.registerOnCapableParticipantsChangeHandler(handlerMock);

          utils.sendMessage('remoteCamera.capableParticipantsChange', capableParticipantsMock);

          expect(handlerInvoked).toEqual(true);
          expect(capableParticipants).toEqual(capableParticipantsMock);
        });
      } else {
        it(`remoteCamera.registerOnCapableParticipantsChangeHandler should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.registerOnCapableParticipantsChangeHandler(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.registerOnErrorHandler function', () => {
    it('remoteCamera.registerOnErrorHandler should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnErrorHandler(emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('remoteCamera.registerOnErrorHandler should not allow calls with null handler when initialized with sidepanel context', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);
      expect(() => remoteCamera.registerOnErrorHandler(null)).toThrowError(
        '[remoteCamera.registerOnErrorHandler] Handler cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.registerOnErrorHandler should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let handlerError: remoteCamera.ErrorReason;
          const handlerMock = (error: remoteCamera.ErrorReason): void => {
            handlerError = error;
          };
          expect.assertions(1);
          try {
            remoteCamera.registerOnErrorHandler(handlerMock);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.registerOnErrorHandler should successfully register a handler for when the handler encounters an error when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

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
      } else {
        it(`remoteCamera.registerOnErrorHandler should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.registerOnErrorHandler(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.registerOnDeviceStateChangeHandler function', () => {
    it('remoteCamera.registerOnDeviceStateChangeHandler should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnDeviceStateChangeHandler(emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('remoteCamera.registerOnDeviceStateChangeHandler should not allow calls with null handler when initialized with sidepanel context', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);
      expect(() => remoteCamera.registerOnDeviceStateChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.registerOnDeviceStateChangeHandler should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let deviceState: remoteCamera.DeviceState;
          const handlerMock = (deviceStateChange: remoteCamera.DeviceState): void => {
            deviceState = deviceStateChange;
          };
          expect.assertions(1);
          try {
            remoteCamera.registerOnDeviceStateChangeHandler(handlerMock);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.registerOnDeviceStateChangeHandler should successfully register a handler for when the device state changes when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

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
      } else {
        it(`remoteCamera.registerOnDeviceStateChangeHandler should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.registerOnDeviceStateChangeHandler(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.registerOnSessionStatusChangeHandler function', () => {
    it('remoteCamera.registerOnSessionStatusChangeHandler should not allow calls before initialization ', () => {
      expect(() => remoteCamera.registerOnSessionStatusChangeHandler(emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('remoteCamera.registerOnSessionStatusChangeHandler should not allow calls with null handler when initialized with sidepanel context', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);
      expect(() => remoteCamera.registerOnSessionStatusChangeHandler(null)).toThrowError(
        '[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null',
      );
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`remoteCamera.registerOnSessionStatusChangeHandler should throw error when remoteCamera is not supported. context : ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          let sessionStatus: remoteCamera.SessionStatus;
          const handlerMock = (sessionStatusChange: remoteCamera.SessionStatus): void => {
            sessionStatus = sessionStatusChange;
          };
          expect.assertions(1);
          try {
            remoteCamera.registerOnSessionStatusChangeHandler(handlerMock);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`remoteCamera.registerOnSessionStatusChangeHandler should successfully register a handler for when the session status changes when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);

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
      } else {
        it(`remoteCamera.registerOnSessionStatusChangeHandler should not allow calls when initialized with ${context} context`, async () => {
          await utils.initializeWithContext(context);
          expect(() => remoteCamera.registerOnSessionStatusChangeHandler(emptyCallback)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing remoteCamera.isSupported function', () => {
    it('remoteCamera.isSupported should return false if the runtime says remote camera is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(remoteCamera.isSupported()).not.toBeTruthy();
    });

    it('remoteCamera.isSupported should return true if the runtime says remote camera is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { remoteCamera: {} } });
      expect(remoteCamera.isSupported()).toBeTruthy();
    });

    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => remoteCamera.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });
});
