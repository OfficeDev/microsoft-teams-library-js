import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { teamsCore } from '../../src/public/teamsAPIs';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('Testing TeamsCore Capability', () => {
  describe('FRAMED - teamsCore Capability tests', () => {
    // Use to send a mock message from the app.

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
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
    });

    describe('Testing teamsCore.isSupported function', () => {
      it('should throw if called before initialization', () => {
        utils.uninitializeRuntimeConfig();
        expect(() => teamsCore.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      });
    });

    describe('Testing teamsCore.enablePrintCapability function', () => {
      it('teamsCore.enablePrintCapability should not allow calls before initialization', () => {
        expect(() => teamsCore.enablePrintCapability()).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`teamsCore.enablePrintCapability should throw error when teamsCore is not supported. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            teamsCore.enablePrintCapability();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
          utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        });
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`Ctrl+P shouldn't call teamsCore.enablePrintCapability if printCapabilty is disabled. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = false;
          jest.spyOn(teamsCore, 'print').mockImplementation((): void => {
            handlerCalled = true;
          });
          const printEvent = new Event('keydown');
          (printEvent as any).keyCode = 80;
          (printEvent as any).ctrlKey = true;

          document.dispatchEvent(printEvent);
          expect(handlerCalled).toBeFalsy();
        });

        it(`Cmd+P shouldn't call teamsCore.enablePrintCapability if printCapabilty is disabled. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = false;
          jest.spyOn(teamsCore, 'print').mockImplementation((): void => {
            handlerCalled = true;
          });
          const printEvent = new Event('keydown');
          (printEvent as any).keyCode = 80;
          (printEvent as any).metaKey = true;

          document.dispatchEvent(printEvent);
          expect(handlerCalled).toBeFalsy();
        });

        it(`teamsCore.enablePrintCapability should successfully call default print handler. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = false;
          teamsCore.enablePrintCapability();
          jest.spyOn(window, 'print').mockImplementation((): void => {
            handlerCalled = true;
          });

          print();

          expect(handlerCalled).toBeTruthy();
        });

        it(`Ctrl+P should successfully call teams.enablePrintCapability. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = false;
          teamsCore.enablePrintCapability();
          jest.spyOn(window, 'print').mockImplementation((): void => {
            handlerCalled = true;
          });
          const printEvent = new Event('keydown');
          (printEvent as any).keyCode = 80;
          (printEvent as any).ctrlKey = true;

          document.dispatchEvent(printEvent);
          expect(handlerCalled).toBeTruthy();
        });

        it(`Cmd+P should successfully call teams.enablePrintCapability. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let handlerCalled = false;
          teamsCore.enablePrintCapability();
          jest.spyOn(window, 'print').mockImplementation((): void => {
            handlerCalled = true;
          });
          const printEvent = new Event('keydown');
          (printEvent as any).keyCode = 80;
          (printEvent as any).metaKey = true;

          document.dispatchEvent(printEvent);
          expect(handlerCalled).toBe(true);
        });
      });
    });

    describe('Testing teamsCore.registerOnLoadHandler function', () => {
      it('should not allow calls before initialization', () => {
        expect(() =>
          teamsCore.registerOnLoadHandler(() => {
            return false;
          }),
        ).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`teamsCore.registerOnLoadHandler should throw error when teamsCore is not supported. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            teamsCore.registerOnLoadHandler(() => {
              return false;
            });
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`teamsCore.registerOnLoadHandler should successfully register handler. context: ${context}`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = false;
          teamsCore.registerOnLoadHandler(() => {
            handlerInvoked = true;
            return false;
          });

          utils.sendMessage('load');

          expect(handlerInvoked).toBe(true);
        });
      });
    });

    describe('Testing teamsCore.registerBeforeUnloadHandler function', () => {
      it('should not allow calls before initialization', () => {
        expect(() =>
          teamsCore.registerBeforeUnloadHandler(() => {
            return false;
          }),
        ).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        it(`teamsCore.registerBeforeUnloadHandler should throw error when teamsCore is not supported. context:${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            teamsCore.registerBeforeUnloadHandler(() => {
              return false;
            });
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`teamsCore.registerBeforeUnloadHandler should successfully register a before unload handler. context: ${context}`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = false;
          teamsCore.registerBeforeUnloadHandler(() => {
            handlerInvoked = true;
            return false;
          });

          utils.sendMessage('beforeUnload');

          expect(handlerInvoked).toBe(true);
        });

        it(`teamsCore.registerBeforeUnloadHandler should call readyToUnload automatically when no before unload handler is registered. context: ${context}`, async () => {
          await utils.initializeWithContext(context);

          utils.sendMessage('beforeUnload');

          const readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
          expect(readyToUnloadMessage).not.toBeNull();
        });

        it(`teamsCore.registerBeforeUnloadHandler should successfully register a before unload handler and not call readyToUnload if it returns true. context: ${context}`, async () => {
          await utils.initializeWithContext(context);

          let handlerInvoked = false;
          let readyToUnloadFunc: () => void;
          teamsCore.registerBeforeUnloadHandler((readyToUnload) => {
            readyToUnloadFunc = readyToUnload;
            handlerInvoked = true;
            return true;
          });

          utils.sendMessage('beforeUnload');

          let readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
          expect(readyToUnloadMessage).toBeNull();
          expect(handlerInvoked).toBe(true);

          readyToUnloadFunc();
          readyToUnloadMessage = utils.findMessageByFunc('readyToUnload');
          expect(readyToUnloadMessage).not.toBeNull();
        });
      });
    });
  });
});
