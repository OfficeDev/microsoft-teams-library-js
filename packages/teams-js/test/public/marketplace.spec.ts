/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { marketplace } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { MatcherType, validateExpectedArgumentsInRequest } from '../resultValidation';
import { Utils } from '../utils';

jest.mock('../../src/internal/marketplaceUtils', () => ({
  validateCartItems: jest.fn(),
  validateUuid: jest.fn(),
  validateCartStatus: jest.fn(),
  deserializeCart: jest.fn().mockReturnValue({
    id: '90080f28-53e9-400f-811a-fcadd107891a',
    version: {
      majorVersion: 1,
      minorVersion: 0,
    },
    cartInfo: {
      market: 'US',
      intent: 'TeamsAdminUser',
      locale: 'en-US',
      status: 'Open',
      currency: 'USD',
      createdAt: '2023-06-19T22:06:59Z',
      updatedAt: '2023-06-19T22:06:59Z',
    },
    cartItems: [],
  }),
  serializeCartItems: jest.fn().mockReturnValue([{ id: '1', name: 'Item 1', price: 10, quantity: 1 }]),
}));

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
          await expect(() => marketplace.getCart()).toThrowError(errorLibraryNotInitialized);
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.getCart should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(new Promise((resolve) => resolve(marketplace.getCart()))).rejects.toEqual(
                errorNotSupportedOnPlatform,
              );
            });

            it('marketplace.getCart should successfully send the getCart message', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });

              const promise = marketplace.getCart();

              const getCartItemsMessage = utils.findMessageByFunc('marketplace.getCart');
              validateExpectedArgumentsInRequest(getCartItemsMessage, 'marketplace.getCart', MatcherType.ToStrictEqual);

              utils.respondToMessage(getCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.getCart should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.getCart()).toThrowError(
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
          cartId: '90080f28-53e9-400f-811a-fcadd107891a',
        };

        it('marketplace.addOrUpdateCartItems should not allow calls before initialization', async () => {
          await expect(() => marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.addOrUpdateCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(
                new Promise((resolve) => resolve(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams))),
              ).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.addOrUpdateCartItems should throw error with invalid addOrUpdateCartItemsParams input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              expect(() =>
                marketplace.addOrUpdateCartItems(null as unknown as marketplace.AddOrUpdateCartItemsParams),
              ).toThrowError(new Error('addOrUpdateCartItemsParams must be provided'));
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
                {
                  ...addOrUpdateCartItemsParams,
                  cartVersion: marketplace.cartVersion,
                },
              );

              utils.respondToMessage(addOrUpdateCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.addOrUpdateCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).toThrowError(
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
          cartId: '90080f28-53e9-400f-811a-fcadd107891a',
        };

        it('marketplace.removeCartItems should not allow calls before initialization', async () => {
          await expect(() => marketplace.removeCartItems(removeCartItemsParams)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.removeCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(
                new Promise((resolve) => resolve(marketplace.removeCartItems(removeCartItemsParams))),
              ).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.removeCartItems should throw error with invalid removeCartItemsParams input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              expect(() =>
                marketplace.removeCartItems(null as unknown as marketplace.RemoveCartItemsParams),
              ).toThrowError(new Error('removeCartItemsParams must be provided'));
            });

            it('marketplace.removeCartItems should throw error with invalid cart item array input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              const emptyCartItemIds = { cartItemIds: [], cartId: '90080f28-53e9-400f-811a-fcadd107891a' };
              expect(() => marketplace.removeCartItems(emptyCartItemIds)).toThrowError(
                new Error('cartItemIds must be a non-empty array'),
              );
              const nullRemoveCartItemIds = { cartItemIds: null, cartId: '90080f28-53e9-400f-811a-fcadd107891a' };
              expect(() =>
                marketplace.removeCartItems(nullRemoveCartItemIds as unknown as marketplace.RemoveCartItemsParams),
              ).toThrowError(new Error('cartItemIds must be a non-empty array'));
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
                {
                  ...removeCartItemsParams,
                  cartVersion: marketplace.cartVersion,
                },
              );

              utils.respondToMessage(removeCartItemsMessage!);
              await promise;
            });
          } else {
            it(`marketplace.removeCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.removeCartItems(removeCartItemsParams)).toThrowError(
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
          cartId: '90080f28-53e9-400f-811a-fcadd107891a',
          cartStatus: marketplace.CartStatus.Error,
          statusInfo: 'error message',
        };

        it('marketplace.updateCartStatus should not allow calls before initialization', async () => {
          await expect(() => marketplace.updateCartStatus(cartStatusParams)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.updateCartStatus should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(new Promise((resolve) => resolve(marketplace.updateCartStatus(cartStatusParams)))).rejects.toEqual(
                errorNotSupportedOnPlatform,
              );
            });

            it('marketplace.updateCartStatus should throw error with invalid updateCartStatusParams input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              expect(() =>
                marketplace.updateCartStatus(null as unknown as marketplace.UpdateCartStatusParams),
              ).toThrowError(new Error('updateCartStatusParams must be provided'));
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
                {
                  ...cartStatusParams,
                  cartVersion: marketplace.cartVersion,
                },
              );

              utils.respondToMessage(updateCartStatusMessage!);
              await promise;
            });
          } else {
            it(`marketplace.updateCartStatus should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.updateCartStatus(cartStatusParams)).toThrowError(
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
          await expect(() => marketplace.getCart()).toThrowError(new Error(errorLibraryNotInitialized));
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.getCart should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(new Promise((resolve) => resolve(marketplace.getCart()))).rejects.toEqual(
                errorNotSupportedOnPlatform,
              );
            });

            it('marketplace.getCart should successfully send the getCart message', async () => {
              const cart: marketplace.Cart = {
                id: '90080f28-53e9-400f-811a-fcadd107891a',
                version: {
                  majorVersion: 1,
                  minorVersion: 0,
                },
                cartInfo: {
                  market: 'US',
                  intent: marketplace.Intent.TeamsAdminUser,
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

              const promise = marketplace.getCart();

              const getCartMessage = utils.findMessageByFunc('marketplace.getCart');
              utils.respondToFramelessMessage({
                data: {
                  id: getCartMessage!.id,
                  args: [undefined, cart],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toEqual(cart);
            });
          } else {
            it(`marketplace.getCart should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.getCart()).toThrowError(
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
          cartId: '90080f28-53e9-400f-811a-fcadd107891a',
        };

        it('marketplace.addOrUpdateCartItems should not allow calls before initialization', async () => {
          await expect(() => marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.addOrUpdateCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(
                new Promise((resolve) => resolve(marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams))),
              ).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.addOrUpdateCartItems should throw error with invalid addOrUpdateCartItemsParams input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              expect(() =>
                marketplace.addOrUpdateCartItems(null as unknown as marketplace.AddOrUpdateCartItemsParams),
              ).toThrowError(new Error('addOrUpdateCartItemsParams must be provided'));
            });

            it('marketplace.addOrUpdateCartItems should successfully send the addOrUpdateCartItems message', async () => {
              const cart: marketplace.Cart = {
                id: '90080f28-53e9-400f-811a-fcadd107891a',
                version: {
                  majorVersion: 1,
                  minorVersion: 0,
                },
                cartInfo: {
                  market: 'US',
                  intent: marketplace.Intent.TeamsAdminUser,
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

              const promise = marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams);

              const addOrUpdateCartItemsMessage = utils.findMessageByFunc('marketplace.addOrUpdateCartItems');
              utils.respondToFramelessMessage({
                data: {
                  id: addOrUpdateCartItemsMessage!.id,
                  args: [undefined, cart],
                },
              } as DOMMessageEvent);

              await promise;
              await expect(promise).resolves.toEqual(cart);
            });
          } else {
            it(`marketplace.addOrUpdateCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams)).toThrowError(
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
          cartId: '90080f28-53e9-400f-811a-fcadd107891a',
        };

        it('marketplace.removeCartItems should not allow calls before initialization', async () => {
          await expect(() => marketplace.removeCartItems(removeCartItemsParams)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.removeCartItems should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(
                new Promise((resolve) => resolve(marketplace.removeCartItems(removeCartItemsParams))),
              ).rejects.toEqual(errorNotSupportedOnPlatform);
            });

            it('marketplace.removeCartItems should throw error with invalid removeCartItemsParams input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              expect(() =>
                marketplace.removeCartItems(null as unknown as marketplace.RemoveCartItemsParams),
              ).toThrowError(new Error('removeCartItemsParams must be provided'));
            });

            it('marketplace.removeCartItems should throw error with empty cart item array input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              const emptyRemoveCartItemIds = { cartItemIds: [], cartId: '90080f28-53e9-400f-811a-fcadd107891a' };
              expect(() => marketplace.removeCartItems(emptyRemoveCartItemIds)).toThrowError(
                new Error('cartItemIds must be a non-empty array'),
              );
              const nullRemoveCartItemIds = { cartItemIds: null, cartId: '90080f28-53e9-400f-811a-fcadd107891a' };
              expect(() =>
                marketplace.removeCartItems(nullRemoveCartItemIds as unknown as marketplace.RemoveCartItemsParams),
              ).toThrowError(new Error('cartItemIds must be a non-empty array'));
            });

            it('marketplace.removeCartItems should successfully send the removeCartItems message', async () => {
              const cart: marketplace.Cart = {
                id: '90080f28-53e9-400f-811a-fcadd107891a',
                version: {
                  majorVersion: 1,
                  minorVersion: 0,
                },
                cartInfo: {
                  market: 'US',
                  intent: marketplace.Intent.TeamsAdminUser,
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
              await expect(promise).resolves.toEqual(cart);
            });
          } else {
            it(`marketplace.removeCartItems should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.removeCartItems(removeCartItemsParams)).toThrowError(
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
          cartId: '90080f28-53e9-400f-811a-fcadd107891a',
          cartStatus: marketplace.CartStatus.Error,
          statusInfo: 'error message',
        };

        it('marketplace.updateCartStatus should not allow calls before initialization', async () => {
          await expect(() => marketplace.updateCartStatus(cartStatusParams)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (context === FrameContexts.content || context === FrameContexts.task) {
            it(`marketplace.updateCartStatus should throw error when marketplace is not supported when initialized with ${context} context`, async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
              expect(new Promise((resolve) => resolve(marketplace.updateCartStatus(cartStatusParams)))).rejects.toEqual(
                errorNotSupportedOnPlatform,
              );
            });

            it('marketplace.updateCartStatus should throw error with invalid updateCartStatusParams input', async () => {
              await utils.initializeWithContext(context);
              utils.setRuntimeConfig({ apiVersion: 2, supports: { marketplace: {} } });
              expect(() =>
                marketplace.updateCartStatus(null as unknown as marketplace.UpdateCartStatusParams),
              ).toThrowError(new Error('updateCartStatusParams must be provided'));
            });

            it('marketplace.updateCartStatus should successfully send the updateCartStatus message', async () => {
              const cart: marketplace.Cart = {
                id: '90080f28-53e9-400f-811a-fcadd107891a',
                version: {
                  majorVersion: 1,
                  minorVersion: 0,
                },
                cartInfo: {
                  market: 'US',
                  intent: marketplace.Intent.TeamsAdminUser,
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
              await expect(promise).resolves.toEqual(cart);
            });
          } else {
            it(`marketplace.updateCartStatus should not allow calls from ${context} context`, async () => {
              await utils.initializeWithContext(context);
              await expect(() => marketplace.updateCartStatus(cartStatusParams)).toThrowError(
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
