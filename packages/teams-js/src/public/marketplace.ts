import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { Currency, Locale, Market } from '.';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Represents the cart object for the app checkout flow
 *
 * @beta
 */
export interface Cart {
  /** version of the cart. */
  readonly version: CartVersion;
  /** the id of the cart. */
  readonly id: string;
  /** the cart info. */
  cartInfo: CartInfo;
  /** the cart items. */
  cartItems: CartItem[];
}

/**
 * Version of the cart.
 *
 * @beta
 */
interface CartVersion {
  /** Represents the major version number. */
  majorVersion: number;
  /** Represents the minor version number. */
  minorVersion: number;
}

/**
 * Represents the cart information
 *
 * @beta
 */
interface CartInfo {
  /** The country market where the products are selling. */
  readonly market: Market;
  /** The identifier to tell the cart is checked out by admin or information worker */
  readonly intent: Intent;
  /** Locale for the user */
  readonly locale: Locale;
  /** The status of the cart. */
  status: CartStatus;
  /** Currency code for the cart item price. */
  readonly currency: Currency;
}

/**
 * Represents the basic cart item information
 *
 * @beta
 */
interface Item {
  /** the id of the cart item. */
  readonly id: string;
  /** the display name of the cart item. */
  name: string;
  /** the quantity of the cart item. */
  quantity: number;
  /** the price of the single cart item. */
  price: number;
  /** the thumbnail imageURL of the cart item. */
  readonly imageURL?: string;
}

/**
 * Represents the cart item that could have accessories
 *
 * @beta
 */
export interface CartItem extends Item {
  /** accessories to the item if exist. */
  readonly accessories?: Item[];
}

/**
 * Represents the persona creating the cart
 *
 * @beta
 */
export enum Intent {
  /** the cart is created by admin of an organization. */
  AdminUser = 'AdminUser',
  /** the cart is created by end user of an organization. */
  EndUser = 'EndUser',
}

/**
 * Represents the status of the cart
 *
 * @beta
 */
export enum CartStatus {
  /** Cart is created but not checked out yet.*/
  Open = 'Open',
  /** Cart is checked out but not completed yet.*/
  Processing = 'Processing',
  /**
   * Indicate checking out is completed and the host should
   * Response a new cart in the next getCart call
   */
  Processed = 'Processed',
  /**
   * Indicate checking out is failed and the host should
   * Response a new cart in the next getCart call
   */
  Error = 'Error',
}
/**
 * Represents the parameters to update the cart status
 *
 * @beta
 */
export interface UpdateCartStatusParams {
  /** Cart is created but not checked out yet.*/
  cartStatus: CartStatus;
  /** Extra info to the status. */
  message?: string;
}

/**
 * Namespace for a vendor app to support a checkout flow by interacting with the marketplace cart.
 */
export namespace marketplace {
  /**
   * Get the cart object owned by the host to checkout.
   *
   * @beta
   */
  export function getCart(): Promise<Cart> {
    return new Promise<Cart>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.getCart'));
    });
  }
  /**
   * Add or update cart items in the cart owned by the host.
   *
   * @param cartItems - A list of cart item, if item id is existing, overwrite the item, otherwise add new item to cart.
   *
   * @beta
   */
  export function addOrUpdateCartItems(cartItems: CartItem[]): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.addOrUpdateCartItems', cartItems));
    });
  }
  /**
   * Remove cart items from the cart owned by the host.
   *
   * @param cartItemIds - A list of cart id, delete the cart item accordingly.
   *
   * @beta
   */
  export function removeCartItems(cartItemIds: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.removeCartItems', cartItemIds));
    });
  }
  /**
   * Update cart status in the cart owned by the host.
   *
   * @param updateCartStatusParams
   *
   * updateCartStatusParams.cartStatus - cart status;
   *
   * updateCartStatusParams.message - extra info to the status.
   *
   * @beta
   */
  export function updateCartStatus(updateCartStatusParams: UpdateCartStatusParams): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.updateCartStatus', updateCartStatusParams));
    });
  }
  /**
   * Checks if the marketplace capability is supported by the host
   * @returns Boolean to represent whether the marketplace capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.marketplace ? true : false;
  }
}
