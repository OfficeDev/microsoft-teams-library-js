import * as communication from '../../src/internal/communication';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import * as utils from '../../src/internal/utils';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { Utils } from '../utils';

describe('Testing communication', () => {
  describe('initializeCommunication', () => {
    describe('frameless', () => {
      let utils: Utils = new Utils();

      beforeEach(() => {
        // Set a mock window for testing
        utils = new Utils();
        utils.mockWindow.parent = undefined;
        app._initialize(utils.mockWindow);
        communication.Communication.parentWindow = undefined;
        GlobalVars.isFramelessWindow = false;
      });

      afterAll(() => {
        communication.uninitializeCommunication();
        GlobalVars.isFramelessWindow = false;
      });

      it('should throw if there is no parent window and no native interface on the current window', async () => {
        app._initialize(undefined);
        const initPromise = communication.initializeCommunication(undefined);
        await expect(initPromise).rejects.toThrowError('Initialization Failed. No Parent window found.');
      });

      it('should receive valid initialize response from parent', async () => {
        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        const initializeResponse = await initPromise;

        const expectedResponse = {
          context: FrameContexts.content,
          clientType: undefined,
          runtimeConfig: undefined,
          clientSupportedSDKVersion: undefined,
        };
        expect(initializeResponse).toStrictEqual(expectedResponse);
      });

      it('Communication.currentWindow should be unchanged by initializeCommunication', async () => {
        expect(communication.Communication.currentWindow).toStrictEqual(utils.mockWindow);

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.currentWindow).toStrictEqual(utils.mockWindow);
      });

      it('should set Communication.parentWindow to undefined', async () => {
        expect(utils.mockWindow.parent).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.parentWindow).toBeUndefined();
      });

      it('should set window.onNativeMessage for handling responses from the parent', async () => {
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.currentWindow.onNativeMessage).not.toBeUndefined();
      });

      it('if there is a parent window that IS NOT self, no initialization message will be received, we will be in framed mode, and parentWindow will be set to the parent of Communication.currentWindow', async () => {
        // This is an error scenario, but it is technically possible so documenting in unit test
        expect.assertions(5);
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        utils.mockWindow.parent = { parentWindow: true };

        const initPromise = communication.initializeCommunication(undefined);
        try {
          const initMessage = utils.findInitializeMessageOrThrow();
          utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

          await initPromise;
        } catch (e) {
          expect(e).not.toBeNull();
        }

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(communication.Communication.parentWindow).toStrictEqual(
          communication.Communication.currentWindow.parent,
        );
        expect(communication.Communication.currentWindow.onNativeMessage).toBeUndefined();
      });

      it('if there is a parent window that IS self, no initialization message will be received, we will be in framed mode, and parentWindow will be set to opener', async () => {
        // This is an error scenario, but it is technically possible so documenting in unit test
        expect.assertions(5);
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        utils.mockWindow.parent = utils.mockWindow;
        utils.mockWindow.opener = { openerWindow: true };

        const initPromise = communication.initializeCommunication(undefined);
        try {
          const initMessage = utils.findInitializeMessageOrThrow();
          utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

          await initPromise;
        } catch (e) {
          expect(e).not.toBeNull();
        }

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(communication.Communication.parentWindow).toStrictEqual(utils.mockWindow.opener);
        expect(communication.Communication.currentWindow.onNativeMessage).toBeUndefined();
      });

      it('should put sdk in frameless window mode', async () => {
        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeTruthy();
      });

      it('should set sdk parentOrigin to null', async () => {
        /**
         * This is an interesting difference from the framed version.
         * For whatever reason, parentOrigin is not updated as part of handling the initialization response because
         * {@link communication.processMessage} is never called, which in turn never calls {@link utils.updateRelationships}
         */
        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findMessageByFunc('initialize');

        if (!initMessage) {
          throw new Error('initialize message not found');
        }

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.parentOrigin).toBeNull();
      });
    });
    describe('framed', () => {
      let utils: Utils = new Utils();

      beforeEach(() => {
        // Set a mock window for testing
        utils = new Utils();
        app._initialize(utils.mockWindow);
        communication.Communication.parentWindow = undefined;
        GlobalVars.isFramelessWindow = false;
      });

      afterEach(() => {
        communication.uninitializeCommunication();
      });

      afterAll(() => {
        communication.Communication.currentWindow = undefined;
        communication.Communication.parentWindow = undefined;
        GlobalVars.isFramelessWindow = false;
      });

      it('should reject if no parent window', async () => {
        app._initialize(undefined);
        const initPromise = communication.initializeCommunication(undefined);
        await expect(initPromise).rejects.toThrowError('Initialization Failed. No Parent window found.');
      });

      it('should receive valid initialize response from parent', async () => {
        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToMessage(initMessage, FrameContexts.content);
        const initializeResponse = await initPromise;

        const expectedResponse = {
          context: FrameContexts.content,
          clientType: undefined,
          runtimeConfig: undefined,
          clientSupportedSDKVersion: undefined,
        };
        expect(initializeResponse).toStrictEqual(expectedResponse);
      });

      it('should set Communication.currentWindow to the value of window', async () => {
        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(communication.Communication.currentWindow).toStrictEqual(utils.mockWindow);
      });

      it('should set Communication.parentOrigin to null and then update to the message origin once a response is received', async () => {
        const initPromise = communication.initializeCommunication(undefined);
        expect(communication.Communication.parentOrigin).toBeNull();
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;
        expect(communication.Communication.parentOrigin).toBe(utils.validOrigin);
      });

      it('should set Communication.parentWindow and Communication.parentOrigin to null if the parent window is closed during the initialization call', async () => {
        expect.assertions(4);

        /* 
          This promise is intentionally not being awaited
          If the parent window is closed during the initialize call,
          the initialize response never resolves (even though we receive it)
          because updateRelationships wipes out Communication.parentWindow and
          Communication.parentOrigin which prevents handleParentMessage from being called
          (which is the function that resolves the promise)
        */
        communication.initializeCommunication(undefined);

        expect(communication.Communication.parentOrigin).toBeNull();
        expect(communication.Communication.parentWindow).not.toBeNull();

        communication.Communication.parentWindow.closed = true;
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToMessage(initMessage, FrameContexts.content);

        expect(communication.Communication.parentWindow).toBeNull();
        expect(communication.Communication.parentOrigin).toBeNull();
      });

      it('should be in framed mode when there is a parent window that is not self', async () => {
        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();
        utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
      });

      it('should be in framed mode when the parent window is self, and Communication.parentWindow should be set to opener', async () => {
        utils.mockWindow.opener = utils.mockWindow.parent;
        utils.mockWindow.parent = communication.Communication.currentWindow.self;

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();
        utils.respondToOpenerMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        expect(communication.Communication.parentWindow).toStrictEqual(utils.mockWindow.opener);
      });
    });
  });
  describe('processMessage', () => {
    it('fail if message has a missing data property', () => {
      const event = { badData: '' } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if message is empty', () => {
      const event = {} as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if data property is not an object', () => {
      const event = { data: '' } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if message has random data', () => {
      const event = { badData: '', notAnOrigin: 'blah' } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if data is undefined', () => {
      const event = { data: undefined } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if data is null', () => {
      const event = { data: null } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if data is undefined', () => {
      const event = { data: undefined } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
    it('fail if data is null', () => {
      const event = { data: null } as unknown as DOMMessageEvent;
      const result = communication.processMessage(event);
      expect(result).toBeUndefined();
    });
  });
  describe('shouldProcessMessage', () => {
    it('fail if message source is same window ', () => {
      communication.Communication.currentWindow = window;
      // window object should now equal Communication.currentWindow
      const result = communication.shouldProcessMessage(window, 'testOrigin.com');
      expect(result).toBe(false);
    });
    it('fail if message source is same window ', () => {
      communication.Communication.currentWindow = window;
      // window object should now equal Communication.currentWindow
      const result = communication.shouldProcessMessage(window, 'testOrigin.com');
      expect(result).toBe(false);
    });
    it('success if origin matches current window ', () => {
      const messageOrigin = window.location.origin;
      communication.Communication.currentWindow = window;
      const result = communication.shouldProcessMessage({} as Window, messageOrigin);
      expect(result).toBe(true);
    });

    it('calls validateOrigin', () => {
      communication.Communication.currentWindow = window;
      jest.spyOn(utils, 'validateOrigin').mockReturnValue(true);
      const messageOrigin = 'http://someorigin';
      const messageOriginURL = new URL(messageOrigin);
      const result = communication.shouldProcessMessage({} as Window, messageOrigin);
      expect(utils.validateOrigin).toBeCalled();
      expect(utils.validateOrigin).toBeCalledWith(messageOriginURL);
      expect(result).toBe(utils.validateOrigin(messageOriginURL));
    });
  });
});
