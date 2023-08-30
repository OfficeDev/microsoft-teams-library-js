import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { clipboard } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from '../../src/public/constants';
import { ClipboardSupportedMimeType } from '../../src/public/interfaces';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('clipboard', () => {
  const dataToCopy: Blob = new Blob(['Mock data'], { type: 'text/plain' });
  const htmlDataToCopy: Blob = new Blob(['<p>Mock data</p>'], { type: 'text/html' });
  const imageJpegDataToCopy: Blob = new Blob(['Mock data'], { type: 'image/jpeg' });
  const imagePngdataToCopy: Blob = new Blob(['Mock data'], { type: 'image/png' });
  const base64ResponsePng = JSON.stringify({ mimeType: 'image/png', content: 'SGVsbG8gd29ybGQ' });
  const base64ResponseJpeg = JSON.stringify({ mimeType: 'image/jpeg', content: 'SGVsbG8gd29ybGQ' });
  const base64ResponsePlainText = JSON.stringify({ mimeType: 'text/plain', content: 'SGVsbG8gd29ybGQ' });
  const base64ResponseHtmlText = JSON.stringify({ mimeType: 'text/html', content: 'SGVsbG8gd29ybGQ' });
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

      it('clipboard.write should not allow calls before initialization', async () => {
        await expect(clipboard.write(dataToCopy)).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('clipboard.write should throw error if blob is empty', async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
              await clipboard.write(new Blob([], { type: ClipboardSupportedMimeType.ImageJPEG }));
            } catch (error) {
              expect(error).toEqual(new Error('Blob cannot be empty.'));
            }
          });

          it(`clipboard.write should throw error if the clipboard.write capability is not supported in runtime config - ${context}:`, async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              await clipboard.write(dataToCopy);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`clipboard.write should throw error if the blob type is not supported with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            await expect(clipboard.write(dataToCopyNotSupported)).rejects.toThrowError(
              `Blob type ${dataToCopyNotSupported.type} is not supported.`,
            );
          });

          it(`clipboard.write send text/plain should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(dataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });

          it(`clipboard.write send text/html should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(htmlDataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });

          it(`clipboard.write send image/png should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(imagePngdataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });

          it(`clipboard.write send image/jpeg should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(imageJpegDataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });
        } else {
          it(`clipboard.write should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(() => clipboard.write(dataToCopy)).rejects.toThrowError(
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
        expect(() => clipboard.write(dataToCopy)).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it('clipboard.write should throw error if blob is empty', async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
              await clipboard.write(new Blob([], { type: ClipboardSupportedMimeType.ImageJPEG }));
            } catch (error) {
              expect(error).toEqual(new Error('Blob cannot be empty.'));
            }
          });

          it(`clipboard.write should throw error if the clipboard.write capability is not supported in runtime config - Context: ${context}`, async () => {
            try {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              await clipboard.write(dataToCopy);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`clipboard.write should throw error if the blob type is not supported with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            await expect(clipboard.write(dataToCopyNotSupported)).rejects.toThrowError(
              `Blob type ${dataToCopyNotSupported.type} is not supported.`,
            );
          });

          it(`clipboard.write send text/plain should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(dataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });

          it(`clipboard.write send text/html should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(htmlDataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });

          it(`clipboard.write send image/png should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(imagePngdataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });

          it(`clipboard.write send image/jpeg should send message to parent with context - ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({
              apiVersion: 2,
              supports: { clipboard: {} },
            });
            const promise = clipboard.write(imageJpegDataToCopy);
            const message = utils.findMessageByFunc('clipboard.writeToClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
            }
            message && utils.respondToMessage(message, undefined as unknown);
            expect(promise).resolves;
          });
        } else {
          it(`clipboard.write should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(() => clipboard.write(dataToCopy)).rejects.toThrowError(
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
        expect(() => clipboard.read()).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        Object.values([
          HostClientType.android,
          HostClientType.ios,
          HostClientType.ipados,
          HostClientType.macos,
        ]).forEach((mobilePlatform) => {
          if (allowedContexts.some((allowedContext) => allowedContext === context)) {
            it(`clipboard.read should throw error if the clipboard.read capability is not supported in runtime config - Context: ${context}`, async () => {
              try {
                await utils.initializeWithContext(context, mobilePlatform);
                utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
                await clipboard.read();
              } catch (e) {
                expect(e).toEqual(errorNotSupportedOnPlatform);
              }
            });
            it(`clipboard.read should send message to parent with context - ${context} for text/plain mimeType`, async () => {
              await utils.initializeWithContext(context, mobilePlatform);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
              try {
                const promise = clipboard.read();
                const clipboardReadMessage = utils.findMessageByFunc('clipboard.readFromClipboard');
                utils.respondToFramelessMessage({
                  data: {
                    id: clipboardReadMessage?.id,
                    args: [undefined, base64ResponsePlainText as string],
                  },
                } as DOMMessageEvent);
                expect(clipboardReadMessage).not.toBeNull();
                expect(clipboardReadMessage?.args).not.toBeNull();
                const response = await promise;
                expect(response.type).toEqual(dataToCopy.type);
              } catch (e) {
                fail(`Promise rejection occurred: ${e}`);
              }
            });
            it(`clipboard.read should send message to parent with context - ${context} for text/html mimeType`, async () => {
              await utils.initializeWithContext(context, mobilePlatform);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
              const promise = clipboard.read();
              const clipboardReadMessage = utils.findMessageByFunc('clipboard.readFromClipboard');
              utils.respondToFramelessMessage({
                data: {
                  id: clipboardReadMessage?.id,
                  args: [undefined, base64ResponseHtmlText],
                },
              } as DOMMessageEvent);
              expect(clipboardReadMessage).not.toBeNull();
              expect(clipboardReadMessage?.args).not.toBeNull();
              try {
                const response = await promise;
                expect(response.type).toEqual(htmlDataToCopy.type);
              } catch (e) {
                expect(e).toBeNull();
              }
            });
            it(`clipboard.read should send message to parent with context - ${context} for image/jpeg mimeType`, async () => {
              await utils.initializeWithContext(context, mobilePlatform);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
              const promise = clipboard.read();
              const clipboardReadMessage = utils.findMessageByFunc('clipboard.readFromClipboard');
              utils.respondToFramelessMessage({
                data: {
                  id: clipboardReadMessage?.id,
                  args: [undefined, base64ResponseJpeg],
                },
              } as DOMMessageEvent);
              expect(clipboardReadMessage).not.toBeNull();
              expect(clipboardReadMessage?.args).not.toBeNull();
              try {
                const response = await promise;
                expect(response.type).toEqual(imageJpegDataToCopy.type);
              } catch (e) {
                expect(e).toBeNull();
              }
            });
            it(`clipboard.read should send message to parent with context - ${context} for image/png mimeType`, async () => {
              await utils.initializeWithContext(context, mobilePlatform);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
              const promise = clipboard.read();
              const clipboardReadMessage = utils.findMessageByFunc('clipboard.readFromClipboard');
              utils.respondToFramelessMessage({
                data: {
                  id: clipboardReadMessage?.id,
                  args: [undefined, base64ResponsePng],
                },
              } as DOMMessageEvent);
              expect(clipboardReadMessage).not.toBeNull();
              expect(clipboardReadMessage?.args).not.toBeNull();
              try {
                const response = await promise;
                expect(response.type).toEqual(imagePngdataToCopy.type);
              } catch (e) {
                expect(e).toBeNull();
              }
            });
          } else {
            it(`clipboard.read should not allow calls from context ${context}`, async () => {
              await utils.initializeWithContext(context, mobilePlatform);
              expect(() => clipboard.read()).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: ${JSON.stringify(context)}.`,
              );
            });
          }
        });
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
        expect(() => clipboard.read()).rejects.toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`clipboard.read should throw error if the clipboard.read capability is not supported in runtime config - Context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
            try {
              await clipboard.read();
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`clipboard.read should send message to parent with context - ${context} for text/plain mimeType`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.read();
            const message = utils.findMessageByFunc('clipboard.readFromClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
            }
            message && utils.respondToMessage(message, undefined as unknown, dataToCopy);
            const response = await promise;
            expect(response.type).toEqual(dataToCopy.type);
          });

          it(`clipboard.read should send message to parent with context - ${context} for text/html mimeType`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.read();
            const message = utils.findMessageByFunc('clipboard.readFromClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
            }
            message && utils.respondToMessage(message, undefined as unknown, htmlDataToCopy);
            const response = await promise;
            expect(response.type).toEqual(htmlDataToCopy.type);
          });

          it(`clipboard.read should send message to parent with context - ${context} for image/png mimeType`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.read();
            const message = utils.findMessageByFunc('clipboard.readFromClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
            }
            message && utils.respondToMessage(message, undefined as unknown, imagePngdataToCopy);
            const response = await promise;
            expect(response.type).toEqual(imagePngdataToCopy.type);
          });
          it(`clipboard.read should send message to parent with context - ${context} for image/jpeg mimeType`, async () => {
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 2, supports: { clipboard: {} } });
            const promise = clipboard.read();
            const message = utils.findMessageByFunc('clipboard.readFromClipboard');
            if (message && message.args) {
              expect(message).not.toBeNull();
            }
            message && utils.respondToMessage(message, undefined as unknown, imageJpegDataToCopy);
            const response = await promise;
            expect(response.type).toEqual(imageJpegDataToCopy.type);
          });
        } else {
          it(`clipboard.read should not allow calls from context ${context}`, async () => {
            await utils.initializeWithContext(context);
            expect(() => clipboard.read()).rejects.toThrowError(
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
