/* eslint-disable @microsoft/sdl/no-insecure-url */
import { v4 as uuid } from 'uuid';

import {
  deserializeCart,
  deserializeCartItems,
  serializeCartItems,
  validateAccessoryItems,
  validateBasicCartItem,
  validateCartItems,
  validateCartStatus,
  validatePrice,
  validateQuantity,
  validateUuid,
} from '../../src/internal/marketplaceUtils';
import { marketplace } from '../../src/public';

describe('Testing marketplace validation', () => {
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
  it('should validate cartStatus', () => {
    expect(() => validateCartStatus(marketplace.CartStatus.Open)).not.toThrowError();
    expect(() => validateCartStatus('InvalidStatus' as marketplace.CartStatus)).toThrowError(
      'cartStatus InvalidStatus is not valid',
    );
  });
});

describe('Testing marketplace serialization', () => {
  const cartItems: marketplace.CartItem[] = [
    { id: '1', name: 'Item 1', price: 10, quantity: 1 },
    { id: '2', name: 'Item 1', price: 10, quantity: 1, imageURL: new URL('https://example.com/image.jpg?q=1&p=2') },
    {
      id: '3',
      name: 'Item 2',
      price: 10,
      quantity: 2,
      imageURL: new URL('https://example.com/image.jpg?q=1&p=2'),
      accessories: [
        {
          id: '33',
          name: 'Item 2',
          price: 10,
          quantity: 2,
          imageURL: new URL('https://example.com/image.jpg?q=1&p=2'),
        },
      ],
    },
    {
      id: '4',
      name: 'Item 2',
      price: 10,
      quantity: 2,
      accessories: [
        {
          id: '44',
          name: 'Item 2',
          price: 10,
          quantity: 2,
          imageURL: new URL('https://example.com/image.jpg?q=1&p=2'),
        },
      ],
    },
  ];
  const cartItemsData = [
    { id: '1', name: 'Item 1', price: 10, quantity: 1 },
    { id: '2', name: 'Item 1', price: 10, quantity: 1, imageURL: 'https://example.com/image.jpg?q=1&p=2' },
    {
      id: '3',
      name: 'Item 2',
      price: 10,
      quantity: 2,
      imageURL: 'https://example.com/image.jpg?q=1&p=2',
      accessories: [
        { id: '33', name: 'Item 2', price: 10, quantity: 2, imageURL: 'https://example.com/image.jpg?q=1&p=2' },
      ],
    },
    {
      id: '4',
      name: 'Item 2',
      price: 10,
      quantity: 2,
      accessories: [
        { id: '44', name: 'Item 2', price: 10, quantity: 2, imageURL: 'https://example.com/image.jpg?q=1&p=2' },
      ],
    },
  ];
  it('should serialize cart items', () => {
    expect(serializeCartItems(cartItems)).toEqual(cartItemsData);
  });

  it('should deserialize cart items', () => {
    expect(deserializeCartItems(cartItemsData)).toEqual(cartItems);
  });

  it('should deserialize cart', () => {
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
      cartItems: cartItems,
    };
    const cartData = {
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
      cartItems: cartItemsData,
    };
    expect(deserializeCart(cartData)).toEqual(cart);
  });
  it('should throw deserialize cart error', () => {
    const cartData = {
      cartItems: { id: '2', name: 'Item 1', price: 10, quantity: 1, imageURL: 'abc' },
    };
    expect(() => deserializeCart(cartData)).toThrowError(new Error('Error deserializing cart'));
  });
});
