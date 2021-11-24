import { FrameInfo, pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

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

const SetCurrentFrame = (): React.ReactElement =>
  ApiWithTextInput<FrameInfo>({
    name: 'setCurrentFrame',
    title: 'Set current frame',
    onClick: {
      validateInput: input => {
        if (!input.websiteUrl || !input.contentUrl) {
          throw new Error('websiteUrl and contentUrl are required.');
        }
      },
      submit: async input => {
        pages.setCurrentFrame(input);
        return 'called';
      },
    },
  });

const RegisterFullScreenChangeHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerFullScreenChangeHandler',
    title: 'Register Full Screen Change Handler',
    onClick: async setResult => {
      pages.registerFullScreenHandler((isFullScreen: boolean): void => {
        setResult('successfully called with isFullScreen:' + isFullScreen);
      });
      return 'registered';
    },
  });

const CheckPageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageCapability',
    title: 'Check Page Call',
    onClick: async () => `Pages module ${pages.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesAPIs = (): ReactElement => (
  <>
    <h1>pages</h1>
    <NavigateCrossDomain />
    <ReturnFocus />
    <SetCurrentFrame />
    <RegisterFullScreenChangeHandler />
    <CheckPageCapability />
  </>
);

export default PagesAPIs;
