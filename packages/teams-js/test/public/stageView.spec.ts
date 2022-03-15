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
    it('should not allow calls before initialization', () => {
      expect(() => stageView.open(stageViewParams)).toThrowError('The library has not yet been initialized');
    });

    Object.keys(FrameContexts)
      .map(k => FrameContexts[k])
      .forEach(frameContext => {
        if (frameContext !== 'content') {
          it.skip(`should not allow calls from ${frameContext} context`, () => {
            utils.initializeWithContext(frameContext);

            expect(() => stageView.open(stageViewParams)).toThrowError(
              `This call is not allowed in the '${frameContext}' context`,
            );
          });
        }
      });

    it('should not allow a null StageViewParams parameter', () => {
      utils.initializeWithContext('content');

      expect(() => stageView.open(null)).toThrowError('[stageView.open] Stage view params cannot be null');
    });

    describe('v1', () => {
      // it('should pass along entire StageViewParams parameter in content context', () => {
      //   utils.initializeWithContext('content');

      //   stageView.open(stageViewParams, () => {
      //     return;
      //   });

      //   const openStageViewMessage = utils.findMessageByFunc('stageView.open');

      //   expect(openStageViewMessage).not.toBeNull();
      //   expect(openStageViewMessage.args).toEqual([stageViewParams]);
      // });

      it('should pass along entire StageViewParams parameter in content context', () => {
        utils.initializeWithContext('content');

        stageView.open(stageViewParams, () => {
          return;
        });

        const openStageViewMessage = utils.findMessageByFunc('stageView.open');
        expect(openStageViewMessage).not.toBeNull();
        expect(openStageViewMessage.args).toEqual([stageViewParams]);
      });

      it('should invoke callback with result', done => {
        utils.initializeWithContext('content');

        let callbackCalled = false;
        stageView.open(stageViewParams, err => {
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

      it('should invoke callback with error', done => {
        utils.initializeWithContext('content');

        let callbackCalled = false;
        stageView.open(stageViewParams, () => {
          try {
            callbackCalled = true;
            done();
          } catch (error) {
            expect(callbackCalled).toBe(true);
            expect(error).toBe('someError');
            done(error);
          }
        });

        const openStageViewMessage = utils.findMessageByFunc('stageView.open');
        expect(openStageViewMessage).not.toBeNull();
        utils.respondToMessage(openStageViewMessage, 'someError');
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
