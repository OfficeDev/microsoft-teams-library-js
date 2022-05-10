import { ErrorCode } from '../../src/public';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { stageView } from '../../src/public/stageView';
import { Utils } from '../utils';

describe('stageView', () => {
  const utils = new Utils();

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

  describe('open', () => {
    it('should not allow calls before initialization', async () => {
      await expect(stageView.open(stageViewParams)).rejects.toThrowError('The library has not yet been initialized');
    });

    Object.keys(FrameContexts)
      .map(k => FrameContexts[k])
      .forEach(frameContext => {
        it(`should not allow calls from ${frameContext} context`, async () => {
          if (frameContext === FrameContexts.content) {
            return;
          }

          await utils.initializeWithContext(frameContext);

          await expect(() => stageView.open(stageViewParams)).rejects.toThrowError(
            `This call is only allowed in following contexts: ["content"]. Current context: "${frameContext}".`,
          );
        });
      });

    it('should not allow a null StageViewParams parameter', () => {
      expect.assertions(1);
      utils.initializeWithContext('content').then(() => {
        expect(() => stageView.open(null)).rejects.toThrowError('[stageView.open] Stage view params cannot be null');
      });
    });

    describe('v1', () => {
      it('should pass along entire StageViewParams parameter in content context', done => {
        utils.initializeWithContext('content').then(() => {
          stageView.open(stageViewParams);

          const openStageViewMessage = utils.findMessageByFunc('stageView.open');
          expect(openStageViewMessage).not.toBeNull();
          expect(openStageViewMessage.args).toEqual([stageViewParams]);
          done();
        });
      });

      it('should invoke callback with result', done => {
        utils.initializeWithContext('content').then(() => {
          let callbackCalled = false;
          stageView.open(stageViewParams).then(err => {
            try {
              callbackCalled = true;
              expect(callbackCalled).toBe(true);
              expect(err).toBeUndefined();
              done(err);
            } catch (err) {
              done(err);
            }
          });

          const openStageViewMessage = utils.findMessageByFunc('stageView.open');
          expect(openStageViewMessage).not.toBeNull();
          utils.respondToMessage(openStageViewMessage, null);
        });
      });

      it('should invoke callback with error', done => {
        expect.assertions(2);
        utils.initializeWithContext('content').then(() => {
          const callback = (error): void => {
            expect(error).toBe('someError');
            done();
          };
          stageView.open(stageViewParams).catch(error => callback(error));

          const openStageViewMessage = utils.findMessageByFunc('stageView.open');
          expect(openStageViewMessage).not.toBeNull();
          utils.respondToMessage(openStageViewMessage, 'someError');
        });
      });
    });

    describe('v2', () => {
      it('should return promise and resolve', async () => {
        await utils.initializeWithContext('content');

        const promise = stageView.open(stageViewParams);

        const openStageViewMessage = utils.findMessageByFunc('stageView.open');
        expect(openStageViewMessage.args).toEqual([stageViewParams]);
        expect(openStageViewMessage).not.toBeNull();
        utils.respondToMessage(openStageViewMessage, null);
        await expect(promise).resolves.not.toThrowError();
      });

      it('should properly handle errors', async () => {
        await utils.initializeWithContext('content');

        const promise = stageView.open(stageViewParams);
        const err = { errorCode: ErrorCode.INTERNAL_ERROR };
        const openStageViewMessage = utils.findMessageByFunc('stageView.open');
        expect(openStageViewMessage).not.toBeNull();

        utils.respondToMessage(openStageViewMessage, err);

        await expect(promise).rejects.toEqual(err);
      });
    });
  });
});
