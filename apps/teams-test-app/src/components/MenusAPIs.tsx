import { menus } from '@microsoft/teams-js';
import React from 'react';
import { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckMenusCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkMenusCapability',
    title: 'Check Menus Capability',
    onClick: async () => `Menus module ${menus.isSupported() ? 'is' : 'is not'} supported`,
  });

const SetUpViews = (): React.ReactElement =>
  ApiWithTextInput<menus.ViewConfiguration[]>({
    name: 'menusSetUpViews',
    title: 'Set Up Views',
    onClick: {
      validateInput: (input) => {
        input.forEach((viewConfig) => {
          if (!viewConfig?.id || !viewConfig.title) {
            throw new Error('ID and Title are required for each viewConfiguration');
          }
        });
      },
      submit: async (input, setResult) => {
        menus.setUpViews(input, (id) => {
          setResult('handler called with id: ' + id);
          return true;
        });
        return 'Completed';
      },
    },
  });

const SetNavBarMenu = (): React.ReactElement =>
  ApiWithTextInput<menus.MenuItem[]>({
    name: 'menusSetNavBarMenu',
    title: 'Set Nav Bar Menu',
    onClick: {
      validateInput: (input) => {
        input.forEach((menuItem) => {
          if (!menuItem?.id || !menuItem?.title || !menuItem?.icon) {
            throw new Error('ID, Title, and Icon are required for each menuItem');
          }
        });
      },
      submit: async (input, setResult) => {
        menus.setNavBarMenu(input, (id) => {
          setResult('handler called with id: ' + id);
          return true;
        });
        return 'Completed';
      },
    },
  });

const ShowActionMenu = (): React.ReactElement =>
  ApiWithTextInput<menus.ActionMenuParameters>({
    name: 'menusShowActionMenu',
    title: 'Show Action Menu',
    onClick: {
      validateInput: (input) => {
        if (!input?.title || !input?.items) {
          throw new Error('Title, and Items are required for actionMenuParameters');
        }
        input.items.forEach((menuItem) => {
          if (!menuItem?.id || !menuItem?.title || !menuItem?.icon) {
            throw new Error('ID, Title, and Icon are required for each menuItem');
          }
        });
      },
      submit: async (input, setResult) => {
        menus.showActionMenu(input, (id) => {
          setResult('handler called with id: ' + id);
          return true;
        });
        return 'Completed';
      },
    },
  });

const MenusAPIs = (): ReactElement => (
  <ModuleWrapper title="Menus">
    <CheckMenusCapability />
    <SetUpViews />
    <SetNavBarMenu />
    <ShowActionMenu />
  </ModuleWrapper>
);

export default MenusAPIs;
