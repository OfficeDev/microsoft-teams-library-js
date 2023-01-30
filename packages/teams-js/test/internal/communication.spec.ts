import * as communication from '../../src/internal/communication';
import { GlobalVars } from '../../src/internal/globalVars';
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

      it('should receive valid initialize response from parent when there is no parent window but the window has a native interface', async () => {
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

      it('should set Communication.parentWindow to undefined when the current window has a parent that is undefined', async () => {
        expect(utils.mockWindow.parent).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.parentWindow).toBeUndefined();
      });

      it('should set window.onNativeMessage for handling responses when the current window has a parent that is undefined', async () => {
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();

        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(communication.Communication.currentWindow.onNativeMessage).not.toBeUndefined();
      });

      it('if there is a parent window that IS NOT self, we will not send messages using onNativeMessage, will not register onNativeMessage, and Communication.parentWindow will be set to the parent of the curent window', async () => {
        expect.assertions(5);
        utils.mockWindow.parent = utils.parentWindow;
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();

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

      it('if there is a parent window that IS self, we will not send messages using onNativeMessage, will not register onNativeMessage, and Communication.parentWindow will be set to the opener of the curent window', async () => {
        expect.assertions(5);
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        utils.mockWindow.parent = utils.mockWindow;
        utils.mockWindow.opener = utils.parentWindow;

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

      it('if there is a parent window that IS self and NO opener, we will send messages using onNativeMessage, will register onNativeMessage, and Communication.parentWindow will be undefined', async () => {
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        utils.mockWindow.parent = utils.mockWindow;

        const initPromise = communication.initializeCommunication(undefined);
        const initMessage = utils.findInitializeMessageOrThrow();
        utils.respondToNativeMessage(initMessage, false, FrameContexts.content);

        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeTruthy();
        expect(communication.Communication.parentWindow).toBeUndefined();
        expect(communication.Communication.currentWindow.onNativeMessage).not.toBeUndefined();
      });

      it('should put sdk in frameless window mode when the current window has a parent that is undefined', async () => {
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
         * communication.processMessage is never called, which in turn never calls communication.updateRelationships
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

      it('should reject if no parent window and current window does not have nativeInterface defined', async () => {
        // In this case, because Communication.currentWindow is being initialized to undefined we fall back to the actual
        // window object created by jest, which does not have nativeInterface defined on it
        app._initialize(undefined);
        const initPromise = communication.initializeCommunication(undefined);
        await expect(initPromise).rejects.toThrowError('Initialization Failed. No Parent window found.');
      });

      it('should receive valid initialize response from parent when currentWindow has a parent with postMessage defined', async () => {
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

      it('should set Communication.currentWindow to the value that was passed to app._initialize', async () => {
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
        utils.respondToMessageAsOpener(initMessage, FrameContexts.content);
        await initPromise;

        expect(GlobalVars.isFramelessWindow).toBeFalsy();
        expect(utils.mockWindow.onNativeMessage).toBeUndefined();
        expect(communication.Communication.parentWindow).toStrictEqual(utils.mockWindow.opener);
      });

      it('should be in frameless mode when the parent window is self and there is no opener, and Communication.parentWindow should be set to undefined', async () => {
        expect.assertions(3);

        utils.mockWindow.opener = undefined;
        utils.mockWindow.parent = communication.Communication.currentWindow.self;

        communication.initializeCommunication(undefined);

        expect(GlobalVars.isFramelessWindow).toBeTruthy();
        expect(utils.mockWindow.onNativeMessage).not.toBeUndefined();
        expect(communication.Communication.parentWindow).toBeUndefined();
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
      expect(communication.Communication.parentOrigin).not.toBeNull();
      communication.uninitializeCommunication();
      expect(communication.Communication.parentOrigin).toBeNull();
    });

    it('should set Communication.childWindow to null', () => {
      app._initialize(utils.mockWindow);
      communication.Communication.childWindow = utils.mockWindow;
      expect(communication.Communication.childWindow).not.toBeNull();
      communication.uninitializeCommunication();
      expect(communication.Communication.childWindow).toBeNull();
    });

    it('should set Communication.childOrigin to null', () => {
      app._initialize(utils.mockWindow);
      communication.Communication.childOrigin = utils.mockWindow.origin;
      expect(communication.Communication.childOrigin).not.toBeNull();
      communication.uninitializeCommunication();
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
      communication.sendMessageToParent('testAction');
      communication.sendMessageToParent('testAction2');
      const message = utils.findMessageByFunc('testAction2');

      if (message) {
        expect(message.id).toBe(1);
      }

      communication.uninitializeCommunication();
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;
      communication.sendMessageToParent('testAction3');

      const messageAfterUninitialize = utils.findMessageByFunc('testAction3');
      if (messageAfterUninitialize) {
        expect(messageAfterUninitialize.id).toBe(0);
      }
    });

    it('unresolved message callbacks should not be triggered after communication has been uninitialized', () => {
      app._initialize(utils.mockWindow);
      communication.initializeCommunication(undefined);
      let callbackWasCalled = false;
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      communication.sendMessageToParent('testAction', () => {
        callbackWasCalled = true;
      });
      const tempProcessMessage = utils.processMessage;
      communication.uninitializeCommunication();
      utils.processMessage = tempProcessMessage;

      utils.respondToMessage({ id: 1, func: 'testAction' }, false);

      expect(callbackWasCalled).toBeFalsy();
    });

    it('unresolved message promises should not be triggered after communication has been uninitialized', async () => {
      app._initialize(utils.mockWindow);
      communication.initializeCommunication(undefined);

      const messageParent = communication.sendMessageToParentAsync('testAction');

      const tempProcessMessage = utils.processMessage;
      communication.uninitializeCommunication();
      utils.processMessage = tempProcessMessage;

      utils.respondToMessage({ id: 1, func: 'testAction' }, false);

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

      communication.sendMessageToParentAsync(actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to framelessPostMessage when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', async () => {
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined);

      const messagePromise = communication.sendMessageToParentAsync(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToNativeMessage(sentMessage, false, []);

      return expect(messagePromise).resolves;
    });
    it('should never send message if there is no Communication.currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow = undefined;

      communication.sendMessageToParentAsync(actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should still receive response to framelessPostMessage even if there is no Communication.currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined);
      communication.Communication.currentWindow = undefined;

      const messagePromise = communication.sendMessageToParentAsync(actionName);

      utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);

      await messagePromise;
      const sentMessage = utils.findMessageByFunc(actionName);
      // eslint-disable-next-line strict-null-checks/all
      expect(sentMessage).toBeDefined();
    });
    it('should never send message if there is no nativeInterface on the currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.sendMessageToParentAsync(actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should receive response to framelessPostMessage even if there is no nativeInterface on the currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(1);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined);
      communication.Communication.currentWindow.nativeInterface = undefined;

      const messagePromise = communication.sendMessageToParentAsync(actionName);

      utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);

      messagePromise.then(() => {
        expect(true).toBeTruthy();
      });
    });
    it('args passed in should be sent with the framelessPostMessage', () => {
      GlobalVars.isFramelessWindow = true;

      const arg1 = 'testArg1';
      communication.sendMessageToParentAsync(actionName, [arg1]);

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

      communication.sendMessageToParentAsync(actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to postMessage when running in a framed window and Communication.currentWindow has a parent with an origin', async () => {
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendMessageToParentAsync(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToMessage(sentMessage, false, []);

      return expect(messagePromise).resolves;
    });
    it('args passed in should be sent with the postMessage', () => {
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const arg1 = 'testArg1';
      communication.sendMessageToParentAsync(actionName, [arg1]);

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
    it('should not send postMessage until after initialization response received', () => {
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();

      communication.sendMessageToParentAsync(actionName);

      let sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage !== null) {
        throw new Error('Should not find a sent message until after the initialization response was received');
      }

      utils.respondToMessage(initializeMessage);

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

      communication.sendMessageToParent(actionName, ['zero', 'one']);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
      if (utils.messages[0].args) {
        expect(utils.messages[0].args[0]).toBe('zero');
        expect(utils.messages[0].args[1]).toBe('one');
      }
    });
    it('should receive response via callback when sending framelessPostMessage to window when running in a frameless window and Communication.currentWindow is set and has a nativeInterface', () => {
      expect.assertions(1);

      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined);

      communication.sendMessageToParent(actionName, () => {
        expect(true).toBeTruthy();
      });
      const sentMessage = utils.findMessageByFunc(actionName);

      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToNativeMessage(sentMessage, false, []);
    });
    it('should never send message if there is no Communication.currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow = undefined;

      communication.sendMessageToParent(actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should still receive response to framelessPostMessage even if there is no Communication.currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(2);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined);
      communication.Communication.currentWindow = undefined;

      communication.sendMessageToParent(actionName, () => {
        expect(true).toBeTruthy();
      });

      utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);

      const sentMessage = utils.findMessageByFunc(actionName);
      // eslint-disable-next-line strict-null-checks/all
      expect(sentMessage).toBeDefined();
    });
    it('should never send message if there is no nativeInterface on the currentWindow when message is sent', () => {
      GlobalVars.isFramelessWindow = true;
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.sendMessageToParent(actionName);

      expect(utils.messages.length).toBe(0);
    });
    it('should receive response to framelessPostMessage even if there is no nativeInterface on the currentWindow when message is sent', async () => {
      // This should probably be fixed, but if the host passes back a response with the right message id we will still notify the caller
      // even if they never actually sent their message to the host
      expect.assertions(1);
      utils.mockWindow.parent = undefined;
      communication.initializeCommunication(undefined);
      communication.Communication.currentWindow.nativeInterface = undefined;

      communication.sendMessageToParent(actionName, () => expect(true).toBeTruthy());

      utils.respondToNativeMessage({ id: 1, func: actionName }, false, []);
    });
    it('should send a message to window when running in a framed window and Communication.parentWindow and Communication.parentOrigin are set', () => {
      GlobalVars.isFramelessWindow = false;
      communication.Communication.parentWindow = utils.mockWindow.parent;
      communication.Communication.parentOrigin = utils.validOrigin;

      communication.sendMessageToParent(actionName);

      expect(utils.messages.length).toBe(1);
      expect(utils.messages[0].id).toBe(0);
      expect(utils.messages[0].func).toBe(actionName);
    });
    it('should receive response to postMessage when running in a framed window and Communication.currentWindow has a parent with an origin', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      communication.sendMessageToParent(actionName, () => expect(true).toBeTruthy());

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToMessage(sentMessage, false, []);
    });
    it('args passed in should be sent with the postMessage', () => {
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const arg1 = 'testArg1';
      communication.sendMessageToParent(actionName, [arg1]);

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
    it('should not send postMessage until after initialization response received', () => {
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();

      communication.sendMessageToParent(actionName);

      let sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage !== null) {
        throw new Error('Should not find a sent message until after the initialization response was received');
      }

      utils.respondToMessage(initializeMessage);

      sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('Did not find any message even after initialization response was received');
      }
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
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndUnwrap(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToMessage(sentMessage, actionName);

      const response = await messagePromise;
      expect(response).toBe(actionName);

      const messagePromise2 = communication.sendMessageToParentAsync(actionName2);

      const sentMessage2 = utils.findMessageByFunc(actionName2);
      if (sentMessage2 === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToMessage(sentMessage2, actionName2);

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
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleStatusAndReason(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      utils.respondToMessage(sentMessage, false, errorMessage);

      await expect(messagePromise).rejects.toThrowError(errorMessage);
    });

    it('should not throw an error if first returned value from host is true', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleStatusAndReason(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      utils.respondToMessage(sentMessage, true, errorMessage);

      await expect(messagePromise).resolves.toBeUndefined();
    });

    it('should pass all args to host', async () => {
      expect.assertions(3);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      communication.sendAndHandleStatusAndReason(actionName, 'arg1', 'arg2', 'arg3');
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
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const defaultErrorMessage = 'This is the default error message';
      const messagePromise = communication.sendAndHandleStatusAndReasonWithDefaultError(
        actionName,
        defaultErrorMessage,
      );

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      utils.respondToMessage(sentMessage, false, errorMessage);

      await expect(messagePromise).rejects.toThrowError(errorMessage);
    });

    it('should throw the default error passed in to the function if first returned value from host is false and host does not provide a custom error', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const defaultErrorMessage = 'This is the default error message';
      const messagePromise = communication.sendAndHandleStatusAndReasonWithDefaultError(
        actionName,
        defaultErrorMessage,
      );

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      utils.respondToMessage(sentMessage, false);

      await expect(messagePromise).rejects.toThrowError(defaultErrorMessage);
    });
    it('should not throw an error if first returned value from host is true', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleStatusAndReasonWithDefaultError(actionName, 'default error');

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const errorMessage = 'this message should show up in the error';
      utils.respondToMessage(sentMessage, true, errorMessage);

      await expect(messagePromise).resolves.toBeUndefined();
    });

    it('should pass all args to host', async () => {
      expect.assertions(3);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      communication.sendAndHandleStatusAndReasonWithDefaultError(actionName, 'default error', 'arg1', 'arg2', 'arg3');
      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage?.args) {
        expect(sentMessage?.args[0]).toStrictEqual('arg1');
        expect(sentMessage?.args[1]).toStrictEqual('arg2');
        expect(sentMessage?.args[2]).toStrictEqual('arg3');
      }
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
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }
      const sdkError = { errorCode: 1, message: 'SdkError Message' };
      utils.respondToMessage(sentMessage, sdkError, 'result value');

      await messagePromise.catch((e) => expect(e).toStrictEqual(sdkError));
    });

    it('should throw true if first value returned from host is true', async () => {
      // this is a bug that should be fixed
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      utils.respondToMessage(sentMessage, true, 'result value');

      await messagePromise.catch((e) => expect(e).toStrictEqual(true));
    });

    it('should return the second parameter returned from the host if undefined is returned from the host as the first parameter', async () => {
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      // eslint-disable-next-line strict-null-checks/all
      utils.respondToMessage(sentMessage, undefined, 'result value');

      await messagePromise.then((value) => expect(value).toBe('result value'));
    });

    it('should return the second parameter returned from the host if false is returned from the host as the first parameter', async () => {
      // this is a bug that should be fixed
      expect.assertions(1);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      const messagePromise = communication.sendAndHandleSdkError(actionName);

      const sentMessage = utils.findMessageByFunc(actionName);
      if (sentMessage === null) {
        throw new Error('No sent message was found');
      }

      utils.respondToMessage(sentMessage, false, 'result value');

      await messagePromise.then((value) => expect(value).toBe('result value'));
    });

    it('should pass all args to host', async () => {
      expect.assertions(3);
      communication.initializeCommunication(undefined);
      const initializeMessage = utils.findInitializeMessageOrThrow();
      utils.respondToMessage(initializeMessage);

      communication.sendAndHandleSdkError(actionName, 'arg1', 'arg2', 'arg3');
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
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(false).toBeFalsy();
      });
      communication.sendMessageEventToChild('testAction', ['arg zero']);
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
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(false).toBeFalsy();
      });
      communication.sendMessageEventToChild('testAction', ['arg zero']);
      communication.waitForMessageQueue(communication.Communication.childWindow, () => {
        expect(true).toBeFalsy();
      });
    });
  });
});
