import * as communication from '../../src/internal/communication';
import { GlobalVars } from '../../src/internal/globalVars';
import * as handlers from '../../src/internal/handlers';
import { MessageRequest } from '../../src/internal/messageObjects';
import { NestedAppAuthMessageEventNames, NestedAppAuthRequest } from '../../src/internal/nestedAppAuthUtils';
import { ResponseHandler } from '../../src/internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../src/internal/telemetry';
import { UUID } from '../../src/internal/uuidObject';
import { ErrorCode, FrameContexts, SdkError } from '../../src/public';
import * as app from '../../src/public/app';
import { Utils } from '../utils';

jest.mock('../../src/internal/handlers', () => ({
  callHandler: jest.fn(),
}));

const testApiVersion = getApiVersionTag(ApiVersionNumber.V_1, 'mockedApiName' as ApiName);

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
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        await expect(initPromise).rejects.toThrowError('Initialization Failed. No Parent window found.');
      });

      it('should receive valid initialize response from parent when there is no parent window but the window has a native interface', async () => {
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

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

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.currentWindow).toStrictEqual(utils.mockWindow);
      });

      it('should set Communication.parentWindow to undefined when the current window has a parent that is undefined', async () => {
        expect(utils.mockWindow.parent).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.parentWindow).toBeUndefined();
      });

      it('should set window.onNativeMessage for handling responses when the current window has a parent that is undefined', async () => {
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.currentWindow.onNativeMessage).not.toBeUndefined();
      });

      it('if there is a parent window that IS NOT self, we will not send messages using onNativeMessage, will not register onNativeMessage, and Communication.parentWindow will be set to the parent of the curent window', async () => {
        expect.assertions(5);
        utils.mockWindow.parent = utils.parentWindow;
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        try {
          const initMessage = utils.findInitializeMessageOrThrow();
          await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

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

      it('if there is a parent window that IS self, we will not send messages using onNativeMessage, will not register onNativeMessage, and Communication.parentWindow will be set to the opener of the curent window', async () => {
        expect.assertions(5);
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        utils.mockWindow.parent = utils.mockWindow;
        utils.mockWindow.opener = utils.parentWindow;

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        try {
          const initMessage = utils.findInitializeMessageOrThrow();
          await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

          await initPromise;
        } catch (e) {
          expect(e).not.toBeNull();
        }

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(communication.Communication.parentWindow).toStrictEqual(utils.mockWindow.opener);
        expect(communication.Communication.currentWindow.onNativeMessage).toBeUndefined();
      });

      it('if there is a parent window that IS self and NO opener, we will send messages using onNativeMessage, will register onNativeMessage, and Communication.parentWindow will be undefined', async () => {
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        utils.mockWindow.parent = utils.mockWindow;

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();
        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeTruthy();
        expect(communication.Communication.parentWindow).toBeUndefined();
        expect(communication.Communication.currentWindow.onNativeMessage).not.toBeUndefined();
      });

      it('should put sdk in frameless window mode when the current window has a parent that is undefined', async () => {
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeTruthy();
      });

      it('should set sdk parentOrigin to null', async () => {
        /**
         * This is an interesting difference from the framed version.
         * For whatever reason, parentOrigin is not updated as part of handling the initialization response because
         * communication.processMessage is never called, which in turn never calls communication.updateRelationships
         */
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findMessageByFunc('initialize');

        if (!initMessage) {
          throw new Error('initialize message not found');
        }

        await utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        /* eslint-disable-next-line strict-null-checks/all */
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

      it('should reject if no parent window and current window does not have nativeInterface defined', async () => {
        // In this case, because Communication.currentWindow is being initialized to undefined we fall back to the actual
        // window object created by jest, which does not have nativeInterface defined on it
        app._initialize(undefined);
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        await expect(initPromise).rejects.toThrowError('Initialization Failed. No Parent window found.');
      });

      it('should receive valid initialize response from parent when currentWindow has a parent with postMessage defined', async () => {
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToMessage(initMessage, FrameContexts.content);
        const initializeResponse = await initPromise;

        const expectedResponse = {
          context: FrameContexts.content,
          clientType: undefined,
          runtimeConfig: undefined,
          clientSupportedSDKVersion: undefined,
        };
        expect(initializeResponse).toStrictEqual(expectedResponse);
      });

      it('should not process messages with malformed or empty origins', async () => {
        const initPromise = communication.initializeCommunication(
          ['malformed-valid-origin', utils.validOrigin],
          testApiVersion,
        );
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        await utils.sendMessageWithCustomOrigin('test1', '');
        await utils.sendMessageWithCustomOrigin('test2', 'malformed-valid-origin');
        await utils.sendMessageWithCustomOrigin('test3', utils.validOrigin);

        expect(handlers.callHandler as jest.Mock).toHaveBeenCalledWith('test3', []);
        expect(handlers.callHandler as jest.Mock).not.toHaveBeenCalledWith('test2', []);
        expect(handlers.callHandler as jest.Mock).not.toHaveBeenCalledWith('test1', []);
      });

      it('should set Communication.currentWindow to the value that was passed to app._initialize', async () => {
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(communication.Communication.currentWindow).toStrictEqual(utils.mockWindow);
      });

      it('should set Communication.parentOrigin to null and then update to the message origin once a response is received', async () => {
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        /* eslint-disable-next-line strict-null-checks/all */
        expect(communication.Communication.parentOrigin).toBeNull();
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;
        /* eslint-disable-next-line strict-null-checks/all */
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
        communication.initializeCommunication(undefined, testApiVersion);

        /* eslint-disable-next-line strict-null-checks/all */
        expect(communication.Communication.parentOrigin).toBeNull();
        expect(communication.Communication.parentWindow).not.toBeNull();

        communication.Communication.parentWindow.closed = true;
        const initMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToMessage(initMessage, FrameContexts.content);

        expect(communication.Communication.parentWindow).toBeNull();
        /* eslint-disable-next-line strict-null-checks/all */
        expect(communication.Communication.parentOrigin).toBeNull();
      });

      it('should be in framed mode when there is a parent window that is not self', async () => {
        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();
        await utils.respondToMessage(initMessage, FrameContexts.content);
        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
      });

      it('should be in framed mode when the parent window is self, and Communication.parentWindow should be set to opener', async () => {
        utils.mockWindow.opener = utils.mockWindow.parent;
        utils.mockWindow.parent = communication.Communication.currentWindow.self;

        const initPromise = communication.initializeCommunication(undefined, testApiVersion);
        const initMessage = utils.findInitializeMessageOrThrow();
        await utils.respondToMessageAsOpener(initMessage, FrameContexts.content);
        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        expect(communication.Communication.parentWindow).toStrictEqual(utils.mockWindow.opener);
      });

      it('should be in frameless mode when the parent window is self and there is no opener, and Communication.parentWindow should be set to undefined', async () => {
        expect.assertions(3);

        utils.mockWindow.opener = undefined;
        utils.mockWindow.parent = communication.Communication.currentWindow.self;

        communication.initializeCommunication(undefined, testApiVersion);

        expect(GlobalVars.isFramelessWindow).toBeTruthy();
        expect(utils.mockWindow.onNativeMessage).not.toBeUndefined();
        expect(communication.Communication.parentWindow).toBeUndefined();
      });

      describe('nested app auth bridge', () => {
        it('should be pollyfilled onto the current window if the current window exists', async () => {
          expect.assertions(1);

          const initPromise = communication.initializeCommunication(undefined, testApiVersion);
          const initMessage = utils.findInitializeMessageOrThrow();
          utils.respondToMessage(
            initMessage,
            FrameContexts.content,
            undefined,
            undefined,
            JSON.stringify({ supports: { nestedAppAuth: {} } }),
          );
          await initPromise;

          expect(utils.mockWindow.nestedAppAuthBridge).toBeDefined();
        });
      });
    });
  });
  describe('uninitializeCommunication', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
    });
    afterEach(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
      communication.Communication.currentWindow = undefined;
    });
    it('should set Communication.parentWindow to null', () => {
      app._initialize(utils.mockWindow);
      communication.Communication.parentWindow = utils.mockWindow.parent;
      expect(communication.Communication.parentWindow).not.toBeNull();
      communication.uninitializeCommunication();
      expect(communication.Communication.parentWindow).toBeNull();
    });

    it('should set Communication.parentOrigin to null', () => {
      app._initialize(utils.mockWindow);
      communication.Communication.parentOrigin = utils.mockWindow.parentOrigin;
      /* eslint-disable-next-line strict-null-checks/all */
      expect(communication.Communication.parentOrigin).not.toBeNull();
      communication.uninitializeCommunication();
      /* eslint-disable-next-line strict-null-checks/all */
      expect(communication.Communication.parentOrigin).toBeNull();
    });

    it('should set Communication.childWindow to null', () => {
      app._initialize(utils.mockWindow);
      communication.Communication.childWindow = utils.mockWindow;
      /* eslint-disable-next-line strict-null-checks/all */
      expect(communication.Communication.childWindow).not.toBeNull();
      communication.uninitializeCommunication();
      /* eslint-disable-next-line strict-null-checks/all */
      expect(communication.Communication.childWindow).toBeNull();
    });

    it('should set Communication.childOrigin to null', () => {
      app._initialize(utils.mockWindow);
      communication.Communication.childOrigin = utils.mockWindow.origin;
      /* eslint-disable-next-line strict-null-checks/all */
      expect(communication.Communication.childOrigin).not.toBeNull();
      communication.uninitializeCommunication();
      /* eslint-disable-next-line strict-null-checks/all */
      expect(communication.Communication.childOrigin).toBeNull();
    });

    it('should empty the queue of messages for the current parent', () => {
      expect.assertions(1);
      communication.Communication.childWindow = utils.mockWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.parentWindow = utils.mockWindow;
      // This function inserts a message into the parentMessageQueue
      communication.sendMessageEventToChild('testMessage');
      communication.uninitializeCommunication();

      communication.Communication.parentWindow = utils.mockWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = (fn) => {
        fn();
      };
      communication.waitForMessageQueue(communication.Communication.parentWindow, () => {
        // this callback only ever fires if the message queue associated with the passed in window is empty
        expect(true).toBeTruthy();
      });
    });

    it('should empty the queue of messages for the current child', () => {
      expect.assertions(1);
      communication.Communication.childWindow = utils.mockWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      // This function inserts a message into the parentMessageQueue
      communication.sendMessageEventToChild('testMessage');
      communication.uninitializeCommunication();

      communication.Communication.childWindow = utils.mockWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = (fn) => {
        fn();
      };
      /* eslint-disable-next-line strict-null-checks/all */
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        // this callback only ever fires if the message queue associated with the passed in window is empty
        expect(true).toBeTruthy();
      });
    });

    it('should reset messageIds to start at 0 again', () => {
      expect.assertions(2);
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;
      communication.sendMessageToParent(testApiVersion, 'testAction');
      communication.sendMessageToParent(testApiVersion, 'testAction2');
      const message = utils.findMessageByFunc('testAction2');

      if (message) {
        expect(message.id).toBe(1);
      }

      communication.uninitializeCommunication();
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;
      communication.sendMessageToParent(testApiVersion, 'testAction3');

      const messageAfterUninitialize = utils.findMessageByFunc('testAction3');
      if (messageAfterUninitialize) {
        expect(messageAfterUninitialize.id).toBe(0);
      }
    });

    it('unresolved message callbacks should not be triggered after communication has been uninitialized', async () => {
      app._initialize(utils.mockWindow);
      communication.initializeCommunication(undefined, testApiVersion);
      let callbackWasCalled = false;
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.sendMessageToParent(testApiVersion, 'testAction', () => {
        callbackWasCalled = true;
      });
      const tempProcessMessage = utils.processMessage;
      communication.uninitializeCommunication();
      utils.processMessage = tempProcessMessage;

      await utils.respondToMessage({ id: 1, func: 'testAction' }, false);

      expect(callbackWasCalled).toBeFalsy();
    });

    it('unresolved message promises should not be triggered after communication has been uninitialized', async () => {
      app._initialize(utils.mockWindow);
      communication.initializeCommunication(undefined, testApiVersion);

      const messageParent = communication.sendMessageToParentAsync(testApiVersion, 'testAction');

      const tempProcessMessage = utils.processMessage;
      communication.uninitializeCommunication();
      utils.processMessage = tempProcessMessage;

      await utils.respondToMessage({ id: 1, func: 'testAction' }, false);

      messageParent.then(() => expect(false).toBeTruthy());
      expect(true).toBeTruthy();
    });

    it('the current window should not have a message listener on it after communication has been uninitialized', async () => {
      app._initialize(utils.mockWindow);
      utils.mockWindow.addEventListener('message', () => {
        // This listener should not be called during the unit test
        expect(true).toBeFalsy();
      });

      // eslint-disable-next-line strict-null-checks/all
      expect(utils.processMessage).not.toBeNull();

      communication.uninitializeCommunication();

      // eslint-disable-next-line strict-null-checks/all
      expect(utils.processMessage).toBeNull();
    });
  });
  describe('sendMessageToParentAsync', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should send framelessPostMessage to window when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', () => {
      GlobalVars.isFramelessWindow = true;

      communication.sendMessageToParentAsync(testApiVersion, actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to framelessPostMessage when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', async () => {
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);

      const messagePromise = communication.sendMessageToParentAsync(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToNativeMessage(sentMessage, false, []);

      return expect(messagePromise).resolves;
    });
    it('should never send message if there is no Communication.currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow = undefined;

      communication.sendMessageToParentAsync(testApiVersion, actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should still receive response to framelessPostMessage even if there is no Communication.currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow = undefined;

      const messagePromise = communication.sendMessageToParentAsync(testApiVersion, actionName);

      await utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);

      await messagePromise;
      const sentMessage = utils.findMessageByFunc(actionName);
      // eslint-disable-next-line strict-null-checks/all
      expect(sentMessage).toBeDefined();
    });
    it('should never send message if there is no nativeInterface on the currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.sendMessageToParentAsync(testApiVersion, actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should receive response to framelessPostMessage even if there is no nativeInterface on the currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(1);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow.nativeInterface = undefined;

      const messagePromise = communication.sendMessageToParentAsync(testApiVersion, actionName);

      await utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);

      messagePromise.then(() => {
        expect(true).toBeTruthy();
      });
    });
    it('args passed in should be sent with the framelessPostMessage', () => {
      GlobalVars.isFramelessWindow = true;

      const arg1 = 'testArg1';
      communication.sendMessageToParentAsync(testApiVersion, actionName, [arg1]);

      expect(utils.messages.length).toBe(1);
      if (utils.messages[0].args === undefined) {
        throw new Error('args expected on message');
      }
      expect(utils.messages[0].args.length).toBe(1);
      expect(utils.messages[0].args[0]).toBe(arg1);
    });
    it('should send a message to window when running in a framed window and Communication.parentWindow and Communication.parentOrigin are set', () => {
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;

      communication.sendMessageToParentAsync(testApiVersion, actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to postMessage when running in a framed window and Communication.currentWindow has a parent with an origin', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendMessageToParentAsync(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToMessage(sentMessage, false, []);

      return expect(messagePromise).resolves;
    });
    it('args passed in should be sent with the postMessage', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const arg1 = 'testArg1';
      communication.sendMessageToParentAsync(testApiVersion, actionName, [arg1]);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      if (sentMessage.args === undefined) {
        throw new Error('args expected on message');
      }
      expect(sentMessage.args.length).toBe(1);
      expect(sentMessage.args[0]).toBe(arg1);
    });
    it('should not send postMessage until after initialization response received', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();

      communication.sendMessageToParentAsync(testApiVersion, actionName);

      let sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage !== null) {
        throw new Error('Should not find a sent message until after the initialization response was received');
      }

      await utils.respondToMessage(initializeMessage);

      sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('Did not find any message even after initialization response was received');
      }
    });
  });
  describe('requestPortFromParentWithVersion', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    beforeEach(() => {
      class MockMessagePort {}
      global.MessagePort = MockMessagePort as unknown as typeof MessagePort;
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      jest.clearAllMocks();
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should send framelessPostMessage to window when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', () => {
      GlobalVars.isFramelessWindow = true;

      communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to framelessPostMessage when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', async () => {
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);

      const messagePromise = communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const port = new MessagePort();
      await utils.respondToNativeMessageWithPorts(sentMessage, false, [], [port]);

      expect(messagePromise).resolves.toBe(port);
    });
    it('should never send message if there is no Communication.currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow = undefined;

      communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should still receive response to framelessPostMessage even if there is no Communication.currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow = undefined;

      const messagePromise = communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      const port = new MessagePort();
      await utils.respondToNativeMessageWithPorts({ id: 1, func: actionName }, false, [], [port]);

      const receivedPort = await messagePromise;
      const sentMessage = utils.findMessageByFunc(actionName);
      // eslint-disable-next-line strict-null-checks/all
      expect(sentMessage).toBeDefined();
      expect(receivedPort).toBe(port);
    });

    it('should reject with the default error if no port is sent and no custom error', async () => {
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow = undefined;

      const messagePromise = communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      await utils.respondToNativeMessageWithPorts({ id: 1, func: actionName }, false, [], []);

      await expect(messagePromise).rejects.toThrowError('Host responded without port or error details.');
    });

    it('should reject with the error from the parent if no port is sent', async () => {
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow = undefined;

      const messagePromise = communication.requestPortFromParentWithVersion(testApiVersion, actionName);
      const error = { errorCode: 500, message: 'Unknown error' };
      await utils.respondToNativeMessageWithPorts({ id: 1, func: actionName }, false, [error], []);

      await expect(messagePromise).rejects.toMatchObject(error);
    });

    it('should never send message if there is no nativeInterface on the currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should receive response to framelessPostMessage even if there is no nativeInterface on the currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(1);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow.nativeInterface = undefined;

      const messagePromise = communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      const port = new MessagePort();
      await utils.respondToNativeMessageWithPorts({ id: 1, func: actionName }, false, [], [port]);

      const receivedPort = await messagePromise;
      expect(receivedPort).toBe(port);
    });
    it('args passed in should be sent with the framelessPostMessage', () => {
      GlobalVars.isFramelessWindow = true;

      const arg1 = 'testArg1';
      communication.requestPortFromParentWithVersion(testApiVersion, actionName, [arg1]);

      expect(utils.messages.length).toBe(1);
      if (utils.messages[0].args === undefined) {
        throw new Error('args expected on message');
      }
      expect(utils.messages[0].args.length).toBe(1);
      expect(utils.messages[0].args[0]).toBe(arg1);
    });
    it('should send a message to window when running in a framed window and Communication.parentWindow and Communication.parentOrigin are set', () => {
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;

      communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to postMessage when running in a framed window and Communication.currentWindow has a parent with an origin', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const port = new MessagePort();
      await utils.respondToMessageWithPorts(sentMessage, [false, []], [port]);

      return expect(messagePromise).resolves.toBe(port);
    });
    it('args passed in should be sent with the postMessage', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const arg1 = 'testArg1';
      communication.requestPortFromParentWithVersion(testApiVersion, actionName, [arg1]);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      if (sentMessage.args === undefined) {
        throw new Error('args expected on message');
      }
      expect(sentMessage.args.length).toBe(1);
      expect(sentMessage.args[0]).toBe(arg1);
    });
    it('should not send postMessage until after initialization response received', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();

      communication.requestPortFromParentWithVersion(testApiVersion, actionName);

      let sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage !== null) {
        throw new Error('Should not find a sent message until after the initialization response was received');
      }

      await utils.respondToMessage(initializeMessage);

      sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('Did not find any message even after initialization response was received');
      }
    });
  });
  describe('sendMessageToParent', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should send framelessPostMessage to window when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', () => {
      expect.assertions(5);
      GlobalVars.isFramelessWindow = true;

      communication.sendMessageToParent(testApiVersion, actionName, ['zero', 'one']);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
      if (utils.messages[0].args) {
        expect(utils.messages[0].args[0]).toBe('zero');
        expect(utils.messages[0].args[1]).toBe('one');
      }
    });
    it('should receive response via callback when sending framelessPostMessage to window when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', async () => {
      expect.assertions(1);

      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);

      communication.sendMessageToParent(testApiVersion, actionName, () => {
        expect(true).toBeTruthy();
      });
      const sentMessage = utils.findMessageByFunc(actionName);

      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToNativeMessage(sentMessage, false, []);
    });
    it('should never send message if there is no Communication.currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow = undefined;

      communication.sendMessageToParent(testApiVersion, actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should still receive response to framelessPostMessage even if there is no Communication.currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(2);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow = undefined;

      communication.sendMessageToParent(testApiVersion, actionName, () => {
        expect(true).toBeTruthy();
      });

      await utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);

      const sentMessage = utils.findMessageByFunc(actionName);
      // eslint-disable-next-line strict-null-checks/all
      expect(sentMessage).toBeDefined();
    });
    it('should never send message if there is no nativeInterface on the currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.sendMessageToParent(testApiVersion, actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should receive response to framelessPostMessage even if there is no nativeInterface on the currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(1);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined, testApiVersion);
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.sendMessageToParent(testApiVersion, actionName, () => expect(true).toBeTruthy());

      await utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);
    });
    it('should send a message to window when running in a framed window and Communication.parentWindow and Communication.parentOrigin are set', () => {
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;

      communication.sendMessageToParent(testApiVersion, actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to postMessage when running in a framed window and Communication.currentWindow has a parent with an origin', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.sendMessageToParent(testApiVersion, actionName, () => expect(true).toBeTruthy());

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToMessage(sentMessage, false, []);
    });
    it('args passed in should be sent with the postMessage', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const arg1 = 'testArg1';
      communication.sendMessageToParent(testApiVersion, actionName, [arg1]);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      if (sentMessage.args === undefined) {
        throw new Error('args expected on message');
      }
      expect(sentMessage.args.length).toBe(1);
      expect(sentMessage.args[0]).toBe(arg1);
    });
    it('should not send postMessage until after initialization response received', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();

      communication.sendMessageToParent(testApiVersion, actionName);

      let sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage !== null) {
        throw new Error('Should not find a sent message until after the initialization response was received');
      }

      await utils.respondToMessage(initializeMessage);

      sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('Did not find any message even after initialization response was received');
      }
    });
  });
  describe('sendNestedAuthRequestToTopWindow', () => {
    let utils: Utils = new Utils();
    const requestName = 'nestedAppAuth.execute';
    const messageData = { messageType: 'nestedAppAuthRequest', id: 0, clientId: 'test' };
    const message = JSON.stringify(messageData);

    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });

    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });

    it('should send a postMessage to top window when the top window and top origin are set and are same as the parent window', () => {
      GlobalVars.isFramelessWindow = false;
      communication.Communication.topWindow = utils.mockWindow.parent;
      communication.Communication.topOrigin = utils.validOrigin;

      communication.sendNestedAuthRequestToTopWindow(message);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(requestName);
      expect((utils.messages[0] as NestedAppAuthRequest).data).toEqual(message);
    });

    it('should send a postMessage to top window when the top window and top origin are set', () => {
      GlobalVars.isFramelessWindow = false;
      communication.Communication.topWindow = utils.topWindow;
      communication.Communication.topOrigin = utils.validOrigin;

      communication.sendNestedAuthRequestToTopWindow(message);

      expect(utils.topMessages.length).toBe(1);
      expect(utils.topMessages[0].id).toBe(0);
      expect(utils.topMessages[0].func).toBe(requestName);
      expect((utils.topMessages[0] as NestedAppAuthRequest).data).toEqual(message);
    });
  });
  describe('sendAndUnwrap', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    const actionName2 = 'test2';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should unwrap response returned in an array and return it not in an array', async () => {
      expect.assertions(2);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndUnwrap(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToMessage(sentMessage, actionName);

      const response = await messagePromise;
      expect(response).toBe(actionName);

      const messagePromise2 = communication.sendMessageToParentAsync(testApiVersion, actionName2);

      const sentMessage2 = utils.findMessageByFunc(actionName2);
      if (sentMessage2 === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToMessage(sentMessage2, actionName2);

      const response2 = await messagePromise2;
      expect(response2).toStrictEqual([actionName2]);
    });
  });
  describe('sendAndHandleStatusAndReason', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should throw correct error if first returned value from host is false', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleStatusAndReason(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      await utils.respondToMessage(sentMessage, false, errorMessage);

      await expect(messagePromise).rejects.toThrowError(errorMessage);
    });

    it('should not throw an error if first returned value from host is true', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleStatusAndReason(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      await utils.respondToMessage(sentMessage, true, errorMessage);

      await expect(messagePromise).resolves.toBeUndefined();
    });

    it('should pass all args to host', async () => {
      expect.assertions(3);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.sendAndHandleStatusAndReason(testApiVersion, actionName, 'arg1', 'arg2', 'arg3');
      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage?.args) {
        expect(sentMessage?.args[0]).toStrictEqual('arg1');
        expect(sentMessage?.args[1]).toStrictEqual('arg2');
        expect(sentMessage?.args[2]).toStrictEqual('arg3');
      }
    });
  });
  describe('sendAndHandleStatusAndReasonWithDefaultError', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should throw error from host if first returned value from host is false and host provides a custom error', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const defaultErrorMessage = 'This is the default error message';
      const messagePromise = communication.sendAndHandleStatusAndReasonWithDefaultError(
        testApiVersion,
        actionName,
        defaultErrorMessage,
      );

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      await utils.respondToMessage(sentMessage, false, errorMessage);

      await expect(messagePromise).rejects.toThrowError(errorMessage);
    });

    it('should throw the default error passed in to the function if first returned value from host is false and host does not provide a custom error', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const defaultErrorMessage = 'This is the default error message';
      const messagePromise = communication.sendAndHandleStatusAndReasonWithDefaultError(
        testApiVersion,
        actionName,
        defaultErrorMessage,
      );

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      await utils.respondToMessage(sentMessage, false);

      await expect(messagePromise).rejects.toThrowError(defaultErrorMessage);
    });
    it('should not throw an error if first returned value from host is true', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleStatusAndReasonWithDefaultError(
        testApiVersion,
        actionName,
        'default error',
      );

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      await utils.respondToMessage(sentMessage, true, errorMessage);

      await expect(messagePromise).resolves.toBeUndefined();
    });

    it('should pass all args to host', async () => {
      expect.assertions(3);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.sendAndHandleStatusAndReasonWithDefaultError(
        testApiVersion,
        actionName,
        'default error',
        'arg1',
        'arg2',
        'arg3',
      );
      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage?.args) {
        expect(sentMessage?.args[0]).toStrictEqual('arg1');
        expect(sentMessage?.args[1]).toStrictEqual('arg2');
        expect(sentMessage?.args[2]).toStrictEqual('arg3');
      }
    });
  });
  describe('callFunctionInHostAndHandleResponse', () => {
    let utils: Utils = new Utils();
    const functionName = 'actionName';

    class UnitTestResponseHandler implements ResponseHandler<unknown, string> {
      public constructor(
        private validateResponse?: (response: unknown) => boolean,
        private deserializeResponse?: (response: unknown) => string,
      ) {}

      public validate(response: unknown): boolean {
        return this.validateResponse ? this.validateResponse(response) : true;
      }
      public deserialize(response: unknown): string {
        return this.deserializeResponse ? this.deserializeResponse(response) : 'default deserialization';
      }
    }

    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should throw error if an invalid apiVersionTag is passed in', async () => {
      expect.assertions(1);

      try {
        await communication.callFunctionInHostAndHandleResponse(
          functionName,
          ['arg2'],
          new UnitTestResponseHandler(),
          '',
        );
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
    it('should pass action name and empty args array to host', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.callFunctionInHostAndHandleResponse(
        functionName,
        [],
        new UnitTestResponseHandler(),
        testApiVersion,
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();
      expect(sentMessage!.args).toBeDefined();
      expect(sentMessage!.args!.length).toBe(0);
    });
    it('should pass args array containing only simple types to host', async () => {
      expect.assertions(3);

      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const inputArgs = [1, 'string', true, undefined, null, [1]];
      communication.callFunctionInHostAndHandleResponse(
        functionName,
        inputArgs,
        new UnitTestResponseHandler(),
        testApiVersion,
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();
      expect(sentMessage!.args).toBeDefined();
      expect(sentMessage!.args!.length).toBe(inputArgs.length);
      try {
        sentMessage?.args?.forEach((arg, index) => {
          if (arg !== inputArgs[index]) {
            throw new Error(`Arg value ${arg} at index ${index} does not match expected value`);
          }
        });
      } catch (e) {
        expect(e).toBeUndefined();
      }
    });
    it('should pass args array containing only ISerializableObjects to host', async () => {
      expect.assertions(3);

      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const inputArgs = [{ serialize: () => 'foo' }, { serialize: () => 'bar' }];
      communication.callFunctionInHostAndHandleResponse(
        functionName,
        inputArgs,
        new UnitTestResponseHandler(),
        testApiVersion,
      );

      const sentMessage = utils.findMessageByFunc(functionName);

      expect(sentMessage).toBeDefined();
      expect(sentMessage!.args).toBeDefined();
      expect(sentMessage!.args!.length).toBe(inputArgs.length);

      try {
        sentMessage?.args?.forEach((arg, index) => {
          if (arg !== inputArgs[index].serialize()) {
            throw new Error(`Arg value ${arg} at index ${index} does not match expected serialized value`);
          }
        });
      } catch (e) {
        expect(e).toBeUndefined();
      }
    });
    it('should throw error if host returns an SdkError', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const sdkError = { errorCode: ErrorCode.OPERATION_TIMED_OUT, message: 'Unit Test Error' };
      const promise = communication.callFunctionInHostAndHandleResponse(
        functionName,
        [],
        new UnitTestResponseHandler(),
        testApiVersion,
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, sdkError);

      expect(promise).rejects.toThrowError(new Error(`${sdkError.errorCode}, message: ${sdkError.message}`));
    });
    it('should throw error if host does not return SdkError and ResponseHandler says response is invalid', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const promise = communication.callFunctionInHostAndHandleResponse(
        functionName,
        [],
        new UnitTestResponseHandler((_response) => false),
        testApiVersion,
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, 'host response value');

      expect(promise).rejects.toThrowError(
        new Error(
          `${ErrorCode.INTERNAL_ERROR}, message: Invalid response from host - ${JSON.stringify('host response value')}`,
        ),
      );
    });
    it('should return correctly deserialized response if host returns a valid response that is not an error', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const promise = communication.callFunctionInHostAndHandleResponse(
        functionName,
        [],
        new UnitTestResponseHandler(
          (_response) => true,
          (_response) => 'this is the deserialized response',
        ),
        testApiVersion,
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, 'host response value');

      expect(promise).resolves.toEqual('this is the deserialized response');
    });
    it('should throw error if returned object matches passed in errorChecker', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const weirdError = { errorCode: ErrorCode.OPERATION_TIMED_OUT, name: 'weird error message' };
      const promise = communication.callFunctionInHostAndHandleResponse(
        functionName,
        [],
        new UnitTestResponseHandler(),
        testApiVersion,
        (err: unknown): err is SdkError => {
          const returnedErrorCode = (err as SdkError).errorCode;
          const extraValue = (err as { name })?.name;
          return returnedErrorCode === weirdError.errorCode && extraValue === 'weird error message';
        },
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, weirdError);

      expect(promise).rejects.toThrowError(new Error(`${weirdError.errorCode}, message: None`));
    });
    it('should throw invalid response error if returned object does not match passed in errorChecker', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const weirdError = { errorCode: ErrorCode.OPERATION_TIMED_OUT, name: 'bizarre error message' };
      const promise = communication.callFunctionInHostAndHandleResponse(
        functionName,
        [],
        new UnitTestResponseHandler((_response) => false),
        testApiVersion,
        (err: unknown): err is SdkError => {
          const returnedErrorCode = (err as SdkError).errorCode;
          const extraValue = (err as { name })?.name;
          return returnedErrorCode === ErrorCode.FILE_NOT_FOUND && extraValue === 'weird error message';
        },
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, weirdError);

      expect(promise).rejects.toThrowError(
        new Error(`${ErrorCode.INTERNAL_ERROR}, message: Invalid response from host - ${JSON.stringify(weirdError)}`),
      );
    });
  });
  describe('callFunctionInHost', () => {
    let utils: Utils = new Utils();
    const functionName = 'actionName';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should throw error if an invalid apiVersionTag is passed in', async () => {
      expect.assertions(1);
      try {
        await communication.callFunctionInHost('', ['arg2'], 'arg1');
      } catch (e) {
        expect(e).toBeDefined();
      }
    });
    it('should pass action name and empty args array to host', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.callFunctionInHost(functionName, [], testApiVersion);

      const sentMessage = utils.findMessageByFunc(functionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      if (!sentMessage.args || sentMessage.args.length > 0) {
        throw new Error('empty args expected on message');
      }
    });
    it('should pass args array containing only simple types to host', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const inputArgs = [1, 'string', true, undefined, null, [1]];
      communication.callFunctionInHost(functionName, inputArgs, testApiVersion);

      const sentMessage = utils.findMessageByFunc(functionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      if (!sentMessage.args) {
        throw new Error('No arg array found on Message');
      } else {
        sentMessage.args.forEach((arg, index) => {
          if (arg !== inputArgs[index]) {
            throw new Error(`Arg value ${arg} at index ${index} does not match expected value`);
          }
        });
      }
    });
    it('should pass args array containing only ISerializableObjects to host', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const inputArgs = [{ serialize: () => 'foo' }, { serialize: () => 'bar' }];
      communication.callFunctionInHost(functionName, inputArgs, testApiVersion);

      const sentMessage = utils.findMessageByFunc(functionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      if (!sentMessage.args) {
        throw new Error('No arg array found on Message');
      } else {
        sentMessage.args.forEach((arg, index) => {
          if (arg !== inputArgs[index].serialize()) {
            throw new Error(`Arg value ${arg} at index ${index} does not match expected serialized value`);
          }
        });
      }
    });
    it('should throw error if host returns an SdkError', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const sdkError = { errorCode: ErrorCode.OPERATION_TIMED_OUT, message: 'Unit Test Error' };
      const promise = communication.callFunctionInHost(functionName, [], testApiVersion);

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, sdkError);

      expect(promise).rejects.toThrowError(new Error(`${sdkError.errorCode}, message: ${sdkError.message}`));
    });
    it('should not throw error if no error returned from host', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const sdkError = undefined;
      const promise = communication.callFunctionInHost(functionName, [], testApiVersion, (err): err is SdkError => {
        return false;
      });

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, sdkError);

      expect(promise).resolves;
    });
    it('should throw error if returned object matches passed in errorChecker', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const weirdError = { errorCode: ErrorCode.OPERATION_TIMED_OUT, name: 'weird error message' };
      const promise = communication.callFunctionInHost(
        functionName,
        [],
        testApiVersion,
        (err: unknown): err is SdkError => {
          const returnedErrorCode = (err as SdkError).errorCode;
          const extraValue = (err as { name })?.name;
          return returnedErrorCode === weirdError.errorCode && extraValue === weirdError.name;
        },
      );

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, weirdError);

      expect(promise).rejects.toThrowError(new Error(`${weirdError.errorCode}, message: None`));
    });
    it('should not throw error if returned object does not match passed in errorChecker', async () => {
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const sdkError = { errorCode: ErrorCode.OPERATION_TIMED_OUT, message: 'Unit Test Error' };
      const promise = communication.callFunctionInHost(functionName, [], testApiVersion, (err): err is SdkError => {
        return false;
      });

      const sentMessage = utils.findMessageByFunc(functionName);
      expect(sentMessage).toBeDefined();

      await utils.respondToMessage(sentMessage!, sdkError);

      expect(promise).rejects.toThrowError(
        new Error(`${ErrorCode.INTERNAL_ERROR}, message: Invalid response from host`),
      );
    });
  });
  describe('sendAndHandleSdkError', () => {
    let utils: Utils = new Utils();
    const actionName = 'test';
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(utils.mockWindow);
    });
    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });
    it('should throw SdkError if one is returned from host', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const sdkError = { errorCode: 1, message: 'SdkError Message' };
      await utils.respondToMessage(sentMessage, sdkError, 'result value');

      await messagePromise.catch((e) => expect(e).toStrictEqual(sdkError));
    });

    it('should throw true if first value returned from host is true', async () => {
      // this is a bug that should be fixed
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      await utils.respondToMessage(sentMessage, true, 'result value');

      await messagePromise.catch((e) => expect(e).toStrictEqual(true));
    });

    it('should return the second parameter returned from the host if undefined is returned from the host as the first parameter', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      // eslint-disable-next-line strict-null-checks/all
      await utils.respondToMessage(sentMessage, undefined, 'result value');

      await messagePromise.then((value) => expect(value).toBe('result value'));
    });

    it('should return the second parameter returned from the host if false is returned from the host as the first parameter', async () => {
      // this is a bug that should be fixed
      expect.assertions(1);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(testApiVersion, actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      await utils.respondToMessage(sentMessage, false, 'result value');

      await messagePromise.then((value) => expect(value).toBe('result value'));
    });

    it('should pass all args to host', async () => {
      expect.assertions(3);
      communication.initializeCommunication(undefined, testApiVersion);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      await utils.respondToMessage(initializeMessage);

      communication.sendAndHandleSdkError(testApiVersion, actionName, 'arg1', 'arg2', 'arg3');
      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage?.args) {
        expect(sentMessage?.args[0]).toStrictEqual('arg1');
        expect(sentMessage?.args[1]).toStrictEqual('arg2');
        expect(sentMessage?.args[2]).toStrictEqual('arg3');
      }
    });
  });
  describe('waitForMessageQueue', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
      app._initialize(window);
    });
    afterAll(() => {
      communication.Communication.currentWindow = window;
      communication.uninitializeCommunication();
    });
    it('should never call callback if parent message queue is not empty', () => {
      expect.assertions(0);
      communication.Communication.childWindow = utils.mockWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.parentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = (fn) => {
        fn();
      };

      // This function inserts a message into the parentMessageQueue
      communication.sendMessageEventToChild('testMessage');
      communication.waitForMessageQueue(communication.Communication.parentWindow, () => {
        // this callback only ever fires if the message queue associated with the passed in window is empty
        expect(false).toBeTruthy();
      });
    });
    it('should call callback once parent message queue is empty', () => {
      expect.assertions(1);
      communication.Communication.childWindow = utils.mockWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.parentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = (fn) => {
        fn();
      };

      communication.waitForMessageQueue(communication.Communication.parentWindow, () => {
        // this callback only ever fires if the message queue associated with the passed in window is empty
        expect(true).toBeTruthy();
      });

      // This function inserts a message into the parentMessageQueue
      communication.sendMessageEventToChild('testMessage');
      communication.uninitializeCommunication();
    });
    it('should throw if Communication.currentWindow is undefined', () => {
      expect.assertions(1);
      communication.Communication.currentWindow = undefined;

      expect(() => {
        communication.waitForMessageQueue(communication.Communication.parentWindow, () => {
          expect(false).toBeTruthy();
        });
      }).toThrow(TypeError);
    });
    it('should throw if Communication.currentWindow does not have setInterval defined', () => {
      expect.assertions(1);
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = undefined;

      expect(() => {
        communication.waitForMessageQueue(communication.Communication.parentWindow, () => {
          expect(false).toBeTruthy();
        });
      }).toThrow(TypeError);
    });
  });
  describe('sendMessageEventToChild', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      communication.uninitializeCommunication();
    });
    afterAll(() => {
      communication.uninitializeCommunication();
    });
    it('should post message to window if Communication.childWindow is set', () => {
      communication.Communication.childWindow = utils.childWindow;
      communication.Communication.childOrigin = utils.validOrigin;
      expect(utils.childMessages.length).toBe(0);
      communication.sendMessageEventToChild('testAction', ['arg zero']);
      expect(utils.childMessages.length).toBe(1);
      expect(utils.childMessages[0].func).toBe('testAction');
      if (!utils.childMessages[0].args) {
        throw new Error('No args found on message');
      }
      expect(utils.childMessages[0].args[0]).toBe('arg zero');
    });

    it('should add message to childWindow message queue if Communication.childOrigin is not set', () => {
      expect.assertions(1);
      communication.Communication.childWindow = utils.childWindow;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = (fn) => {
        fn();
      };
      /* eslint-disable-next-line strict-null-checks/all */
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(false).toBeFalsy();
      });
      communication.sendMessageEventToChild('testAction', ['arg zero']);
      /* eslint-disable-next-line strict-null-checks/all */
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(true).toBeFalsy();
      });
    });

    it('should add message to childWindow message queue if Communication.childWindow is not set', () => {
      expect.assertions(1);
      communication.Communication.childOrigin = utils.validOrigin;
      communication.Communication.currentWindow = utils.mockWindow;
      communication.Communication.currentWindow.setInterval = (fn) => {
        fn();
      };
      /* eslint-disable-next-line strict-null-checks/all */
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(false).toBeFalsy();
      });
      communication.sendMessageEventToChild('testAction', ['arg zero']);
      /* eslint-disable-next-line strict-null-checks/all */
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(true).toBeFalsy();
      });
    });
  });

  describe('nestedAppAuthBridge', () => {
    let utils: Utils = new Utils();
    const requestName = 'nestedAppAuth.execute';
    const messageData = { messageType: NestedAppAuthMessageEventNames.Request, id: 0, clientId: 'test' };
    const validMessage = JSON.stringify(messageData);
    const validResponseMessage = JSON.stringify({
      ...messageData,
      messageType: NestedAppAuthMessageEventNames.Response,
    });
    const setupNAABridge = async (supportsNAA = true): Promise<void> => {
      const supports = supportsNAA ? { nestedAppAuth: {} } : {};
      const initPromise = communication.initializeCommunication(undefined, testApiVersion);
      const initMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initMessage, FrameContexts.content, undefined, undefined, JSON.stringify({ supports }));
      await initPromise;
    };

    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      app._initialize(utils.mockWindow);
      communication.Communication.parentWindow = undefined;
      GlobalVars.isFramelessWindow = false;
    });

    afterAll(() => {
      communication.Communication.currentWindow = utils.mockWindow;
      communication.uninitializeCommunication();
    });

    describe('bridge initialization', () => {
      it('should not initialize the bridge if the current window does not support nestedAppAuth', async () => {
        await setupNAABridge(false);
        expect(communication.Communication.currentWindow.nestedAppAuthBridge).toBeUndefined();
      });

      it('should initialize the bridge if the current window supports nestedAppAuth', async () => {
        await setupNAABridge();
        expect(communication.Communication.currentWindow.nestedAppAuthBridge).toBeDefined();
      });
    });

    describe('postMessage', () => {
      it('should post a message when called with a valid NestedAppAuthRequest', async () => {
        utils.mockWindow.top = utils.topWindow;
        await setupNAABridge();
        communication.Communication.currentWindow.nestedAppAuthBridge.postMessage(validMessage);

        expect(utils.topMessages.length).toBe(1);
        expect(utils.topMessages[0].func).toBe(requestName);
        expect((utils.topMessages[0] as NestedAppAuthRequest).data).toEqual(validMessage);
      });

      it('should not post a message when called with an invalid message', async () => {
        const invalidMessage = 'Invalid message';
        utils.mockWindow.top = utils.topWindow;
        await setupNAABridge();
        communication.Communication.currentWindow.nestedAppAuthBridge.postMessage(invalidMessage);

        expect(utils.topMessages.length).toBe(0);
      });

      it('should not post a message when called with a valid JSON that is not a NestedAppAuthRequest', async () => {
        const nonRequestMessage = JSON.stringify({ messageType: 'NonRequestMessage' });
        utils.mockWindow.top = utils.topWindow;
        await setupNAABridge();
        communication.Communication.currentWindow.nestedAppAuthBridge.postMessage(nonRequestMessage);

        expect(utils.topMessages.length).toBe(0);
      });
    });

    describe('responding to nestedAppAuthRequest', () => {
      test('should respond to a valid nestedAppAuthRequest with a nestedAppAuthResponse', async () => {
        const onMessageReceivedCb = jest.fn();

        utils.mockWindow.top = utils.topWindow;
        await setupNAABridge();
        communication.Communication.currentWindow.nestedAppAuthBridge.addEventListener('message', onMessageReceivedCb);

        utils.respondToMessage(
          {
            id: 0,
            data: validMessage,
            func: 'nestedAppAuth.execute',
          },
          false,
          validResponseMessage,
        );

        expect(onMessageReceivedCb).toBeCalledWith(validResponseMessage);
      });

      test('should ignore invalid nestedAppAuthResponse', async () => {
        const onMessageReceivedCb = jest.fn();

        utils.mockWindow.top = utils.topWindow;
        await setupNAABridge();
        communication.Communication.currentWindow.nestedAppAuthBridge.addEventListener('message', onMessageReceivedCb);

        utils.respondToMessage(
          {
            id: 0,
            data: validMessage,
            func: 'nestedAppAuth.execute',
          },
          false,
          JSON.stringify({ messageType: 'InvalidMessage' }),
        );

        expect(onMessageReceivedCb).not.toBeCalled();
      });

      test('should ignore other SDK messages', async () => {
        const onMessageReceivedCb = jest.fn();

        utils.mockWindow.top = utils.topWindow;
        await setupNAABridge();
        communication.Communication.currentWindow.nestedAppAuthBridge.addEventListener('message', onMessageReceivedCb);

        utils.respondToMessage(
          {
            func: 'initialize',
            id: 0,
          } as MessageRequest,
          false,
          'initializeResponse',
        );

        expect(onMessageReceivedCb).not.toBeCalled();
      });
    });
  });
  describe('UUID tests', () => {
    let utils: Utils = new Utils();

    beforeEach(() => {
      // Set a mock window for testing
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      app._initialize(utils.mockWindow);
      communication.Communication.parentWindow = undefined;
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      communication.uninitializeCommunication();
    });
    afterAll(() => {
      GlobalVars.isFramelessWindow = false;
    });
    describe('postMessage', () => {
      it('should delete callback correctly with uuid', async () => {
        app._initialize(utils.mockWindow);
        communication.initializeCommunication(undefined, testApiVersion);
        let callbackWasCalled = 0;
        const initializeMessage = utils.findInitializeMessageOrThrow();
        let message = utils.findMessageByFunc('initialize');

        if (message) {
          expect(message.id).toBe(0);
        }

        await utils.respondToMessage(initializeMessage);

        communication.sendMessageToParent(testApiVersion, 'testAction', () => {
          callbackWasCalled++;
        });
        message = utils.findMessageByFunc('testAction');

        if (message) {
          expect(message.id).toBe(1);
        }

        await utils.respondToMessage({ id: message?.id, uuid: message?.uuid, func: 'testAction' }, false);

        expect(callbackWasCalled).toBe(1);

        //Call respondToMessageAgain, this should not call the callback since it should be deleted and callbackWasCalled should be still 1
        await utils.respondToMessage({ id: message?.id, uuid: message?.uuid, func: 'testAction' }, false);

        expect(callbackWasCalled).toBe(1);

        communication.sendMessageToParent(testApiVersion, 'testAction2', () => {
          callbackWasCalled++;
        });

        message = utils.findMessageByFunc('testAction2');

        if (message) {
          expect(message.id).toBe(2);
        }

        await utils.respondToMessage({ id: message?.id, uuid: message?.uuid, func: 'testAction2' }, false);
        expect(callbackWasCalled).toBe(2);
      });

      it('should delete callback correctly with number id only', async () => {
        app._initialize(utils.mockWindow);
        communication.initializeCommunication(undefined, testApiVersion);
        let callbackWasCalled = 0;
        const initializeMessage = utils.findInitializeMessageOrThrow();
        let message = utils.findMessageByFunc('initialize');

        if (message) {
          expect(message.id).toBe(0);
        }

        await utils.respondToMessage(initializeMessage);

        communication.sendMessageToParent(testApiVersion, 'testAction', () => {
          callbackWasCalled++;
        });
        message = utils.findMessageByFunc('testAction');

        if (message) {
          expect(message.id).toBe(1);
        }

        await utils.respondToMessage({ id: message?.id, func: 'testAction' }, false);

        expect(callbackWasCalled).toBe(1);

        //Call respondToMessageAgain, this should not call the callback since it should be deleted and callbackWasCalled should be still 1
        await utils.respondToMessage({ id: message?.id, func: 'testAction' }, false);

        expect(callbackWasCalled).toBe(1);

        communication.sendMessageToParent(testApiVersion, 'testAction2', () => {
          callbackWasCalled++;
        });

        message = utils.findMessageByFunc('testAction2');

        if (message) {
          expect(message.id).toBe(2);
        }

        await utils.respondToMessage({ id: message?.id, func: 'testAction2' }, false);
        expect(callbackWasCalled).toBe(2);
      });

      it('should not call callback with invalid uuid', async () => {
        app._initialize(utils.mockWindow);
        communication.initializeCommunication(undefined, testApiVersion);
        let callbackWasCalled = 0;
        const initializeMessage = utils.findInitializeMessageOrThrow();

        await utils.respondToMessage(initializeMessage);

        communication.sendMessageToParent(testApiVersion, 'testAction', () => {
          callbackWasCalled++;
        });

        const message = utils.findMessageByFunc('testAction');

        if (message) {
          expect(message.id).toBe(1);
        }

        await utils.respondToMessage({ id: message?.id, uuid: new UUID(), func: 'testAction' }, false);

        //Since uuid is set but is not the same value as the message request, message should not process and message should not call callback
        expect(callbackWasCalled).toBe(0);

        //Respond with correct set of message uuid and now callback should be called
        await utils.respondToMessage({ id: message?.id, uuid: message?.uuid, func: 'testAction' }, false);

        expect(callbackWasCalled).toBe(1);
      });
    });
  });
});
