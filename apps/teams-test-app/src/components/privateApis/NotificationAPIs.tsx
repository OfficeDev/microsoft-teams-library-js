import { notifications, ShowNotificationParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from '../utils';
import { SupportButton } from '../utils/SupportButton/SupportButton';

const CheckNotificationCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkCapabilityNotifications',
    module: 'Notifications',
    isSupported: notifications.isSupported(),
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
