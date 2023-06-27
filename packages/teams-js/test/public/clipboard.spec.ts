import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { clipboard } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('clipboard', () => {
  const dataToCopy: Blob = new Blob(['Mock data'], { type: 'text/plain' });
  const dataToCopyNotSupported: Blob = new Blob(['Mock data not supported'], { type: 'application/json' });
  const allowedContexts = [FrameContexts.content, FrameContexts.task, FrameContexts.stage, FrameContexts.sidePanel];
  Object.assign(navigator, {
    clipboard: {},
  });

  describe('Testing clipboard.write function', () => {
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

      it('clipboard.write should not allow calls before initialization', () => {
        expect(clipboard.write(dataToCopy)).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`clipboard.write should throw error if the clipboard.write capability is not supported in runtime config - Context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
            const promise = clipboard.write(dataToCopy);
            expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`clipboard.write should throw error if the blob type is not supported with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            expect(clipboard.write(dataToCopyNotSupported)).rejects.toThrowError(
              `Blob type ${dataToCopyNotSupported.type} is not supported.`,
            );
          });

          it(`clipboard.write should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.write(dataToCopy);
            const clipboardWriteMessage = utils.findMessageByFunc('clipboard.writeToClipboard');
            expect(clipboardWriteMessage).not.toBeNull();
            expect(clipboardWriteMessage?.args).not.toBeNull();
            expect(promise).resolves;
          });
        } else {
          it(`clipboard.write should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(clipboard.write(dataToCopy)).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });
        }
      });
    });

    describe('framed', () => {
      let utils: Utils = new Utils();

      beforeEach(() => {
        // Set a mock window for testing
        utils = new Utils();
        app._initialize(utils.mockWindow);
        GlobalVars.isFramelessWindow = false;
      });

      afterEach(() => {
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });

      it('clipboard.write should not allow calls before initialization', () => {
        expect(clipboard.write(dataToCopy)).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`clipboard.write should throw error if the clipboard.write capability is not supported in runtime config - Context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
            const promise = clipboard.write(dataToCopy);
            expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`clipboard.write should throw error if the blob type is not supported with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            expect(clipboard.write(dataToCopyNotSupported)).rejects.toThrowError(
              `Blob type ${dataToCopyNotSupported.type} is not supported.`,
            );
          });

          it(`clipboard.write should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.write(dataToCopy);
            const clipboardWriteMessage = utils.findMessageByFunc('clipboard.writeToClipboard');
            expect(clipboardWriteMessage).not.toBeNull();
            expect(clipboardWriteMessage?.args).not.toBeNull();
            expect(promise).resolves;
          });
        } else {
          it(`clipboard.write should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(clipboard.write(dataToCopy)).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });
        }
      });
    });
  });

  describe('Testing clipboard.read function', () => {
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

      it('clipboard.read should not allow calls before initialization', () => {
        expect(clipboard.read()).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`clipboard.read should throw error if the clipboard.read capability is not supported in runtime config - Context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
            const promise = clipboard.read();
            expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`clipboard.read should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.read();
            const clipboardReadMessage = utils.findMessageByFunc('clipboard.readFromClipboard');
            utils.respondToMessage(clipboardReadMessage, dataToCopy);
            expect(clipboardReadMessage).not.toBeNull();
            expect(clipboardReadMessage?.args).not.toBeNull();
            expect(promise).resolves.toEqual(dataToCopy);
          });
        } else {
          it(`clipboard.read should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(clipboard.read()).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });
        }
      });
    });

    describe('framed', () => {
      let utils: Utils = new Utils();

      beforeEach(() => {
        // Set a mock window for testing
        utils = new Utils();
        app._initialize(utils.mockWindow);
        GlobalVars.isFramelessWindow = false;
      });

      afterEach(() => {
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });

      it('clipboard.read should not allow calls before initialization', () => {
        expect(clipboard.read()).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`clipboard.read should throw error if the clipboard.read capability is not supported in runtime config - Context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
            const promise = clipboard.read();
            expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
          });

          it(`clipboard.read should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.read();
            const clipboardReadMessage = utils.findMessageByFunc('clipboard.readFromClipboard');
            expect(clipboardReadMessage).not.toBeNull();
            expect(clipboardReadMessage?.args).not.toBeNull();
            expect(promise).resolves;
          });
        } else {
          it(`clipboard.read should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(clipboard.read()).rejects.toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });
        }
      });
    });
  });
});
