import {
  DeepLinkParameters,
  FrameInfo,
  navigateCrossDomain,
  pages,
  registerFocusEnterHandler,
  registerFullScreenHandler,
  returnFocus,
  setFrameContext,
  settings,
  shareDeepLink,
  ShareDeepLinkParameters,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const GetConfig = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'config_getConfig',
    title: 'Get Config',
    onClick: {
      withPromise: async () => {
        const result = await pages.getConfig();
        return JSON.stringify(result);
      },
      withCallback: (setResult) => {
        const callback = (instanceSettings: settings.Settings): void => {
          setResult(JSON.stringify(instanceSettings));
        };
        settings.getSettings(callback);
      },
    },
  });

const NavigateCrossDomain = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'navigateCrossDomain2',
    title: 'Navigate Cross Domain',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('Target URL is required.');
        }
      },
      submit: {
        withPromise: async (input) => {
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
      validateInput: (input) => {
        if (!input.appId || !input.pageId) {
          throw new Error('AppID and PageID are required.');
        }
      },
      submit: async (input) => {
        await pages.navigateToApp(input);
        return 'Completed';
      },
    },
  });

const ShareDeepLink = (): ReactElement =>
  ApiWithTextInput<DeepLinkParameters & ShareDeepLinkParameters>({
    name: 'pages.shareDeepLink',
    title: 'Share Deeplink (Pages)',
    onClick: {
      validateInput: (input) => {
        if (!((input.subEntityId && input.subEntityLabel) || (input.subPageId && input.subPageLabel))) {
          throw new Error('subPageId and subPageLabel OR subEntityId and subEntityLabel are required.');
        }
      },
      submit: {
        withPromise: async (input) => {
          if (input.subEntityId && input.subEntityLabel) {
            await pages.shareDeepLink({
              subPageId: input.subEntityId,
              subPageLabel: input.subEntityLabel,
              subPageWebUrl: input.subEntityWebUrl,
            });
          } else {
            await pages.shareDeepLink(input);
          }
          return 'called shareDeepLink';
        },
        withCallback: (input, setResult) => {
          if (input.subEntityId && input.subEntityLabel) {
            shareDeepLink(input);
          } else {
            shareDeepLink({
              subEntityId: input.subPageId,
              subEntityLabel: input.subPageLabel,
              subEntityWebUrl: input.subPageWebUrl,
            });
          }
          setResult('called shareDeepLink');
        },
      },
    },
  });

const ReturnFocus = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'returnFocus',
    title: 'Return Focus',
    label: 'navigateForward',
    onClick: {
      withPromise: async (input) => {
        await pages.returnFocus(input);
        return 'Current navigateForward state is ' + input;
      },
      withCallback: (input) => {
        returnFocus(input);
        return 'Current navigateForward state is ' + input;
      },
    },
  });

const RegisterFocusEnterHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerFocusEnterHandler',
    title: 'Register On Focus Enter Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.registerFocusEnterHandler((navigateForward) => {
          setResult('successfully called with navigateForward:' + navigateForward);
          return true;
        });
        return 'registered';
      },
      withCallback: (setResult) => {
        registerFocusEnterHandler((navigateForward) => {
          setResult('successfully called with navigateForward:' + navigateForward);
          return true;
        });
        setResult('registered');
      },
    },
  });

const SetCurrentFrame = (): React.ReactElement =>
  ApiWithTextInput<FrameInfo>({
    name: 'setCurrentFrame',
    title: 'Set current frame',
    onClick: {
      validateInput: (input) => {
        if (!input.websiteUrl || !input.contentUrl) {
          throw new Error('websiteUrl and contentUrl are required.');
        }
      },
      submit: {
        withPromise: async (input) => {
          pages.setCurrentFrame(input);
          return 'called';
        },
        withCallback: (input, setResult) => {
          setFrameContext(input);
          setResult('called');
        },
      },
    },
  });

const RegisterFullScreenChangeHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerFullScreenChangeHandler',
    title: 'Register Full Screen Change Handler',
    onClick: {
      withPromise: async (setResult) => {
        pages.registerFullScreenHandler((isFullScreen: boolean): void => {
          setResult('successfully called with isFullScreen:' + isFullScreen);
        });
        return 'registered';
      },
      withCallback: (setResult) => {
        registerFullScreenHandler((isFullScreen: boolean): void => {
          setResult('successfully called with isFullScreen:' + isFullScreen);
        });
        setResult('registered');
      },
    },
  });

const CheckPageCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPageCapability',
    title: 'Check Page Call',
    onClick: async () => `Pages module ${pages.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesAPIs = (): ReactElement => (
  <ModuleWrapper title="Pages">
    <GetConfig />
    <NavigateCrossDomain />
    <NavigateToApp />
    <ShareDeepLink />
    <ReturnFocus />
    <RegisterFocusEnterHandler />
    <SetCurrentFrame />
    <RegisterFullScreenChangeHandler />
    <CheckPageCapability />
  </ModuleWrapper>
);

export default PagesAPIs;
