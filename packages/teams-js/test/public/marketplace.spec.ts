import { v4 as uuid } from 'uuid';

import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { marketplace } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { MatcherType, validateExpectedArgumentsInRequest } from '../resultValidation';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */
describe('Testing marketplace capability', () => {
  describe('Framed - Testing pages module', () => {
    // Use to send a mock message from the app.
    const utils = new Utils();

    beforeEach(() => {
      utils.processMessage = null;
      utils.messages = [];
      utils.childMessages = [];
      utils.childWindow.closed = false;
      jest.mock('../../src/internal/marketplaceUtils', () => ({
        validateCartItems: jest.fn(),
        validateUuid: jest.fn(),
        validateCartStatus: jest.fn(),
      }));

      // Set a mock window for testing
      app._initialize(utils.mockWindow);
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (app._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
      }
      jest.clearAllMocks();
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
          if (context === FrameContexts.content || context === FrameContexts.task) {
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
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.addOrUpdateCartItems function', () => {
        const addOrUpdateCartItemsParams = {
          cartItems: [{ id: '1', name: 'Item 1', price: 10, quantity: 1 }],
          cartId: uuid(),
        };

        it('marketplace.addOrUpdateCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.addOrUpdateCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).rejects.toEqual(
                errorNotSupportedOnPlatform,
              );
            });

            it('marketplace.addOrUpdateCartItems should successfully send the addOrUpdateCartItems message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams);

              const addOrUpdateCartItemsMessage = utils.findMessageByFunc('marketplace.addOrUpdateCartItems');
              validateExpectedArgumentsInRequest(
                addOrUpdateCartItemsMessage,
                'marketplace.addOrUpdateCartItems',
                MatcherType.ToStrictEqual,
                addOrUpdateCartItemsParams,
              );

              utils.respondToMessage(addOrUpdateCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.addOrUpdateCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.removeCartItems function', () => {
        const removeCartItemsParams = {
          cartItemIds: ['1'],
          cartId: uuid(),
        };

        it('marketplace.removeCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.removeCartItems(removeCartItemsParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        it('marketplace.removeCartItems should throw error with empty cart item array input', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
          const emptyCartItemIds = { cartItemIds: [], cartId: uuid() };
          expect(marketplace.removeCartItems(emptyCartItemIds)).rejects.toThrowError(
            new Error('cartItemIds must be a non-empty array'),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.removeCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.removeCartItems(removeCartItemsParams)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.removeCartItems should successfully send the removeCartItems message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.removeCartItems(removeCartItemsParams);

              const removeCartItemsMessage = utils.findMessageByFunc('marketplace.removeCartItems');
              validateExpectedArgumentsInRequest(
                removeCartItemsMessage,
                'marketplace.removeCartItems',
                MatcherType.ToStrictEqual,
                removeCartItemsParams,
              );

              utils.respondToMessage(removeCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.removeCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.removeCartItems(removeCartItemsParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.updateCartStatus function', () => {
        const cartStatusParams = {
          cartId: uuid(),
          cartStatus: marketplace.CartStatus.Error,
          statusInfo: 'error message',
        };

        it('marketplace.updateCartStatus should not allow calls before initialization', async () => {
          await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
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
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });
  });

  describe('Frameless - Testing pages module in frameless framework', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      GlobalVars.isFramelessWindow = false;
      jest.mock('../../src/internal/marketplaceUtils', () => ({
        validateCartItems: jest.fn(),
        validateUuid: jest.fn(),
        validateCartStatus: jest.fn(),
      }));
    });
    afterEach(() => {
      app._uninitialize();
      jest.clearAllMocks();
      GlobalVars.isFramelessWindow = false;
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
          expect(() => marketplace.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
        });
      });

      describe('Testing marketplace.getCart function', () => {
        it('marketplace.getCart should not allow calls before initialization', async () => {
          await expect(marketplace.getCart()).rejects.toThrowError(new Error(errorLibraryNotInitialized));
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
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
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.addOrUpdateCartItems function', () => {
        const addOrUpdateCartItemsParams = {
          cartItems: [{ id: '1', name: 'Item 1', price: 10, quantity: 1 }],
          cartId: uuid(),
        };

        it('marketplace.addOrUpdateCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.addOrUpdateCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).rejects.toEqual(
                errorNotSupportedOnPlatform,
              );
            });

            it('marketplace.addOrUpdateCartItems should successfully send the addOrUpdateCartItems message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              const promise = marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams);
              const addOrUpdateCartItemsMessage = utils.findMessageByFunc('marketplace.addOrUpdateCartItems');
              utils.respondToMessage(addOrUpdateCartItemsMessage!);
              await promise;
              await expect(promise).resolves.toBe(undefined);
            });
          } else {
            it(`marketplace.addOrUpdateCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.removeCartItems function', () => {
        const removeCartItemsParams = {
          cartItemIds: ['1'],
          cartId: uuid(),
        };

        it('marketplace.removeCartItems should not allow calls before initialization', async () => {
          await expect(marketplace.removeCartItems(removeCartItemsParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        it('marketplace.removeCartItems should throw error with empty cart item array input', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
          const emptyRemoveCartItemIds = { cartItemIds: [], cartId: uuid() };
          expect(marketplace.removeCartItems(emptyRemoveCartItemIds)).rejects.toThrowError(
            new Error('cartItemIds must be a non-empty array'),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.removeCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.removeCartItems(removeCartItemsParams)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.removeCartItems should successfully send the removeCartItems message', async () => {
              const cart: marketplace.Cart = {
                id: uuid(),
                version: {
                  majorVersion: 1,
                  minorVersion: 0,
                },
                cartInfo: {
                  market: 'US',
                  intent: marketplace.Intent.AdminUser,
                  locale: 'en-US',
                  status: marketplace.CartStatus.Open,
                  currency: 'USD',
                  createdAt: '2023-06-19T22:06:59Z',
                  updatedAt: '2023-06-19T22:06:59Z',
                },
                cartItems: [],
              };
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.removeCartItems(removeCartItemsParams);

              const removeCartItemsMessage = utils.findMessageByFunc('marketplace.removeCartItems');
              utils.respondToFramelessMessage({
                data: {
                  id: removeCartItemsMessage!.id,
                  args: [undefined, cart],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toBe(cart);
            });
          } else {
            it(`marketplace.removeCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.removeCartItems(removeCartItemsParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });

      describe('Testing marketplace.updateCartStatus function', () => {
        const cartStatusParams = {
          cartId: uuid(),
          cartStatus: marketplace.CartStatus.Error,
          statusInfo: 'error message',
        };

        it('marketplace.updateCartStatus should not allow calls before initialization', async () => {
          await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.updateCartStatus should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.updateCartStatus should successfully send the updateCartStatus message', async () => {
              const cart: marketplace.Cart = {
                id: uuid(),
                version: {
                  majorVersion: 1,
                  minorVersion: 0,
                },
                cartInfo: {
                  market: 'US',
                  intent: marketplace.Intent.AdminUser,
                  locale: 'en-US',
                  status: marketplace.CartStatus.Open,
                  currency: 'USD',
                  createdAt: '2023-06-19T22:06:59Z',
                  updatedAt: '2023-06-19T22:06:59Z',
                },
                cartItems: [],
              };

              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.updateCartStatus(cartStatusParams);

              const updateCartStatusMessage = utils.findMessageByFunc('marketplace.updateCartStatus');
              utils.respondToFramelessMessage({
                data: {
                  id: updateCartStatusMessage!.id,
                  args: [undefined, cart],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toBe(cart);
            });
          } else {
            it(`marketplace.updateCartStatus should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(marketplace.updateCartStatus(cartStatusParams)).rejects.toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify([
                  FrameContexts.content,
                  FrameContexts.task,
                ])}. Current context: "${context}".`,
              );
            });
          }
        });
      });
    });
  });
});
