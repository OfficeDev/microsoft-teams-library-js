import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { ErrorCode } from '../../src/public/interfaces';
import { profile } from '../../src/public/profile';
import { Utils } from '../utils';

describe('profile', () => {
  describe('showProfile', () => {
    const allowedContexts = [FrameContexts.content];
    const desktopPlatformMock = new Utils();

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

    it('should not allow showProfile calls before initialization', () => {
      expect(() => profile.showProfile(undefined)).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should return an error if validation fails. context: ${context}`, async () => {
          await desktopPlatformMock.initializeWithContext(context);
          await expect(profile.showProfile(undefined)).rejects.toEqual({
            errorCode: ErrorCode.INVALID_ARGUMENTS,
            message: 'A request object is required',
          });
        });

        it(`sends expected message. context: ${context}`, async () => {
          await desktopPlatformMock.initializeWithContext(context);

          const request: profile.ShowProfileRequest = {
            persona: { identifiers: { Smtp: 'test@microsoft.com' }, displayName: 'test' },
            targetElementBoundingRect: {
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: 0,
              height: 0,
              x: 0,
              y: 0,
            } as DOMRect,
            triggerType: 'MouseHover',
          };

          profile.showProfile(request);

          const message = desktopPlatformMock.findMessageByFunc('profile.showProfile');
          expect(message).toBeDefined();
          expect(message.func).toEqual('profile.showProfile');
          expect(message.args.length).toEqual(1);

          const sentRequest = message.args[0];
          expect(sentRequest.persona).toEqual(request.persona);
          expect(sentRequest.triggerType).toEqual(request.triggerType);
          expect(sentRequest.targetRectangle).toEqual({
            x: request.targetElementBoundingRect.x,
            y: request.targetElementBoundingRect.y,
            width: request.targetElementBoundingRect.width,
            height: request.targetElementBoundingRect.height,
          });
        });
      }
    });
  });
});
