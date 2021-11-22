import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput } from './utils';

const NavigateBack = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'navigateBack',
    title: 'Navigate Back',
    onClick: async () => {
      await pages.backStack.navigateBack();
      return 'Completed';
    },
  });

const CheckPageBackStackCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageBackStackCapability',
    title: 'Check Page BackStack Call',
    onClick: async () => `Pages.backStack module ${pages.backStack.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesAPIs = (): ReactElement => (
  <>
    <h1>pages.backStack</h1>
    <NavigateBack />
    <CheckPageBackStackCapability />
  </>
);

export default PagesAPIs;
