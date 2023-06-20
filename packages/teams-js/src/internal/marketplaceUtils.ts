import { marketplace } from '../public';

/**
 * @hidden
 * Validates the cart item properties are valid
 * @param cartItems The cart items
 * @returns [true, undefined] if all properties of all cart items are valid, [false, error message] otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateCartItems(cartItems: marketplace.CartItem[]): [boolean, string | undefined] {
  for (const cartItem of cartItems) {
    const priceValidationResult = validatePrice(cartItem.price);
    if (!priceValidationResult[0]) {
      return priceValidationResult;
    }
    const quantityValidationResult = validateQuantity(cartItem.quantity);
    if (!quantityValidationResult[0]) {
      return quantityValidationResult;
    }
  }
  return [true, undefined];
}

/**
 * @hidden
 * Validates the cart item properties are valid
 * @param price The price to be validated
 * @returns [true, undefined] if price is valid, [false, error message] otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validatePrice(price: number): [boolean, string | undefined] {
  if (typeof price !== 'number' || price < 0) {
    return [false, `price ${price} must be a number not less than 0`];
  }
  if (parseFloat(price.toFixed(3)) !== price) {
    return [false, `price ${price} must have at most 3 decimal places`];
  }
  return [true, undefined];
}

/**
 * @hidden
 * Validates quantity is valid
 * @param quantity The quantity to be validated
 * @returns [true, undefined] if quantity is valid, [false, error message] otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validateQuantity(quantity: number): [boolean, string | undefined] {
  if (typeof quantity !== 'number' || quantity <= 0) {
    return [false, `quantity ${quantity} must be a number greater than 0`];
  }
  if (parseInt(quantity.toString()) !== quantity) {
    return [false, `quantity ${quantity} must be an integer`];
  }
  return [true, undefined];
}
