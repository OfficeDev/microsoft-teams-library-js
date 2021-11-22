import { pages, TabInstance } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
import CheckboxAndButton from './CheckboxAndButton';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from './utils';

const NavigateBack = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'navigateBack',
    title: 'Navigate Back',
    onClick: async () => {
      await pages.backStack.navigateBack();
      return 'Completed';
    },
  });

const NavigateCrossDomain = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'navigateCrossDomain2',
    title: 'Navigate Cross Domain',
    onClick: {
      validateInput: input => {
        if (!input) {
          throw new Error('Target URL is required.');
        }
      },
      submit: async input => {
        await pages.navigateCrossDomain(input);
        return 'Completed';
      },
    },
  });

const NavigateToTab = (): React.ReactElement =>
  ApiWithTextInput<TabInstance>({
    name: 'navigateToTab',
    title: 'Navigate To Tab',
    onClick: {
      validateInput: input => {
        if (!input.tabName) {
          throw new Error('tabName is required');
        }
      },
      submit: async input => {
        await pages.tabs.navigateToTab(input);
        return 'Completed';
      },
    },
  });

const ReturnFocus = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'returnFocus',
    title: 'Return Focus',
    label: 'navigateForward',
    onClick: async input => {
      await pages.returnFocus(input);
      return 'Current navigateForward state is ' + input;
    },
  });

const CheckPageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageCapability',
    title: 'Check Page Call',
    onClick: async () => `Pages module ${pages.isSupported() ? 'is' : 'is not'} supported`,
  });

const NavigationAPIs = (): ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version
  const [navigateCrossDomainRes, setNavigateCrossDomainRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const navigateCrossDomainFunc = (url: string): void => {
    setNavigateCrossDomainRes('navigateCrossDomain()' + noHostSdkMsg);
    pages
      .navigateCrossDomain(url)
      .then(() => setNavigateCrossDomainRes('Completed'))
      .catch(reason => setNavigateCrossDomainRes(reason));
  };

  return (
    <>
      <h1>navigation</h1>
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={navigateCrossDomainFunc}
        output={navigateCrossDomainRes}
        hasInput={true}
        title="Navigate Cross Domain"
        name="navigateCrossDomain"
      />
      <NavigateCrossDomain />
      <ReturnFocus />
      <NavigateToTab />
      <NavigateBack />
      <CheckPageCapability />
    </>
  );
};

export default NavigationAPIs;
