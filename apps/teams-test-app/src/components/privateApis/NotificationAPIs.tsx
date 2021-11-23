import { notifications, ShowNotificationParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckNotificationCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityNotifications',
    title: 'Check Capability Notifications',
    onClick: async () => `Notifications module ${notifications.isSupported() ? 'is' : 'is not'} supported`,
  });

const ShowNotification = (): React.ReactElement =>
  ApiWithTextInput<ShowNotificationParameters>({
    name: 'showNotification',
    title: 'Show Notification',
    onClick: {
      validateInput: input => {
        if (!input.message || !input.notificationType) {
          throw new Error('message and notificationType are required.');
        }
      },
      submit: async input => {
        notifications.showNotification(input);
        return 'Called';
      },
    },
  });

const NotificationAPIs = (): ReactElement => (
  <>
    <h1>notifications</h1>
    <ShowNotification />
    <CheckNotificationCapability />
  </>
);

export default NotificationAPIs;
