import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { SdkError } from '../../src/public/interfaces';
import { monetization } from '../../src/public/monetization';
import { FramelessPostMocks } from '../framelessPostMocks';

describe('monetization_v1', () => {
  const desktopPlatformMock = new FramelessPostMocks();

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
    it('should not allow calls before initialization', () => {
      expect(() =>
        monetization.openPurchaseExperience(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully execute callback and sdkError should be null', done => {
      desktopPlatformMock.initializeWithContext(FrameContexts.content).then(() => {
        monetization.openPurchaseExperience((error: SdkError | null) => {
          expect(error).toBeNull();
          done();
        });
        const message = desktopPlatformMock.findMessageByFunc('monetization.openPurchaseExperience');
        expect(message).not.toBeNull();

        const callbackId = message.id;
        desktopPlatformMock.respondToMessage({
          data: {
            id: callbackId,
            args: [null, undefined],
          },
        } as DOMMessageEvent);
      });
    });
  });
});
describe('monetization_v2', () => {
  const desktopPlatformMock = new FramelessPostMocks();

  beforeEach(() => {
    desktopPlatformMock.messages = [];
    // Set a mock window for testing
    app._initialize(desktopPlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('openPurchaseExperience', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        monetization.openPurchaseExperience(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully execute and not throw any error', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.content);
      const promise = monetization.openPurchaseExperience();
      const message = desktopPlatformMock.findMessageByFunc('monetization.openPurchaseExperience');
      expect(message).not.toBeNull();

      const callbackId = message.id;
      desktopPlatformMock.respondToMessage({
        data: {
          id: callbackId,
          args: [null, true],
        },
      } as DOMMessageEvent);
      await expect(promise).resolves.not.toThrow();
      await expect(promise).resolves.toBe(true);
    });
  });
});
