import React, { ReactElement } from 'react';
import { noHubSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { notifications, ShowNotificationParameters } from '@microsoft/teamsjs-app-sdk';

const NotificationAPIs = (): ReactElement => {
  const [showNotification, setShowNotification] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const returnShowNotification = (showNotificationParamsInput: string): void => {
    const showNotificationParams: ShowNotificationParameters = JSON.parse(showNotificationParamsInput);
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
        handleClickWithInput={returnShowNotification}
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
