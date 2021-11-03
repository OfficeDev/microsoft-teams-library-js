import { notifications, ShowNotificationParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';

const NotificationAPIs = (): ReactElement => {
  const [showNotification, setShowNotification] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const returnShowNotification = (showNotificationParamsInput: string): void => {
    const showNotificationParams: ShowNotificationParameters = JSON.parse(showNotificationParamsInput);
    setShowNotification('showNotification()' + noHostSdkMsg);
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
      <h1>notifications</h1>
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
