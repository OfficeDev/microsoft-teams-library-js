import { menus } from '@microsoft/teams-js';
import React from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckMenusCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMenusCapability',
    title: 'Check Menus Capability',
    onClick: async () => `Menus ${menus.isSupported() ? 'is' : 'is not'} supported`,
  });

const SetUpViews = (): React.ReactElement =>
  ApiWithTextInput<menus.ViewConfiguration[]>({
    name: 'setUpViews',
    title: 'set Up Views',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async (input, setResult) => {
        const handler = (id: string): boolean => {
          setResult(`Success with Id number ${id}`);
          return true;
        };
        menus.setUpViews(input, handler);
        return 'menus.setUpViews() has been called. If successful, this message will change when the user selects view configuration.';
      },
    },
  });

const SetNavBarMenu = (): React.ReactElement =>
  ApiWithTextInput<menus.MenuItem[]>({
    name: 'setNavBarMenu',
    title: 'set Nav Bar Menu',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async (input, setResult) => {
        const handler = (id: string): boolean => {
          setResult(`Success with Id number ${id}`);
          return true;
        };
        menus.setNavBarMenu(input, handler);
        return 'menus.setNavBarMenu() has been called. If successful, this message will change when the user selects menu item.';
      },
    },
  });

const ShowActionMenu = (): React.ReactElement =>
  ApiWithTextInput<menus.ActionMenuParameters>({
    name: 'showActionMenu',
    title: 'show Action Menu',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('input is required.');
        }
      },
      submit: async (input, setResult) => {
        const handler = (id: string): boolean => {
          setResult(`Success with Id number ${id}`);
          return true;
        };
        menus.showActionMenu(input, handler);
        return 'menus.showActionMenu() has been called. If successful, this message will change when the user selects menu item.';
      },
    },
  });

const MenusAPIs = (): React.ReactElement => (
  <>
    <h1>menus</h1>
    <SetUpViews />
    <SetNavBarMenu />
    <ShowActionMenu />
    <CheckMenusCapability />
  </>
);

export default MenusAPIs;
