import React, { ReactElement } from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { notifications } from '@microsoft/teamsjs-app-sdk';

const NotificationAPIs = (): ReactElement => {
  const [showNotification, setShowNotification] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const returnShowNotification = (showNotificationParams: any): void => {
    showNotificationParams = JSON.parse(showNotificationParams);
    setShowNotification('showNotification()' + noHubSdkMsg);
    notifications.showNotification(showNotificationParams);
  };

  const checkNotificationCapability = (): void => {
    if (notifications.isSupported()) {
      setCapabilityCheckRes('Notifications module is supported');
    } else {
      setCapabilityCheckRes('Notifications module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnShowNotification}
        output={showNotification}
        hasInput={true}
        title="Show Notification"
        name="showNotification"
      />
      <BoxAndButton
        handleClick={checkNotificationCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Capability Notifications"
        name="checkCapabilityNotifications"
      />
    </>
  );
};

export default NotificationAPIs;
