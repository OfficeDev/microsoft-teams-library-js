import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { SdkError } from '../../src/public/interfaces';
import { monetization } from '../../src/public/monetization';
import { FramelessPostMocks } from '../framelessPostMocks';

const allowedContexts = [FrameContexts.content];
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

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContext => allowedContext == context)) {
        it(`should to not allow to initialize FramContext with context: ${context}.`, async () => {
          await desktopPlatformMock.initializeWithContext(context);
          expect(() => {
            monetization.openPurchaseExperience((error: SdkError | null) => {
              expect(error).toBeNull();
            });
          }).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('should successfully execute callback and sdkError should be null', async () => {
      await desktopPlatformMock.initializeWithContext(FrameContexts.content);
      monetization.openPurchaseExperience((error: SdkError | null) => {
        expect(error).toBeNull();
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
      expect(() => monetization.openPurchaseExperience(undefined)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContext => allowedContext == context)) {
        it(`should to not allow to initialize FramContext with context: ${context}.`, async () => {
          await desktopPlatformMock.initializeWithContext(context);
          expect(() => monetization.openPurchaseExperience()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
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
