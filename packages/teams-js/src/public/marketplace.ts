import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import {
  deserializeCart,
  serializeCartItems,
  validateCartItems,
  validateCartStatus,
  validateUuid,
} from '../internal/marketplaceUtils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @hidden
 * Namespace for an app to support a checkout flow by interacting with the marketplace cart in the host.
 * @beta
 */
export namespace marketplace {
  /**
   * @hidden
   * the version of the current cart interface
   * which is forced to send to the host in the calls.
   * @internal
   * Limited to Microsoft-internal use
   * @beta
   */
  export const cartVersion: CartVersion = {
    /**
     * @hidden
     * Represents the major version of the current cart interface,
     * it is increased when incompatible interface update happens.
     */
    majorVersion: 1,
    /**
     * @hidden
     * The minor version of the current cart interface, which is compatible
     * with the previous minor version in the same major version.
     */
    minorVersion: 1,
  };

  /**
   * @hidden
   * Represents the cart object for the app checkout flow.
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
     * The uuid of the cart.
     */
    readonly id: string;
    /**
     * @hidden
     * The cart info.
     */
    readonly cartInfo: CartInfo;
    /**
     * @hidden
     * The cart items.
     */
    readonly cartItems: CartItem[];
  }

  /**
   * @hidden
   * Version of the cart that is used by the app.
   * @internal
   * Limited to Microsoft-internal use
   * @beta
   */
  interface CartVersion {
    /**
     * @hidden
     * Represents the major version of a cart, it
     * not compatible with the previous major version.
     */
    readonly majorVersion: number;
    /**
     * @hidden
     * The minor version of a cart, which is compatible
     * with the previous minor version in the same major version.
     */
    readonly minorVersion: number;
  }

  /**
   * @hidden
   * Represents the cart information
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
     * The identifier to tell the cart is checked out by admin or end user.
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
    readonly status: CartStatus;
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
   * @beta
   */
  export interface Item {
    /**
     * @hidden
     * The id of the cart item.
     */
    readonly id: string;
    /**
     * @hidden
     * The display name of the cart item.
     */
    readonly name: string;
    /**
     * @hidden
     * The quantity of the cart item.
     */
    readonly quantity: number;
    /**
     * @hidden
     * The price of the single cart item.
     */
    readonly price: number;
    /**
     * @hidden
     * The thumbnail imageURL of the cart item.
     */
    readonly imageURL?: URL;
  }

  /**
   * @hidden
   * Represents the cart item that could have accessories
   * @beta
   */
  export interface CartItem extends Item {
    /**
     * @hidden
     * Accessories to the item if existing.
     */
    readonly accessories?: Item[];
    /**
     * @hidden
     * The thumbnail imageURL of the cart item.
     */
    readonly imageURL?: URL;
  }

  /**
   * @hidden
   * Represents the persona creating the cart.
   * @beta
   */
  export enum Intent {
    /**
     * @hidden
     * The cart is created by admin of an organization in Teams Admin Center.
     */
    TACAdminUser = 'TACAdminUser',
    /**
     * @hidden
     * The cart is created by admin of an organization in Teams.
     */
    TeamsAdminUser = 'TeamsAdminUser',
    /**
     * @hidden
     * The cart is created by end user of an organization in Teams.
     */
    TeamsEndUser = 'TeamsEndUser',
  }

  /**
   * @hidden
   * Represents the status of the cart.
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
     * return a new cart in the next getCart call.
     */
    Processed = 'Processed',
    /**
     * @hidden
     * Indicate checking out process is manually cancelled by the user
     */
    Closed = 'Closed',
    /**
     * @hidden
     * Indicate checking out is failed and the host should
     * return a new cart in the next getCart call.
     */
    Error = 'Error',
  }
  /**
   * @hidden
   * Represents the parameters to update the cart items.
   * @beta
   */
  export interface AddOrUpdateCartItemsParams {
    /**
     * @hidden
     * The uuid of the cart to be updated, target on the cart
     * being checked out  if cartId is not provided.
     */
    cartId?: string;
    /**
     * @hidden
     * A list of cart items object, for each item,
     * if item id exists in the cart, overwrite the item price and quantity,
     * otherwise add new items to cart.
     */
    cartItems: CartItem[];
  }
  /**
   * @hidden
   * Represents the parameters to remove the cart items.
   * @beta
   */
  export interface RemoveCartItemsParams {
    /**
     * @hidden
     * The uuid of the cart to be updated, target on the cart
     * being checked out if cartId is not provided.
     */
    cartId?: string;
    /**
     * @hidden
     * A list of cart id, delete the cart item accordingly.
     */
    cartItemIds: string[];
  }
  /**
   * @hidden
   * Represents the parameters to update the cart status.
   * @beta
   */
  export interface UpdateCartStatusParams {
    /**
     * @hidden
     * The uuid of the cart to be updated, target on the cart
     * being checked out if cartId is not provided.
     */
    cartId?: string;
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
   * @returns A promise of the cart object in the cartVersion.
   * @beta
   */
  export function getCart(): Promise<Cart> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    return sendAndHandleSdkError('marketplace.getCart', cartVersion).then(deserializeCart);
  }
  /**
   * @hidden
   * Add or update cart items in the cart owned by the host.
   * @param addOrUpdateCartItemsParams Represents the parameters to update the cart items.
   * @returns A promise of the updated cart object in the cartVersion.
   * @beta
   */
  export function addOrUpdateCartItems(addOrUpdateCartItemsParams: AddOrUpdateCartItemsParams): Promise<Cart> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (!addOrUpdateCartItemsParams) {
      throw new Error('addOrUpdateCartItemsParams must be provided');
    }
    validateUuid(addOrUpdateCartItemsParams?.cartId);
    validateCartItems(addOrUpdateCartItemsParams?.cartItems);
    return sendAndHandleSdkError('marketplace.addOrUpdateCartItems', {
      ...addOrUpdateCartItemsParams,
      cartItems: serializeCartItems(addOrUpdateCartItemsParams.cartItems),
      cartVersion,
    }).then(deserializeCart);
  }

  /**
   * @hidden
   * Remove cart items from the cart owned by the host.
   * @param removeCartItemsParams The parameters to remove the cart items.
   * @returns A promise of the updated cart object in the cartVersion.
   * @beta
   */
  export function removeCartItems(removeCartItemsParams: RemoveCartItemsParams): Promise<Cart> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (!removeCartItemsParams) {
      throw new Error('removeCartItemsParams must be provided');
    }
    validateUuid(removeCartItemsParams?.cartId);
    if (!Array.isArray(removeCartItemsParams?.cartItemIds) || removeCartItemsParams?.cartItemIds.length === 0) {
      throw new Error('cartItemIds must be a non-empty array');
    }
    return sendAndHandleSdkError('marketplace.removeCartItems', {
      ...removeCartItemsParams,
      cartVersion,
    }).then(deserializeCart);
  }
  /**
   * @hidden
   * Update cart status in the cart owned by the host.
   * @param updateCartStatusParams The parameters to update the cart status.
   * @returns A promise of the updated cart object in the cartVersion.
   * @beta
   */
  export function updateCartStatus(updateCartStatusParams: UpdateCartStatusParams): Promise<Cart> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (!updateCartStatusParams) {
      throw new Error('updateCartStatusParams must be provided');
    }
    validateUuid(updateCartStatusParams?.cartId);
    validateCartStatus(updateCartStatusParams?.cartStatus);
    return sendAndHandleSdkError('marketplace.updateCartStatus', {
      ...updateCartStatusParams,
      cartVersion,
    }).then(deserializeCart);
  }
  /**
   * @hidden
   * Checks if the marketplace capability is supported by the host.
   * @returns Boolean to represent whether the marketplace capability is supported.
   * @throws Error if {@linkcode app.initialize} has not successfully completed.
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.marketplace ? true : false;
  }
}
