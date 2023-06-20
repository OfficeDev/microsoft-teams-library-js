import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateCartItems } from '../internal/marketplaceUtils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @hidden
 * Namespace for an app to support a checkout flow by interacting with the marketplace cart in the host.
 *
 * @beta
 */
export namespace marketplace {
  /**
   * @hidden
   * Represents the cart object for the app checkout flow.
   *
   * @beta
   */
  export interface Cart {
    /**
     * @hidden
     * Version of the cart.
     */
    readonly version: CartVersion;
    /**
     * @hidden
     * The id of the cart.
     */
    readonly id: string;
    /**
     * @hidden
     * The cart info.
     */
    cartInfo: CartInfo;
    /**
     * @hidden
     * The cart items.
     */
    cartItems: CartItem[];
  }

  /**
   * @hidden
   * Version of the cart.
   *
   * @beta
   */
  interface CartVersion {
    /**
     * @hidden
     * Represents the major version number.
     */
    majorVersion: number;
    /**
     * @hidden
     * Represents the minor version number.
     */
    minorVersion: number;
  }

  /**
   * @hidden
   * Represents the cart information
   *
   * @beta
   */
  interface CartInfo {
    /**
     * @hidden
     * The country market where the products are selling.
     * Should be country code in ISO 3166-1 alpha-2 format, e.g. CA for Canada.
     * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
     */
    readonly market: string;
    /**
     * @hidden
     * The identifier to tell the cart is checked out by admin or information worker
     */
    readonly intent: Intent;
    /**
     * @hidden
     * Locale the app should render for the user
     * Should be a BCP 47 language tag, e.g. en-US ([primary tag]-[ISO 3166-1 alpha-2 code]).
     * https://en.wikipedia.org/wiki/IETF_language_tag
     */
    readonly locale: string;
    /**
     * @hidden
     * The status of the cart.
     */
    status: CartStatus;
    /**
     * @hidden
     * ISO 4217 currency code for the cart item price, e.g. USD for US Dollar.
     * https://en.wikipedia.org/wiki/ISO_4217
     */
    readonly currency: string;
    /**
     * @hidden
     * ISO 8601 timestamp string in UTC, indicates when the cart is created.
     * e.g. 2023-06-19T22:06:59Z
     * https://en.wikipedia.org/wiki/ISO_8601
     */
    readonly createdAt: string;
    /**
     * @hidden
     * ISO 8601 timestamp string in UTC, indicates when the cart is updated.
     * e.g. 2023-06-19T22:06:59Z
     * https://en.wikipedia.org/wiki/ISO_8601
     */
    readonly updatedAt: string;
  }

  /**
   * @hidden
   * Represents the basic cart item information.
   *
   * @beta
   */
  interface Item {
    /**
     * @hidden
     * The id of the cart item.
     */
    readonly id: string;
    /**
     * @hidden
     * The display name of the cart item.
     */
    name: string;
    /**
     * @hidden
     * The quantity of the cart item.
     */
    quantity: number;
    /**
     * @hidden
     * The price of the single cart item.
     */
    price: number;
    /**
     * @hidden
     * The thumbnail imageURL of the cart item.
     */
    readonly imageURL?: string;
  }

  /**
   * @hidden
   * Represents the cart item that could have accessories
   *
   * @beta
   */
  export interface CartItem extends Item {
    /**
     * @hidden
     * Accessories to the item if existing.
     */
    readonly accessories?: Item[];
  }

  /**
   * @hidden
   * Represents the persona creating the cart.
   *
   * @beta
   */
  export enum Intent {
    /**
     * @hidden
     * The cart is created by admin of an organization.
     */
    AdminUser = 'AdminUser',
    /**
     * @hidden
     * The cart is created by end user of an organization.
     */
    EndUser = 'EndUser',
  }

  /**
   * @hidden
   * Represents the status of the cart.
   *
   * @beta
   */
  export enum CartStatus {
    /**
     * @hidden
     * Cart is created but not checked out yet.
     */
    Open = 'Open',
    /**
     * @hidden
     * Cart is checked out but not completed yet.
     */
    Processing = 'Processing',
    /**
     * @hidden
     * Indicate checking out is completed and the host should
     * response a new cart in the next getCart call.
     */
    Processed = 'Processed',
    /**
     * @hidden
     * Indicate checking out is failed and the host should
     * response a new cart in the next getCart call.
     */
    Error = 'Error',
  }
  /**
   * @hidden
   * Represents the parameters to update the cart status.
   *
   * @beta
   */
  export interface UpdateCartStatusParams {
    /**
     * @hidden
     * Status of the cart.
     */
    cartStatus: CartStatus;
    /**
     * @hidden
     * Extra info to the status.
     */
    statusInfo?: string;
  }

  /**
   * @hidden
   * Get the cart object owned by the host to checkout.
   *
   * @beta
   */
  export function getCart(): Promise<Cart> {
    return new Promise<Cart>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.getCart'));
    });
  }
  /**
   * @hidden
   * Add or update cart items in the cart owned by the host.
   *
   * @param cartItems - A list of cart items, if item id exists, overwrite the item, otherwise add new items to cart.
   *
   * @beta
   */
  export function addOrUpdateCartItems(cartItems: CartItem[]): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      const [isValidItems, invalidItemsMessage] = validateCartItems(cartItems);
      if (!isValidItems) {
        throw new Error(invalidItemsMessage);
      }
      resolve(sendAndHandleSdkError('marketplace.addOrUpdateCartItems', cartItems));
    });
  }
  /**
   * @hidden
   * Remove cart items from the cart owned by the host.
   *
   * @param cartItemIds - A list of cart id, delete the cart item accordingly.
   *
   * @beta
   */
  export function removeCartItems(cartItemIds: string[]): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError('marketplace.removeCartItems', cartItemIds));
    });
  }
  /**
   * @hidden
   * Update cart status in the cart owned by the host.
   *
   * @param updateCartStatusParams
   * updateCartStatusParams.cartStatus - cart status.
   * updateCartStatusParams.message - extra info to the status.
   *
   * @beta
   */
  export function updateCartStatus(updateCartStatusParams: UpdateCartStatusParams): Promise<void> {
    return new Promise<void>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (!Array.isArray(updateCartStatusParams) || updateCartStatusParams.length === 0) {
        throw new Error('updateCartStatusParams must be a non-empty array');
      }
      resolve(sendAndHandleSdkError('marketplace.updateCartStatus', updateCartStatusParams));
    });
  }
  /**
   * @hidden
   * Checks if the marketplace capability is supported by the host.
   *
   * @returns Boolean to represent whether the marketplace capability is supported.
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed.
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.marketplace ? true : false;
  }
}
