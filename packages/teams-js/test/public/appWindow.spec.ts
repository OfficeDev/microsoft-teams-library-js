import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ChildAppWindow, ParentAppWindow } from '../../src/public';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('appWindow', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyCallback = (): void => {};
  const testMessage = 'exampleMessage';
  describe('Child app window', () => {
    const childAppWindow = new ChildAppWindow();
    it('childAppWindow.postMessage should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => childAppWindow.postMessage('message')).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('childAppWindow.addEventListener should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => childAppWindow.addEventListener('message', emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    describe('frameless', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.mockWindow.parent = undefined;
        utils.messages = [];
        GlobalVars.isFramelessWindow = false;
      });
      afterEach(() => {
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });

      describe('ChildAppWindow.postMessage', () => {
        Object.values(FrameContexts).forEach((frameContext) => {
          it(`should initiate the post message to child: ${frameContext}`, async () => {
            await utils.initializeWithContext(frameContext);
            expect(GlobalVars.isFramelessWindow).toBeTruthy();
            childAppWindow.postMessage(testMessage);
            const message = utils.findMessageByFunc('messageForChild');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual([testMessage]);
          });
        });
      });

      describe('ChildAppWindow.addEventListener', () => {
        Object.values(FrameContexts).forEach((frameContext) => {
          it(`should initiate the registration call for 'messageForParent: ${frameContext}`, async () => {
            await utils.initializeWithContext(frameContext);
            expect(GlobalVars.isFramelessWindow).toBeTruthy();
            childAppWindow.addEventListener('message', emptyCallback);
            const message = utils.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForParent']);
          });
        });
      });
    });
    describe('framed', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.messages = [];
      });
      afterEach(() => {
        app._uninitialize();
      });
      describe('ChildAppWindow.postMessage', () => {
        Object.values(FrameContexts).forEach((frameContext) => {
          it(`should initiate the post message to child: ${frameContext}`, async () => {
            await utils.initializeWithContext(frameContext);
            expect(GlobalVars.isFramelessWindow).toBeFalsy();
            childAppWindow.postMessage(testMessage);
            const message = utils.findMessageByFunc('messageForChild');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual([testMessage]);
          });
        });
      });
      describe('ChildAppWindow.addEventListener', () => {
        Object.values(FrameContexts).forEach((frameContext) => {
          it(`should initiate the registration call for messageForParent: ${frameContext}`, async () => {
            await utils.initializeWithContext(frameContext);
            expect(GlobalVars.isFramelessWindow).toBeFalsy();
            childAppWindow.addEventListener('message', emptyCallback);
            const message = utils.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForParent']);
          });
        });
      });
    });
  });

  describe('Parent app window', () => {
    const parentAppWindow = new ParentAppWindow();
    const allowedContexts = [FrameContexts.task];
    it('ParentAppWindow.postMessage should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => parentAppWindow.postMessage('message')).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('ParentAppWindow.addEventListner should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => parentAppWindow.addEventListener('message', emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    describe('frameless', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.mockWindow.parent = undefined;
        utils.messages = [];
        GlobalVars.isFramelessWindow = false;
      });
      afterEach(() => {
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });

      describe('ParentAppWindow.postMessage', () => {
        Object.values(allowedContexts).forEach((frameContext) => {
          if (allowedContexts.some((allowedContext) => allowedContext == frameContext)) {
            it(`should initiate the post message to parent: ${frameContext}`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeTruthy();
              parentAppWindow.postMessage(testMessage);
              const message = utils.findMessageByFunc('messageForParent');
              expect(message).not.toBeUndefined();
              expect(message.args).toStrictEqual([testMessage]);
            });
          } else {
            it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeTruthy();
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
        Object.values(FrameContexts).forEach((frameContext) => {
          if (allowedContexts.some((allowedContext) => allowedContext == frameContext)) {
            it(`should initiate the registration call for 'messageForChild: ${frameContext}`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeTruthy();
              parentAppWindow.addEventListener('message', emptyCallback);
              const message = utils.findMessageByFunc('registerHandler');
              expect(message).not.toBeUndefined();
              expect(message.args).toStrictEqual(['messageForChild']);
            });
          } else {
            it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeTruthy();
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
    describe('framed', () => {
      let utils: Utils = new Utils();
      beforeEach(() => {
        utils = new Utils();
        utils.messages = [];
      });
      afterEach(() => {
        app._uninitialize();
      });
      describe('ParentAppWindow.postMessage', () => {
        Object.values(FrameContexts).forEach((frameContext) => {
          if (allowedContexts.some((allowedContext) => allowedContext == frameContext)) {
            it(`should initiate the post message to parent: ${frameContext}`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeFalsy();
              parentAppWindow.postMessage(testMessage);
              const message = utils.findMessageByFunc('messageForParent');
              expect(message).not.toBeUndefined();
              expect(message.args).toStrictEqual([testMessage]);
            });
          } else {
            it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeFalsy();
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
        Object.values(FrameContexts).forEach((frameContext) => {
          if (allowedContexts.some((allowedContext) => allowedContext == frameContext)) {
            it(`should initiate the registration call for messageForChild: ${frameContext}`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeFalsy();
              parentAppWindow.addEventListener('message', emptyCallback);
              const message = utils.findMessageByFunc('registerHandler');
              expect(message).not.toBeUndefined();
              expect(message.args).toStrictEqual(['messageForChild']);
            });
          } else {
            it(`should to not allow to initialize FramContext with context: ${frameContext}.`, async () => {
              await utils.initializeWithContext(frameContext);
              expect(GlobalVars.isFramelessWindow).toBeFalsy();
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
});
