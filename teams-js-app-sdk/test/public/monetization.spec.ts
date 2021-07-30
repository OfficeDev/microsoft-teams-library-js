import { monetization } from '../../src/public/monetization';
import { SdkError, ErrorCode } from '../../src/public/interfaces';
import { FramelessPostMocks } from '../framelessPostMocks';
import { app } from '../src/public/app';
import { Utils } from '../utils';
import { FrameContexts } from '../../src/public';

describe('monetization', () => {
  const desktopPlatformMock = new FramelessPostMocks();
  const utils = new Utils();

  beforeEach(() => {
    desktopPlatformMock.messages = [];
    app._initialize(desktopPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('openPurchaseExperience', () => {
    it('should not allow get meeting details calls with null callback', () => {
      expect(() => monetization.openPurchaseExperience(null)).toThrowError('[open purchase experience] Callback cannot be null');
    });

    it('should not allow calls before initialization', () => {
      expect(() =>
        monetization.openPurchaseExperience(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully execute callback and sdkError should be null', () => {
      desktopPlatformMock.initializeWithContext(FrameContexts.content);

      let callbackCalled = "false";
      let returnedSdkError: SdkError | null;
      monetization.openPurchaseExperience((error: SdkError | null) => {
        callbackCalled = "true";
        returnedSdkError = error;
      });
      var millisecondsToWait = 50;
      setTimeout(function() {
        expect(callbackCalled).toBe("true");
        expect(returnedSdkError).toBeNull();
      }, millisecondsToWait);
    });
  });
});
