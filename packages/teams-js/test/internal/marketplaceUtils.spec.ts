/* eslint-disable @microsoft/sdl/no-insecure-url */
import { v4 as uuid } from 'uuid';

import {
  validateAccessoryItems,
  validateBasicCartItem,
  validateCartItems,
  validateCartStatus,
  validatePrice,
  validateQuantity,
  validateUrl,
  validateUuid,
} from '../../src/internal/marketplaceUtils';
import { marketplace } from '../../src/public';

describe.only('Testing marketplace utils', () => {
  it('should validate cart items in parameters', () => {
    const cartItems = [
      { id: '1', name: 'Item 1', price: 10, quantity: 1 },
      { id: '2', name: 'Item 2', price: 10, quantity: 2 },
    ];
    expect(() => validateCartItems(cartItems)).not.toThrowError();
  });
  it('should validate price of cart items', () => {
    expect(() => validatePrice(12.34)).not.toThrowError();
    expect(() => validatePrice(12.346)).not.toThrowError();
    expect(() => validatePrice(0)).not.toThrowError();
    expect(() => validatePrice(-12.34)).toThrowError('price -12.34 must be a number not less than 0');
    expect(() => validatePrice(12.3456)).toThrowError('price 12.3456 must have at most 3 decimal places');
  });
  it('should validate quantity of cart items', () => {
    expect(() => validateQuantity(0)).toThrowError('quantity 0 must be an integer greater than 0');
    expect(() => validateQuantity(3.2)).toThrowError('quantity 3.2 must be an integer greater than 0');
    expect(() => validateQuantity(-2)).toThrowError('quantity -2 must be an integer greater than 0');
    expect(() => validateQuantity(3)).not.toThrowError();
  });
  it('should validate id of the cart', () => {
    expect(() => validateUuid(uuid())).not.toThrowError();
    expect(() => validateUuid('')).toThrowError('id must not be empty');
    expect(() => validateUuid('123')).toThrowError('id must be a valid UUID');
  });
  it('should validate the accessories of a cart item', () => {
    const accessories = [
      { id: '1', name: 'Item 1', price: 10, quantity: 1 },
      { id: '2', name: 'Item 2', price: 10, quantity: 2 },
    ];
    const nestedAccessories = [{ id: '2', name: 'Item 2', price: 10, quantity: 2, accessories: [] }];
    expect(() => validateAccessoryItems(accessories)).not.toThrowError();
    expect(() => validateAccessoryItems(null)).not.toThrowError();
    expect(() => validateAccessoryItems([])).toThrowError('CartItem.accessories must be a non-empty array');
    expect(() => validateAccessoryItems(nestedAccessories)).toThrowError(
      'Item in CartItem.accessories cannot have accessories',
    );
  });
  it('should validate basic cart item', () => {
    const basicCartItem = { id: '1', name: 'Item 1', price: 10, quantity: 1 };
    const nestedAccessories = { id: '2', name: '', price: 10, quantity: 2, accessories: [] };
    const emptyIdItem = { id: '', name: 'Item 1', price: 10, quantity: 1 };
    expect(() => validateBasicCartItem(basicCartItem)).not.toThrowError();
    expect(() => validateBasicCartItem(nestedAccessories)).toThrowError('cartItem.name must not be empty');
    expect(() => validateBasicCartItem(emptyIdItem)).toThrowError('cartItem.id must not be empty');
  });
  it('should validate url', () => {
    expect(() => validateUrl(null)).not.toThrowError();
    expect(() => validateUrl('http://www.microsoft.com/image.jpg')).not.toThrowError();
    expect(() => validateUrl('https://abc12345')).not.toThrowError();
    expect(() => validateUrl('url')).toThrowError('url url is not valid');
    expect(() => validateUrl('')).toThrowError('url  is not valid');
  });
  it('should validate cartStatus', () => {
    expect(() => validateCartStatus(marketplace.CartStatus.Open)).not.toThrowError();
    expect(() => validateCartStatus('InvalidStatus' as marketplace.CartStatus)).toThrowError(
      'cartStatus InvalidStatus is not valid',
    );
  });
});
