import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ErrorCode } from '../../src/public';
import * as app from '../../src/public/app/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import * as stageView from '../../src/public/stageView/stageView';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('stageView', () => {
  const utils = new Utils();

  function makeRuntimeSupportStageViewCapability() {
    utils.setRuntimeConfig({ apiVersion: 1, supports: { stageView: { self: {} } } });
  }

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  const stageViewParams: stageView.StageViewParams = {
    appId: 'appId',
    contentUrl: 'contentUrl',
    threadId: 'threadId',
    title: 'title',
    websiteUrl: 'websiteUrl',
    entityId: 'entityId',
    openMode: stageView.StageViewOpenMode.modal,
    messageId: 'messageId',
  };

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => stageView.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('open', () => {
    const allowedContexts = [FrameContexts.content];
    it('should not allow calls before initialization', async () => {
      await expect(stageView.open(stageViewParams)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === frameContext)) {
        it(`should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);

          await expect(() => stageView.open(stageViewParams)).rejects.toThrowError(
            `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
          );
        });
      }
    });

    it('should not allow a null StageViewParams parameter', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      expect(() => stageView.open(null)).rejects.toThrowError('[stageView.open] Stage view params cannot be null');
    });

    it('should pass along entire StageViewParams parameter in content context', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      const promise = stageView.open(stageViewParams);

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();
      expect(openStageViewMessage.args).toEqual([stageViewParams]);

      await expect(promise).resolves;
    });

    it('should return promise and resolve', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      const promise = stageView.open(stageViewParams);

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();

      utils.respondToMessage(openStageViewMessage, null);

      await expect(promise).resolves.not.toThrowError();
    });

    it('should properly handle errors', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      const promise = stageView.open(stageViewParams);

      const err = { errorCode: ErrorCode.INTERNAL_ERROR };
      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();

      utils.respondToMessage(openStageViewMessage, err);

      await expect(promise).rejects.toEqual(err);
    });

    it('should throw error when stageView is not supported.', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      expect.assertions(1);

      try {
        await stageView.open(stageViewParams);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
  });

  describe('self isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => stageView.self.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('self', () => {
    const allowedSelfContexts = [FrameContexts.content];

    it('should reject close before initialization', async () => {
      await expect(stageView.self.close('result')).rejects.toThrowError(errorLibraryNotInitialized);
      expect(utils.findMessageByFunc('stageView.self.close')).toBeNull();
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (!allowedSelfContexts.some((allowedSelfContexts) => allowedSelfContexts === frameContext)) {
        it(`should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);

          await expect(() => stageView.self.close()).rejects.toThrowError(
            `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
          );
        });
      }
    });

    it('should return promise and resolve', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      const promise = stageView.self.close();

      const closeStageViewMessage = utils.findMessageByFunc('stageView.self.close');
      expect(closeStageViewMessage).not.toBeNull();
      expect(closeStageViewMessage.args).toEqual([]);
      expect(utils.findMessageByFunc('stageView.self.close', 1)).toBeNull();

      utils.respondToMessage(closeStageViewMessage, null);

      await expect(promise).resolves.toBeUndefined();
    });

    it('should omit an explicitly undefined result on the wire', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      const promise = stageView.self.close(undefined);
      const message = utils.findMessageByActionName('stageView.self.close');
      expect(message.args).toEqual([]);
      utils.respondToMessage(message, null);
      await expect(promise).resolves.toBeUndefined();
    });

    it.each(['opaque result', '', '{"opaque":true}'])('should forward result %p unchanged once', async (result) => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { stageView: { self: { closeResult: {} } } } });

      const promise = stageView.self.close(result);
      const message = utils.findMessageByActionName('stageView.self.close');
      expect(message.args).toEqual([result]);
      expect(utils.findMessageByFunc('stageView.self.close', 1)).toBeNull();
      utils.respondToMessage(message, null);
      await expect(promise).resolves.toBeUndefined();
    });

    it.each(['opaque result', ''])('should reject result %p on an old host without sending close', async (result) => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      expect(stageView.self.isSupported()).toBe(true);
      await expect(stageView.self.close(result)).rejects.toEqual(errorNotSupportedOnPlatform);
      expect(utils.findMessageByFunc('stageView.self.close')).toBeNull();
    });

    it('should require the self capability even when stageView is supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { stageView: {} } });

      await expect(stageView.self.close('result')).rejects.toEqual(errorNotSupportedOnPlatform);
      expect(utils.findMessageByFunc('stageView.self.close')).toBeNull();
    });

    it.each<unknown>([null, 0, false, {}, []])('should reject invalid result %p without sending close', async (result) => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { stageView: { self: { closeResult: {} } } } });

      // @ts-expect-error Exercise invalid JavaScript callers.
      await expect(stageView.self.close(result)).rejects.toThrowError('[stageView.self.close] Result must be a string');
      expect(utils.findMessageByFunc('stageView.self.close')).toBeNull();
    });

    it.each(['opaque result', ''])('should propagate host errors for result %p without retrying', async (result) => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 4, supports: { stageView: { self: { closeResult: {} } } } });

      const promise = stageView.self.close(result);
      const message = utils.findMessageByActionName('stageView.self.close');
      const error = { errorCode: ErrorCode.INTERNAL_ERROR };
      utils.respondToMessage(message, error);
      await expect(promise).rejects.toEqual(error);
      expect(utils.findMessageByFunc('stageView.self.close', 1)).toBeNull();
    });

    it('should properly handle errors', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      makeRuntimeSupportStageViewCapability();

      const promise = stageView.self.close();

      const err = { errorCode: ErrorCode.INTERNAL_ERROR };
      const closeStageViewMessage = utils.findMessageByFunc('stageView.self.close');
      expect(closeStageViewMessage).not.toBeNull();

      utils.respondToMessage(closeStageViewMessage, err);

      await expect(promise).rejects.toEqual(err);
    });

    it('should throw error when stageView is not supported.', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      expect.assertions(1);

      try {
        await stageView.self.close();
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
  });
});
