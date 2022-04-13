import { ChildAppWindow, ParentAppWindow } from '../../src/public';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('appWindow', () => {
  // Use to send a mock message from the app.

  const framedMock = new Utils();
  const framelessMock = new FramelessPostMocks();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyCallback = (): void => {};

  beforeEach(() => {
    framedMock.processMessage = null;
    framedMock.messages = [];
    framelessMock.messages = [];
    framedMock.childMessages = [];
    framedMock.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('ChildAppWindow', () => {
    const childAppWindow = new ChildAppWindow();

    describe('ChildAppWindow.postMessage', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => childAppWindow.postMessage('message')).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(frameContext => {
        it(`FRAMED: should initiate the post message to child: ${frameContext}`, async () => {
          await framedMock.initializeWithContext(frameContext);
          childAppWindow.postMessage('exampleMessage');
          const message = framedMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });

        it(`FRAMELESS: should initiate the post message to child: ${frameContext}`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          childAppWindow.postMessage('exampleMessage');
          const message = framelessMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });
      });
    });
    describe('ChildAppWindow.addEventListener', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => childAppWindow.addEventListener('message', emptyCallback)).toThrowError(
          'The library has not yet been initialized',
        );
      });

      Object.values(FrameContexts).forEach(frameContext => {
        it(`FRAMED: should initiate the registration call for messageForParent: ${frameContext}`, async () => {
          await framedMock.initializeWithContext(frameContext);
          childAppWindow.addEventListener('message', emptyCallback);
          const message = framedMock.findMessageByFunc('registerHandler');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMELESS: should initiate the registration call for 'messageForParent: ${frameContext}`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          childAppWindow.addEventListener('message', emptyCallback);
          const message = framelessMock.findMessageByFunc('registerHandler');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['messageForParent']);
        });
      });
    });
  });
  describe('ParentAppWindow', () => {
    const parentAppWindow = new ParentAppWindow();
    const allowedContexts = [FrameContexts.task];
    describe('ParentAppWindow.postMessage', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => parentAppWindow.postMessage('message')).toThrowError('The library has not yet been initialized');
      });

      Object.values(FrameContexts).forEach(frameContext => {
        if (allowedContexts.some(allowedContext => allowedContext == frameContext)) {
          it(`FRAMED: should initiate the post message to parent: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            parentAppWindow.postMessage('exampleMessage');
            const message = framedMock.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['exampleMessage']);
          });

          it(`FRAMELESS: should initiate the post message to parent: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            parentAppWindow.postMessage('exampleMessage');
            const message = framelessMock.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['exampleMessage']);
          });
        } else {
          it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            expect(parentAppWindow.postMessage).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
          it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(parentAppWindow.postMessage).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        }
      });
    });
    describe('ParentAppWindow.addEventListener', () => {
      it('should not allow calls before initialization', () => {
        expect.assertions(1);
        expect(() => parentAppWindow.addEventListener('message', emptyCallback)).toThrowError(
          'The library has not yet been initialized',
        );
      });

      Object.values(FrameContexts).forEach(frameContext => {
        if (allowedContexts.some(allowedContext => allowedContext == frameContext)) {
          it(`FRAMED: should initiate the registration call for messageForChild: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            parentAppWindow.addEventListener('message', emptyCallback);
            const message = framedMock.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForChild']);
          });

          it(`FRAMELESS: should initiate the registration call for 'messageForChild: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            parentAppWindow.addEventListener('message', emptyCallback);
            const message = framelessMock.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForChild']);
          });
        } else {
          it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            expect(parentAppWindow.postMessage).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
          it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(parentAppWindow.postMessage).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        }
      });
    });
  });
});
