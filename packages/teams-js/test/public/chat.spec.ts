import { errorLibraryNotInitialized } from '../../src/internal/constants';
import * as app from '../../src/public/app/app';
import { chat, OpenGroupChatRequest, OpenSingleChatRequest } from '../../src/public/chat';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import {
  validateChatDeepLinkMessage,
  validateChatDeepLinkPrefix,
  validateChatDeepLinkTopic,
  validateDeepLinkUsers,
} from '../internal/deepLinkUtilities.spec';
import { isPromiseStillPending } from '../promiseTester';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('chat', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('Testing chat.isSupported function', () => {
    it('should not be supported before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => chat.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('Testing chat.openChat function', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
      );
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.task];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`openChat should throw error if chat capability is not supported in runtime config - Context: ${context}`, async () => {
          const chatRequest: OpenSingleChatRequest = {
            user: 'someUPN',
            message: 'someMessage',
          };
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          const promise = chat.openChat(chatRequest);
          expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
        });
        it(`should successfully pass chatRequest to non-legacy Teams host - Context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

          const chatRequest: OpenSingleChatRequest = {
            user: 'someUPN',
            message: 'someMessage',
          };

          const normalizedChatRequestArguments = {
            members: ['someUPN'],
            message: 'someMessage',
          };

          chat.openChat(chatRequest);

          const openChatMessage = utils.findMessageByFunc('chat.openChat');
          expect(openChatMessage).not.toBeNull();
          expect(openChatMessage.args).toEqual([normalizedChatRequestArguments]);
        });

        it(`should wait until response is received from non-legacy Teams host before resolving promise - Context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

          const chatRequest: OpenSingleChatRequest = {
            user: 'someUPN',
            message: 'someMessage',
          };

          const promise: Promise<void> = chat.openChat(chatRequest);
          expect(await isPromiseStillPending(promise)).toBe(true);

          const openChatMessage = utils.findMessageByFunc('chat.openChat');
          await utils.respondToMessage(openChatMessage, true);

          await expect(promise).resolves.not.toThrow();
        });

        it(`should successfully pass chatRequest to legacy Teams host - Context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: true, supports: { chat: {} } });

          const chatRequest: OpenSingleChatRequest = {
            user: 'someUPN',
            message: 'someMessage',
          };

          const promise: Promise<void> = chat.openChat(chatRequest);

          const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
          expect(executeDeepLinkMessage).not.toBeNull();
          expect(executeDeepLinkMessage.args).toHaveLength(1);

          const chatDeepLink: URL = new URL(executeDeepLinkMessage.args[0] as string);
          validateChatDeepLinkPrefix(chatDeepLink);
          validateDeepLinkUsers(chatDeepLink, [chatRequest.user]);
          validateChatDeepLinkMessage(chatDeepLink, chatRequest.message);

          await utils.respondToMessage(executeDeepLinkMessage, true);
          await expect(promise).resolves.not.toThrow();
        });
      }
    });
  });

  describe('Testing chat.openGroupChat function', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls when no members are provided', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: [],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError('OpenGroupChat Failed: No users specified');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content","task"]. Current context: "settings".',
      );
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.task];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`openGroupChat should throw error if chat capability is not supported in runtime config - Context: ${context}`, async () => {
          const chatRequest: OpenGroupChatRequest = {
            users: ['someUPN', 'someUPN2'],
            message: 'someMessage',
          };
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          const promise = chat.openGroupChat(chatRequest);
          expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it(`should successfully pass chatRequest to non-legacy Teams host - Context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

          const chatRequest: OpenGroupChatRequest = {
            users: ['someUPN', 'someUPN2'],
            message: 'someMessage',
            topic: 'someTopic',
          };

          const normalizedChatRequestArguments = {
            members: ['someUPN', 'someUPN2'],
            message: 'someMessage',
            topic: 'someTopic',
          };

          chat.openGroupChat(chatRequest);

          const openChatMessage = utils.findMessageByFunc('chat.openChat');
          expect(openChatMessage).not.toBeNull();
          expect(openChatMessage.args).toEqual([normalizedChatRequestArguments]);
        });

        it(`should successfully pass chatRequest to non-legacy Teams host when only one UPN is specified - Context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

          const chatRequest: OpenGroupChatRequest = {
            users: ['someUPN'],
            message: 'someMessage',
            topic: 'someTopic',
          };

          const normalizedChatRequestArgumentsForASingleUser = {
            members: ['someUPN'],
            message: 'someMessage',
          };

          chat.openGroupChat(chatRequest);

          const openChatMessage = utils.findMessageByFunc('chat.openChat');
          expect(openChatMessage).not.toBeNull();
          expect(openChatMessage.args).toEqual([normalizedChatRequestArgumentsForASingleUser]);
        });

        it(`should wait until response is received from non-legacy Teams host before resolving promise  - Context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

          const chatRequest: OpenGroupChatRequest = {
            users: ['someUPN'],
            message: 'someMessage',
            topic: 'someTopic',
          };

          const chatPromise = chat.openGroupChat(chatRequest);
          expect(await isPromiseStillPending(chatPromise)).toBe(true);

          const openChatMessage = utils.findMessageByFunc('chat.openChat');
          await utils.respondToMessage(openChatMessage, true);

          await expect(chatPromise).resolves.not.toThrow();
        });

        it(`should successfully pass chatRequest to legacy Teams host - Context:${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: true, supports: { chat: {} } });

          const chatRequest: OpenGroupChatRequest = {
            users: ['someUPN', 'someUPN2'],
            message: 'someMessage',
            topic: 'someTopic',
          };

          const promise: Promise<void> = chat.openGroupChat(chatRequest);

          const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
          expect(executeDeepLinkMessage).not.toBeNull();
          expect(executeDeepLinkMessage.args).toHaveLength(1);

          const chatDeepLink: URL = new URL(executeDeepLinkMessage.args[0] as string);
          validateChatDeepLinkPrefix(chatDeepLink);
          validateDeepLinkUsers(chatDeepLink, chatRequest.users);
          validateChatDeepLinkMessage(chatDeepLink, chatRequest.message);
          validateChatDeepLinkTopic(chatDeepLink, chatRequest.topic);

          await utils.respondToMessage(executeDeepLinkMessage, true);
          await expect(promise).resolves.not.toThrow();
        });
      }
    });
  });
});
