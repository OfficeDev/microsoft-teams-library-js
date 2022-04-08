import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { ErrorCode } from '../../src/public/interfaces';
import { profile } from '../../src/public/profile';
import { Utils } from '../utils';

describe('profile', () => {
  describe('openCard', () => {
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

    it('should return an error if validation fails', () => {
      utils.initializeWithContext('content');

      let error;
      profile.showProfile(err => {
        error = err;
      }, undefined);

      expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
    });

    it('sends expected message', () => {
      utils.initializeWithContext('content');

      const request: profile.ShowProfileRequest = {
        persona: { identifiers: { PersonaType: 'User', Smtp: 'test@microsoft.com' }, displayName: 'test' },
        targetElementBoundingRect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRect,
        triggerType: 'MouseHover',
      };

      let error;
      profile.showProfile(err => {
        error = err;
      }, request);

      expect(error).toBeUndefined();
      expect(utils.messages.length).toEqual(2);
      expect(utils.messages[1].func).toEqual('profile.showProfile');
      expect(utils.messages[1].args.length).toEqual(1);

      const sentRequest = utils.messages[1].args[0];
      expect(sentRequest.persona).toEqual(request.persona);
      expect(sentRequest.triggerType).toEqual(request.triggerType);
      expect(sentRequest.targetElementBoundingRect).toEqual(request.targetElementBoundingRect);
    });
  });
});
