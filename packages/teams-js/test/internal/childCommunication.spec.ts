import {
  handleIncomingMessageFromChild,
  sendMessageEventToChild,
  shouldEventBeRelayedToChild,
  shouldProcessChildMessage,
  uninitializeChildCommunication,
} from '../../src/internal/childCommunication';
import { uninitializeCommunication } from '../../src/internal/communication';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { activateChildProxyingCommunication, overwriteFeatureFlagsState } from '../../src/public';
import * as app from '../../src/public/app/app';
import { resetBuildFeatureFlags } from '../../src/public/featureFlags';
import { Utils } from '../utils';

describe('childCommunication', () => {
  let utils = new Utils();
  let childOrigin = '';
  let mockOrigin = '';

  beforeEach(() => {
    utils = new Utils();
    childOrigin = utils.childWindow.location.origin;
    mockOrigin = utils.mockWindow.location.origin;
  });

  afterEach(() => {
    uninitializeCommunication();
  });

  describe('childProxyingFeatureFlag off', () => {
    beforeEach(() => {
      resetBuildFeatureFlags();
    });

    describe('shouldEventBeRelayedToChild', () => {
      it('should return false', () => {
        expect(shouldEventBeRelayedToChild()).toBe(false);
      });
    });

    describe('shouldProcessChildMessage', () => {
      it('should return false', () => {
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(false);
      });
    });
  });

  describe('childProxyingFeatureFlag on', () => {
    beforeEach(() => {
      activateChildProxyingCommunication();
    });

    afterEach(() => {
      resetBuildFeatureFlags();
    });

    describe('uninitializeChildCommunication', () => {
      it('after un-initializing should avoid message event relaying to child apps', () => {
        // this will set the child window
        shouldProcessChildMessage(utils.childWindow, childOrigin);
        expect(shouldEventBeRelayedToChild()).toBe(true);

        uninitializeChildCommunication();

        expect(shouldEventBeRelayedToChild()).toBe(false);
      });

      it('after un-initializing new child messages will be proxied to a new window', () => {
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(true);
        expect(shouldProcessChildMessage(utils.mockWindow, mockOrigin)).toBe(false);

        uninitializeChildCommunication();

        expect(shouldProcessChildMessage(utils.mockWindow, mockOrigin)).toBe(true);
      });
    });

    describe('shouldEventBeRelayedToChild', () => {
      it('should return false if child window is not initialized', () => {
        expect(shouldEventBeRelayedToChild()).toBe(false);
      });

      it('should return true if child window is initialized', () => {
        shouldProcessChildMessage(utils.childWindow, childOrigin);
        expect(shouldEventBeRelayedToChild()).toBe(true);
      });
    });

    describe('shouldProcessChildMessage', () => {
      it('should return true if its the first message from a child window', () => {
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(true);
      });

      it('should return false if child window is closed', () => {
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(true);

        utils.childWindow.closed = true;
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(false);
      });

      it('should return false if child window is not the source of the message', () => {
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(true);
        expect(shouldProcessChildMessage(utils.mockWindow, mockOrigin)).toBe(false);
      });

      it('should return true if previous child window is closed and new child message is received', () => {
        expect(shouldProcessChildMessage(utils.childWindow, childOrigin)).toBe(true);

        utils.childWindow.closed = true;
        expect(shouldProcessChildMessage(utils.mockWindow, mockOrigin)).toBe(true);
      });
    });

    describe('sendMessageEventToChild', () => {
      it('it should send message event to child window', () => {
        // Set child window
        shouldProcessChildMessage(utils.childWindow, childOrigin);

        // Send event
        sendMessageEventToChild('event1');

        // Should have received previous messages
        expect(utils.childMessages).toContainEqual({ func: 'event1', args: [] });
      });

      it('should add message to queue if child window is not set', () => {
        sendMessageEventToChild('test1');
        sendMessageEventToChild('test2');

        // Set child window
        shouldProcessChildMessage(utils.childWindow, childOrigin);

        // Trigger queue to be flushed
        handleIncomingMessageFromChild({ data: {} } as DOMMessageEvent, utils.childWindow, jest.fn(), jest.fn());

        // Should have received previous messages
        expect(utils.childMessages).toContainEqual({ func: 'test1', args: [] });
        expect(utils.childMessages).toContainEqual({ func: 'test2', args: [] });
      });
    });

    describe('handleIncomingMessageFromChild', () => {
      afterEach(() => {
        app._uninitialize();
      });

      it('messages proxied from child should be tagged as proxied from child', async () => {
        expect.assertions(1);
        await utils.initializeWithContext('context');
        await utils.sendMessageFromChild('test1', ['testArg1']);
        const sentMessage = utils.findMessageByActionName('test1');
        expect(sentMessage.isProxiedFromChild).toBe(true);
      });

      it('messages that do not come from the parent are assumed from a child app and proxied to the parent', async () => {
        expect.assertions(1);
        await utils.initializeWithContext('context');
        await utils.sendMessageFromChild('test1', ['testArg1']);
        const sentMessage = utils.findMessageByFunc('test1');
        expect(sentMessage).not.toBeNull();
      });

      it('only messages of active child window are proxied to the parent', async () => {
        expect.assertions(2);
        await utils.initializeWithContext('context');

        // Send message from active child window
        await utils.sendMessageFromChild('test1', ['testArg1']);
        const sentMessage = utils.findMessageByFunc('test1');
        expect(sentMessage).not.toBeNull();

        // Send message from other child window
        await utils.sendCustomMessage(
          utils.validOrigin,
          {
            postMessage: jest.fn(),
            close: jest.fn(),
            closed: false,
          },
          'test2',
          'testArg2',
        );
        const secondMessage = utils.findMessageByFunc('test2');
        expect(secondMessage).toBeNull();
      });

      it('the child window that sent the message receives the response back', async () => {
        expect.assertions(1);
        await utils.initializeWithContext('context');
        const requestID = await utils.sendMessageFromChild('test1', ['testArg1']);
        const sentMessage = utils.findMessageByActionName('test1');
        await utils.respondToMessage(sentMessage, 'testResponse');
        const response = utils.findMessageResponseInChildById(requestID);
        expect(response).not.toBeNull();
      });

      it('if a child window changes origin, it does not receive the response initiated by another child window', async () => {
        expect.assertions(1);
        await utils.initializeWithContext('context');

        // Send custom message from custom child window
        const mockedInitialChildWindow = {
          postMessage: jest.fn(),
          close: jest.fn(),
          closed: false,
        };
        const requestID = await utils.sendCustomMessage(utils.tabOrigin, mockedInitialChildWindow, 'test1', 'testArg1');

        // Close the initial child window and set the current child window
        mockedInitialChildWindow.closed = true;
        shouldProcessChildMessage(utils.childWindow, childOrigin);

        // Respond to the message from the initial child window
        const sentMessage = utils.findMessageByActionName('test1');
        await utils.respondToMessage(sentMessage, 'testResponse');
        const response = utils.findMessageResponseInChildById(requestID);
        expect(response).toBeNull();
      });

      describe('disableEnforceOriginMatchForChildResponses on', () => {
        beforeEach(() => {
          overwriteFeatureFlagsState({ disableEnforceOriginMatchForChildResponses: true });
        });

        afterEach(() => {
          overwriteFeatureFlagsState({ disableEnforceOriginMatchForChildResponses: false });
        });

        it('the child window that sent the message receives the response back', async () => {
          expect.assertions(1);
          await utils.initializeWithContext('context');
          const requestID = await utils.sendMessageFromChild('test1', ['testArg1']);
          const sentMessage = utils.findMessageByActionName('test1');
          await utils.respondToMessage(sentMessage, 'testResponse');
          const response = utils.findMessageResponseInChildById(requestID);
          expect(response).not.toBeNull();
        });

        it('if a child window changes origin it still receives response for request', async () => {
          expect.assertions(1);
          await utils.initializeWithContext('context');

          // Send custom message from custom child window
          const mockedInitialChildWindow = {
            postMessage: jest.fn(),
            close: jest.fn(),
            closed: false,
          };
          const requestID = await utils.sendCustomMessage(
            utils.tabOrigin,
            mockedInitialChildWindow,
            'test1',
            'testArg1',
          );

          // Close the initial child window and set the current child window
          mockedInitialChildWindow.closed = true;
          shouldProcessChildMessage(utils.childWindow, childOrigin);

          // Respond to the message from the initial child window
          const sentMessage = utils.findMessageByActionName('test1');
          await utils.respondToMessage(sentMessage, 'testResponse');
          const response = utils.findMessageResponseInChildById(requestID);
          expect(response).not.toBeNull();
        });
      });
    });
  });
});
