import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { meetingRoom } from '../../src/private/meetingRoom';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('Testing meetingRoom', () => {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyHandler = (): void => {};

  describe('Test if functions throw error properly before initialization ', () => {
    it('meetingRoom.isSupported should throw if called before initialization', () => {
      expect(() => meetingRoom.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('meetingRoom.getPairedMeetingRoomInfo should throw if called before initialization', () => {
      expect(() => meetingRoom.getPairedMeetingRoomInfo()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('meetingRoom.sendCommandToPairedMeetingRoom should not allow calls before initialization', () => {
      expect(() => meetingRoom.sendCommandToPairedMeetingRoom('mute')).rejects.toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler should not allow calls before initialization ', () => {
      expect(() => meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyHandler)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('meetingRoom.registerMeetingRoomStatesUpdateHandler should not allow calls before initialization ', () => {
      expect(() => meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyHandler)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
  });

  describe('frameless', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    describe('meetingRoom.getPairedMeetingRoomInfo', () => {
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`getPairedMeetingRoomInfo should throw error when meetingRoom is not supported : ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(meetingRoom.getPairedMeetingRoomInfo()).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it(`meetingRoom.getPairedMeetingRoomInfo should successfully get meeting room info on mobile: ${frameContext}`, async () => {
          await utils.initializeWithContext('content');

          const promise = meetingRoom.getPairedMeetingRoomInfo();

          const message = utils.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(0);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [null, meetingRoomInfo],
            },
          } as DOMMessageEvent);

          const returnedMeetingRoomInfo = await promise;
          expect(returnedMeetingRoomInfo.endpointId).toBe(meetingRoomInfo.endpointId);
          expect(returnedMeetingRoomInfo.deviceName).toBe(meetingRoomInfo.deviceName);
          expect(returnedMeetingRoomInfo.clientType).toBe(meetingRoomInfo.clientType);
          expect(returnedMeetingRoomInfo.clientVersion).toBe(meetingRoomInfo.clientVersion);
        });

        it(`meetingRoom.getPairedMeetingRoomInfo should pass sdkError while get meeting room info on mobile: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          const promise = meetingRoom.getPairedMeetingRoomInfo();

          const message = utils.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(0);

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: 500, message: errorMessage }],
            },
          } as DOMMessageEvent);

          return expect(promise).rejects.toEqual({ errorCode: 500, message: errorMessage });
        });
      });
    });

    describe('meetingRoom.sendCommandToPairedMeetingRoom', () => {
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.sendCommandToPairedMeetingRoom should throw error when meetingRoom is not supported: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(meetingRoom.sendCommandToPairedMeetingRoom('mute')).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it(`meetingRoom.sendCommandToPairedMeetingRoom should not allow calls with null command name: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          return expect(meetingRoom.sendCommandToPairedMeetingRoom(null)).rejects.toThrowError(
            '[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty',
          );
        });

        it(`meetingRoom.sendCommandToPairedMeetingRoom should not allow calls with empty command name: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          return expect(meetingRoom.sendCommandToPairedMeetingRoom('')).rejects.toThrowError(
            '[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty',
          );
        });

        it(`meetingRoom.sendCommandToPairedMeetingRoom should successfully send commands on mobile: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          const promise = meetingRoom.sendCommandToPairedMeetingRoom('mute');

          const message = utils.findMessageByFunc('meetingRoom.sendCommandToPairedMeetingRoom');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toBe('mute');

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: 1, message: 'command failed' }],
            },
          } as DOMMessageEvent);

          return expect(promise).rejects.toEqual({ errorCode: 1, message: 'command failed' });
        });
      });
    });

    describe('meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler', () => {
      it('should not allow calls with null callback ', () => {
        expect(() => meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(null)).toThrowError(
          '[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null',
        );
      });
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler should throw error when meetingRoom is not supported: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          expect.assertions(1);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyHandler);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });
        it(`meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler should successful register capabilities update handler on mobile: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          let handlerInvoked = false;
          let returnedCapabilities;
          meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(
            (capabilities: meetingRoom.MeetingRoomCapability) => {
              handlerInvoked = true;
              returnedCapabilities = capabilities;
            },
          );

          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomCapabilitiesUpdate');

          utils.respondToFramelessMessage({
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
      });
    });

    describe('meetingRoom.registerMeetingRoomStatesUpdateHandler', () => {
      it('should not allow calls with null callback ', () => {
        expect(() => meetingRoom.registerMeetingRoomStatesUpdateHandler(null)).toThrowError(
          '[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null',
        );
      });
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.registerMeetingRoomStatesUpdateHandler should throw error when meetingRoom is not supported: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          expect.assertions(1);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyHandler);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`meetingRoom.registerMeetingRoomStatesUpdateHandler should successful register states update handler on mobile: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          let handlerInvoked = false;
          let returnedStates;
          meetingRoom.registerMeetingRoomStatesUpdateHandler((states: meetingRoom.MeetingRoomState) => {
            handlerInvoked = true;
            returnedStates = states;
          });

          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');

          utils.respondToFramelessMessage({
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

        it(`meetingRoom.registerMeetingRoomStatesUpdateHandler should successful register states update handler on desktop: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyHandler);

          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');
        });
      });
    });
  });

  describe('framed', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
    });

    describe('meetingRoom.getPairedMeetingRoomInfo', () => {
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.getPairedMeetingRoomInfo should successfully get meeting room info on mobile: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);
          meetingRoom.getPairedMeetingRoomInfo();
          const message = utils.findMessageByFunc('meetingRoom.getPairedMeetingRoomInfo');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(0);
        });
      });
    });

    describe('meetingRoom.sendCommandToPairedMeetingRoom', () => {
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.sendCommandToPairedMeetingRoom should successfully send commands on desktop: ${frameContext}`, async () => {
          await utils.initializeWithContext('content');

          meetingRoom.sendCommandToPairedMeetingRoom('mute');

          const message = utils.findMessageByFunc('meetingRoom.sendCommandToPairedMeetingRoom');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toBe('mute');
        });
      });
    });

    describe('meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler', () => {
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler should successful register capabilities update handler on desktop: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler(emptyHandler);

          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomCapabilitiesUpdate');
        });
      });
    });

    describe('meetingRoom.registerMeetingRoomStatesUpdateHandler', () => {
      Object.values(FrameContexts).forEach((frameContext) => {
        it(`meetingRoom.registerMeetingRoomStatesUpdateHandler should successful register states update handler on desktop: ${frameContext}`, async () => {
          await utils.initializeWithContext(frameContext);

          meetingRoom.registerMeetingRoomStatesUpdateHandler(emptyHandler);

          const messageForRegister = utils.findMessageByFunc('registerHandler');
          expect(messageForRegister).not.toBeNull();
          expect(messageForRegister.args.length).toBe(1);
          expect(messageForRegister.args[0]).toBe('meetingRoom.meetingRoomStatesUpdate');
        });
      });
    });
  });
});
