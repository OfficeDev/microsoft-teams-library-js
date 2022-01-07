import { DeepLinkParameters, FrameInfo, navigateCrossDomain, pages, returnFocus } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
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
      submit: {
        withPromise: async input => {
          await pages.navigateCrossDomain(input);
          return 'Completed';
        },
        withCallback: (input, setResult) => {
          const onComplete = (status: boolean, reason?: string): void => {
            if (!status) {
              if (reason) {
                setResult(JSON.stringify(reason));
              } else {
                setResult("Status is false but there's not reason?! This shouldn't happen.");
              }
            } else {
              setResult('Completed');
            }
          };
          navigateCrossDomain(input, onComplete);
        },
      },
    },
  });

const NavigateToApp = (): React.ReactElement =>
  ApiWithTextInput<pages.NavigateToAppParams>({
    name: 'navigateToApp',
    title: 'Navigate To App',
    onClick: {
      validateInput: input => {
        if (!input.appId || !input.pageId) {
          throw new Error('AppID and PageID are required.');
        }
      },
      submit: async input => {
        await pages.navigateToApp(input);
        return 'Completed';
      },
    },
  });

const ShareDeepLink = (): ReactElement =>
  ApiWithTextInput<DeepLinkParameters>({
    name: 'core.shareDeepLink',
    title: 'Share Deeplink',
    onClick: {
      validateInput: input => {
        if (!input.subEntityId || !input.subEntityLabel) {
          throw new Error('subEntityId and subEntityLabel are required.');
        }
      },
      submit: async input => {
        await pages.shareDeepLink(input);
        return 'called shareDeepLink';
      },
    },
  });

const ReturnFocus = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'returnFocus',
    title: 'Return Focus',
    label: 'navigateForward',
    onClick: {
      withPromise: async input => {
        await pages.returnFocus(input);
        return 'Current navigateForward state is ' + input;
      },
      withCallback: input => {
        returnFocus(input);
        return 'Current navigateForward state is ' + input;
      },
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
    <NavigateToApp />
    <ShareDeepLink />
    <ReturnFocus />
    <SetCurrentFrame />
    <RegisterFullScreenChangeHandler />
    <CheckPageCapability />
  </>
);

export default PagesAPIs;
