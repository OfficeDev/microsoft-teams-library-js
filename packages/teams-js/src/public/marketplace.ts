import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from './constants';
import { Cart } from './interfaces';
import { runtime } from './runtime';

export namespace marketplace {
  /**
   * get cart object for app.
   *
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
   * update cart object in the host for app
   *
   * @param cart - An object containing all product items and cart info.
   *
   * @returns boolean to represent whether the set operation is success or not
   */
  export function setCart(cart: Cart): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.setCart', cart));
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
