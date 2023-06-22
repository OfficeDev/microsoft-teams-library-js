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
  ApiWithTextInput<marketplace.AddOrUpdateCartItemsParams>({
    name: 'addOrUpdateCartItems',
    title: 'Add Or Update CartItems',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (addOrUpdateCartItemsParams) => {
        const cart = await marketplace.addOrUpdateCartItems(addOrUpdateCartItemsParams);
        return JSON.stringify(cart);
      },
    },
  });

const RemoveCartItems = (): ReactElement =>
  ApiWithTextInput<marketplace.RemoveCartItemsParams>({
    name: 'removeCartItems',
    title: 'Remove Cart Items',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('input is undefined');
        }
      },
      submit: async (removeCartItemsParams) => {
        const cart = await marketplace.removeCartItems(removeCartItemsParams);
        return JSON.stringify(cart);
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
      submit: async (updateCartStatusParams) => {
        const cart = await marketplace.updateCartStatus(updateCartStatusParams);
        return JSON.stringify(cart);
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
