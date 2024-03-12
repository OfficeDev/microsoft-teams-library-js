import { pages } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const ShowResponseButton = (): React.ReactElement =>
  ApiWithTextInput<pages.responseButton.ResponseInfo>({
    name: 'showResponseButton',
    title: 'Show Response Button',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw new Error('reponseInfo is required');
        }
      },
      submit: async (input) => {
        await pages.responseButton.showResponseButton(input);
        return 'Completed';
      },
    },
    defaultInput: JSON.stringify({
      responseId: 'reply',
      actionInfo: {
        actionId: 'actionId',
        actionObjects: [
          {
            itemId: '1',
            secondaryId: {
              name: 'driveId',
              value: 'secondaryDriveValue',
            },
            originalSource: {
              messageId: 'mockMessageId',
              conversationId: 'mockConversationId',
              type: 'email',
            },
            type: 'm365content',
          },
        ],
      },
    }),
  });

const HideResponseButton = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'hideResponseButton',
    title: 'Hide Response Button',
    onClick: async () => {
      await pages.responseButton.hideResponseButton();
      return 'Completed';
    },
  });

// const RegisterResponseButtonClickEventHandler = (): React.ReactElement =>
//   ApiWithoutInput({
//     name: 'registerResponseButtonClickEventHandler',
//     title: 'Register Response Button Click Event Handler',
//     onClick: async (setResult) => {
//       pages.responseButton.registerResponseButtonClickEventHandler((): void => {
//         setResult('responseButtonEventHandler successfully called');
//       });
//       return 'Completed';
//     },
//   });

const RegisterResponseButtonClickEventHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerResponseButtonClickEventHandler',
    title: 'Register Response Button Click Event Handler',
    onClick: async (setResult) => {
      pages.responseButton.registerResponseButtonClickEventHandler(
        (event: pages.responseButton.ResponseButtonEvent): void => {
          setResult('responseButton click event received.');
          event.notifySuccess();
        },
      );
      return 'pages.response.responseButtonEventType()' + noHostSdkMsg;
    },
  });

const ResponseButtonClickEventHandlerFailure = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerResponseButtonClickEventHandlerFailure',
    title: 'Register Response Button Click Event Handler Failure',
    onClick: async (setResult) => {
      pages.responseButton.registerResponseButtonClickEventHandler(
        (removeEvent: pages.responseButton.ResponseButtonEvent): void => {
          setResult('responseButton click event failed.');
          removeEvent.notifyFailure('theReason');
        },
      );
      return 'pages.response.responseButtonEventType()' + noHostSdkMsg;
    },
  });

const CheckPagesResponseButtonCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkPagesResponseButtonCapability',
    title: 'Check Pages ResponseButton Capability',
    onClick: async () =>
      `Pages.responseButton module ${pages.responseButton.isSupported() ? 'is' : 'is not'} supported`,
  });

const PagesResponseButtonAPIs = (): ReactElement => (
  <ModuleWrapper title="Response Button">
    <ShowResponseButton />
    <HideResponseButton />
    <RegisterResponseButtonClickEventHandler />
    <ResponseButtonClickEventHandlerFailure />
    <CheckPagesResponseButtonCapability />
  </ModuleWrapper>
);

export default PagesResponseButtonAPIs;
