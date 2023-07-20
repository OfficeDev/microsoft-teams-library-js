import { appNotification } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';
import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const CheckAppNotificationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkNotificationCapabilityCall',
    title: 'Check Notification Capability ',
    onClick: async () => `Notification module ${appNotification.isSupported() ? 'is' : 'is not'} supported`,
  });


const DisplayInAppNotification = (): React.ReactElement =>
  ApiWithTextInput<appNotification.NotificationDisplayParam>({
    name: 'display  AppNotificationCapability',
    title: 'Display App Notification Capability',
    onClick: {
      validateInput: (input) => {
        if (!input.title) {
          throw new Error('Title is required')
        }
        if (!input.content) {
          throw new Error('Content is required')
        }
        if (!input.displayDurationInSeconds) {
          throw new Error('displayDurationInSeconds is required')
        }
        if (!input.notificationActionUrl) {
          throw new Error('notificationActionUrl is required')
        }
      },
      submit: async (input) => {
        await appNotification.displayInAppNotification(input);
        return 'Completed';
      },
    },
  });

const AppNotificationAPIs = (): ReactElement => (
  <ModuleWrapper title="Notification">
    <CheckAppNotificationCapability />
    <DisplayInAppNotification />
  </ModuleWrapper>
);

export default AppNotificationAPIs;
