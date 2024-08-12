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
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.addAndConfigure should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.addAndConfigure({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.addAndConfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.addAndConfigure({ threadId: '' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: ThreadId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.addAndConfigure should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.addAndConfigure(mockHostEntity);
          const message = utils.findMessageByFunc('hostEntity.tab.addAndConfigure');
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
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: '' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: ThreadId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.reconfigure({ internalTabInstanceId: '', tabName: 'name' }, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: TabId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.reconfigure should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.reconfigure(mockTab, mockHostEntity);
          const message = utils.findMessageByFunc('hostEntity.tab.reconfigure');
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
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.rename should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.rename(mockTab, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.rename should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.rename(mockTab, { threadId: '' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: ThreadId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.rename should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.rename({ internalTabInstanceId: '', tabName: 'name' }, { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: TabId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.rename should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.rename(mockTab, mockHostEntity);
          const message = utils.findMessageByFunc('hostEntity.tab.rename');
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
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.remove should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.remove('tabId', { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.reconfigure should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.reconfigure(mockTab, { threadId: '' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: ThreadId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.remove should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.remove('', { threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: TabId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.remove should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.remove('tabId', mockHostEntity);
          const message = utils.findMessageByFunc('hostEntity.tab.remove');
          expect(message).not.toBeNull();
          expect(message?.args).toEqual(['tabId', mockHostEntity]);
          if (message) {
            utils.respondToMessage(message, true, true);
          }

          return expect(promise).resolves.toEqual(true);
        });
      });
    });

    describe('getAll', () => {
      it('hostEntity.tab.getAll should not allow calls before initialization', () => {
        expect(() => hostEntity.tab.getAll({ threadId: 'threadId' })).toThrowError(
          new Error(errorLibraryNotInitialized),
        );
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`hostEntity.tab.getAll should throw error when hostEntity is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          try {
            await hostEntity.tab.getAll({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.getAll should throw error when hostEntity.tabs is not supported when initialized with ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: {} } });
          try {
            await hostEntity.tab.getAll({ threadId: 'threadId' });
          } catch (e) {
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.NOT_SUPPORTED_ON_PLATFORM}, message: Not supported on platform`),
            );
          }
        });

        it(`hostEntity.tab.getAll should throw error when threadId is passed as empty and initialized with ${context} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          try {
            await hostEntity.tab.getAll({ threadId: '' });
          } catch (e) {
            console.log(e);
            expect(e).toEqual(
              new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: ThreadId cannot be null or empty`),
            );
          }
        });

        it(`hostEntity.tab.getAll should be pass message with the expected parameters and initialized with ${context} context`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { hostEntity: { tab: {} } } });
          const promise = hostEntity.tab.getAll(mockHostEntity);
          const message = utils.findMessageByFunc('hostEntity.tab.getAll');
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
