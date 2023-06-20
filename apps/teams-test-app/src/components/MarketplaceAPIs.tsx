import { marketplace } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const GetCart = (): ReactElement =>
  ApiWithoutInput({
    name: 'getCart',
    title: 'Get Cart',
    onClick: async () => {
      const cart = await marketplace.getCart();
      return JSON.stringify(cart);
    },
  });

const AddOrUpdateCartItems = (): ReactElement =>
  ApiWithTextInput<marketplace.CartItem[]>({
    name: 'addOrUpdateCartItems',
    title: 'Add Or Update CartItems',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (cartItems, setResult) => {
        await marketplace.addOrUpdateCartItems(cartItems);
        const msg = 'update cart items succeeded';
        setResult(msg);
        return msg;
      },
    },
  });

const RemoveCartItems = (): ReactElement =>
  ApiWithTextInput<string[]>({
    name: 'removeCartItems',
    title: 'Remove Cart Items',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (cartItemIds, setResult) => {
        await marketplace.removeCartItems(cartItemIds);
        const msg = 'remove cart items succeeded';
        setResult(msg);
        return msg;
      },
    },
  });

const UpdateCartStatus = (): ReactElement =>
  ApiWithTextInput<marketplace.UpdateCartStatusParams>({
    name: 'updateCartStatus',
    title: 'Update Cart Status',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (updateCartStatusParams, setResult) => {
        await marketplace.updateCartStatus(updateCartStatusParams);
        const msg = 'update cart status succeeded';
        setResult(msg);
        return msg;
      },
    },
  });

const CheckMarketplaceCapability = (): ReactElement =>
  ApiWithoutInput({
    name: 'checkMarketplaceCapability',
    title: 'Check Marketplace Capability ',
    onClick: async () => {
      if (marketplace.isSupported()) {
        return 'marketplace module is supported';
      } else {
        return 'marketplace module is not supported';
      }
    },
  });

const MarketplaceAPIs = (): ReactElement => (
  <ModuleWrapper title="MarketplaceAPIs">
    <CheckMarketplaceCapability />
    <GetCart />
    <AddOrUpdateCartItems />
    <RemoveCartItems />
    <UpdateCartStatus />
  </ModuleWrapper>
);

export default MarketplaceAPIs;
