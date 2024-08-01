import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { hostEntity } from '../../src/private/hostEntity';
import { ErrorCode, FrameContexts, TabInstance } from '../../src/public';
import { app } from '../../src/public/app';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('hostEntity', () => {
  let utils = new Utils();

  beforeEach(() => {
    utils = new Utils();
    utils.mockWindow.parent = undefined;
    utils.messages = [];
    GlobalVars.isFramelessWindow = false;
  });

  afterEach(() => {
    app._uninitialize();
    jest.clearAllMocks();
  });

  describe('tab', () => {
    const mockTab: TabInstance = {
      internalTabInstanceId: 'tabId',
      tabName: 'name',
    };
    const mockHostEntity = {
      threadId: 'threadId',
      messageId: 'messageId',
    };

    describe('isSupported', () => {
      it('should throw if called before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => hostEntity.tab.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    describe('addAndConfigure', () => {
      it('hostEntity.tab.addAndConfigure should not allow calls before initialization', () => {
        expect(() => hostEntity.tab.addAndConfigure({ threadId: 'threadId' })).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`hostEntity.tab.addAndConfigure should throw error when hostEntity is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          try {
            await hostEntity.tab.addAndConfigure({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.addAndConfigure should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.addAndConfigure({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.addAndConfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.addAndConfigure({ threadId: '' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'ThreadId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.addAndConfigure should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.addAndConfigure(mockHostEntity);
          const message = utils.findMessageByFunc('associatedApps.tab.addAndConfigureApp');
          expect(message).not.toBeNull();
          expect(message?.args).toEqual([mockHostEntity, null]);
          if (message) {
            utils.respondToMessage(message, true, mockTab);
          }

          return expect(promise).resolves.toEqual(mockTab);
        });
      });
    });

    describe('reconfigure', () => {
      it('hostEntity.tab.reconfigure should not allow calls before initialization', () => {
        expect(() => hostEntity.tab.reconfigure(mockTab, { threadId: 'threadId' })).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`hostEntity.tab.reconfigure should throw error when hostEntity is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: '' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'ThreadId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.reconfigure({ internalTabInstanceId: '', tabName: 'name' }, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'TabId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.reconfigure should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.reconfigure(mockTab, mockHostEntity);
          const message = utils.findMessageByFunc('associatedApps.tab.reconfigure');
          expect(message).not.toBeNull();
          expect(message?.args).toEqual([mockTab, mockHostEntity]);
          if (message) {
            utils.respondToMessage(message, true, mockTab);
          }

          return expect(promise).resolves.toEqual(mockTab);
        });
      });
    });

    describe('rename', () => {
      it('hostEntity.tab.rename should not allow calls before initialization', () => {
        expect(() => hostEntity.tab.reconfigure(mockTab, { threadId: 'threadId' })).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`hostEntity.tab.rename should throw error when hostEntity is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          try {
            await hostEntity.tab.rename(mockTab, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.rename should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.rename(mockTab, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.rename should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.rename(mockTab, { threadId: '' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'ThreadId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.rename should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.rename({ internalTabInstanceId: '', tabName: 'name' }, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'TabId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.rename should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.rename(mockTab, mockHostEntity);
          const message = utils.findMessageByFunc('associatedApps.tab.rename');
          expect(message).not.toBeNull();
          expect(message?.args).toEqual([mockTab, mockHostEntity]);
          if (message) {
            utils.respondToMessage(message, true, mockTab);
          }

          return expect(promise).resolves.toEqual(mockTab);
        });
      });
    });
    describe('remove', () => {
      it('hostEntity.tab.remove should not allow calls before initialization', () => {
        expect(() => hostEntity.tab.reconfigure(mockTab, { threadId: 'threadId' })).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`hostEntity.tab.remove should throw error when hostEntity is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          try {
            await hostEntity.tab.remove('tabId', { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.remove should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.remove('tabId', { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: '' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'ThreadId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.remove should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.remove('', { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'TabId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.remove should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.remove('tabId', mockHostEntity);
          const message = utils.findMessageByFunc('associatedApps.tab.remove');
          expect(message).not.toBeNull();
          expect(message?.args).toEqual(['tabId', mockHostEntity]);
          if (message) {
            utils.respondToMessage(message, true, true);
          }

          return expect(promise).resolves.toEqual(true);
        });
      });
    });

    describe('getTabs', () => {
      it('hostEntity.tab.getTabs should not allow calls before initialization', () => {
        expect(() => hostEntity.tab.getTabs({ threadId: 'threadId' })).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`hostEntity.tab.getTabs should throw error when hostEntity is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          try {
            await hostEntity.tab.getTabs({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.getTabs should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.getTabs({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
            });
          }
        });

        it(`hostEntity.tab.getTabs should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.getTabs({ threadId: '' });
          } catch (e) {
            expect(e).toEqual({
              errorCode: ErrorCode.INVALID_ARGUMENTS,
              message: 'ThreadId cannot be null or empty',
            });
          }
        });

        it(`hostEntity.tab.getTabs should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.getTabs(mockHostEntity);
          const message = utils.findMessageByFunc('associatedApps.tab.getTabs');
          expect(message).not.toBeNull();
          expect(message?.args).toEqual([mockHostEntity]);
          if (message) {
            utils.respondToMessage(message, true, [mockTab]);
          }

          return expect(promise).resolves.toEqual([mockTab]);
        });
      });
    });
  });
});
