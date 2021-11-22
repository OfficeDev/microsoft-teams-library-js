import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from './utils';

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

const PagesAPIs = (): ReactElement => {
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
      <h1>pages</h1>
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
      <CheckPageCapability />
    </>
  );
};

export default PagesAPIs;
