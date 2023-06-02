import { CartItem, marketplace, UpdateCartStatusParams } from '@microsoft/teams-js';
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
  ApiWithTextInput<CartItem[]>({
    name: 'AddOrUpdateCartItems',
    title: 'AddOrUpdateCartItems',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (cartItems, setResult) => {
        await marketplace.addOrUpdateCartItems(cartItems);
        const msg = 'Teams client update cart items succeeded';
        setResult(msg);
        return msg;
      },
    },
  });

const RemoveCartItems = (): ReactElement =>
  ApiWithTextInput<string[]>({
    name: 'RemoveCartItems',
    title: 'RemoveCartItems',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (cartItemIds, setResult) => {
        await marketplace.removeCartItems(cartItemIds);
        const msg = 'Teams client remove cart items succeeded';
        setResult(msg);
        return msg;
      },
    },
  });

const UpdateCartStatus = (): ReactElement =>
  ApiWithTextInput<UpdateCartStatusParams>({
    name: 'UpdateCartStatus',
    title: 'UpdateCartStatus',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (updateCartStatusParams, setResult) => {
        await marketplace.updateCartStatus(updateCartStatusParams);
        const msg = 'Teams client remove cart items succeeded';
        setResult(msg);
        return msg;
      },
    },
  });

const CheckMarketplaceCapability = (): ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityMarketplace',
    title: 'Check Capability Marketplace',
    onClick: async () => {
      if (marketplace.isSupported()) {
        return 'Marketplace capability is supported';
      } else {
        return 'Marketplace capability is not supported';
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
