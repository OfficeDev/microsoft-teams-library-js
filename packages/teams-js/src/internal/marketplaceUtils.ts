/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { validate } from 'uuid';

import { marketplace } from '../public';

/**
 * @hidden
 * deserialize the cart data:
 * - convert url properties from string to URL
 * @param cartItems The cart items
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function deserializeCart(cartData: any): marketplace.Cart {
  try {
    cartData.cartItems = deserializeCartItems(cartData.cartItems);
    return cartData as marketplace.Cart;
  } catch (e) {
    throw new Error('Error deserializing cart');
  }
}

/**
 * @hidden
 * deserialize the cart items:
 * - convert url properties from string to URL
 * @param cartItems The cart items
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function deserializeCartItems(cartItemsData: any): marketplace.CartItem {
  return cartItemsData.map((cartItem) => {
    if (cartItem.imageURL) {
      const url = new URL(cartItem.imageURL);
      cartItem.imageURL = url;
    }
    if (cartItem.accessories) {
      cartItem.accessories = deserializeCartItems(cartItem.accessories);
    }
    return cartItem;
  }) as marketplace.CartItem;
}

/**
 * @hidden
 * serialize the cart items:
 * - make URL properties to string
 * @param cartItems The cart items
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const serializeCartItems = (cartItems: marketplace.CartItem[]): any => {
  try {
    return cartItems.map((cartItem) => {
      const { imageURL, accessories, ...rest } = cartItem;
      const cartItemsData: any = { ...rest };
      if (imageURL) {
        cartItemsData.imageURL = imageURL.href;
      }
      if (accessories) {
        cartItemsData.accessories = serializeCartItems(accessories);
      }
      return cartItemsData;
    });
  } catch (e) {
    throw new Error('Error serializing cart items');
  }
};

/**
 * @hidden
 * Validate the cart item properties are valid
 * @param cartItems The cart items
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateCartItems(cartItems: marketplace.CartItem[]): void {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error('cartItems must be a non-empty array');
  }
  for (const cartItem of cartItems) {
    validateBasicCartItem(cartItem);
    validateAccessoryItems(cartItem.accessories);
  }
}

/**
 * @hidden
 * Validate accessories
 * @param accessoryItems The accessories to be validated
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateAccessoryItems(accessoryItems: marketplace.Item[] | undefined | null): void {
  if (accessoryItems === null || accessoryItems === undefined) {
    return;
  }
  if (!Array.isArray(accessoryItems) || accessoryItems.length === 0) {
    throw new Error('CartItem.accessories must be a non-empty array');
  }
  for (const accessoryItem of accessoryItems) {
    if (accessoryItem['accessories']) {
      throw new Error('Item in CartItem.accessories cannot have accessories');
    }
    validateBasicCartItem(accessoryItem);
  }
}

/**
 * @hidden
 * Validate the basic cart item properties are valid
 * @param basicCartItem The basic cart item
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateBasicCartItem(basicCartItem: marketplace.Item): void {
  if (!basicCartItem.id) {
    throw new Error('cartItem.id must not be empty');
  }
  if (!basicCartItem.name) {
    throw new Error('cartItem.name must not be empty');
  }
  validatePrice(basicCartItem.price);
  validateQuantity(basicCartItem.quantity);
}

/**
 * @hidden
 * Validate the id is valid
 * @param id A uuid string
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateUuid(id: string | undefined | null): void {
  if (id === undefined || id === null) {
    return;
  }
  if (!id) {
    throw new Error('id must not be empty');
  }
  if (validate(id) === false) {
    throw new Error('id must be a valid UUID');
  }
}

/**
 * @hidden
 * Validate the cart item properties are valid
 * @param price The price to be validated
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validatePrice(price: number): void {
  if (typeof price !== 'number' || price < 0) {
    throw new Error(`price ${price} must be a number not less than 0`);
  }
  if (parseFloat(price.toFixed(3)) !== price) {
    throw new Error(`price ${price} must have at most 3 decimal places`);
  }
}

/**
 * @hidden
 * Validate quantity
 * @param quantity The quantity to be validated
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateQuantity(quantity: number): void {
  if (typeof quantity !== 'number' || quantity <= 0 || parseInt(quantity.toString()) !== quantity) {
    throw new Error(`quantity ${quantity} must be an integer greater than 0`);
  }
}

/**
 * @hidden
 * Validate cart status
 * @param cartStatus The cartStatus to be validated
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateCartStatus(cartStatus: marketplace.CartStatus): void {
  if (!Object.values(marketplace.CartStatus).includes(cartStatus)) {
    throw new Error(`cartStatus ${cartStatus} is not valid`);
  }
}
