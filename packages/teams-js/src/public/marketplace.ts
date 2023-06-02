import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from './constants';
import { Cart, CartItem, UpdateCartStatusParams } from './interfaces';
import { runtime } from './runtime';

export namespace marketplace {
  /**
   * get cart object for app.
   *
   * @beta
   */
  export function getCart(): Promise<Cart> {
    return new Promise<Cart>((resolve) => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.getCart'));
    });
  }
  /**
   * add or update cart items in the cart in host.
   *
   * @param cartItems - a list of cart item, if item id is existing, update the quantity, otherwise add new item to cart.
   *
   * @beta
   */
  export function addOrUpdateCartItems(cartItems: CartItem[]): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.addOrUpdateCartItems', cartItems));
    });
  }
  /**
   * remove cart items in the cart in host.
   *
   * @param cartItemIds - a list of cart id, delete the cart item accordingly.
   *
   * @beta
   */
  export function removeCartItems(cartItemIds: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.removeCartItems', cartItemIds));
    });
  }
  /**
   * update cart status.
   *
   * @param cartStatus - cart status.
   *
   * @param message - extra info to the status.
   *
   * @beta
   */
  export function updateCartStatus(updateCartStatusParams: UpdateCartStatusParams): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.updateCartStatus', updateCartStatusParams));
    });
  }
  /**
   * @hidden
   *
   * Checks if the marketplace capability is supported by the host
   * @returns boolean to represent whether the marketplace capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.marketplace ? true : false;
  }
}
