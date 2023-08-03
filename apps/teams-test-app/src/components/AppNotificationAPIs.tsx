import { appNotification } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

function deserializeParam(
  notificationDisplayParam: appNotification.NotificationDisplayParamForAppHost,
): appNotification.NotificationDisplayParam {
  return {
    title: notificationDisplayParam.title,
    content: notificationDisplayParam.content,
    icon: notificationDisplayParam.notificationIconAsString
      ? new URL(notificationDisplayParam.notificationIconAsString)
      : undefined,
    displayDurationInSeconds: notificationDisplayParam.displayDurationInSeconds,
    notificationActionUrl: new URL(notificationDisplayParam.notificationActionUrlAsString),
  };
}

const CheckAppNotificationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkAppNotificationCapability',
    title: 'Check AppNotification Capability ',
    onClick: async () => `Notification module ${appNotification.isSupported() ? 'is' : 'is not'} supported`,
  });

const DisplayAppNotification = (): React.ReactElement =>
  ApiWithTextInput<appNotification.NotificationDisplayParamForAppHost>({
    name: 'displayAppNotificationCapability',
    title: 'Display App Notification Capability',
    onClick: {
      validateInput: (input) => {
        if (!input.title) {
          throw new Error('Title is required');
        }
        if (!input.content) {
          throw new Error('Content is required');
        }
        if (!input.displayDurationInSeconds) {
          throw new Error('displayDurationInSeconds is required');
        }
        if (!input.notificationActionUrlAsString) {
          throw new Error('notification URL is required');
        }
      },

      submit: async (input) => {
        await appNotification.displayInAppNotification(deserializeParam(input));
        return 'Completed';
      },
    },
  });

const AppNotificationAPIs = (): ReactElement => (
  <ModuleWrapper title="AppNotification">
    <CheckAppNotificationCapability />
    <DisplayAppNotification />
  </ModuleWrapper>
);

export default AppNotificationAPIs;
