import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ErrorCode } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { stageView } from '../../src/public/stageView';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('stageView', () => {
  const utils = new Utils();

  const allowedContexts = [FrameContexts.content];

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
  };

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => stageView.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('open', () => {
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
      expect(() => stageView.open(null)).rejects.toThrowError('[stageView.open] Stage view params cannot be null');
    });

    it('should pass along entire StageViewParams parameter in content context', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const promise = stageView.open(stageViewParams);

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();
      expect(openStageViewMessage.args).toEqual([stageViewParams]);

      await expect(promise).resolves;
    });

    it('should return promise and resolve', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      const promise = stageView.open(stageViewParams);

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();

      utils.respondToMessage(openStageViewMessage, null);

      await expect(promise).resolves.not.toThrowError();
    });

    it('should properly handle errors', async () => {
      await utils.initializeWithContext(FrameContexts.content);

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
});
