import { _uninitialize, _initialize } from '../../src/public/publicAPIs';
import { Utils } from '../utils';
import { FrameContexts, stageView } from '../../src/public';

describe('stageView', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
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

    it('should pass along entire StageViewParams parameter in content context', () => {
      utils.initializeWithContext('content');

      stageView.open(stageViewParams, () => {
        return;
      });

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();
      expect(openStageViewMessage.args).toEqual([stageViewParams]);
    });

    it('should invoke callback with result', () => {
      utils.initializeWithContext('content');

      let callbackCalled = false;
      stageView.open(stageViewParams, err => {
        expect(err).toBeNull();
        callbackCalled = true;
      });

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();
      utils.respondToMessage(openStageViewMessage, null);
      expect(callbackCalled).toBe(true);
    });

    it('should invoke callback with error', () => {
      utils.initializeWithContext('content');

      let callbackCalled = false;
      stageView.open(stageViewParams, err => {
        expect(err).toBe('someError');
        callbackCalled = true;
      });

      const openStageViewMessage = utils.findMessageByFunc('stageView.open');
      expect(openStageViewMessage).not.toBeNull();
      utils.respondToMessage(openStageViewMessage, 'someError');
      expect(callbackCalled).toBe(true);
    });
  });
});
