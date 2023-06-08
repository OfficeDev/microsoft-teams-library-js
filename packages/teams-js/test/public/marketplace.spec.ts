import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { CartStatus, marketplace } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { MatcherType, validateExpectedArgumentsInRequest } from '../resultValidation';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

const emptyCallback = () => {};
describe('Testing marketplace capability', () => {
  describe('Framed - Testing pages module', () => {
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

    describe('Testing marketplace name space', () => {
      describe('Testing marketplace.isSupported function', () => {
        it('marketplace.isSupported should return false if the runtime says marketplace is not supported', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect(marketplace.isSupported()).not.toBeTruthy();
        });

        it('marketplace.isSupported should return true if the runtime says marketplace is supported', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
          expect(marketplace.isSupported()).toBeTruthy();
        });

        it('should throw if called before initialization', () => {
          utils.uninitializeRuntimeConfig();
          expect(() => marketplace.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
        });
      });

      describe('Testing marketplace.getCart function', () => {
        it('marketplace.getCart should not allow calls before initialization', async () => {
          await expect(marketplace.getCart()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.getCart should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.getCart()).rejects.toEqual(errorNotSupportedOnPlatform);
            });
          } else {
            it(`marketplace.getCart should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.getCart()).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.addOrUpdateCartItems function', () => {
        const cartItems = [{ id: '1', name: 'Item 1', price: 10, quantity: 1 }];

        it('marketplace.addOrUpdateCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.addOrUpdateCartItems(cartItems)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.addOrUpdateCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.addOrUpdateCartItems(cartItems)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.addOrUpdateCartItems should successfully send the addOrUpdateCartItems message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.addOrUpdateCartItems(cartItems);

              const addOrUpdateCartItemsMessage = utils.findMessageByFunc('marketplace.addOrUpdateCartItems');
              validateExpectedArgumentsInRequest(
                addOrUpdateCartItemsMessage,
                'marketplace.addOrUpdateCartItems',
                MatcherType.ToStrictEqual,
                cartItems,
              );

              utils.respondToMessage(addOrUpdateCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.addOrUpdateCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.addOrUpdateCartItems(cartItems)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.removeCartItems function', () => {
        const cartItemIds = ['001', '002', '003'];

        it('marketplace.removeCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.removeCartItems(cartItemIds)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.removeCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.removeCartItems(cartItemIds)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.removeCartItems should successfully send the removeCartItems message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.removeCartItems(cartItemIds);

              const removeCartItemsMessage = utils.findMessageByFunc('marketplace.removeCartItems');
              validateExpectedArgumentsInRequest(
                removeCartItemsMessage,
                'marketplace.removeCartItems',
                MatcherType.ToStrictEqual,
                cartItemIds,
              );

              utils.respondToMessage(removeCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.removeCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.removeCartItems(cartItemIds)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.updateCartStatus function', () => {
        const cartStatusParams = {
          cartStatus: CartStatus.Processed,
          message: 'success message',
        };

        it('marketplace.updateCartStatus should not allow calls before initialization', async () => {
          await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.updateCartStatus should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.updateCartStatus should successfully send the updateCartStatus message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.updateCartStatus(cartStatusParams);

              const updateCartStatusMessage = utils.findMessageByFunc('marketplace.updateCartStatus');
              validateExpectedArgumentsInRequest(
                updateCartStatusMessage,
                'marketplace.updateCartStatus',
                MatcherType.ToStrictEqual,
                cartStatusParams,
              );

              utils.respondToMessage(updateCartStatusMessage!);
              await promise;
            });
          } else {
            it(`marketplace.updateCartStatus should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });
  });

  describe('Frameless - Testing pages module in frameless framework', () => {
    // Use to send a mock message from the app.
    const framelessPostMocks = new FramelessPostMocks();
    const utils = new Utils();

    beforeEach(() => {
      framelessPostMocks.messages = [];
      app._initialize(framelessPostMocks.mockWindow);
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);

        app._uninitialize();
      }
    });
    describe('Testing marketplace name space', () => {
      describe('Testing marketplace.isSupported function', () => {
        it('marketplace.isSupported should return false if the runtime says marketplace is not supported', async () => {
          await framelessPostMocks.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect(marketplace.isSupported()).not.toBeTruthy();
        });

        it('marketplace.isSupported should return true if the runtime says marketplace is supported', async () => {
          await framelessPostMocks.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
          expect(marketplace.isSupported()).toBeTruthy();
        });

        it('should throw if called before initialization', () => {
          framelessPostMocks.uninitializeRuntimeConfig();
          expect(() => marketplace.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
        });
      });

      describe('Testing marketplace.getCart function', () => {
        it('marketplace.getCart should not allow calls before initialization', async () => {
          await expect(marketplace.getCart()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.getCart should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.getCart()).rejects.toEqual(errorNotSupportedOnPlatform);
            });
          } else {
            it(`marketplace.getCart should not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              await expect(marketplace.getCart()).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.addOrUpdateCartItems function', () => {
        const cartItems = [{ id: '1', name: 'Item 1', price: 10, quantity: 1 }];

        it('marketplace.addOrUpdateCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.addOrUpdateCartItems(cartItems)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.addOrUpdateCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.addOrUpdateCartItems(cartItems)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.addOrUpdateCartItems should successfully send the addOrUpdateCartItems message', async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              const promise = marketplace.addOrUpdateCartItems(cartItems);
              const addOrUpdateCartItemsMessage = framelessPostMocks.findMessageByFunc(
                'marketplace.addOrUpdateCartItems',
              );
              framelessPostMocks.respondToMessage({
                data: {
                  id: addOrUpdateCartItemsMessage!.id,
                  args: [],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toBe(undefined);
            });
          } else {
            it(`marketplace.addOrUpdateCartItems should not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              await expect(marketplace.addOrUpdateCartItems(cartItems)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.removeCartItems function', () => {
        const cartItemIds = ['001', '002', '003'];

        it('marketplace.removeCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.removeCartItems(cartItemIds)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.removeCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.removeCartItems(cartItemIds)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.removeCartItems should successfully send the removeCartItems message', async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.removeCartItems(cartItemIds);

              const removeCartItemsMessage = framelessPostMocks.findMessageByFunc('marketplace.removeCartItems');
              framelessPostMocks.respondToMessage({
                data: {
                  id: removeCartItemsMessage!.id,
                  args: [],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toBe(undefined);
            });
          } else {
            it(`marketplace.removeCartItems should not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              await expect(marketplace.removeCartItems(cartItemIds)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.updateCartStatus function', () => {
        const cartStatusParams = {
          cartStatus: CartStatus.Processed,
          message: 'success message',
        };

        it('marketplace.updateCartStatus should not allow calls before initialization', async () => {
          await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content) {
            it(`marketplace.updateCartStatus should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.updateCartStatus should successfully send the updateCartStatus message', async () => {
              await framelessPostMocks.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.updateCartStatus(cartStatusParams);

              const updateCartStatusMessage = framelessPostMocks.findMessageByFunc('marketplace.updateCartStatus');
              framelessPostMocks.respondToMessage({
                data: {
                  id: updateCartStatusMessage!.id,
                  args: [],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toBe(undefined);
            });
          } else {
            it(`marketplace.updateCartStatus should not allow calls from ${context} context`, async () => {
              await framelessPostMocks.initializeWithContext(context);
              await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });
  });
});
